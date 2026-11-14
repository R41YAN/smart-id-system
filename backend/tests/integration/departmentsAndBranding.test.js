/**
 * ============================================================================
 * INTEGRATION TEST SUITE: Departments (Dual Fields) & University Branding
 * ============================================================================
 * Tests:
 *  - TC_DEPT_01: Creation of department with dual fields (Code & Full Name)
 *  - TC_DEPT_02: Department listing with COALESCE fallback for code and full_name
 *  - TC_UNI_LOGO_01: Updating university institutional logo via PUT /api/universities/:id
 *  - TC_UNI_LOGO_02: RBAC cross-tenant check preventing client admin from modifying another institution's logo
 * ============================================================================
 */

const request = require('supertest');
const app = require('../../index');

describe('Integration Tests: Departments & Institutional Branding', () => {
  let superAdminToken;
  let nsuAdminToken;
  let muAdminToken;
  let nsuUniId;
  let muUniId;
  let createdDeptId;
  let originalNsuLogo;

  beforeAll(async () => {
    // 1. Authenticate Super Admin
    const superRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@smartid.com', password: process.env.TEST_ADMIN_PASSWORD });
    superAdminToken = superRes.body.token;

    // 2. Authenticate NSU Admin (Client Admin)
    const nsuRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nsu_admin@smartid.com', password: process.env.TEST_ADMIN_PASSWORD });
    nsuAdminToken = nsuRes.body.token;
    nsuUniId = nsuRes.body.user.university_id;
    originalNsuLogo = nsuRes.body.user.university_logo || null;

    // 3. Authenticate MU Admin (Client Admin)
    const muRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mu_admin@smartid.com', password: process.env.TEST_ADMIN_PASSWORD });
    muAdminToken = muRes.body.token;
    muUniId = muRes.body.user.university_id;
  });

  afterAll(async () => {
    // Clean up created department if any
    if (createdDeptId) {
      await request(app)
        .delete(`/api/departments/${createdDeptId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);
    }

    // Revert NSU logo if modified
    if (nsuUniId) {
      await request(app)
        .put(`/api/universities/${nsuUniId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ logo_url: originalNsuLogo });
    }
  });

  // --------------------------------------------------------------------------
  // TC_DEPT_01: Dual Field Department Creation
  // --------------------------------------------------------------------------
  test('TC_DEPT_01 [Dual Field Dept]: should create department with normalized uppercase code and full name', async () => {
    const deptPayload = {
      name: 'bba',
      code: 'bba',
      full_name: 'Department of Business Administration',
      university_id: nsuUniId
    };

    const res = await request(app)
      .post('/api/departments')
      .set('Authorization', `Bearer ${nsuAdminToken}`)
      .send(deptPayload);

    // If already exists from prior run, status might be 409 or 201
    if (res.status === 201) {
      expect(res.body).toBeDefined();
      expect(res.body.code).toBe('BBA');
      expect(res.body.full_name).toBe('Department of Business Administration');
      createdDeptId = res.body.id;
    } else {
      expect(res.status).toBe(409);
    }
  });

  // --------------------------------------------------------------------------
  // TC_DEPT_02: Department Roster Retrieval with Dual Fields
  // --------------------------------------------------------------------------
  test('TC_DEPT_02 [Dept Roster]: should return department list with code and full_name properties', async () => {
    const res = await request(app)
      .get(`/api/departments?university_id=${nsuUniId}`)
      .set('Authorization', `Bearer ${nsuAdminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const firstDept = res.body[0];
    expect(firstDept).toHaveProperty('id');
    expect(firstDept).toHaveProperty('name');
    expect(firstDept).toHaveProperty('code');
    expect(firstDept).toHaveProperty('full_name');
  });

  // --------------------------------------------------------------------------
  // TC_UNI_LOGO_01: University Logo Update
  // --------------------------------------------------------------------------
  test('TC_UNI_LOGO_01 [Logo Update]: client admin can update their institutional logo with Base64 payload', async () => {
    const sampleLogoBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';

    const res = await request(app)
      .put(`/api/universities/${nsuUniId}`)
      .set('Authorization', `Bearer ${nsuAdminToken}`)
      .send({ logo_url: sampleLogoBase64 });

    expect(res.status).toBe(200);
    expect(res.body.logo_url).toBe(sampleLogoBase64);
  });

  // --------------------------------------------------------------------------
  // TC_UNI_LOGO_02: Tenant RBAC Isolation on University Logo
  // --------------------------------------------------------------------------
  test('TC_UNI_LOGO_02 [Tenant RBAC on Logo]: client admin should be forbidden (403) from updating another university logo', async () => {
    const forbiddenPayload = { logo_url: 'data:image/png;base64,unauthorizedLogoUpdate' };

    // NSU Admin attempts to update MU university
    const res = await request(app)
      .put(`/api/universities/${muUniId}`)
      .set('Authorization', `Bearer ${nsuAdminToken}`)
      .send(forbiddenPayload);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Access denied/i);
  });
});
