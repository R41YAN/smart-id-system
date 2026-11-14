/**
 * Unit tests run anywhere. Integration tests WIPE and re-seed a database, so they only run
 * against TEST_DATABASE_URL (a separate, throw-away database) — never the real/demo database.
 */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      setupFiles: ['<rootDir>/tests/integrationEnv.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/integrationSetup.js'],
    },
  ],
};
