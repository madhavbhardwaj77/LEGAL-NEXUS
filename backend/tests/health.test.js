const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Health & Root API Endpoints', () => {
  it('should return welcome payload at root /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Legal Nexus API');
  });

  it('should report healthy status at /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('OPERATIONAL');
    expect(res.body.data.database.mongo).toBe('CONNECTED');
  });
});
