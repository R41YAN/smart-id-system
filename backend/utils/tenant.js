/**
 * Multi-tenant access helpers.
 *
 * Every record (student, batch, department) belongs to exactly one university.
 * A client_admin may only touch records of their own university; a super_admin may touch all.
 * Every endpoint that takes a record id MUST check ownership with these helpers.
 */
const pool = require('../db/connection');

const OWNER_QUERIES = {
  student: `SELECT s.id, s.deleted_at, s.batch_id, d.university_id
            FROM students s JOIN departments d ON s.department_id = d.id
            WHERE s.id = $1`,
  batch: `SELECT b.id, b.deleted_at, b.department_id, d.university_id
          FROM batches b JOIN departments d ON b.department_id = d.id
          WHERE b.id = $1`,
  department: `SELECT d.id, d.deleted_at, d.university_id
               FROM departments d
               WHERE d.id = $1`,
};

/** True if the logged-in user may access data of the given university. */
function canAccessUniversity(user, universityId) {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return user.role === 'client_admin'
    && user.university_id != null
    && Number(user.university_id) === Number(universityId);
}

/** Parses a positive integer id; returns null when invalid. */
function parseId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Loads a record and verifies the user owns it.
 * Returns { record } on success or { status, message } on failure.
 * Records of other universities are reported as "not found" so ids of other tenants are not revealed.
 */
async function loadOwned(type, rawId, user, db = pool) {
  const id = parseId(rawId);
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  if (!id) return { status: 400, message: `Invalid ${type} id` };

  const result = await db.query(OWNER_QUERIES[type], [id]);
  const record = result.rows[0];
  if (!record || !canAccessUniversity(user, record.university_id)) {
    return { status: 404, message: `${label} not found` };
  }
  return { record };
}

module.exports = { canAccessUniversity, loadOwned, parseId };
