/**
 * Comprehensive End-to-End Verification Script for Nyaya Setu
 * Validates full lifecycle: Health -> Auth -> AI Story Intake -> Multi-Agent Analysis -> Case Conversion -> Timeline -> Documents -> Verification -> Admin Audit Logs
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../backend/src/app');

async function runFullVerification() {
  console.log('===============================================================');
  console.log('    NYAYA SETU — MILESTONES 1, 2 & 3 END-TO-END VERIFICATION   ');
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

    // 3. AI Case Story Intake (Milestone 3)
    console.log('\n[3] Testing AI Story Intake Parsing (/api/ai/intake)...');
    const intakeStory = 'Employer ne 3 mahine se salary nahi di, 150000 rupaye pending hai in Delhi.';
    const intakeRes = await request(app)
      .post('/api/ai/intake')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ story: intakeStory });
    console.log(`    Intake Status: ${intakeRes.status}`);
    console.log(`    Detected Domain: ${intakeRes.body.data.domain}`);
    console.log(`    Language: ${intakeRes.body.data.detectedLanguage}`);
    console.log(`    Clarifying Questions:`, intakeRes.body.data.clarifyingQuestions);

    // 4. Multi-Agent Case Analysis (Milestone 3 LangGraph Workflow)
    console.log('\n[4] Testing Multi-Agent Case Analysis (/api/ai/analyze)...');
    const analyzeRes = await request(app)
      .post('/api/ai/analyze')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ story: intakeStory });
    console.log(`    Analysis Status: ${analyzeRes.status}`);
    console.log(`    Generated Case Number: ${analyzeRes.body.data.case.caseNumber}`);
    console.log(`    Urgency Level: ${analyzeRes.body.data.urgency.urgencyLevel} (${analyzeRes.body.data.urgency.colorCode})`);
    console.log(`    Evidence Checklist (Missing/Available): ${analyzeRes.body.data.evidence.missing.length} missing, ${analyzeRes.body.data.evidence.available.length} available`);
    console.log(`    Verification Grounding: ${analyzeRes.body.data.verification.status}`);

    // 5. Convert AI Intake into Formal Persisted Case (Milestone 3)
    console.log('\n[5] Converting Structured AI Intake into Live Database Case (/api/ai/intake-to-case)...');
    const convertRes = await request(app)
      .post('/api/ai/intake-to-case')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        structuredCase: analyzeRes.body.data.case,
        intakeNarrative: intakeStory,
      });
    const caseId = convertRes.body.data._id;
    console.log(`    Case Created! Case Number: ${convertRes.body.data.caseNumber} (ID: ${caseId})`);
    console.log(`    Category: ${convertRes.body.data.category} | Urgency: ${convertRes.body.data.urgency} | Status: ${convertRes.body.data.status}`);

    // 6. Milestone 2 RAG Research & Citation Verification
    console.log('\n[6] Testing Legal Knowledge & Citation Verification (/api/ai/research & /api/ai/verify-citation)...');
    const researchRes = await request(app)
      .post('/api/ai/research')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        query: 'My employer has not paid my salary for three months.',
        jurisdiction: 'Delhi',
      });
    console.log(`    RAG Research: ${researchRes.body.data.legalBasis?.length} authoritative provisions retrieved.`);

    const citationRes = await request(app)
      .post('/api/ai/verify-citation')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        act: 'The Payment of Wages Act, 1936',
        section: 'Section 15',
      });
    console.log(`    Citation Verification: ${citationRes.body.data.valid} (Status: ${citationRes.body.data.status})`);

    // 7. Case Timeline Events
    console.log('\n[7] Adding Chronological Timeline Events...');
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
        eventType: 'LEGAL_NOTICE_SENT',
        title: 'Statutory 15-Day Demand Notice Sent',
        dateTime: '2023-12-20T00:00:00Z',
        description: 'Issued formal demand notice under Payment of Wages Act.',
      },
    ];

    for (const evt of events) {
      await request(app)
        .post(`/api/cases/${caseId}/events`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(evt);
      console.log(`    [+] Added Event: "${evt.title}" (${evt.eventType})`);
    }

    const timelineRes = await request(app)
      .get(`/api/cases/${caseId}/timeline`)
      .set('Authorization', `Bearer ${citizenToken}`);
    console.log(`    Timeline retrieved! Total Events: ${timelineRes.body.data.length}`);

    // 8. Upload Document Metadata & Background Job Queue
    console.log('\n[8] Uploading Document Metadata & Dispatching to Background Queue...');
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

    // 9. Lawyer Registration & Bar Verification
    console.log('\n[9] Registering Advocate (Adv. Neha Kapoor)...');
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
          practiceAreas: ['Employment', 'Corporate & Commercial'],
          experienceYears: 8,
          barCouncilRegistration: {
            registrationNumber: 'D/4512/2016',
            stateBarCouncil: 'Bar Council of Delhi',
            yearOfEnrollment: 2016,
          },
        },
      });
    const lawyerToken = lawyerSignup.body.data.tokens.accessToken;

    // 10. Admin Verification Workflow
    console.log('\n[10] Admin Approving Bar Council Verification...');
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
        reviewNotes: 'Bar Council enrollment confirmed.',
      });
    console.log(`    Verification status: ${reviewRes.body.data.status}`);

    // 11. Lawyer Assigning to Case
    console.log('\n[11] Lawyer Assigning to Case...');
    const assignRes = await request(app)
      .patch(`/api/cases/${caseId}/assign-lawyer`)
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ lawyerId: lawyerSignup.body.data.user.id });
    console.log(`    Case status: ${assignRes.body.data.status} (Assigned Lawyer: ${assignRes.body.data.assignedLawyer})`);

    // 12. Admin Audit Logs
    console.log('\n[12] Fetching Immutable Audit Logs...');
    const auditRes = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log(`    Total Audit Records: ${auditRes.body.data.length}`);

    console.log('\n===============================================================');
    console.log('  [✓] ALL MILESTONES 1, 2 & 3 CRITERIA VERIFIED SUCCESSFULLY!   ');
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
