#!/usr/bin/env node
/**
 * Focused Load Test — DB & Auth
 * So sánh với kết quả cũ (bcrypt rounds=12, chưa có index mới)
 */

const autocannon = require('./node_modules/autocannon');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

function bench(opts) {
  return new Promise((resolve, reject) => {
    const inst = autocannon(opts, (err, r) => err ? reject(err) : resolve(r));
    autocannon.track(inst, { renderProgressBar: false, renderResultsTable: false });
  });
}

function getAuthToken() {
  return new Promise((resolve) => {
    const body = JSON.stringify({ identifier: 'admin@aimock.local', password: 'admin@123' });
    const opts = {
      hostname: 'localhost', port: 3000,
      path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d).accessToken || null); }
        catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(body); req.end();
  });
}

const dline = () => '═'.repeat(66);
const sline = () => '─'.repeat(66);

// So sánh với kết quả cũ
const PREV = {
  'Login |    5 users': { rps: 3,   lat: 1752, p99: 2107 },
  'Login |   10 users': { rps: 2,   lat: 3723, p99: 6094 },
  'Login |   30 users': { rps: 2,   lat: 5696, p99: 9643 },
  'Login |   50 users': { rps: 0,   lat: 0,    p99: 0    },
  'Questions |   10 users': { rps: 0,   lat: 0,    p99: 0    },
  'Questions |   50 users': { rps: 189, lat: 4394, p99: 6124 },
  'Questions |  100 users': { rps: 513, lat: 192,  p99: 915  },
  'Questions |  200 users': { rps: 485, lat: 392,  p99: 6577 },
  'UserStats |   10 users': { rps: 240, lat: 41,   p99: 400  },
  'UserStats |   50 users': { rps: 426, lat: 115,  p99: 348  },
  'UserStats |  100 users': { rps: 356, lat: 277,  p99: 1660 },
  'UserStats |  200 users': { rps: 442, lat: 442,  p99: 4498 },
};

function diff(now, prev) {
  if (!prev || prev === 0) return '';
  const pct = ((now - prev) / prev * 100);
  const sign = pct >= 0 ? '+' : '';
  return `(${sign}${pct.toFixed(0)}%)`;
}

const results = [];

function printResult(label, r) {
  const rps   = Math.round(r.requests.average);
  const lat   = r.latency.average.toFixed(1);
  const p99   = r.latency.p99;
  const total = r.requests.total;
  const errs  = (r.errors || 0) + (r.timeouts || 0);
  const bad   = r.non2xx || 0;
  const ok    = total - errs - bad;
  const pct   = total > 0 ? (ok / total * 100).toFixed(1) : '0.0';

  const prev  = PREV[label];
  const rDiff = prev ? diff(rps,        prev.rps) : '';
  const lDiff = prev ? diff(parseFloat(lat), prev.lat) : '';

  const icon = parseFloat(pct) >= 99 ? '✅' : parseFloat(pct) >= 95 ? '⚠️ ' : '❌';

  console.log(`\n  ${icon}  ${label}`);
  console.log(`       RPS          : ${rps.toLocaleString().padStart(6)}  ${rDiff}`);
  console.log(`       Latency avg  : ${lat.padStart(7)} ms  ${lDiff}`);
  console.log(`       Latency p99  : ${String(p99).padStart(7)} ms`);
  console.log(`       Total / Err  : ${total.toLocaleString()} / ${errs + bad}`);
  console.log(`       Success      : ${pct}%`);

  results.push({ label, rps, lat: parseFloat(lat), p99, pct: parseFloat(pct), total, errs: errs + bad });
}

