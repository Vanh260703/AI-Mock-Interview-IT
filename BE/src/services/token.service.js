const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '30m',
  });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  });

const generateRandomToken = () => crypto.randomBytes(32).toString('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

module.exports = { generateAccessToken, generateRefreshToken, generateRandomToken, hashToken };
