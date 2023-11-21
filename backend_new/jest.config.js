module.exports = {
  testEnvironment: 'node',
  testMatch: [
    "**/*.test.js"
  ],
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    JEST_SERVER_PORT: 2000,
  },
}