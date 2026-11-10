const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Auto-heal / self-initialize backend/.env if missing (e.g., on fresh clone on friend's PC)
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  const defaultEnvContent = [
    'PORT=5000',
    '# Cloud Supabase Database (Auto-configured fallback for instant demo)',
    'DATABASE_URL=postgresql://postgres.qwqnrvpubmnarseleegr:SmartId_2026@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
    'JWT_SECRET=smart_id_super_secret_key_2026',
    'JWT_EXPIRES_IN=7d',
    ''
  ].join('\n');
  try {
    fs.writeFileSync(envPath, defaultEnvContent, { flag: 'wx' });
    console.log('⚡ Initialized backend/.env with Cloud Supabase configuration');
  } catch (err) {
    // Non-fatal if filesystem is read-only
  }
}
require('dotenv').config({ path: envPath });

// Cloud Supabase fallback ensures zero-configuration startup on any PC
const DEFAULT_DATABASE_URL = 'postgresql://postgres.qwqnrvpubmnarseleegr:SmartId_2026@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  };
} else if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  poolConfig = {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME     || 'smart_id_system',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
} else {
  poolConfig = {
    connectionString: DEFAULT_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
}

const pool = new Pool({
  ...poolConfig,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('connect', () => console.log('✅ PostgreSQL connected'));
pool.on('error',   (err) => console.error('❌ PostgreSQL error:', err.message));

module.exports = pool;
