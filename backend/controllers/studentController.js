const pool = require('../db/connection');
const { generateStudentId } = require('../utils/idGenerator');

const getAll = async (req, res) => {
  const { batch_id, department_id, trash } = req.query;
  try {
    let query = `
      SELECT s.*, COALESCE(d.code, d.name) AS department_name, COALESCE(d.code, d.name) AS department_code, d.full_name AS department_full_name, b.year, b.batch_number,
             b.semester_code, b.semester_index, u.name AS university_name, u.logo_url AS university_logo, u.type AS university_type
      FROM students s
      JOIN departments d ON s.department_id = d.id
      JOIN batches b ON s.batch_id = b.id
      JOIN universities u ON d.university_id = u.id
    `;
    const params = [];
    const conds = [];

    // Filter out deleted records unless explicitly requesting trash
    if (trash === 'true') {
      conds.push('s.deleted_at IS NOT NULL');
    } else {
      conds.push('s.deleted_at IS NULL');
    }

    if (batch_id)      { conds.push(`s.batch_id=$${params.length+1}`);      params.push(batch_id); }
    if (department_id) { conds.push(`s.department_id=$${params.length+1}`); params.push(department_id); }
    if (req.user.role === 'client_admin') {
      conds.push(`d.university_id=$${params.length+1}`);
      params.push(req.user.university_id);
    }
    if (conds.length) query += ' WHERE ' + conds.join(' AND ');
    query += ' ORDER BY b.year DESC, b.semester_index ASC NULLS LAST, b.batch_number ASC NULLS LAST, s.serial_number ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/students  — Concurrency-safe admission
const admit = async (req, res) => {
  const { batch_id, department_id, name, email, phone, photo } = req.body;
  if (!batch_id || !department_id || !name)
    return res.status(400).json({ message: 'batch_id, department_id, and name are required' });

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // ── LOCK batch row (prevents race conditions) ──────────────────────────
    const batchResult = await client.query(
      `SELECT b.*, COALESCE(d.code, d.name) AS dept_name, u.type AS uni_type, u.id AS uni_id
       FROM batches b
       JOIN departments d ON b.department_id = d.id
       JOIN universities u ON d.university_id = u.id
       WHERE b.id=$1
       FOR UPDATE`,
      [batch_id]
    );
    if (!batchResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Batch not found' });
    }
    const batch = batchResult.rows[0];

    // Access control — client_admin can only admit to their own university
    if (req.user.role === 'client_admin' && batch.uni_id !== req.user.university_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Access denied' });
    }

    // Serial cap
    const newSerial = batch.current_serial + 1;
    if (newSerial > 999) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Maximum capacity (999) reached for this batch' });
    }

    // Increment serial
    await client.query('UPDATE batches SET current_serial=$1 WHERE id=$2', [newSerial, batch_id]);

    // Lock university (immutable after first admission)
    await client.query('UPDATE universities SET is_locked=TRUE WHERE id=$1', [batch.uni_id]);

    // ── GENERATE ID ───────────────────────────────────────────────────────
    const studentId = generateStudentId({
      universityType: batch.uni_type,
      deptName:       batch.dept_name,
      year:           batch.year,
      semesterIndex:  batch.semester_index,
      batchNumber:    batch.batch_number,
      serial:         newSerial,
    });

    // ── INSERT STUDENT ────────────────────────────────────────────────────
    const studentResult = await client.query(
      `INSERT INTO students (batch_id, department_id, student_id, name, email, phone, photo, serial_number, admitted_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [batch_id, department_id, studentId, name, email || null, phone || null, photo || null, newSerial, req.user.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Student admitted successfully', student: studentResult.rows[0] });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    console.error('Admit error:', err);
    if (err.code === '23505')
      return res.status(409).json({ message: 'ID conflict — please retry' });
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (client) client.release();
  }
};

// POST /api/students/bulk  — Concurrency-safe bulk admission
const bulkAdmit = async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'students array is required and must not be empty' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Group students by batch_id
    const byBatch = {};
    for (let i = 0; i < students.length; i++) {
      const item = students[i];
      if (!item.batch_id || !item.department_id || !item.name) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Row #${i + 1} is missing batch_id, department_id, or name` });
      }
      if (!byBatch[item.batch_id]) byBatch[item.batch_id] = [];
      byBatch[item.batch_id].push(item);
    }

    const admittedStudents = [];

    // Process each batch with ACID row lock
    for (const batchId of Object.keys(byBatch)) {
      const batchResult = await client.query(
        `SELECT b.*, COALESCE(d.code, d.name) AS dept_name, u.type AS uni_type, u.id AS uni_id
         FROM batches b
         JOIN departments d ON b.department_id = d.id
         JOIN universities u ON d.university_id = u.id
         WHERE b.id=$1 AND b.deleted_at IS NULL
         FOR UPDATE`,
        [batchId]
      );

      if (!batchResult.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: `Batch ID ${batchId} not found or inactive` });
      }
      const batch = batchResult.rows[0];

      if (req.user.role === 'client_admin' && batch.uni_id !== req.user.university_id) {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: `Access denied to batch ID ${batchId}` });
      }

      const batchStudents = byBatch[batchId];
      if (batch.current_serial + batchStudents.length > 999) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Batch "${batch.dept_name}" exceeds capacity limit (999). Remaining seats: ${999 - batch.current_serial}`
        });
      }

      let runningSerial = batch.current_serial;

      for (const s of batchStudents) {
        runningSerial += 1;
        const studentId = generateStudentId({
          universityType: batch.uni_type,
          deptName:       batch.dept_name,
          year:           batch.year,
          semesterIndex:  batch.semester_index,
          batchNumber:    batch.batch_number,
          serial:         runningSerial,
        });

        const ins = await client.query(
          `INSERT INTO students (batch_id, department_id, student_id, name, email, phone, photo, serial_number, admitted_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
          [batchId, s.department_id, studentId, s.name, s.email || null, s.phone || null, s.photo || null, runningSerial, req.user.id]
        );
        admittedStudents.push(ins.rows[0]);
      }

      await client.query('UPDATE batches SET current_serial=$1 WHERE id=$2', [runningSerial, batchId]);
      await client.query('UPDATE universities SET is_locked=TRUE WHERE id=$1', [batch.uni_id]);
    }

    await client.query('COMMIT');
    res.status(201).json({
      message: `Successfully admitted ${admittedStudents.length} students via bulk enrollment`,
      count: admittedStudents.length,
      students: admittedStudents
    });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    console.error('Bulk admit error:', err);
    res.status(500).json({ message: 'Server error during bulk admission', error: err.message });
  } finally {
    if (client) client.release();
  }
};

