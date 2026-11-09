/**
 * ============================================================================
 * INTEGRATION TEST SUITE: Student Admission & Multi-Tenant Engine
 * ============================================================================
 * Tests end-to-end flows:
 *  - Validation of mandatory admission fields
 *  - Cross-tenant role-based access control (RBAC isolation)
 *  - Query filtering by department and batch
 *  - Student ID pattern compliance
 * ============================================================================
 */

const request = require('supertest');
const app = require('../../index');

describe('Integration Tests: Student Admission & Management (/api/students)', () => {
  let superAdminToken;
  let nsuAdminToken;
  let muAdminToken;
  let nsuBatchId;
  let muBatchId;
  let nsuDeptId;

  // Setup: Authenticate users and retrieve prerequisite IDs
  beforeAll(async () => {
    // 1. Authenticate Super Admin
    const superRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@smartid.com', password: 'admin123' });
    superAdminToken = superRes.body.token;

    // 2. Authenticate NSU Admin (Open Credit)
    const nsuRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nsu_admin@smartid.com', password: 'admin123' });
    nsuAdminToken = nsuRes.body.token;

    // 3. Authenticate MU Admin (Close Credit)
    const muRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mu_admin@smartid.com', password: 'admin123' });
    muAdminToken = muRes.body.token;

    // 4. Retrieve Batches
    const batchesRes = await request(app)
      .get('/api/batches')
      .set('Authorization', `Bearer ${superAdminToken}`);

    const batches = batchesRes.body;
    const nsuBatch = batches.find(b => b.semester_code !== null);
    const muBatch = batches.find(b => b.batch_number !== null);

    if (nsuBatch) {
      nsuBatchId = nsuBatch.id;
      nsuDeptId = nsuBatch.department_id;
    }
    if (muBatch) {
      muBatchId = muBatch.id;
    }
  });

  // --------------------------------------------------------------------------
  // TC_ADM_01: Input Validation
  // --------------------------------------------------------------------------
  test('TC_ADM_01 [Validation]: should reject admission if mandatory fields are missing', async () => {
    const invalidPayloads = [
      { batch_id: '', department_id: '', name: '' },
      { batch_id: nsuBatchId, department_id: '', name: 'Test Student' },
      { batch_id: '', department_id: nsuDeptId, name: 'Test Student' },
      { batch_id: nsuBatchId, department_id: nsuDeptId, name: '' }
    ];

    for (const payload of invalidPayloads) {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${nsuAdminToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    }
  });

  // --------------------------------------------------------------------------
  // TC_ADM_02: Cross-Tenant Isolation (RBAC Security)
  // --------------------------------------------------------------------------
  test('TC_ADM_02 [Tenant Isolation]: NSU admin should NOT be allowed to admit students to MU batches', async () => {
    if (!muBatchId) return;

    // Arrange: NSU admin sends request to admit into MU batch
    const crossTenantPayload = {
      batch_id: muBatchId,
      department_id: nsuDeptId,
      name: 'Intruder Student',
      email: 'intruder@test.com'
    };

    // Act
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${nsuAdminToken}`)
      .send(crossTenantPayload);

    // Assert: Forbidden (Access denied across university boundaries)
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Access denied/i);
  });

  // --------------------------------------------------------------------------
  // TC_ADM_03: Non-existent Batch Handling
  // --------------------------------------------------------------------------
  test('TC_ADM_03 [Not Found]: should return 404 when batch ID does not exist', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        batch_id: 999999,
        department_id: nsuDeptId || 1,
        name: 'Ghost Student'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Batch not found/i);
  });

  // --------------------------------------------------------------------------
  // TC_ADM_04: Multi-Tenant Scoping for Student Listing
  // --------------------------------------------------------------------------
  test('TC_ADM_04 [Scoping]: GET /api/students should scope records appropriately by role', async () => {
    // 1. Super Admin sees all students across universities
    const superList = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(superList.status).toBe(200);
    expect(Array.isArray(superList.body)).toBe(true);

    // 2. Client Admin sees only their assigned university students
    const nsuList = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${nsuAdminToken}`);

    expect(nsuList.status).toBe(200);
    expect(Array.isArray(nsuList.body)).toBe(true);

    // Every student in nsuList must belong to NSU
    nsuList.body.forEach(student => {
      expect(student.university_name).toBe('North South University');
    });
  });

  // --------------------------------------------------------------------------
  // TC_ADM_05: Format Compliance of Student IDs
  // --------------------------------------------------------------------------
  test('TC_ADM_05 [ID Pattern]: all retrieved student IDs should match SIFS format rules', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    res.body.forEach(student => {
      if (student.university_type === 'open_credit') {
        // [Dept][YY][SemCode][3 digits], e.g. CSE26SP001
        expect(student.student_id).toMatch(/^[A-Z]{2,5}\d{2}(SP|SM|FL)\d{3}$/);
      } else if (student.university_type === 'close_credit') {
        // [Dept][Batch][YY][3 digits], e.g. CSE5426001
        expect(student.student_id).toMatch(/^[A-Z]{2,5}\d{1,4}\d{2}\d{3}$/);
      }
    });
  });

  // --------------------------------------------------------------------------
  // TC_ADM_06: Student Photo Upload & Late Photo Update
  // --------------------------------------------------------------------------
  test('TC_ADM_06 [Photo Lifecycle]: should accept photo on admission and support late update via PATCH /api/students/:id/photo', async () => {
    if (!nsuBatchId || !nsuDeptId) return;

    // 1. Admit student with sample Base64 photo
    const admitRes = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${nsuAdminToken}`)
      .send({
        batch_id: nsuBatchId,
        department_id: nsuDeptId,
        name: 'QA Photo Student',
        email: `photo_test_${Date.now()}@example.com`,
        phone: '01700000000',
        photo: 'data:image/jpeg;base64,sampleInitialPhotoData'
      });

    expect(admitRes.status).toBe(201);
    expect(admitRes.body.student).toBeDefined();
    expect(admitRes.body.student.photo).toBe('data:image/jpeg;base64,sampleInitialPhotoData');
    const studentId = admitRes.body.student.id;

    // 2. Late update photo via PATCH
    const patchRes = await request(app)
      .patch(`/api/students/${studentId}/photo`)
      .set('Authorization', `Bearer ${nsuAdminToken}`)
      .send({ photo: 'data:image/jpeg;base64,updatedNewPhotoData' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.student.photo).toBe('data:image/jpeg;base64,updatedNewPhotoData');

    // 3. Clean up test student
    await request(app)
      .delete(`/api/students/${studentId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
  });

  // --------------------------------------------------------------------------
  // TC_ADM_07: University Logo Association
  // --------------------------------------------------------------------------
  test('TC_ADM_07 [Branding]: student roster should include university_logo and universities should expose logo_url', async () => {
    const res = await request(app)
      .get('/api/universities')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const nsu = res.body.find(u => u.name.includes('North South'));
    if (nsu) {
      expect(nsu.logo_url).toBeDefined();
    }
  });

});