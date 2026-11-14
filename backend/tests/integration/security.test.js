/**
 * ============================================================================
 * INTEGRATION TEST SUITE: Security & ID-Integrity Regression Tests
 * ============================================================================
 *  - Tenant isolation (one university's admin can't read/change another's data)
 *  - Serial numbers / student IDs are never reused after delete & restore
 *  - Admission input integrity (department must match batch, no inactive batch)
 *  - Concurrency: parallel admissions get unique, gap-free serials
 *  - Login brute-force protection, forged tokens, input validation
 * ============================================================================
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../index');
const pool = require('../../db/connection');

const PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const login = async (email) =>
  (await request(app).post('/api/auth/login').send({ email, password: PASSWORD })).body.token;
const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Security & ID integrity', () => {
  let nsuToken, muToken, superToken;
  let nsu, mu; // { uniId, deptId, batchId, studentId }

  beforeAll(async () => {
    superToken = await login('superadmin@smartid.com');
    nsuToken = await login('nsu_admin@smartid.com');
    muToken = await login('mu_admin@smartid.com');

    const pick = async (uniName) => {
      const r = await pool.query(
        `SELECT u.id AS uni_id, d.id AS dept_id, b.id AS batch_id, s.id AS student_id
         FROM universities u
         JOIN departments d ON d.university_id = u.id
         JOIN batches b ON b.department_id = d.id
         JOIN students s ON s.batch_id = b.id
         WHERE u.name = $1 ORDER BY s.id LIMIT 1`, [uniName]);
      const row = r.rows[0];
      return { uniId: row.uni_id, deptId: row.dept_id, batchId: row.batch_id, studentId: row.student_id };
    };
    nsu = await pick('North South University');
    mu = await pick('Metropolitan University');
  });

  // ── Tenant isolation ──────────────────────────────────────────────────────
  describe('Tenant isolation (IDOR)', () => {
    test('SEC_01: NSU admin cannot permanently delete an MU student', async () => {
      const res = await request(app).delete('/api/trash/permanent').set(auth(nsuToken))
        .send({ type: 'student', id: mu.studentId });
      expect(res.status).toBe(404);
      const still = await pool.query('SELECT id FROM students WHERE id=$1', [mu.studentId]);
      expect(still.rows.length).toBe(1);
    });

    test('SEC_02: NSU admin cannot move an MU student to the Recycle Bin', async () => {
      const res = await request(app).delete(`/api/students/${mu.studentId}`).set(auth(nsuToken));
      expect(res.status).toBe(404);
      const r = await pool.query('SELECT deleted_at FROM students WHERE id=$1', [mu.studentId]);
      expect(r.rows[0].deleted_at).toBeNull();
    });

    test('SEC_03: NSU admin cannot restore or purge MU items from the Recycle Bin', async () => {
      await pool.query('UPDATE students SET deleted_at = NOW() WHERE id=$1', [mu.studentId]);
      const restore = await request(app).post('/api/trash/restore').set(auth(nsuToken))
        .send({ type: 'student', id: mu.studentId });
      expect(restore.status).toBe(404);
      const purge = await request(app).delete('/api/trash/permanent').set(auth(nsuToken))
        .send({ type: 'student', id: mu.studentId });
      expect(purge.status).toBe(404);
      // MU's own admin can restore it
      const own = await request(app).post('/api/trash/restore').set(auth(muToken))
        .send({ type: 'student', id: mu.studentId });
      expect(own.status).toBe(200);
    });

    test('SEC_04: NSU admin cannot delete MU batches or departments', async () => {
      const b = await request(app).delete(`/api/batches/${mu.batchId}`).set(auth(nsuToken));
      const d = await request(app).delete(`/api/departments/${mu.deptId}`).set(auth(nsuToken));
      expect(b.status).toBe(404);
      expect(d.status).toBe(404);
    });

    test('SEC_05: NSU admin cannot create a batch inside an MU department', async () => {
      const res = await request(app).post('/api/batches').set(auth(nsuToken))
        .send({ department_id: mu.deptId, year: 2027, batch_number: 60 });
      expect(res.status).toBe(404);
    });

    test('SEC_06: department_id filter cannot be used to list another university\'s batches', async () => {
      const res = await request(app).get(`/api/batches?department_id=${mu.deptId}`).set(auth(nsuToken));
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('SEC_07: NSU admin cannot read MU university details', async () => {
      const res = await request(app).get(`/api/universities/${mu.uniId}`).set(auth(nsuToken));
      expect(res.status).toBe(404);
      const own = await request(app).get(`/api/universities/${nsu.uniId}`).set(auth(nsuToken));
      expect(own.status).toBe(200);
    });

    test('SEC_08: NSU admin cannot change the photo of an MU student', async () => {
      const res = await request(app).patch(`/api/students/${mu.studentId}/photo`).set(auth(nsuToken))
        .send({ photo: null });
      expect(res.status).toBe(404);
    });

    test('SEC_09: items that are not in the Recycle Bin cannot be deleted permanently', async () => {
      const res = await request(app).delete('/api/trash/permanent').set(auth(nsuToken))
        .send({ type: 'student', id: nsu.studentId });
      expect(res.status).toBe(400);
    });
  });

  // ── Serial numbers / IDs ────────────────────────────────────────────────
  describe('Student IDs are never reused', () => {
    test('SEC_10: deleting the newest student does not block or reuse its ID', async () => {
      const admit = (name) => request(app).post('/api/students').set(auth(nsuToken))
        .send({ batch_id: nsu.batchId, department_id: nsu.deptId, name });

      const a = await admit('Serial Test A');
      expect(a.status).toBe(201);

      const del = await request(app).delete(`/api/students/${a.body.student.id}`).set(auth(nsuToken));
      expect(del.status).toBe(200);

      const b = await admit('Serial Test B');
      expect(b.status).toBe(201); // previously: 409 "ID conflict" forever
      expect(b.body.student.serial_number).toBe(a.body.student.serial_number + 1);
      expect(b.body.student.student_id).not.toBe(a.body.student.student_id);

      const restore = await request(app).post('/api/trash/restore').set(auth(nsuToken))
        .send({ type: 'student', id: a.body.student.id });
      expect(restore.status).toBe(200);

      const ids = await pool.query('SELECT student_id FROM students WHERE batch_id=$1', [nsu.batchId]);
      const all = ids.rows.map((r) => r.student_id);
      expect(new Set(all).size).toBe(all.length);
    });

    test('SEC_11: parallel admissions get unique, consecutive serials (FOR UPDATE lock)', async () => {
      const before = (await pool.query('SELECT current_serial FROM batches WHERE id=$1', [mu.batchId])).rows[0].current_serial;
      const N = 15;
      const results = await Promise.all(Array.from({ length: N }, (_, i) =>
        request(app).post('/api/students').set(auth(muToken))
          .send({ batch_id: mu.batchId, department_id: mu.deptId, name: `Parallel ${i}` })));
      results.forEach((r) => expect(r.status).toBe(201));
      const serials = results.map((r) => r.body.student.serial_number).sort((x, y) => x - y);
      expect(serials).toEqual(Array.from({ length: N }, (_, i) => before + 1 + i));
    });
  });

  // ── Admission integrity ─────────────────────────────────────────────────
  describe('Admission input integrity', () => {
    test('SEC_12: department_id must match the batch\'s department', async () => {
      const otherDept = await pool.query(
        'SELECT id FROM departments WHERE university_id=$1 AND id<>$2 LIMIT 1', [nsu.uniId, nsu.deptId]);
      const res = await request(app).post('/api/students').set(auth(nsuToken))
        .send({ batch_id: nsu.batchId, department_id: otherDept.rows[0].id, name: 'Wrong Dept' });
      expect(res.status).toBe(400);
    });

    test('SEC_13: cannot admit into a batch that is in the Recycle Bin', async () => {
      const batch = await request(app).post('/api/batches').set(auth(nsuToken))
        .send({ department_id: nsu.deptId, year: 2031, semester_code: 'SM', semester_index: 2 });
      expect(batch.status).toBe(201);
      await request(app).delete(`/api/batches/${batch.body.id}`).set(auth(nsuToken));
      const res = await request(app).post('/api/students').set(auth(nsuToken))
        .send({ batch_id: batch.body.id, department_id: nsu.deptId, name: 'Ghost' });
      expect(res.status).toBe(400);
    });

    test('SEC_14: batch rules — batch 1–99 only, semester code must match index', async () => {
      const big = await request(app).post('/api/batches').set(auth(muToken))
        .send({ department_id: mu.deptId, year: 2027, batch_number: 100 });
      expect(big.status).toBe(400);
      const mismatch = await request(app).post('/api/batches').set(auth(nsuToken))
        .send({ department_id: nsu.deptId, year: 2027, semester_code: 'FL', semester_index: 1 });
      expect(mismatch.status).toBe(400);
    });

    test('SEC_15: unsafe photo values are rejected', async () => {
      const res = await request(app).post('/api/students').set(auth(nsuToken))
        .send({ batch_id: nsu.batchId, department_id: nsu.deptId, name: 'X', photo: 'javascript:alert(1)' });
      expect(res.status).toBe(400);
    });

    test('SEC_16: department codes must be 2–6 letters', async () => {
      const res = await request(app).post('/api/departments').set(auth(nsuToken))
        .send({ code: 'CS1', full_name: 'Bad Code' });
      expect(res.status).toBe(400);
    });
  });

  // ── Authentication ──────────────────────────────────────────────────────
  describe('Authentication hardening', () => {
    test('SEC_17: a token signed with the old leaked secret is rejected', async () => {
      const forged = jwt.sign({ id: 1, role: 'super_admin', university_id: null }, 'smart_id_super_secret_key_2026');
      const res = await request(app).get('/api/auth/users').set(auth(forged));
      expect(res.status).toBe(401);
    });

    test('SEC_18: repeated wrong passwords are blocked (429)', async () => {
      const email = 'mu_admin@smartid.com';
      for (let i = 0; i < 5; i++) {
        const r = await request(app).post('/api/auth/login').send({ email, password: 'wrong-password' });
        expect(r.status).toBe(401);
      }
      const blocked = await request(app).post('/api/auth/login').send({ email, password: 'wrong-password' });
      expect(blocked.status).toBe(429);
    });

    test('SEC_19: server errors and 404s do not leak internal error details', async () => {
      const res = await request(app).get('/api/universities/not-a-number').set(auth(superToken));
      expect(res.status).toBe(404);
      expect(res.body.error).toBeUndefined();
    });
  });
});
