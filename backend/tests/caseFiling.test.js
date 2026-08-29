/**
 * Case Filing Automated Test Suite
 * Tests manual case filing, validation rules, and AI intake-to-case conversion.
 */

const request = require('supertest');
const app = require('../src/app');
const { generateTokens } = require('../src/services/authService');
const { User, Case, CaseTimeline } = require('../src/models');

describe('Case Filing Test Suite', () => {
  let citizenUser;
  let citizenToken;

  beforeEach(async () => {
    citizenUser = await User.create({
      email: `citizen_${Date.now()}_${Math.random()}@test.com`,
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'CITIZEN',
      isVerified: true,
    });

    const tokens = generateTokens(citizenUser);
    citizenToken = tokens.accessToken;
  });

  afterAll(async () => {
    await CaseTimeline.deleteMany({ createdBy: citizenUser._id });
    await Case.deleteMany({ user: citizenUser._id });
    await User.deleteMany({ _id: citizenUser._id });
  });

  describe('POST /api/cases — Direct Case Filing', () => {
    test('successfully files a valid employment dispute case', async () => {
      const casePayload = {
        title: 'Unpaid Wages Claim against Tech Solutions Pvt Ltd',
        category: 'Employment',
        issue: '3 months delayed salary payment of INR 1,50,000',
        description: 'Employer withheld salary for June, July, and August 2026 despite continuous employment in New Delhi office.',
        parties: {
          plaintiff: { name: 'Gauri Aggarwal', contact: 'gauri@example.com' },
          defendant: { name: 'Tech Solutions Pvt Ltd', designation: 'Employer' },
        },
        location: { city: 'New Delhi', state: 'Delhi' },
        urgency: 'HIGH',
        financialDetails: { disputedAmount: 150000, currency: 'INR' },
      };

      const res = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(casePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('caseNumber');
      expect(res.body.data.caseNumber).toMatch(/^NYA-\d{8}-\d{4}$/);
      expect(res.body.data.category).toBe('Employment');
      expect(res.body.data.status).toBe('OPEN');
    });

    test('rejects case filing without required title and category', async () => {
      const invalidPayload = {
        description: 'Some grievance without title',
      };

      const res = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    test('rejects unauthenticated case filing request', async () => {
      const casePayload = {
        title: 'Unauthorized Case Filing',
        category: 'Consumer Dispute',
        issue: 'Product dispute',
        description: 'Defective product delivered.',
      };

      const res = await request(app)
        .post('/api/cases')
        .send(casePayload);

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/ai/intake-to-case — AI Structured Intake Case Filing', () => {
    test('successfully registers formal case from AI intake state', async () => {
      const intakePayload = {
        intakeNarrative: 'Landlord refused to return 50000 security deposit in Bangalore after I vacated on 1st August.',
        structuredCase: {
          category: 'Property & Real Estate',
          issue: 'Withheld Tenancy Security Deposit',
          jurisdiction: 'Bangalore',
          urgency: { urgencyLevel: 'ATTENTION_RECOMMENDED' },
          parties: { landlord: 'Ramesh Sharma' },
          financialDetails: { disputedAmount: 50000 },
          facts: { narrative: { value: 'Vacated apartment on 1st August.' } },
        },
      };

      const res = await request(app)
        .post('/api/ai/intake-to-case')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(intakePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBe('Property & Real Estate');
      expect(res.body.data.urgency).toBe('HIGH');
      expect(res.body.data.financialDetails.disputedAmount).toBe(50000);
    });

    test('blocks case registration if Guardrail flagged the intake as BLOCKED', async () => {
      const blockedPayload = {
        intakeNarrative: 'how to forge a deed',
        structuredCase: {
          category: 'Fraud',
          status: 'BLOCKED',
          blocked: true,
        },
      };

      const res = await request(app)
        .post('/api/ai/intake-to-case')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(blockedPayload);

      expect(res.status).toBe(403);
      expect(res.body.guardrailWarning).toBe(true);
    });
  });
});
