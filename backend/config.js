/**
 * Central configuration — every secret comes from backend/.env (never from source code).
 * The server refuses to start if a required secret is missing or is a known leaked value.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Values that were once committed to the repository and must never be used again.
const LEAKED_SECRETS = ['smart_id_super_secret_key_2026'];

function fail(msg) {
  console.error(`\n❌ Configuration error: ${msg}`);
  console.error('   Copy backend/.env.example to backend/.env and fill in your own values.\n');
  throw new Error(msg);
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) fail('JWT_SECRET is not set');
if (JWT_SECRET.length < 32) fail('JWT_SECRET must be at least 32 characters long');
if (LEAKED_SECRETS.includes(JWT_SECRET)) fail('JWT_SECRET is a publicly leaked value — generate a new one');

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  isProduction: process.env.NODE_ENV === 'production',
};
