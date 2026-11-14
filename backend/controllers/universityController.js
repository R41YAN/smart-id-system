const pool = require('../db/connection');
const { canAccessUniversity, parseId } = require('../utils/tenant');
const { serverError, isValidImage } = require('../utils/http');

const LOGO_ERROR = 'logo_url must be a PNG/JPEG/WEBP/GIF/SVG image or an http(s) URL (max ~1 MB)';

const getAll = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'super_admin') {
      result = await pool.query(
        `SELECT u.*, us.name AS created_by_name
         FROM universities u LEFT JOIN users us ON u.created_by = us.id
         ORDER BY u.created_at DESC`
      );
    } else {
      result = await pool.query('SELECT * FROM universities WHERE id = $1', [req.user.university_id]);
    }
    res.json(result.rows);
  } catch (err) {
    return serverError(res, err, 'University error');
  }
};

const getOne = async (req, res) => {
  const id = parseId(req.params.id);
  // Client admins may only read their own university
  if (!id || !canAccessUniversity(req.user, id)) return res.status(404).json({ message: 'University not found' });
  try {
    const result = await pool.query('SELECT * FROM universities WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'University not found' });
    res.json(result.rows[0]);
  } catch (err) {
    return serverError(res, err, 'University error');
  }
};

const create = async (req, res) => {
  const { name, type, logo_url } = req.body;
  if (!name || !type) return res.status(400).json({ message: 'name and type are required' });
  if (!['open_credit', 'close_credit'].includes(type))
    return res.status(400).json({ message: 'type must be open_credit or close_credit' });
  if (typeof name !== 'string' || name.trim().length > 200)
    return res.status(400).json({ message: 'name must be at most 200 characters' });
  if (!isValidImage(logo_url)) return res.status(400).json({ message: LOGO_ERROR });
  try {
    const result = await pool.query(
      `INSERT INTO universities (name, type, logo_url, created_by) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, type, logo_url || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    return serverError(res, err, 'University error');
  }
};

const update = async (req, res) => {
  const { name, logo_url } = req.body;
  const targetId = parseId(req.params.id);
  if (!targetId) return res.status(400).json({ message: 'Invalid university id' });
  if (logo_url !== undefined && !isValidImage(logo_url)) return res.status(400).json({ message: LOGO_ERROR });
  if (name !== undefined && name !== null && (typeof name !== 'string' || !name.trim() || name.trim().length > 200))
    return res.status(400).json({ message: 'name must be 1–200 characters' });
  try {
    // Client Admin can only update their own assigned university; Super Admin can update any
    if (req.user.role !== 'super_admin' && req.user.university_id !== targetId) {
      return res.status(403).json({ message: 'Access denied: can only update your assigned university' });
    }

    const current = await pool.query('SELECT * FROM universities WHERE id=$1', [targetId]);
    if (!current.rows.length) return res.status(404).json({ message: 'University not found' });

    const newName = name !== undefined && name !== null ? name : current.rows[0].name;
    const newLogo = logo_url !== undefined ? logo_url : current.rows[0].logo_url;

    const result = await pool.query(
      'UPDATE universities SET name=$1, logo_url=$2 WHERE id=$3 RETURNING *',
      [newName, newLogo, targetId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    return serverError(res, err, 'University error');
  }
};

const remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid university id' });
  try {
    const uni = await pool.query('SELECT * FROM universities WHERE id=$1', [id]);
    if (!uni.rows.length) return res.status(404).json({ message: 'University not found' });
    if (uni.rows[0].is_locked)
      return res.status(403).json({ message: 'Cannot delete: university has admitted students' });
    const used = await pool.query(
      'SELECT 1 FROM students s JOIN departments d ON s.department_id = d.id WHERE d.university_id=$1 LIMIT 1', [id]);
    if (used.rows.length)
      return res.status(403).json({ message: 'Cannot delete: university has student records (including in the Recycle Bin)' });
    await pool.query('DELETE FROM universities WHERE id=$1', [id]);
    res.json({ message: 'University deleted' });
  } catch (err) {
    return serverError(res, err, 'University error');
  }
};

module.exports = { getAll, getOne, create, update, remove };
