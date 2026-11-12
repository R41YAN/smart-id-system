const request = require('supertest');
const app = require('../../index');

describe('Integration Tests: Bulk Admission & Recycle Bin (/api/students/bulk & /api/trash)', () => {
  let superAdminToken;
  let clientAdminToken;
  let testBatchId;
  let testDeptId;

  beforeAll(async () => {
    const superRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@smartid.com', password: 'admin123' });
    superAdminToken = superRes.body.token;

    const clientRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nsu_admin@smartid.com', password: 'admin123' });
    clientAdminToken = clientRes.body.token;

    const deptsRes = await request(app)
      .get('/api/departments')
      .set('Authorization', `Bearer ${clientAdminToken}`);
    if (deptsRes.body.length > 0) {
      testDeptId = deptsRes.body[0].id;
      // Create a fresh test batch to guarantee clean serial 0
      const batchRes = await request(app)
        .post('/api/batches')
        .set('Authorization', `Bearer ${clientAdminToken}`)
        .send({
          department_id: testDeptId,
          year: 2035,
          semester_code: 'FL',
          semester_index: 3
        });
      if (batchRes.body?.id) {
        testBatchId = batchRes.body.id;
      }
    }
  });

  afterAll(async () => {
    if (testBatchId) {
      await request(app)
        .delete('/api/trash/permanent')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ type: 'batch', id: testBatchId });
    }
  });

  test('TC_BULK_01: should admit multiple students in a single transaction with sequential IDs', async () => {
    if (!testBatchId || !testDeptId) return;

    const payload = {
      students: [
        {
          department_id: testDeptId,
          batch_id: testBatchId,
          name: `Bulk Student A ${Date.now()}`,
          email: `bulk_a_${Date.now()}@example.com`
        },
        {
          department_id: testDeptId,
          batch_id: testBatchId,
          name: `Bulk Student B ${Date.now()}`,
          email: `bulk_b_${Date.now()}@example.com`
        }
      ]
    };

    const res = await request(app)
      .post('/api/students/bulk')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.count).toBe(2);
    expect(Array.isArray(res.body.students)).toBe(true);
    expect(res.body.students[1].serial_number).toBe(res.body.students[0].serial_number + 1);

    // Clean up created students
    for (const s of res.body.students) {
      await request(app)
        .delete(`/api/trash/permanent`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ type: 'student', id: s.id });
    }
  });

  test('TC_TRASH_01: soft deleted student should appear in /api/trash and be restorable', async () => {
    if (!testBatchId || !testDeptId) return;

    // 1. Admit a single student
    const admitRes = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        department_id: testDeptId,
        batch_id: testBatchId,
        name: `Trash Test Student ${Date.now()}`,
        email: `trash_test_${Date.now()}@example.com`
      });

    expect(admitRes.status).toBe(201);
    const studentId = admitRes.body.student.id;

    // 2. Soft delete student
    const deleteRes = await request(app)
      .delete(`/api/students/${studentId}`)
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(deleteRes.status).toBe(200);

    // 3. Verify student is in /api/trash
    const trashRes = await request(app)
      .get('/api/trash')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(trashRes.status).toBe(200);
    const inTrash = trashRes.body.students.some(s => s.id === studentId);
    expect(inTrash).toBe(true);

    // 4. Restore student
    const restoreRes = await request(app)
      .post('/api/trash/restore')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({ type: 'student', id: studentId });

    expect(restoreRes.status).toBe(200);

    // 5. Permanent cleanup
    await request(app)
      .delete('/api/trash/permanent')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'student', id: studentId });
  });
});
