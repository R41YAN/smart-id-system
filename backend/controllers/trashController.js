const pool = require('../db/connection');
const { loadOwned } = require('../utils/tenant');
const { serverError } = require('../utils/http');

const TRASH_TYPES = ['student', 'batch', 'department', 'university'];
const capitalize = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// GET /api/trash — View all soft-deleted records (Role-separated: Super Admin sees Universities, Client Admin sees campus records)
const getTrash = async (req, res) => {
  try {
    const isClient = req.user.role === 'client_admin';
    const uniId = req.user.university_id;

    // Super Admin: Clean Role Separation (only manages deleted Universities)
    if (!isClient) {
      const uniQuery = `
        SELECT u.*, us.name AS created_by_name
        FROM universities u
        LEFT JOIN users us ON u.created_by = us.id
        WHERE u.deleted_at IS NOT NULL
        ORDER BY u.deleted_at DESC
      `;
      const unisRes = await pool.query(uniQuery);
      return res.json({
        students: [],
        batches: [],
        departments: [],
        universities: unisRes.rows,
        totalCount: unisRes.rows.length
      });
    }

    // Client Admin: Manages their campus academic records (Students, Batches, Departments)
    // 1. Deleted Students
    const studentQuery = `
      SELECT s.*, COALESCE(d.code, d.name) AS department_name, b.year, b.batch_number,
             b.semester_code, b.semester_index, u.name AS university_name, u.logo_url AS university_logo
      FROM students s
      JOIN departments d ON s.department_id = d.id
      JOIN batches b ON s.batch_id = b.id
      JOIN universities u ON d.university_id = u.id
      WHERE s.deleted_at IS NOT NULL AND d.university_id = $1
      ORDER BY s.deleted_at DESC
    `;
    const studentsRes = await pool.query(studentQuery, [uniId]);

    // 2. Deleted Batches
    const batchQuery = `
      SELECT b.*, COALESCE(d.code, d.name) AS department_name, d.university_id, u.name AS university_name, u.logo_url AS university_logo
      FROM batches b
      JOIN departments d ON b.department_id = d.id
      JOIN universities u ON d.university_id = u.id
      WHERE b.deleted_at IS NOT NULL AND d.university_id = $1
      ORDER BY b.deleted_at DESC
    `;
    const batchesRes = await pool.query(batchQuery, [uniId]);

    // 3. Deleted Departments
    const deptQuery = `
      SELECT d.*, u.name AS university_name, u.logo_url AS university_logo
      FROM departments d
      JOIN universities u ON d.university_id = u.id
      WHERE d.deleted_at IS NOT NULL AND d.university_id = $1
      ORDER BY d.deleted_at DESC
    `;
    const deptsRes = await pool.query(deptQuery, [uniId]);

    res.json({
      students: studentsRes.rows,
      batches: batchesRes.rows,
      departments: deptsRes.rows,
      universities: [],
      totalCount: studentsRes.rows.length + batchesRes.rows.length + deptsRes.rows.length
    });
  } catch (err) {
    return serverError(res, err, 'Get trash error');
  }
};

// POST /api/trash/restore — Restore a soft-deleted record
const restoreItem = async (req, res) => {
  const { type, id } = req.body;
  if (!type || !id) {
    return res.status(400).json({ message: 'type and id are required' });
  }
  if (!TRASH_TYPES.includes(type)) {
    return res.status(400).json({ message: 'Invalid entity type' });
  }

  try {
    const owned = await loadOwned(type, id, req.user);
    if (owned.status) return res.status(owned.status).json({ message: owned.message });
    const { record } = owned;
    if (!record.deleted_at) {
      return res.status(400).json({ message: `${capitalize(type)} is not in the Recycle Bin` });
    }

    if (type === 'student') {
      const parent = await pool.query('SELECT deleted_at FROM batches WHERE id=$1', [record.batch_id]);
      if (parent.rows[0]?.deleted_at) {
        return res.status(409).json({ message: 'Restore the batch of this student first' });
      }
      await pool.query('UPDATE students SET deleted_at = NULL WHERE id=$1', [record.id]);
      return res.json({ message: 'Student restored successfully' });
    }

    if (type === 'batch') {
      const parent = await pool.query('SELECT deleted_at FROM departments WHERE id=$1', [record.department_id]);
      if (parent.rows[0]?.deleted_at) {
        return res.status(409).json({ message: 'Restore the department of this batch first' });
      }
      await pool.query('UPDATE batches SET deleted_at = NULL WHERE id=$1', [record.id]);
      return res.json({ message: 'Batch restored successfully' });
    }

    if (type === 'department') {
      await pool.query('UPDATE departments SET deleted_at = NULL WHERE id=$1', [record.id]);
      return res.json({ message: 'Department restored successfully' });
    }

    if (type === 'university') {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Only super admin can restore universities' });
      }
      await pool.query('UPDATE universities SET deleted_at = NULL WHERE id=$1', [record.id]);
      return res.json({ message: 'University restored successfully' });
    }

    return res.status(400).json({ message: 'Invalid entity type' });
  } catch (err) {
    return serverError(res, err, 'Restore error');
  }
};

