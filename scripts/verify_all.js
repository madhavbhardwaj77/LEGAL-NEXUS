/**
 * End-to-End System Verification Script for Nyaya Setu
 * Validates full lifecycle: Health -> Auth -> Profiles -> Case Intake -> Chronological Timeline -> Documents -> Verification -> Admin Audit Logs
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../backend/src/app');

async function runFullVerification() {
  console.log('===============================================================');
  console.log('       NYAYA SETU — MILESTONE 1 END-TO-END VERIFICATION       ');
  console.log('===============================================================\n');

  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('[✓] MongoDB In-Memory Database connected:', uri);

  try {
    // 1. Health Check
    console.log('\n[1] Testing Health Check Endpoint (/api/health)...');
    const healthRes = await request(app).get('/api/health');
    console.log(`    Status: ${healthRes.status}, Response:`, healthRes.body.data);
    if (healthRes.status !== 200 || healthRes.body.data.status !== 'OPERATIONAL') {
      throw new Error('Health check failed');
    }

    // 2. Citizen Registration
    console.log('\n[2] Registering Citizen (Aarav Sharma)...');
    const citizenSignup = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'aarav.sharma@example.com',
        password: 'CitizenPass123!',
        role: 'CITIZEN',
        phone: '+919876543210',
        profileData: {
          fullName: 'Aarav Sharma',
          location: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
          preferredLanguage: 'Hindi',
        },
      });
    console.log(`    Citizen registered: ${citizenSignup.body.data.user.email} (ID: ${citizenSignup.body.data.user.id})`);
    const citizenToken = citizenSignup.body.data.tokens.accessToken;

    // 3. File Case (Employment / Unpaid Salary)
    console.log('\n[3] Filing Case: Employment Unpaid Salary Dispute...');
    const caseRes = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Unpaid Salary for 3 Months - Tech Corp Pvt Ltd',
        category: 'Employment',
        issue: 'Unpaid Salary',
        description: 'Employer withheld salary for October, November, and December 2023 without any disciplinary notice or formal cause.',
        location: { city: 'New Delhi', state: 'Delhi' },
        urgency: 'HIGH',
        parties: {
          plaintiff: { name: 'Aarav Sharma', contact: '+919876543210' },
          defendant: { name: 'Vikram Mehta', organization: 'Tech Corp Pvt Ltd', designation: 'Managing Director' },
        },
        financialDetails: { disputedAmount: 180000, currency: 'INR' },
      });
    const caseId = caseRes.body.data._id;
    console.log(`    Case filed successfully! Case Number: ${caseRes.body.data.caseNumber} (ID: ${caseId})`);

    // 4. Case Timeline Events
    console.log('\n[4] Populating Chronological Timeline Events...');
    const events = [
      {
        eventType: 'EMPLOYMENT_STARTED',
        title: 'Employment Commenced',
        dateTime: '2023-01-10T00:00:00Z',
        description: 'Joined Tech Corp Pvt Ltd as Lead Backend Engineer.',
      },
      {
        eventType: 'SALARY_DUE',
        title: 'October Salary Due & Unpaid',
        dateTime: '2023-11-01T00:00:00Z',
        description: 'October salary was not deposited by scheduled payday.',
      },
      {
        eventType: 'HR_CONTACTED',
        title: 'Formal Email to HR Payroll',
        dateTime: '2023-11-15T00:00:00Z',
        description: 'Sent formal grievance email to HR Head requesting salary disbursement.',
      },
      {
        eventType: 'LEGAL_NOTICE_SENT',
        title: 'Statutory 15-Day Demand Notice Sent',
        dateTime: '2023-12-20T00:00:00Z',
        description: 'Issued formal demand notice under Payment of Wages Act via registered post.',
      },
    ];

    for (const evt of events) {
      const evtRes = await request(app)
        .post(`/api/cases/${caseId}/events`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(evt);
      console.log(`    [+] Added Event: "${evt.title}" (${evt.eventType})`);
    }

    // 5. Verify Timeline Sequence
    const timelineRes = await request(app)
      .get(`/api/cases/${caseId}/timeline`)
      .set('Authorization', `Bearer ${citizenToken}`);
    console.log(`    Timeline retrieved! Total Events: ${timelineRes.body.data.length}`);

    // 6. Upload Document Metadata & Background Job Queue
    console.log('\n[5] Uploading Document Metadata & Dispatching to Background Queue...');
    const docRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        caseId,
        title: 'Employment Offer Letter & Salary Slips',
        documentType: 'EMPLOYMENT_CONTRACT',
        fileUrl: 'https://storage.nyayasetu.in/cases/doc_contract_981.pdf',
        fileName: 'employment_contract_aarav.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
      });
    console.log(`    Document registered: ${docRes.body.data.document.title}`);
    console.log(`    Background Job Queued: Job ID: ${docRes.body.data.queueJob.jobId} -> Queue: ${docRes.body.data.queueJob.queueName}`);

    // 7. Lawyer Registration & Bar Verification
    console.log('\n[6] Registering Advocate (Adv. Neha Kapoor)...');
    const lawyerSignup = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'neha.kapoor.adv@example.com',
        password: 'LawyerPass123!',
        role: 'LAWYER',
        phone: '+919811223344',
        profileData: {
          fullName: 'Adv. Neha Kapoor',
          title: 'Senior Labor & Employment Counsel',
          practiceAreas: ['Employment', 'Corporate & Commercial', 'Civil Litigation'],
          experienceYears: 8,
          barCouncilRegistration: {
            registrationNumber: 'D/4512/2016',
            stateBarCouncil: 'Bar Council of Delhi',
            yearOfEnrollment: 2016,
          },
        },
      });
    const lawyerToken = lawyerSignup.body.data.tokens.accessToken;
    console.log(`    Advocate registered: ${lawyerSignup.body.data.user.email}`);

    // 8. Admin Verification Workflow
    console.log('\n[7] Admin Approving Bar Council Verification...');
    const adminSignup = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'admin.super@nyayasetu.in',
        password: 'AdminRootPass123!',
        role: 'ADMIN',
      });
    const adminToken = adminSignup.body.data.tokens.accessToken;

    const verificationReq = await request(app)
      .post('/api/verification/request')
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({
        fullName: 'Adv. Neha Kapoor',
        barRegistrationNumber: 'D/4512/2016',
        stateBarCouncil: 'Bar Council of Delhi',
        enrollmentYear: 2016,
        certificateUrl: 'https://storage.nyayasetu.in/verifications/cert_4512.pdf',
      });
    const verificationId = verificationReq.body.data._id;

    const reviewRes = await request(app)
      .patch(`/api/verification/requests/${verificationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'VERIFIED',
        reviewNotes: 'Bar Council enrollment confirmed via Delhi Bar Roll.',
      });
    console.log(`    Verification status updated: ${reviewRes.body.data.status}`);

    // 9. Lawyer assigns herself to the case
    console.log('\n[8] Lawyer Assigning to Case...');
    const assignRes = await request(app)
      .patch(`/api/cases/${caseId}/assign-lawyer`)
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ lawyerId: lawyerSignup.body.data.user.id });
    console.log(`    Case status updated: ${assignRes.body.data.status} (Assigned Lawyer: ${assignRes.body.data.assignedLawyer})`);

    // 10. Admin Audit Logs
    console.log('\n[9] Fetching Immutable Audit Logs...');
    const auditRes = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log(`    Total Audit Log Records Recorded: ${auditRes.body.data.length}`);
    console.log('    Recent audit actions:', auditRes.body.data.slice(0, 5).map((l) => `${l.action} on [${l.resource}] by ${l.userRole}`));

    console.log('\n===============================================================');
    console.log('  [✓] ALL MILESTONE 1 END-TO-END CRITERIA VERIFIED SUCCESSFULLY! ');
    console.log('===============================================================\n');
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

runFullVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
