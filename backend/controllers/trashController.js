const pool = require('../db/connection');

// GET /api/trash — View all soft-deleted records for this university
const getTrash = async (req, res) => {
  try {
    const isClient = req.user.role === 'client_admin';
    const uniId = req.user.university_id;

    // 1. Deleted Students
    let studentQuery = `
      SELECT s.*, COALESCE(d.code, d.name) AS department_name, b.year, b.batch_number,
             b.semester_code, b.semester_index, u.name AS university_name
      FROM students s
      JOIN departments d ON s.department_id = d.id
      JOIN batches b ON s.batch_id = b.id
      JOIN universities u ON d.university_id = u.id
      WHERE s.deleted_at IS NOT NULL
    `;
    const studentParams = [];
    if (isClient) {
      studentQuery += ' AND d.university_id = $1';
      studentParams.push(uniId);
    }
    studentQuery += ' ORDER BY s.deleted_at DESC';
    const studentsRes = await pool.query(studentQuery, studentParams);

    // 2. Deleted Batches
    let batchQuery = `
      SELECT b.*, COALESCE(d.code, d.name) AS department_name, d.university_id, u.name AS university_name
      FROM batches b
      JOIN departments d ON b.department_id = d.id
      JOIN universities u ON d.university_id = u.id
      WHERE b.deleted_at IS NOT NULL
    `;
    const batchParams = [];
    if (isClient) {
      batchQuery += ' AND d.university_id = $1';
      batchParams.push(uniId);
    }
    batchQuery += ' ORDER BY b.deleted_at DESC';
    const batchesRes = await pool.query(batchQuery, batchParams);

    // 3. Deleted Departments
    let deptQuery = `
      SELECT d.*, u.name AS university_name
      FROM departments d
      JOIN universities u ON d.university_id = u.id
      WHERE d.deleted_at IS NOT NULL
    `;
    const deptParams = [];
    if (isClient) {
      deptQuery += ' AND d.university_id = $1';
      deptParams.push(uniId);
    }
    deptQuery += ' ORDER BY d.deleted_at DESC';
    const deptsRes = await pool.query(deptQuery, deptParams);

    res.json({
      students: studentsRes.rows,
      batches: batchesRes.rows,
      departments: deptsRes.rows,
      totalCount: studentsRes.rows.length + batchesRes.rows.length + deptsRes.rows.length
    });
  } catch (err) {
    console.error('Get trash error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/trash/restore — Restore a soft-deleted record
const restoreItem = async (req, res) => {
  const { type, id } = req.body;
  if (!type || !id) {
    return res.status(400).json({ message: 'type and id are required' });
  }

  try {
    if (type === 'student') {
      const studentRes = await pool.query('SELECT batch_id FROM students WHERE id=$1', [id]);
      if (!studentRes.rows.length) return res.status(404).json({ message: 'Student not found in trash' });
      const batchId = studentRes.rows[0].batch_id;

      await pool.query('UPDATE students SET deleted_at = NULL WHERE id=$1', [id]);

      // Recalibrate batch serial
      const maxSerialRes = await pool.query(
        'SELECT COALESCE(MAX(serial_number), 0) AS max_serial FROM students WHERE batch_id=$1 AND deleted_at IS NULL',
        [batchId]
      );
      await pool.query('UPDATE batches SET current_serial=$1 WHERE id=$2', [maxSerialRes.rows[0].max_serial, batchId]);

      return res.json({ message: 'Student restored successfully' });
    }

    if (type === 'batch') {
      await pool.query('UPDATE batches SET deleted_at = NULL WHERE id=$1', [id]);
      return res.json({ message: 'Batch restored successfully' });
    }

    if (type === 'department') {
      await pool.query('UPDATE departments SET deleted_at = NULL WHERE id=$1', [id]);
      return res.json({ message: 'Department restored successfully' });
    }

    return res.status(400).json({ message: 'Invalid entity type' });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/trash/permanent — Permanently delete a single item
const permanentDelete = async (req, res) => {
  const { type, id } = req.body;
  if (!type || !id) {
    return res.status(400).json({ message: 'type and id are required' });
  }

  try {
    if (type === 'student') {
      await pool.query('DELETE FROM students WHERE id=$1', [id]);
      return res.json({ message: 'Student permanently deleted' });
    }

    if (type === 'batch') {
      await pool.query('DELETE FROM batches WHERE id=$1', [id]);
      return res.json({ message: 'Batch permanently deleted' });
    }

    if (type === 'department') {
      await pool.query('DELETE FROM departments WHERE id=$1', [id]);
      return res.json({ message: 'Department permanently deleted' });
    }

    return res.status(400).json({ message: 'Invalid entity type' });
  } catch (err) {
    console.error('Permanent delete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/trash/empty — Empty all trash for the university
const emptyTrash = async (req, res) => {
  try {
    const isClient = req.user.role === 'client_admin';
    const uniId = req.user.university_id;

    if (isClient) {
      await pool.query(`
        DELETE FROM students 
        WHERE deleted_at IS NOT NULL 
          AND department_id IN (SELECT id FROM departments WHERE university_id = $1)
      `, [uniId]);

      await pool.query(`
        DELETE FROM batches 
        WHERE deleted_at IS NOT NULL 
          AND department_id IN (SELECT id FROM departments WHERE university_id = $1)
      `, [uniId]);

      await pool.query(`
        DELETE FROM departments 
        WHERE deleted_at IS NOT NULL AND university_id = $1
      `, [uniId]);
    } else {
      await pool.query('DELETE FROM students WHERE deleted_at IS NOT NULL');
      await pool.query('DELETE FROM batches WHERE deleted_at IS NOT NULL');
      await pool.query('DELETE FROM departments WHERE deleted_at IS NOT NULL');
    }

    res.json({ message: 'Recycle bin emptied permanently' });
  } catch (err) {
    console.error('Empty trash error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getTrash, restoreItem, permanentDelete, emptyTrash };
