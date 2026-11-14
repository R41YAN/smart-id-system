/**
 * Changes the password of an existing account (e.g. to replace the old public "admin123").
 *   node scripts/set_password.js <email>
 * The new password is typed in the terminal (not saved in shell history). Min 8 characters.
 */
const readline = require('readline');
const bcrypt = require('bcryptjs');
const pool = require('../db/connection');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/set_password.js <email>');
    process.exit(1);
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const password = await new Promise((resolve) => rl.question(`New password for ${email}: `, resolve));
  rl.close();
  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  const r = await pool.query('UPDATE users SET password_hash=$1 WHERE LOWER(email)=LOWER($2) RETURNING email', [hash, email]);
  console.log(r.rowCount ? `✅ Password updated for ${r.rows[0].email}` : `❌ No user with email ${email}`);
}

main()
  .catch((err) => { console.error('❌', err.message); process.exitCode = 1; })
  .finally(() => pool.end());
