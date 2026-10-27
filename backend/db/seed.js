const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./connection');
const { generateStudentId } = require('../utils/idGenerator');

async function seed() {
  console.log('🌱 Starting database setup and seeding...');

  try {
    // 1. Read and apply schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Database schema applied successfully');

    // 2. Hash default password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // 3. Create Super Admin
    const superAdminRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'super_admin')
       RETURNING id, name, email, role`,
      ['System Super Admin', 'superadmin@smartid.com', passwordHash]
    );
    const superAdmin = superAdminRes.rows[0];
    console.log(`✅ Super Admin created: ${superAdmin.email}`);

    // 4. Create Sample Universities
    const nsuRes = await pool.query(
      `INSERT INTO universities (name, type, created_by)
       VALUES ('North South University', 'open_credit', $1)
       RETURNING id, name, type`,
      [superAdmin.id]
    );
    const nsu = nsuRes.rows[0];

    const muRes = await pool.query(
      `INSERT INTO universities (name, type, created_by)
       VALUES ('Metropolitan University', 'close_credit', $1)
       RETURNING id, name, type`,
      [superAdmin.id]
    );
    const mu = muRes.rows[0];
    console.log(`✅ Universities created: ${nsu.name} (open_credit), ${mu.name} (close_credit)`);

    // 5. Create Client Admins
    const nsuAdminRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, university_id)
       VALUES ('NSU Admission Admin', 'nsu_admin@smartid.com', $1, 'client_admin', $2)
       RETURNING id, name, email, role`,
      [passwordHash, nsu.id]
    );
    const nsuAdmin = nsuAdminRes.rows[0];

    const muAdminRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, university_id)
       VALUES ('MU Admission Admin', 'mu_admin@smartid.com', $1, 'client_admin', $2)
       RETURNING id, name, email, role`,
      [passwordHash, mu.id]
    );
    const muAdmin = muAdminRes.rows[0];
    console.log(`✅ Client Admins created: ${nsuAdmin.email}, ${muAdmin.email}`);

    // 6. Create Departments
    const deptCseNsu = (await pool.query(
      `INSERT INTO departments (university_id, name) VALUES ($1, 'CSE') RETURNING id, name`,
      [nsu.id]
    )).rows[0];

    const deptBbaNsu = (await pool.query(
      `INSERT INTO departments (university_id, name) VALUES ($1, 'BBA') RETURNING id, name`,
      [nsu.id]
    )).rows[0];

    const deptCseMu = (await pool.query(
      `INSERT INTO departments (university_id, name) VALUES ($1, 'CSE') RETURNING id, name`,
      [mu.id]
    )).rows[0];

    const deptEeeMu = (await pool.query(
      `INSERT INTO departments (university_id, name) VALUES ($1, 'EEE') RETURNING id, name`,
      [mu.id]
    )).rows[0];
    console.log('✅ Sample departments created');

    // 7. Create Batches
    // NSU (Open Credit): CSE 2026 Spring (SP, index 1)
    const nsuBatchSpring = (await pool.query(
      `INSERT INTO batches (department_id, year, semester_code, semester_index, current_serial)
       VALUES ($1, 2026, 'SP', 1, 2)
       RETURNING id, year, semester_code, semester_index`,
      [deptCseNsu.id]
    )).rows[0];

    // MU (Close Credit): CSE 54th Batch 2026
    const muBatch54 = (await pool.query(
      `INSERT INTO batches (department_id, year, batch_number, current_serial)
       VALUES ($1, 2026, 54, 2)
       RETURNING id, year, batch_number`,
      [deptCseMu.id]
    )).rows[0];
    console.log('✅ Sample batches created');

    // 8. Create Sample Students
    // NSU Student 1: Open Credit -> CSE26SP001
    const nsuId1 = generateStudentId({
      universityType: 'open_credit',
      deptName: 'CSE',
      year: 2026,
      semesterIndex: 1,
      serial: 1,
    });
    await pool.query(
      `INSERT INTO students (batch_id, department_id, student_id, name, email, serial_number, admitted_by)
       VALUES ($1, $2, $3, 'Arafat Rahman', 'arafat@example.com', 1, $4)`,
      [nsuBatchSpring.id, deptCseNsu.id, nsuId1, nsuAdmin.id]
    );

    // NSU Student 2: Open Credit -> CSE26SP002
    const nsuId2 = generateStudentId({
      universityType: 'open_credit',
      deptName: 'CSE',
      year: 2026,
      semesterIndex: 1,
      serial: 2,
    });
    await pool.query(
      `INSERT INTO students (batch_id, department_id, student_id, name, email, serial_number, admitted_by)
       VALUES ($1, $2, $3, 'Nusrat Jahan', 'nusrat@example.com', 2, $4)`,
      [nsuBatchSpring.id, deptCseNsu.id, nsuId2, nsuAdmin.id]
    );

    // MU Student 1: Close Credit -> CSE5426001
    const muId1 = generateStudentId({
      universityType: 'close_credit',
      deptName: 'CSE',
      year: 2026,
      batchNumber: 54,
      serial: 1,
    });
    await pool.query(
      `INSERT INTO students (batch_id, department_id, student_id, name, email, serial_number, admitted_by)
       VALUES ($1, $2, $3, 'Tanvir Ahmed', 'tanvir@example.com', 1, $4)`,
      [muBatch54.id, deptCseMu.id, muId1, muAdmin.id]
    );

    // MU Student 2: Close Credit -> CSE5426002
    const muId2 = generateStudentId({
      universityType: 'close_credit',
      deptName: 'CSE',
      year: 2026,
      batchNumber: 54,
      serial: 2,
    });
    await pool.query(
      `INSERT INTO students (batch_id, department_id, student_id, name, email, serial_number, admitted_by)
       VALUES ($1, $2, $3, 'Sadia Islam', 'sadia@example.com', 2, $4)`,
      [muBatch54.id, deptCseMu.id, muId2, muAdmin.id]
    );

    // Mark universities as locked
    await pool.query(`UPDATE universities SET is_locked = TRUE WHERE id IN ($1, $2)`, [nsu.id, mu.id]);
    console.log('✅ Sample students admitted and IDs formatted successfully');

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Default Credentials:');
    console.log('  Super Admin:');
    console.log('    Email:    superadmin@smartid.com');
    console.log('    Password: admin123');
    console.log('  Client Admin (Open Credit - NSU):');
    console.log('    Email:    nsu_admin@smartid.com');
    console.log('    Password: admin123');
    console.log('  Client Admin (Close Credit - MU):');
    console.log('    Email:    mu_admin@smartid.com');
    console.log('    Password: admin123');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seed();
