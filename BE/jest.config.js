module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  // Redirect các module external/infra sang mock tương ứng
  moduleNameMapper: {
    '^.*/config/bull(\\.js)?$':             '<rootDir>/tests/mocks/bull.js',
    '^.*/config/redis(\\.js)?$':            '<rootDir>/tests/mocks/redis.js',
    '^.*/config/cloudinary(\\.js)?$':       '<rootDir>/tests/mocks/cloudinary.js',
    '^.*/config/rateLimit(\\.js)?$':        '<rootDir>/tests/mocks/rateLimit.js',
    '^.*/services/email\\.service(\\.js)?$':'<rootDir>/tests/mocks/email.service.js',
  },
};
