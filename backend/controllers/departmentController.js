const pool = require('../db/connection');

const getAll = async (req, res) => {
  try {
    const uniId = req.user.role === 'super_admin'
      ? (req.query.university_id || null)
      : req.user.university_id;

    const result = uniId
      ? await pool.query('SELECT * FROM departments WHERE university_id=$1 ORDER BY name', [uniId])
      : await pool.query('SELECT * FROM departments ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  const { name, university_id } = req.body;
  if (!name) return res.status(400).json({ message: 'Department name is required' });
  const uniId = req.user.role === 'client_admin' ? req.user.university_id : university_id;
  if (!uniId) return res.status(400).json({ message: 'university_id is required' });
  try {
    const result = await pool.query(
      'INSERT INTO departments (university_id, name) VALUES ($1,$2) RETURNING *',
      [uniId, name.toUpperCase().trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Department already exists' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM departments WHERE id=$1', [req.params.id]);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, remove };
