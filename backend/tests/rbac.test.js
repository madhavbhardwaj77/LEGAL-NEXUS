const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Role-Based Access Control (RBAC) & Security Tests', () => {
  let citizenToken;
  let lawyerToken;
  let adminToken;

  beforeEach(async () => {
    // Citizen
    const citizenRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'citizen.test@example.com',
        password: 'Password123!',
        role: 'CITIZEN',
      });
    citizenToken = citizenRes.body.data.tokens.accessToken;

    // Lawyer
    const lawyerRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'lawyer.test@example.com',
        password: 'Password123!',
        role: 'LAWYER',
      });
    lawyerToken = lawyerRes.body.data.tokens.accessToken;

    // Admin
    const adminRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'admin.test@example.com',
        password: 'AdminPassword123!',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.data.tokens.accessToken;
  });

  it('should deny citizens from accessing admin routes (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin users to view admin stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalCases');
  });

  it('should deny unauthorized user from accessing another user private case', async () => {
    // User A creates case
    const caseRes = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        category: 'Consumer Dispute',
        issue: 'Defective product',
        description: 'Seller refused return',
      });
    const caseId = caseRes.body.data._id;

    // User B signs up
    const userBRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'userb@example.com',
        password: 'Password123!',
        role: 'CITIZEN',
      });
    const userBToken = userBRes.body.data.tokens.accessToken;

    // User B attempts to access User A's case
    const unauthorizedAccess = await request(app)
      .get(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(unauthorizedAccess.status).toBe(403);
  });
});
