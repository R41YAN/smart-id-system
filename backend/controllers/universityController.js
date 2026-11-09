const pool = require('../db/connection');

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
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM universities WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'University not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  const { name, type, logo_url } = req.body;
  if (!name || !type) return res.status(400).json({ message: 'name and type are required' });
  if (!['open_credit', 'close_credit'].includes(type))
    return res.status(400).json({ message: 'type must be open_credit or close_credit' });
  try {
    const result = await pool.query(
      `INSERT INTO universities (name, type, logo_url, created_by) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, type, logo_url || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  const { name, logo_url } = req.body;
  const targetId = parseInt(req.params.id, 10);
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
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const uni = await pool.query('SELECT * FROM universities WHERE id=$1', [req.params.id]);
    if (!uni.rows.length) return res.status(404).json({ message: 'University not found' });
    if (uni.rows[0].is_locked)
      return res.status(403).json({ message: 'Cannot delete: university has admitted students' });
    await pool.query('DELETE FROM universities WHERE id=$1', [req.params.id]);
    res.json({ message: 'University deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
