const jwt = require('jsonwebtoken');
const { getRedis } = require('../config/redis');
const { generateRefreshToken, generateRandomToken, hashToken } = require('./token.service');

// Giữ hash cũ thêm một lúc để các tab gửi refresh đồng thời không bị coi là reuse
const GRACE_SECONDS = 30;

const currentKey = (userId) => `refresh:${userId}`;
const prevKey    = (userId) => `refresh_prev:${userId}`;

// Giá trị lưu trong Redis: "<sid>.<sha256(token)>"
const entry = (sid, token) => `${sid}.${hashToken(token)}`;

// KEYS[1] = refresh:<id>, KEYS[2] = refresh_prev:<id>
// ARGV: 1 = entry token cũ, 2 = entry token mới, 3 = TTL token mới, 4 = grace TTL, 5 = sid
// Trả về: 1 = đã rotate, 2 = trong thời gian ân hạn, 0 = phiên khác/không tồn tại, -1 = reuse → đã thu hồi
const ROTATE_SCRIPT = `
local cur = redis.call('GET', KEYS[1])
if not cur then return 0 end
if cur == ARGV[1] then
  redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
  redis.call('SET', KEYS[2], ARGV[1], 'EX', ARGV[4])
  return 1
end
if string.sub(cur, 1, #ARGV[5] + 1) ~= ARGV[5] .. '.' then return 0 end
if redis.call('GET', KEYS[2]) == ARGV[1] then return 2 end
redis.call('DEL', KEYS[1], KEYS[2])
return -1
`;

const ROTATE_RESULT = { ROTATED: 1, GRACE: 2, INVALID: 0, REUSED: -1 };

const secondsUntil = (exp) => Math.max(exp - Math.floor(Date.now() / 1000), 1);

// Tạo phiên mới khi login — ghi đè phiên trước đó của user
async function createSession(payload) {
  const sid = generateRandomToken();
  const token = generateRefreshToken({ ...payload, sid, jti: generateRandomToken() });
  const { exp } = jwt.decode(token);

  const redis = getRedis();
  await redis.set(currentKey(payload.id), entry(sid, token), { EX: secondsUntil(exp) });
  await redis.del(prevKey(payload.id));

  return { token, maxAgeMs: secondsUntil(exp) * 1000 };
}

// Xác thực refresh token cũ và đổi sang token mới (giữ nguyên hạn của phiên)
// Ném lỗi nếu token không hợp lệ; trả { status, decoded, token?, maxAgeMs? }
async function rotateSession(oldToken) {
  const decoded = jwt.verify(oldToken, process.env.REFRESH_TOKEN_SECRET);
  const { id, role, sid, exp } = decoded;
  if (!sid) return { status: ROTATE_RESULT.INVALID, decoded };

  const ttl = secondsUntil(exp);
  const token = jwt.sign(
    { id, role, sid, jti: generateRandomToken(), exp },
    process.env.REFRESH_TOKEN_SECRET,
  );

  const status = await getRedis().eval(ROTATE_SCRIPT, {
    keys: [currentKey(id), prevKey(id)],
    arguments: [entry(sid, oldToken), entry(sid, token), String(ttl), String(GRACE_SECONDS), sid],
  });

  if (status === ROTATE_RESULT.ROTATED) return { status, decoded, token, maxAgeMs: ttl * 1000 };
  return { status, decoded };
}

async function revokeSession(userId) {
  await getRedis().del([currentKey(userId), prevKey(userId)]);
}

module.exports = { createSession, rotateSession, revokeSession, ROTATE_RESULT, GRACE_SECONDS };
