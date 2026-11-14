const pool = require('../db/connection');
const { generateStudentId } = require('../utils/idGenerator');
const { loadOwned, parseId } = require('../utils/tenant');
const { serverError, isValidImage } = require('../utils/http');

const MAX_SERIAL = 999;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates one student's personal fields. Returns an error message or null. */
function validateStudentFields({ name, email, phone, photo }) {
  if (typeof name !== 'string' || !name.trim()) return 'name is required';
  if (name.trim().length > 100) return 'name must be at most 100 characters';
  if (email && (typeof email !== 'string' || email.length > 150 || !EMAIL_RE.test(email))) return 'email is not valid';
  if (phone && (typeof phone !== 'string' || !/^[0-9+\-\s()]{3,20}$/.test(phone))) return 'phone is not valid';
  if (!isValidImage(photo)) return 'photo must be a PNG/JPEG/WEBP/GIF image or an http(s) URL (max ~1 MB)';
  return null;
}

/**
 * Locks the batch row (SELECT ... FOR UPDATE) and loads everything needed to generate IDs.
 * Must be called inside a transaction.
 */
async function lockBatch(client, batchId) {
  const result = await client.query(
    `SELECT b.*, COALESCE(d.code, d.name) AS dept_name, d.deleted_at AS dept_deleted_at,
            u.type AS uni_type, u.id AS uni_id
     FROM batches b
     JOIN departments d ON b.department_id = d.id
     JOIN universities u ON d.university_id = u.id
     WHERE b.id=$1
     FOR UPDATE OF b`,
    [batchId]
  );
  return result.rows[0] || null;
}

/**
 * Highest serial ever used in this batch — including students in the Recycle Bin.
 * Serials are never reused, so a deleted student's ID can never be given to someone else.
 */
async function lastUsedSerial(client, batch) {
  const r = await client.query('SELECT COALESCE(MAX(serial_number), 0) AS max FROM students WHERE batch_id=$1', [batch.id]);
  return Math.max(Number(batch.current_serial) || 0, Number(r.rows[0].max) || 0);
}

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
    return serverError(res, err, 'List students error');
  }
};