async function main() {
  console.log('\n🚀  Focused Load Test — DB & Auth');
  console.log(`    Target : ${BASE_URL}`);
  console.log(`    Date   : ${new Date().toLocaleString('vi-VN')}`);
  console.log('    Changes: bcrypt rounds 12→10 | 6 indexes mới\n');

  // Check server
  try {
    await new Promise((res, rej) => http.get(`${BASE_URL}/api/health`, r => { r.resume(); res(); }).on('error', rej));
    console.log('  ✅  Server reachable');
  } catch { console.error('  ❌  Server not reachable'); process.exit(1); }

  // Auth token
  process.stdout.write('  🔑  Getting auth token... ');
  const token = await getAuthToken();
  console.log(token ? '✅' : '❌ failed');

  const authH = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : null;
  const loginBody = JSON.stringify({ identifier: 'admin@aimock.local', password: 'admin@123' });

  // ── PHASE 1: Login (bcrypt — bottleneck chính) ────────────────────────────
  console.log(`\n${dline()}`);
  console.log('  PHASE 1 — POST /api/auth/login  (bcrypt rounds: 12 → 10)');
  console.log(dline());

  for (const [c, d] of [[5,15],[10,15],[30,15],[50,15],[100,15]]) {
    process.stdout.write(`\n  ⏳  ${String(c).padStart(4)} concurrent users...`);
    const r = await bench({
      url: `${BASE_URL}/api/auth/login`,
      connections: c, duration: d,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: loginBody,
    });
    process.stdout.write(' done\n');
    printResult(`Login | ${String(c).padStart(4)} users`, r);
  }

  if (!authH) { console.log('\n  ⚠️  No auth token — skipping DB tests'); return; }

  // Cooldown: chờ login requests in-flight drain hết trước khi test DB
  process.stdout.write('\n  ⏸   Cooldown 15s (drain lingering bcrypt requests)...');
  await new Promise(r => setTimeout(r, 15000));
  console.log(' done');

  // ── PHASE 2: DB Read — Questions (index mới: isActive compound) ──────────
  console.log(`\n${dline()}`);
  console.log('  PHASE 2 — GET /api/questions  (index: isActive+category+difficulty)');
  console.log(dline());

  for (const [c, d] of [[10,10],[50,10],[100,10],[200,10],[300,10]]) {
    process.stdout.write(`\n  ⏳  ${String(c).padStart(4)} concurrent users...`);
    const r = await bench({ url: `${BASE_URL}/api/questions`, connections: c, duration: d, headers: authH });
    process.stdout.write(' done\n');
    printResult(`Questions | ${String(c).padStart(4)} users`, r);
  }

  // ── PHASE 3: DB Aggregate — UserStats (index mới: user+status+completedAt)
  console.log(`\n${dline()}`);
  console.log('  PHASE 3 — GET /api/users/me/stats  (index: user+status+completedAt)');
  console.log(dline());

  for (const [c, d] of [[10,10],[50,10],[100,10],[200,10],[300,10]]) {
    process.stdout.write(`\n  ⏳  ${String(c).padStart(4)} concurrent users...`);
    const r = await bench({ url: `${BASE_URL}/api/users/me/stats`, connections: c, duration: d, headers: authH });
    process.stdout.write(' done\n');
    printResult(`UserStats | ${String(c).padStart(4)} users`, r);
  }

  // ── PHASE 4: DB Read — User Progress ─────────────────────────────────────
  console.log(`\n${dline()}`);
  console.log('  PHASE 4 — GET /api/users/me/progress');
  console.log(dline());

  for (const [c, d] of [[50,10],[100,10],[200,10]]) {
    process.stdout.write(`\n  ⏳  ${String(c).padStart(4)} concurrent users...`);
    const r = await bench({ url: `${BASE_URL}/api/users/me/progress`, connections: c, duration: d, headers: authH });
    process.stdout.write(' done\n');
    printResult(`Progress  | ${String(c).padStart(4)} users`, r);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${dline()}`);
  console.log('  SUMMARY');
  console.log(dline());
  console.log('');
  console.log('  Scenario                        RPS    Lat avg   Lat p99  Success');
  console.log('  ' + sline());

  for (const s of results) {
    const prev = PREV[s.label];
    const rDiff = prev ? ` ${diff(s.rps, prev.rps)}` : '';
    const flag = s.pct >= 99 ? '✅' : s.pct >= 95 ? '⚠️ ' : '❌';
    console.log(
      `  ${s.label.padEnd(32)}` +
      `${String(s.rps).padStart(6)}${rDiff.padEnd(10)}` +
      `${(s.lat.toFixed(1) + ' ms').padStart(8)}` +
      `  ${String(s.p99).padStart(6)} ms` +
      `  ${(s.pct.toFixed(1) + '%').padStart(7)}  ${flag}`
    );
  }

  // ── Capacity summary ──────────────────────────────────────────────────────
  const loginOk     = results.filter(r => r.label.startsWith('Login')     && r.pct >= 99);
  const questionsOk = results.filter(r => r.label.startsWith('Questions') && r.pct >= 99);
  const statsOk     = results.filter(r => r.label.startsWith('UserStats') && r.pct >= 99);

  const maxC = arr => arr.length
    ? Math.max(...arr.map(r => parseInt(r.label.match(/\d+/)?.[0] || 0)))
    : 0;
  const maxRPS = arr => arr.length ? Math.max(...arr.map(r => r.rps)) : 0;

  console.log(`\n${dline()}`);
  console.log('  KẾT LUẬN');
  console.log(dline());
  console.log('');
  console.log(`  🔐  Login (bcrypt)    : tối đa ~${maxC(loginOk)} concurrent  |  peak ${maxRPS(loginOk)} req/s`);
  console.log(`  📋  Questions (DB)    : tối đa ~${maxC(questionsOk)} concurrent  |  peak ${maxRPS(questionsOk)} req/s`);
  console.log(`  📊  UserStats (agg)   : tối đa ~${maxC(statsOk)} concurrent  |  peak ${maxRPS(statsOk)} req/s`);
  console.log('');
}

main().catch(console.error);
