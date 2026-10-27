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
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ message: 'name and type are required' });
  if (!['open_credit', 'close_credit'].includes(type))
    return res.status(400).json({ message: 'type must be open_credit or close_credit' });
  try {
    const result = await pool.query(
      `INSERT INTO universities (name, type, created_by) VALUES ($1,$2,$3) RETURNING *`,
      [name, type, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE universities SET name=$1 WHERE id=$2 RETURNING *',
      [name, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'University not found' });
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
