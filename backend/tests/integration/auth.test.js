/**
 * ============================================================================
 * INTEGRATION TEST SUITE: Authentication & Authorization Flow
 * ============================================================================
 * Directly follows Page 2 of Teacher QA Guidelines:
 *  - TC_01: Valid Login
 *  - TC_02: Invalid Password
 *  - TC_03: Empty Fields
 *  - TC_04: SQL Injection Check
 * Plus JWT token protection & multi-tenant identity verification
 * ============================================================================
 */

const request = require('supertest');
const app = require('../../index');

describe('Integration Tests: Authentication Flow (/api/auth)', () => {

  // --------------------------------------------------------------------------
  // TC_AUTH_01: Valid Login Scenario
  // --------------------------------------------------------------------------
  test('TC_AUTH_01 [Valid Login]: should authenticate Super Admin and return JWT with user profile', async () => {
    // Arrange
    const credentials = {
      email: 'superadmin@smartid.com',
      password: process.env.TEST_ADMIN_PASSWORD
    };

    // Act
    const res = await request(app)
      .post('/api/auth/login')
      .send(credentials);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('superadmin@smartid.com');
    expect(res.body.user.role).toBe('super_admin');
  });

  // --------------------------------------------------------------------------
  // TC_AUTH_02: Invalid Password Scenario
  // --------------------------------------------------------------------------
  test('TC_AUTH_02 [Invalid Password]: should reject invalid password with 401', async () => {
    // Arrange
    const credentials = {
      email: 'superadmin@smartid.com',
      password: 'incorrect_password_123'
    };

    // Act
    const res = await request(app)
      .post('/api/auth/login')
      .send(credentials);

    // Assert
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
    expect(res.body.token).toBeUndefined();
  });

  // --------------------------------------------------------------------------
  // TC_AUTH_03: Empty Fields Validation
  // --------------------------------------------------------------------------
  test('TC_AUTH_03 [Empty Fields]: should reject login request when email or password is missing', async () => {
    // Arrange
    const emptyPayloads = [
      { email: '', password: '' },
      { email: 'superadmin@smartid.com', password: '' },
      { email: '', password: process.env.TEST_ADMIN_PASSWORD }
    ];

    // Act & Assert
    for (const payload of emptyPayloads) {
      const res = await request(app)
        .post('/api/auth/login')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('email and password are required');
    }
  });

  // --------------------------------------------------------------------------
  // TC_AUTH_04: SQL Injection Attack Resilience
  // --------------------------------------------------------------------------
  test('TC_AUTH_04 [SQL Injection Check]: should safely deny SQL injection string without crashing or bypassing auth', async () => {
    // Arrange: Classic SQL injection payload intended to evaluate true
    const maliciousPayload = {
      email: "' OR 1=1 --",
      password: "' OR 'a'='a"
    };

    // Act
    const res = await request(app)
      .post('/api/auth/login')
      .send(maliciousPayload);

    // Assert: Parameterized PostgreSQL query prevents injection; safely returns 401
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
    expect(res.body.token).toBeUndefined();
  });

  // --------------------------------------------------------------------------
  // TC_AUTH_05: Protected Route Access with Valid Bearer Token
  // --------------------------------------------------------------------------
  test('TC_AUTH_05 [Protected Route /api/auth/me]: should return authenticated user profile with valid JWT', async () => {
    // 1. Arrange: Login first to obtain valid token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nsu_admin@smartid.com', password: process.env.TEST_ADMIN_PASSWORD });

    const token = loginRes.body.token;
    expect(token).toBeDefined();

    // 2. Act: Access protected profile
    const profileRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    // 3. Assert
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.email).toBe('nsu_admin@smartid.com');
    expect(profileRes.body.role).toBe('client_admin');
  });

  // --------------------------------------------------------------------------
  // TC_AUTH_06: Unauthorized Access Attempt without Bearer Token
  // --------------------------------------------------------------------------
  test('TC_AUTH_06 [Unauthorized Access]: should deny access to protected endpoints without JWT', async () => {
    // Act
    const res = await request(app).get('/api/auth/me');

    // Assert
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/No token provided|Unauthorized/i);
  });

});