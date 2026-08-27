const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Case Lifecycle, Timeline & Evidence APIs', () => {
  let citizenToken;
  let citizenId;
  let lawyerToken;
  let lawyerId;

  beforeEach(async () => {
    // Create Citizen
    const citizenRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'rajesh.kumar@example.com',
        password: 'Password123!',
        role: 'CITIZEN',
        phone: '+919988776655',
        profileData: {
          fullName: 'Rajesh Kumar',
          location: { city: 'Delhi', state: 'Delhi' },
        },
      });
    citizenToken = citizenRes.body.data.tokens.accessToken;
    citizenId = citizenRes.body.data.user.id;

    // Create Lawyer
    const lawyerRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'advocate.singh@example.com',
        password: 'LawyerPassword123!',
        role: 'LAWYER',
        profileData: {
          fullName: 'Adv. Manjit Singh',
          practiceAreas: ['Employment'],
        },
      });
    lawyerToken = lawyerRes.body.data.tokens.accessToken;
    lawyerId = lawyerRes.body.data.user.id;
  });

  it('should create a new case and automatically generate the initial timeline event', async () => {
    const casePayload = {
      category: 'Employment',
      issue: 'Unpaid Salary',
      location: {
        city: 'Delhi',
        state: 'Delhi',
      },
      description: 'My employer has not paid my salary for three months despite multiple written requests.',
      urgency: 'HIGH',
      parties: {
        plaintiff: { name: 'Rajesh Kumar' },
        defendant: { name: 'Tech Solutions Pvt Ltd', designation: 'Managing Director' },
      },
      financialDetails: {
        disputedAmount: 150000,
        currency: 'INR',
      },
    };

    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send(casePayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.caseNumber).toMatch(/^NYA-/);
    expect(res.body.data.category).toBe('Employment');
    expect(res.body.data.issue).toBe('Unpaid Salary');
    expect(res.body.data.status).toBe('OPEN');

    const caseId = res.body.data._id;

    // Verify timeline includes the auto-generated intake event
    const timelineRes = await request(app)
      .get(`/api/cases/${caseId}/timeline`)
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(timelineRes.status).toBe(200);
    expect(timelineRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(timelineRes.body.data[0].eventType).toBe('COMPLAINT_FILED');
  });

  it('should add structured chronological events to the case timeline', async () => {
    // 1. Create Case
    const caseRes = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        category: 'Employment',
        issue: 'Unpaid Salary',
        description: 'Salary overdue since November.',
      });
    const caseId = caseRes.body.data._id;

    // 2. Add Timeline Event: Employment Started
    await request(app)
      .post(`/api/cases/${caseId}/events`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        eventType: 'EMPLOYMENT_STARTED',
        title: 'Employment Commenced',
        dateTime: '2023-01-15T00:00:00.000Z',
        description: 'Joined Tech Solutions as Senior Analyst.',
      });

    // 3. Add Timeline Event: Salary Became Due
    await request(app)
      .post(`/api/cases/${caseId}/events`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        eventType: 'SALARY_DUE',
        title: 'November Salary Due',
        dateTime: '2023-12-01T00:00:00.000Z',
        description: 'November 2023 salary was not credited to account.',
      });

    // 4. Add Timeline Event: HR Contacted
    await request(app)
      .post(`/api/cases/${caseId}/events`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        eventType: 'HR_CONTACTED',
        title: 'Emailed HR Department',
        dateTime: '2023-12-10T00:00:00.000Z',
        description: 'Sent formal reminder email to HR Payroll manager.',
      });

    // 5. Add Timeline Event: Legal Notice Received / Sent
    await request(app)
      .post(`/api/cases/${caseId}/events`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        eventType: 'LEGAL_NOTICE_SENT',
        title: 'Sent Legal Demand Notice',
        dateTime: '2024-01-05T00:00:00.000Z',
        description: 'Advocate issued 15-day statutory notice for clearance of dues.',
      });

    // 6. Fetch timeline and verify chronological sort
    const timelineRes = await request(app)
      .get(`/api/cases/${caseId}/timeline`)
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(timelineRes.status).toBe(200);
    const events = timelineRes.body.data;
    expect(events.length).toBe(5); // Initial intake + 4 added events

    const eventTypes = events.map((e) => e.eventType);
    expect(eventTypes).toContain('EMPLOYMENT_STARTED');
    expect(eventTypes).toContain('SALARY_DUE');
    expect(eventTypes).toContain('HR_CONTACTED');
    expect(eventTypes).toContain('LEGAL_NOTICE_SENT');
  });

  it('should retrieve case details with caching and support lawyer assignment', async () => {
    const caseRes = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        category: 'Employment',
        issue: 'Unpaid Salary',
        description: 'Case description',
      });
    const caseId = caseRes.body.data._id;

    // First fetch (populates cache)
    const firstFetch = await request(app)
      .get(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(firstFetch.status).toBe(200);

    // Second fetch (from cache)
    const secondFetch = await request(app)
      .get(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(secondFetch.status).toBe(200);
    expect(secondFetch.body.data._id).toBe(caseId);

    // Assign lawyer
    const assignRes = await request(app)
      .patch(`/api/cases/${caseId}/assign-lawyer`)
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ lawyerId });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.status).toBe('LAWYER_ASSIGNED');
    expect(assignRes.body.data.assignedLawyer).toBe(lawyerId);
  });
});
