const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/user.model');
const { getRedis } = require('../config/redis');
const {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
  hashToken,
} = require('../services/token.service');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/email.service');

const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TTL * 1000,
  });
};

// Issue access token + refresh token, set cookie
async function issueSession(res, user) {
  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const redis = getRedis();
  await redis.set(`refresh:${user._id}`, hashToken(refreshToken), { EX: REFRESH_TTL });
  setRefreshCookie(res, refreshToken);

  return {
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      gender: user.gender,
      avatar: user.avatar,
      role: user.role,
    },
  };
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, gender, avatar } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const redis = getRedis();
    const cooldownKey = `email_cooldown:${email.toLowerCase()}`;
    const inCooldown = await redis.get(cooldownKey);
    if (inCooldown) {
      const ttl = await redis.ttl(cooldownKey);
      return res.status(429).json({ message: `Please wait ${ttl} seconds before requesting another email.` });
    }

    const rawToken = generateRandomToken();

    const user = await User.create({
      email,
      password,
      gender,
      avatar,
      emailVerificationToken: hashToken(rawToken),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendVerificationEmail(email, rawToken);
      await redis.set(cooldownKey, '1', { EX: 60 });
    } catch (emailErr) {
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: 'Could not send verification email. Please try again.' });
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashed = hashToken(req.params.token);
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
// Body: { identifier: email | username, password }
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.password) {
      return res.status(401).json({ message: 'This account uses social login. Please sign in with Google or Facebook.' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const session = await issueSession(res, user);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const redis = getRedis();
        await redis.del(`refresh:${decoded.id}`);
      } catch {
        // token invalid — still clear cookie
      }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const redis = getRedis();
    const stored = await redis.get(`refresh:${decoded.id}`);
    if (!stored || stored !== hashToken(token)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const redis = getRedis();
      const cooldownKey = `email_cooldown:${email.toLowerCase()}`;
      const inCooldown = await redis.get(cooldownKey);
      if (inCooldown) {
        const ttl = await redis.ttl(cooldownKey);
        return res.status(429).json({ message: `Please wait ${ttl} seconds before requesting another email.` });
      }

      const rawToken = generateRandomToken();
      user.resetPasswordToken = hashToken(rawToken);
      user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await user.save({ validateBeforeSave: false });
      await sendResetPasswordEmail(email, rawToken);
      await redis.set(cooldownKey, '1', { EX: 60 });
    }

    // Always 200 — do not reveal whether email exists
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'New password is required' });

    const hashed = hashToken(req.params.token);
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Invalidate active session
    const redis = getRedis();
    await redis.del(`refresh:${user._id}`);

    res.json({ message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google  — body: { code }
exports.googleLogin = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Authorization code is required' });

    // Đổi code lấy access_token
    const { data: tokenData } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID?.trim(),
      client_secret: process.env.GOOGLE_CLIENT_SECRET?.trim(),
      redirect_uri: process.env.GOOGLE_REDIRECT_URL?.trim(),
      grant_type: 'authorization_code',
    });

    // Lấy thông tin user từ Google
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const { id: googleId, email, name, picture } = profile;

    // Tìm user theo googleId hoặc email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        username: name,
        avatar: picture,
        isEmailVerified: true,
      });
    } else if (!user.googleId) {
      // Liên kết tài khoản đã có email với Google
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      await user.save({ validateBeforeSave: false });
    }

    const session = await issueSession(res, user);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/facebook  — body: { code }
exports.facebookLogin = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Authorization code is required' });

    // Đổi code lấy access_token
    const { data: tokenData } = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_CLIENT_ID?.trim(),
        client_secret: process.env.FACEBOOK_CLIENT_SECRET?.trim(),
        redirect_uri: process.env.FACEBOOK_REDIRECT_URL?.trim(),
        code,
      },
    });

    // Lấy thông tin user từ Facebook
    const { data: profile } = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email,picture.type(large)',
        access_token: tokenData.access_token,
      },
    });

    const { id: facebookId, email, name, picture } = profile;
    const avatar = picture?.data?.url;

    if (!email) {
      return res.status(400).json({ message: 'Facebook account does not have an email. Please use another login method.' });
    }

    let user = await User.findOne({ $or: [{ facebookId }, { email }] });

    if (!user) {
      user = await User.create({
        facebookId,
        email,
        username: name,
        avatar,
        isEmailVerified: true,
      });
    } else if (!user.facebookId) {
      user.facebookId = facebookId;
      if (!user.avatar) user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
    }

    const session = await issueSession(res, user);
    res.json(session);
  } catch (err) {
    next(err);
  }
};
