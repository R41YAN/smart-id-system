/** Re-creates a fresh demo database before each integration test file. */
const { seed } = require('../db/seed');
const { resetLoginRateLimit } = require('../middleware/rateLimit');

jest.setTimeout(25000);

beforeAll(async () => {
  await seed({ adminPassword: process.env.TEST_ADMIN_PASSWORD, closePool: false, quiet: true });
  resetLoginRateLimit();
});
