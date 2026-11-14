const pool = require('../db/connection');
const { loadOwned } = require('../utils/tenant');
const { serverError } = require('../utils/http');

// Letters only, 2–6 characters (e.g. CSE, EEE, BBA). Digits are not allowed because the
// department code is followed by numbers in the student ID, which would make IDs ambiguous.
const DEPT_CODE_RE = /^[A-Z]{2,6}$/;

const getAll = async (req, res) => {
  try {
    const { trash } = req.query;
    const uniId = req.user.role === 'super_admin'
      ? (req.query.university_id || null)
      : req.user.university_id;

    const trashCond = trash === 'true' ? 'deleted_at IS NOT NULL' : 'deleted_at IS NULL';

    const query = uniId
      ? `SELECT id, university_id, name, COALESCE(code, name) AS code, COALESCE(full_name, name) AS full_name, created_at FROM departments WHERE university_id=$1 AND ${trashCond} ORDER BY COALESCE(code, name) ASC`
      : `SELECT id, university_id, name, COALESCE(code, name) AS code, COALESCE(full_name, name) AS full_name, created_at FROM departments WHERE ${trashCond} ORDER BY COALESCE(code, name) ASC`;

    const result = uniId ? await pool.query(query, [uniId]) : await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    return serverError(res, err, 'Department error');
  }
};

const create = async (req, res) => {
  const { name, code, full_name, university_id } = req.body;
  const deptCode = (code || name || '').trim().toUpperCase();
  const deptFullName = (full_name || name || code || '').trim();

  if (!deptCode) {
    return res.status(400).json({ message: 'Department code is required' });
  }
  if (!DEPT_CODE_RE.test(deptCode)) {
    return res.status(400).json({ message: 'Department code must be 2–6 letters (A–Z), e.g. CSE' });
  }
  if (deptFullName.length > 150) {
    return res.status(400).json({ message: 'Department name must be at most 150 characters' });
  }

  const uniId = req.user.role === 'client_admin' ? req.user.university_id : university_id;
  if (!uniId) return res.status(400).json({ message: 'university_id is required' });

  try {
    const result = await pool.query(
      'INSERT INTO departments (university_id, name, code, full_name) VALUES ($1,$2,$3,$4) RETURNING *',
      [uniId, deptCode, deptCode, deptFullName || deptCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Department already exists' });
    if (err.code === '23503') return res.status(400).json({ message: 'University not found' });
    return serverError(res, err, 'Create department error');
  }
};

const remove = async (req, res) => {
  try {
    const owned = await loadOwned('department', req.params.id, req.user);
    if (owned.status) return res.status(owned.status).json({ message: owned.message });
    if (owned.record.deleted_at)
      return res.status(400).json({ message: 'Department is already in the Recycle Bin' });

    const batches = await pool.query('SELECT id FROM batches WHERE department_id=$1 AND deleted_at IS NULL LIMIT 1', [owned.record.id]);
    if (batches.rows.length > 0)
      return res.status(403).json({ message: 'Cannot delete department with active batches' });
    await pool.query('UPDATE departments SET deleted_at = NOW() WHERE id=$1', [owned.record.id]);
    res.json({ message: 'Department moved to Recycle Bin' });
  } catch (err) {
    return serverError(res, err, 'Department error');
  }
};

module.exports = { getAll, create, remove };
