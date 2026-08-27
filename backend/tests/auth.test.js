const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Authentication & User Management APIs', () => {
  it('should register a new citizen user and generate JWT tokens', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'citizen.sharma@example.com',
        password: 'Password123!',
        role: 'CITIZEN',
        phone: '+919876543210',
        profileData: {
          fullName: 'Aarav Sharma',
          location: { city: 'Delhi', state: 'Delhi' },
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('citizen.sharma@example.com');
    expect(res.body.data.user.role).toBe('CITIZEN');
    expect(res.body.data.tokens).toHaveProperty('accessToken');
    expect(res.body.data.tokens).toHaveProperty('refreshToken');
  });

  it('should reject signup with duplicate email', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: 'CITIZEN',
      });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: 'CITIZEN',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate a registered user and return user info with token', async () => {
    // Signup
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'lawyer.verma@example.com',
        password: 'LawyerSecurePassword1!',
        role: 'LAWYER',
        profileData: {
          fullName: 'Adv. Priya Verma',
          practiceAreas: ['Employment', 'Corporate'],
        },
      });

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'lawyer.verma@example.com',
        password: 'LawyerSecurePassword1!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.tokens).toHaveProperty('accessToken');

    const token = loginRes.body.data.tokens.accessToken;

    // Get current user profile via /me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('lawyer.verma@example.com');
    expect(meRes.body.data.profile.fullName).toBe('Adv. Priya Verma');
    expect(meRes.body.data.profile.practiceAreas).toContain('Employment');
  });

  it('should refresh tokens using valid refresh token', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'student.kumar@example.com',
        password: 'StudentPassword123!',
        role: 'LAW_STUDENT',
      });

    const refreshToken = signupRes.body.data.tokens.refreshToken;

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.tokens).toHaveProperty('accessToken');
    expect(refreshRes.body.data.tokens).toHaveProperty('refreshToken');
  });
});
