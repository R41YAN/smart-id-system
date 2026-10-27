const pool = require('../db/connection');
const { generateStudentId } = require('../utils/idGenerator');

const getAll = async (req, res) => {
  const { batch_id, department_id } = req.query;
  try {
    let query = `
      SELECT s.*, d.name AS department_name, b.year, b.batch_number,
             b.semester_code, b.semester_index, u.name AS university_name, u.type AS university_type
      FROM students s
      JOIN departments d ON s.department_id = d.id
      JOIN batches b ON s.batch_id = b.id
      JOIN universities u ON d.university_id = u.id
    `;
    const params = [];
    const conds = [];

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
  const { batch_id, department_id, name, email, phone } = req.body;
  if (!batch_id || !department_id || !name)
    return res.status(400).json({ message: 'batch_id, department_id, and name are required' });

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // ── LOCK batch row (prevents race conditions) ──────────────────────────
    const batchResult = await client.query(
      `SELECT b.*, d.name AS dept_name, u.type AS uni_type, u.id AS uni_id
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
      `INSERT INTO students (batch_id, department_id, student_id, name, email, phone, serial_number, admitted_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [batch_id, department_id, studentId, name, email || null, phone || null, newSerial, req.user.id]
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

const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id=$1', [req.params.id]);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, admit, remove };
