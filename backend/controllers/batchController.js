const pool = require('../db/connection');

const getAll = async (req, res) => {
  const { department_id } = req.query;
  try {
    let query = `
      SELECT b.*, d.name AS department_name, d.university_id
      FROM batches b JOIN departments d ON b.department_id = d.id
    `;
    const params = [];
    if (department_id) {
      query += ' WHERE b.department_id=$1';
      params.push(department_id);
    } else if (req.user.role === 'client_admin') {
      query += ' WHERE d.university_id=$1';
      params.push(req.user.university_id);
    }
    query += ' ORDER BY b.year DESC, b.semester_index ASC NULLS LAST, b.batch_number ASC NULLS LAST';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  const { department_id, year, batch_number, semester_code, semester_index } = req.body;
  if (!department_id || !year)
    return res.status(400).json({ message: 'department_id and year are required' });

  try {
    const deptResult = await pool.query(
      `SELECT d.*, u.type AS uni_type FROM departments d
       JOIN universities u ON d.university_id = u.id WHERE d.id=$1`,
      [department_id]
    );
    if (!deptResult.rows.length) return res.status(404).json({ message: 'Department not found' });

    const { uni_type } = deptResult.rows[0];
    if (uni_type === 'close_credit' && !batch_number)
      return res.status(400).json({ message: 'batch_number required for close_credit university' });
    if (uni_type === 'open_credit' && (!semester_code || !semester_index))
      return res.status(400).json({ message: 'semester_code and semester_index required for open_credit university' });

    const result = await pool.query(
      `INSERT INTO batches (department_id, year, batch_number, semester_code, semester_index)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [department_id, year, batch_number || null, semester_code || null, semester_index || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const students = await pool.query('SELECT id FROM students WHERE batch_id=$1 LIMIT 1', [req.params.id]);
    if (students.rows.length > 0)
      return res.status(403).json({ message: 'Cannot delete batch with admitted students' });
    await pool.query('DELETE FROM batches WHERE id=$1', [req.params.id]);
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, remove };
