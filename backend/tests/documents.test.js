const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Documents & Background Queue APIs', () => {
  let token;
  let caseId;

  beforeEach(async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'doc.tester@example.com',
        password: 'Password123!',
        role: 'CITIZEN',
      });
    token = signupRes.body.data.tokens.accessToken;

    const caseRes = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Employment',
        issue: 'Wrongful Termination',
        description: 'Terminated without notice period pay.',
      });
    caseId = caseRes.body.data._id;
  });

  it('should register document metadata and enqueue background processing job', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        caseId,
        title: 'Employment Offer Letter & Contract',
        documentType: 'EMPLOYMENT_CONTRACT',
        fileUrl: 'https://storage.legalnexus.in/docs/sample_contract.pdf',
        fileName: 'sample_contract.pdf',
        fileSize: 1024500,
        mimeType: 'application/pdf',
        pageCount: 6,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.document.processingStatus).toBe('QUEUED');
    expect(res.body.data.queueJob).toHaveProperty('jobId');
    expect(res.body.data.queueJob.queueName).toBe('queue:document_processing');
  });

  it('should retrieve list of documents associated with a case', async () => {
    // Upload 2 documents
    await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        caseId,
        title: 'Pay Slip Oct 2023',
        documentType: 'SALARY_SLIP',
        fileUrl: 'https://storage.nyayasetu.in/docs/oct_payslip.pdf',
      });

    await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        caseId,
        title: 'Termination Letter',
        documentType: 'LEGAL_NOTICE',
        fileUrl: 'https://storage.nyayasetu.in/docs/termination.pdf',
      });

    const res = await request(app)
      .get(`/api/documents/case/${caseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});
