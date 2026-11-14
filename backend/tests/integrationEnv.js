/**
 * Runs before every integration test file (before any app code is loaded).
 * Points the app at the separate TEST database and refuses to run against the real one.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

const envFile = path.resolve(__dirname, '../.env');
const fileEnv = fs.existsSync(envFile) ? dotenv.parse(fs.readFileSync(envFile)) : {};
const testUrl = process.env.TEST_DATABASE_URL || fileEnv.TEST_DATABASE_URL;

if (!testUrl) {
  throw new Error(
    'Integration tests need TEST_DATABASE_URL (a separate throw-away database). ' +
    'They delete all data in it. Set TEST_DATABASE_URL in backend/.env, or run only `npm run test:unit`.'
  );
}
const realUrl = fileEnv.DATABASE_URL || '';
if (realUrl && testUrl === realUrl) {
  throw new Error('TEST_DATABASE_URL must NOT be the same as DATABASE_URL — tests would wipe your real data.');
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testUrl;
if (!process.env.DB_SSL && /localhost|127\.0\.0\.1/.test(testUrl)) process.env.DB_SSL = 'false';
process.env.JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
  && process.env.JWT_SECRET !== 'smart_id_super_secret_key_2026'
  ? process.env.JWT_SECRET
  : crypto.randomBytes(48).toString('hex');
process.env.TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Test-Only-Pass-2026';
