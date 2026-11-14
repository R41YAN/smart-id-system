const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * Database credentials are read ONLY from backend/.env (or real environment variables).
 * Nothing is hard-coded here — see backend/.env.example.
 *
 * SSL:
 *   DB_SSL=false          → no SSL (local PostgreSQL)
 *   DB_SSL_CA=<path.crt>  → SSL with full certificate verification (recommended for Supabase;
 *                           download the CA from Supabase → Project Settings → Database → SSL)
 *   (default)             → SSL without certificate verification, with a warning
 */
function buildSsl() {
  if (process.env.DB_SSL === 'false') return false;
  if (process.env.DB_SSL_CA) {
    return { ca: fs.readFileSync(path.resolve(process.env.DB_SSL_CA), 'utf8'), rejectUnauthorized: true };
  }
  console.warn('⚠️  DB_SSL_CA not set — SSL certificate is NOT verified. Set DB_SSL_CA for production.');
  return { rejectUnauthorized: false };
}

let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = { connectionString: process.env.DATABASE_URL, ssl: buildSsl() };
} else if (process.env.DB_HOST) {
  if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD is not set in backend/.env');
  }
  poolConfig = {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_id_system',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    ssl:      process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1' ? false : buildSsl(),
  };
} else {
  console.error('\n❌ No database configured. Set DATABASE_URL (or DB_HOST / DB_PASSWORD) in backend/.env');
  console.error('   Copy backend/.env.example to backend/.env and fill in your own values.\n');
  throw new Error('Database is not configured');
}

const pool = new Pool({
  ...poolConfig,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('connect', () => { if (process.env.NODE_ENV !== 'test') console.log('✅ PostgreSQL connected'); });
pool.on('error',   (err) => console.error('❌ PostgreSQL error:', err.message));

module.exports = pool;