const remove = async (req, res) => {
  try {
    const studentRes = await pool.query('SELECT batch_id FROM students WHERE id=$1', [req.params.id]);
    if (!studentRes.rows.length) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const batchId = studentRes.rows[0].batch_id;

    // Soft delete: move to Recycle Bin
    await pool.query('UPDATE students SET deleted_at = NOW() WHERE id=$1', [req.params.id]);

    // Recalibrate batch current_serial to the highest remaining active student serial
    const maxSerialRes = await pool.query(
      'SELECT COALESCE(MAX(serial_number), 0) AS max_serial FROM students WHERE batch_id=$1 AND deleted_at IS NULL',
      [batchId]
    );
    await pool.query(
      'UPDATE batches SET current_serial=$1 WHERE id=$2',
      [maxSerialRes.rows[0].max_serial, batchId]
    );

    res.json({ message: 'Student moved to Recycle Bin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updatePhoto = async (req, res) => {
  const { photo } = req.body;
  const studentId = parseInt(req.params.id, 10);
  try {
    const check = await pool.query(
      `SELECT s.id, d.university_id 
       FROM students s
       JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1`,
      [studentId]
    );
    if (!check.rows.length) return res.status(404).json({ message: 'Student not found' });
    if (req.user.role === 'client_admin' && check.rows[0].university_id !== req.user.university_id) {
      return res.status(403).json({ message: 'Access denied: can only update students in your university' });
    }

    const result = await pool.query(
      'UPDATE students SET photo = $1 WHERE id = $2 RETURNING *',
      [photo || null, studentId]
    );
    res.json({ message: 'Student photo updated successfully', student: result.rows[0] });
  } catch (err) {
    console.error('Update photo error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, admit, bulkAdmit, remove, updatePhoto };
