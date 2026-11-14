const pool = require('../db/connection');
const { loadOwned } = require('../utils/tenant');
const { serverError } = require('../utils/http');
const { SEMESTER_MAP } = require('../utils/idGenerator');

const getAll = async (req, res) => {
  const { department_id, trash } = req.query;
  try {
    let query = `
      SELECT b.*, COALESCE(d.code, d.name) AS department_name, COALESCE(d.code, d.name) AS department_code, d.full_name AS department_full_name, d.university_id
      FROM batches b JOIN departments d ON b.department_id = d.id
    `;
    const params = [];
    const conds = [];

    if (trash === 'true') {
      conds.push('b.deleted_at IS NOT NULL');
    } else {
      conds.push('b.deleted_at IS NULL');
    }

    if (department_id) {
      conds.push(`b.department_id=$${params.length + 1}`);
      params.push(department_id);
    }
    // Client admins ALWAYS see only their own university, even when filtering by department
    if (req.user.role === 'client_admin') {
      conds.push(`d.university_id=$${params.length + 1}`);
      params.push(req.user.university_id);
    }
    if (conds.length) query += ' WHERE ' + conds.join(' AND ');
    query += ' ORDER BY b.year DESC, b.semester_index ASC NULLS LAST, b.batch_number ASC NULLS LAST';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    return serverError(res, err, 'List batches error');
  }
};

const create = async (req, res) => {
  const { department_id, year, batch_number, semester_index } = req.body;
  if (!department_id || !year)
    return res.status(400).json({ message: 'department_id and year are required' });

  const yearNum = Number(year);
  if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2099)
    return res.status(400).json({ message: 'year must be between 2000 and 2099' });

  try {
    const owned = await loadOwned('department', department_id, req.user);
    if (owned.status) {
      const message = owned.status === 404 ? 'Department not found' : owned.message;
      return res.status(owned.status).json({ message });
    }
    if (owned.record.deleted_at)
      return res.status(400).json({ message: 'Department is in the Recycle Bin' });

    const uni = await pool.query('SELECT type FROM universities WHERE id=$1', [owned.record.university_id]);
    const uniType = uni.rows[0].type;

    let batchNum = null;
    let semIndex = null;
    let semCode = null;

    if (uniType === 'close_credit') {
      if (!batch_number)
        return res.status(400).json({ message: 'batch_number required for close_credit university' });
      batchNum = Number(batch_number);
      // 1–99 keeps every ID the same length (batch is always 2 digits in the ID)
      if (!Number.isInteger(batchNum) || batchNum < 1 || batchNum > 99)
        return res.status(400).json({ message: 'batch_number must be a whole number from 1 to 99' });
    } else {
      semIndex = Number(semester_index);
      if (!semester_index || !req.body.semester_code)
        return res.status(400).json({ message: 'semester_code and semester_index required for open_credit university' });
      if (!SEMESTER_MAP[semIndex])
        return res.status(400).json({ message: 'semester_index must be 1 (Spring), 2 (Summer) or 3 (Fall)' });
      // The code is derived from the index so the two can never disagree
      semCode = SEMESTER_MAP[semIndex];
      if (req.body.semester_code !== semCode)
        return res.status(400).json({ message: `semester_code must be ${semCode} for semester_index ${semIndex}` });
    }

    const result = await pool.query(
      `INSERT INTO batches (department_id, year, batch_number, semester_code, semester_index)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [owned.record.id, yearNum, batchNum, semCode, semIndex]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    return serverError(res, err, 'Create batch error');
  }
};

const remove = async (req, res) => {
  try {
    const owned = await loadOwned('batch', req.params.id, req.user);
    if (owned.status) return res.status(owned.status).json({ message: owned.message });
    if (owned.record.deleted_at)
      return res.status(400).json({ message: 'Batch is already in the Recycle Bin' });

    const students = await pool.query('SELECT id FROM students WHERE batch_id=$1 AND deleted_at IS NULL LIMIT 1', [owned.record.id]);
    if (students.rows.length > 0)
      return res.status(403).json({ message: 'Cannot delete batch with active admitted students' });
    await pool.query('UPDATE batches SET deleted_at = NOW() WHERE id=$1', [owned.record.id]);
    res.json({ message: 'Batch moved to Recycle Bin' });
  } catch (err) {
    return serverError(res, err, 'Delete batch error');
  }
};

module.exports = { getAll, create, remove };
