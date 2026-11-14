/**
 * Applies every SQL file in db/migrations (in name order) to the configured database.
 * Migrations are written to be safe to run more than once and never delete data.
 *   npm run migrate
 */
const fs = require('fs');
const path = require('path');
const pool = require('./connection');

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log(`✅ Applied ${file}`);
  }
}

migrate()
  .catch((err) => { console.error('❌ Migration failed:', err.message); process.exitCode = 1; })
  .finally(() => pool.end());