// POST /api/students  — Concurrency-safe admission
const admit = async (req, res) => {
  const { batch_id, department_id, name, email, phone, photo } = req.body;
  const batchId = parseId(batch_id);
  if (!batch_id || !department_id || !name)
    return res.status(400).json({ message: 'batch_id, department_id, and name are required' });
  if (!batchId) return res.status(400).json({ message: 'Invalid batch_id' });
  const fieldError = validateStudentFields({ name, email, phone, photo });
  if (fieldError) return res.status(400).json({ message: fieldError });

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // ── LOCK batch row (prevents race conditions) ──────────────────────────
    const batch = await lockBatch(client, batchId);
    if (!batch) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Access control — client_admin can only admit to their own university
    if (req.user.role === 'client_admin' && batch.uni_id !== req.user.university_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Access denied' });
    }
    if (batch.deleted_at || batch.dept_deleted_at) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'This batch or its department is in the Recycle Bin' });
    }
    // The student must belong to the department of the batch (the ID is built from it)
    if (Number(department_id) !== batch.department_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'department_id does not match the department of this batch' });
    }

    // Serial cap
    const newSerial = (await lastUsedSerial(client, batch)) + 1;
    if (newSerial > MAX_SERIAL) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Maximum capacity (${MAX_SERIAL}) reached for this batch` });
    }

    // Increment serial
    await client.query('UPDATE batches SET current_serial=$1 WHERE id=$2', [newSerial, batch.id]);

    // Lock university (immutable after first admission)
    await client.query('UPDATE universities SET is_locked=TRUE WHERE id=$1 AND is_locked IS NOT TRUE', [batch.uni_id]);

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
      [batch.id, batch.department_id, studentId, name.trim(), email || null, phone || null, photo || null, newSerial, req.user.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Student admitted successfully', student: studentResult.rows[0] });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    if (err.code === '23505')
      return res.status(409).json({ message: 'ID conflict — please retry' });
    return serverError(res, err, 'Admit error');
  } finally {
    if (client) client.release();
  }
};

// POST /api/students/bulk  — Concurrency-safe bulk admission
const MAX_BULK_ROWS = 999;

const bulkAdmit = async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'students array is required and must not be empty' });
  }
  if (students.length > MAX_BULK_ROWS) {
    return res.status(400).json({ message: `At most ${MAX_BULK_ROWS} students can be imported at once` });
  }

  // Validate every row before touching the database
  const byBatch = new Map();
  for (let i = 0; i < students.length; i++) {
    const item = students[i] || {};
    if (!item.batch_id || !item.department_id || !item.name) {
      return res.status(400).json({ message: `Row #${i + 1} is missing batch_id, department_id, or name` });
    }
    const batchId = parseId(item.batch_id);
    if (!batchId) return res.status(400).json({ message: `Row #${i + 1}: invalid batch_id` });
    const fieldError = validateStudentFields(item);
    if (fieldError) return res.status(400).json({ message: `Row #${i + 1}: ${fieldError}` });
    if (!byBatch.has(batchId)) byBatch.set(batchId, []);
    byBatch.get(batchId).push({ ...item, row: i + 1 });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const admittedStudents = [];

    // Lock batches in ascending id order so two bulk imports can never deadlock
    const batchIds = [...byBatch.keys()].sort((x, y) => x - y);

    for (const batchId of batchIds) {
      const batch = await lockBatch(client, batchId);

      if (!batch || batch.deleted_at || batch.dept_deleted_at) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: `Batch ID ${batchId} not found or inactive` });
      }

      if (req.user.role === 'client_admin' && batch.uni_id !== req.user.university_id) {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: `Access denied to batch ID ${batchId}` });
      }

      const batchStudents = byBatch.get(batchId);
      const wrongDept = batchStudents.find((s) => Number(s.department_id) !== batch.department_id);
      if (wrongDept) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Row #${wrongDept.row}: department does not match the batch's department` });
      }

      let runningSerial = await lastUsedSerial(client, batch);
      if (runningSerial + batchStudents.length > MAX_SERIAL) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Batch "${batch.dept_name}" exceeds capacity limit (${MAX_SERIAL}). Remaining seats: ${MAX_SERIAL - runningSerial}`
        });
      }

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
          [batch.id, batch.department_id, studentId, s.name.trim(), s.email || null, s.phone || null, s.photo || null, runningSerial, req.user.id]
        );
        admittedStudents.push(ins.rows[0]);
      }

      await client.query('UPDATE batches SET current_serial=$1 WHERE id=$2', [runningSerial, batch.id]);
      await client.query('UPDATE universities SET is_locked=TRUE WHERE id=$1 AND is_locked IS NOT TRUE', [batch.uni_id]);
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
    if (err.code === '23505')
      return res.status(409).json({ message: 'ID conflict — please retry' });
    return serverError(res, err, 'Bulk admit error');
  } finally {
    if (client) client.release();
  }
};

// DELETE /api/students/:id — move to Recycle Bin
const remove = async (req, res) => {
  try {
    const owned = await loadOwned('student', req.params.id, req.user);
    if (owned.status) return res.status(owned.status).json({ message: owned.message });
    if (owned.record.deleted_at) {
      return res.status(400).json({ message: 'Student is already in the Recycle Bin' });
    }

    // Soft delete only. The batch serial counter is NOT lowered: serials (and therefore
    // student IDs) are never reused, so restoring the student later can never collide.
    await pool.query('UPDATE students SET deleted_at = NOW() WHERE id=$1', [owned.record.id]);

    res.json({ message: 'Student moved to Recycle Bin' });
  } catch (err) {
    return serverError(res, err, 'Delete student error');
  }
};

const updatePhoto = async (req, res) => {
  const { photo } = req.body;
  if (!isValidImage(photo)) {
    return res.status(400).json({ message: 'photo must be a PNG/JPEG/WEBP/GIF image or an http(s) URL (max ~1 MB)' });
  }
  try {
    const owned = await loadOwned('student', req.params.id, req.user);
    if (owned.status) return res.status(owned.status).json({ message: owned.message });

    const result = await pool.query(
      'UPDATE students SET photo = $1 WHERE id = $2 RETURNING *',
      [photo || null, owned.record.id]
    );
    res.json({ message: 'Student photo updated successfully', student: result.rows[0] });
  } catch (err) {
    return serverError(res, err, 'Update photo error');
  }
};

module.exports = { getAll, admit, bulkAdmit, remove, updatePhoto };
