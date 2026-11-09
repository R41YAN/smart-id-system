const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('../db/connection');

async function run() {
  try {
    const defaultLogos = {
      'Dhaka University': '/logos/du.svg',
      'University of Information Technology and Sciences': '/logos/uits.svg',
      'BRAC University': '/logos/brac.svg',
      'Metropolitan University': '/logos/mu.svg',
      'North South University': '/logos/nsu.svg',
    };

    for (const [name, logo] of Object.entries(defaultLogos)) {
      await pool.query(
        `UPDATE universities 
         SET logo_url = $1 
         WHERE name ILIKE $2;`,
        [logo, `%${name}%`]
      );
    }

    const updated = await pool.query('SELECT id, name, type, logo_url FROM universities ORDER BY id;');
    console.log('✅ Updated universities with svg logos:', updated.rows);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