// DELETE /api/trash/permanent — Permanently delete a single item that is already in the Recycle Bin
const permanentDelete = async (req, res) => {
  const { type, id } = req.body;
  if (!type || !id) {
    return res.status(400).json({ message: 'type and id are required' });
  }
  if (!TRASH_TYPES.includes(type)) {
    return res.status(400).json({ message: 'Invalid entity type' });
  }

  try {
    const owned = await loadOwned(type, id, req.user);
    if (owned.status) return res.status(owned.status).json({ message: owned.message });
    const { record } = owned;
    if (!record.deleted_at) {
      return res.status(400).json({ message: `Only items in the Recycle Bin can be deleted permanently` });
    }

    if (type === 'university') {
      const depts = await pool.query('SELECT 1 FROM departments WHERE university_id=$1 LIMIT 1', [record.id]);
      if (depts.rows.length) {
        return res.status(409).json({
          message: 'Cannot delete permanently: it still contains departments. Delete those departments permanently first.',
        });
      }
      await pool.query('DELETE FROM users WHERE university_id = $1', [record.id]);
    }

    const table = { student: 'students', batch: 'batches', department: 'departments', university: 'universities' }[type];
    await pool.query(`DELETE FROM ${table} WHERE id=$1 AND deleted_at IS NOT NULL`, [record.id]);
    return res.json({ message: `${capitalize(type)} permanently deleted` });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        message: 'Cannot delete permanently: it still contains related records. Delete those first.',
      });
    }
    return serverError(res, err, 'Permanent delete error');
  }
};

// POST /api/trash/empty — Empty trash safely by role
const emptyTrash = async (req, res) => {
  let client;
  try {
    const isClient = req.user.role === 'client_admin';
    const uniId = req.user.university_id;

    client = await pool.connect();
    await client.query('BEGIN'); // all-or-nothing

    if (isClient) {
      // Client Admin empties only their own campus's deleted records
      await client.query(`
        DELETE FROM students 
        WHERE deleted_at IS NOT NULL 
          AND department_id IN (SELECT id FROM departments WHERE university_id = $1)
      `, [uniId]);

      await client.query(`
        DELETE FROM batches 
        WHERE deleted_at IS NOT NULL 
          AND department_id IN (SELECT id FROM departments WHERE university_id = $1)
      `, [uniId]);

      await client.query(`
        DELETE FROM departments 
        WHERE deleted_at IS NOT NULL AND university_id = $1
      `, [uniId]);
    } else {
      // Super Admin only empties deleted Universities (never touches campus student/cohort records)
      await client.query(`
        DELETE FROM users 
        WHERE university_id IN (SELECT id FROM universities WHERE deleted_at IS NOT NULL)
      `);
      await client.query('DELETE FROM universities WHERE deleted_at IS NOT NULL');
    }

    await client.query('COMMIT');
    res.json({ message: 'Recycle bin emptied permanently' });
  } catch (err) {
    if (client) { try { await client.query('ROLLBACK'); } catch (_) {} }
    if (err.code === '23503') {
      return res.status(409).json({ message: 'Some items still contain active records and could not be deleted' });
    }
    return serverError(res, err, 'Empty trash error');
  } finally {
    if (client) client.release();
  }
};

module.exports = { getTrash, restoreItem, permanentDelete, emptyTrash };
