import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Paperclip,
  Scale,
  Sparkles,
  ArrowRight,
  Building2,
  DollarSign,
  Lock,
} from 'lucide-react';
import api from '../services/api';

const getCategoryDetails = (category) => {
  const cat = (category || '').toLowerCase();
  
  if (cat.includes('consumer')) {
    return {
      statute: 'The Consumer Protection Act, 2019 — Section 35',
      description: 'Defines the manner in which a complaint shall be filed electronically (e-Daakhil) before District, State, or National Consumer Commissions for defects in goods or deficiency in services.',
      actionPlan: [
        'Collate & Preserve Records: Gather original invoice, payment receipt, delivery photos, and correspondence with customer care.',
        'Lodge Grievance: File a pre-litigation complaint on the National Consumer Helpline portal (NCH) by dialing 1915.',
        'File Consumer Complaint: Register formal electronic complaint on the e-Daakhil Portal (edaakhil.nic.in) for refund and compensation.'
      ]
    };
  }
  
  if (cat.includes('property') || cat.includes('real estate') || cat.includes('tenant') || cat.includes('rental')) {
    return {
      statute: 'The Model Tenancy Act, 2021 — Section 21',
      description: 'Specifies the procedure for eviction of tenants and recovery of security deposits, detailing grounds of lease termination and refund obligations.',
      actionPlan: [
        'Preserve Rental Records: Collect signed rent agreement, bank deposit slips, notice period emails, and photos of vacated premises.',
        'Issue Legal Demand Notice: Serve a formal 15-day statutory notice to refund deposit or quit possession.',
        'File Petition: Approach local Rent Authority or Rent Court to recover the security deposit with interest.'
      ]
    };
  }
  
  if (cat.includes('cyber') || cat.includes('privacy') || cat.includes('data')) {
    return {
      statute: 'The Information Technology Act, 2000 — Section 66D',
      description: 'Imposes punishment for cheating by personation using computer resource, covering online fraud, email spoofing, and phishing transactions.',
      actionPlan: [
        'Block & Freeze: Contact bank immediately to freeze transactions and dispute unauthorized charges.',
        'Call Helpline: Dial 1930 Cyber Fraud Helpline immediately to attempt account lien (freeze funds in beneficiary bank).',
        'Lodge Cyber Complaint: File a formal complaint online at the National Cyber Crime Reporting Portal (cybercrime.gov.in) with transaction logs.'
      ]
    };
  }
  
  if (cat.includes('employment') || cat.includes('labour') || cat.includes('wage')) {
    return {
      statute: 'The Payment of Wages Act, 1936 — Section 15',
      description: 'Mandates wage settlement on due dates and authorizes the Labour Authority to order wage recovery plus statutory compensation and penalties.',
      actionPlan: [
        'Collate & Preserve Records: Gather employment appointment letter, salary slips, and bank statements showing unpaid months.',
        'Issue Statutory Demand Notice: Serve formal 15-day notice under the Payment of Wages Act.',
        'Pre-Litigation Grievance: Register online grievance on the Ministry of Labour SAMADHAN Portal (samadhan.labour.gov.in).'
      ]
    };
  }
  
  return {
    statute: 'The Code of Civil Procedure, 1908 — Section 89',
    description: 'Encourages alternate dispute resolution (ADR) mechanisms, including mediation, conciliation, and arbitration, to resolve civil disputes before court trials.',
    actionPlan: [
      'Preserve Evidence: Collect agreement copy, transaction history, emails, and notices exchanged.',
      'Serve Legal Notice: Send formal pre-suit notice outlining demands and giving 30 days to resolve.',
      'Pre-Litigation Mediation: Register for pre-litigation mediation at the local District Legal Services Authority (DLSA).'
    ]
  };
};

export default function CaseDetailModal({ selectedCase, isOpen, onClose, onCaseUpdated, user }) {
  const details = selectedCase ? getCategoryDetails(selectedCase.category) : null;
  const [activeTab, setActiveTab] = useState('workspace'); // workspace | timeline | documents | evidence | legalBasis
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Timeline Event Form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventType, setEventType] = useState('HR_CONTACTED');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [eventDesc, setEventDesc] = useState('');

  // New Document Form state
  const [showDocForm, setShowDocForm] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('EMPLOYMENT_CONTRACT');
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    if (selectedCase?._id && isOpen) {
      loadTimeline();
      loadDocuments();
    }
  }, [selectedCase, isOpen]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cases/${selectedCase._id}/timeline`);
      setTimelineEvents(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await api.get(`/documents/case/${selectedCase._id}`);
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${selectedCase._id}/events`, {
        eventType,
        title: eventTitle,
        dateTime: new Date(eventDate),
        description: eventDesc,
        source: 'USER',
      });
      setEventTitle('');
      setEventDesc('');
      setShowEventForm(false);
      loadTimeline();
    } catch (err) {
      console.error('Failed to add timeline event:', err);
    }
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    try {
      await api.post('/documents', {
        caseId: selectedCase._id,
        title: docTitle,
        documentType: docType,
        fileUrl: docUrl || `https://storage.nyayasetu.in/docs/${encodeURIComponent(docTitle)}.pdf`,
      });
      setDocTitle('');
      setDocUrl('');
      setShowDocForm(false);
      loadDocuments();
    } catch (err) {
      console.error('Failed to add document:', err);
    }
  };

  const getUrgencyBadge = (urgency) => {
    const u = (urgency || selectedCase.urgency || '').toUpperCase();
    if (u === 'EMERGENCY' || u === 'URGENT_ASSISTANCE' || u === 'HIGH') {
      return (
        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          Urgent Attention Required
        </span>
      );
    }
    if (u === 'ATTENTION_RECOMMENDED' || u === 'MEDIUM') {
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-xl flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Attention Recommended
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        General Legal Guidance
      </span>
    );
  };

  if (!isOpen || !selectedCase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-start shrink-0 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono bg-slate-800 text-nyaya-300 px-2 py-0.5 rounded-md border border-slate-700 font-bold">
                {selectedCase.caseNumber}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-nyaya-700 text-white">
                {selectedCase.category}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-100">
                {selectedCase.status}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">{selectedCase.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {getUrgencyBadge(selectedCase.urgency)}
            <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'workspace', label: 'Case Workspace Overview' },
            { id: 'timeline', label: 'Timeline Milestones', count: timelineEvents.length },
            { id: 'documents', label: 'Documents & Evidence', count: documents.length },
            { id: 'details', label: 'Parties & Claims' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                activeTab === t.id
                  ? 'border-nyaya-600 text-nyaya-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: 7-LAYER CASE WORKSPACE OVERVIEW */}
          {activeTab === 'workspace' && (
            <div className="space-y-5">
              {/* Layer 1: Issue & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dispute Domain</span>
                  <span className="text-xs font-bold text-slate-800">{selectedCase.category}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Court Jurisdiction</span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedCase.location?.city || 'Delhi'}, {selectedCase.location?.state || 'India'}
                  </span>
                </div>
                <div className="p-3.5 bg-nyaya-50 rounded-2xl border border-nyaya-200">
                  <span className="text-[10px] uppercase font-bold text-nyaya-700 block mb-1">Financial Quantum</span>
                  <span className="text-sm font-extrabold text-nyaya-900">
                    ₹{Number(selectedCase.financialDetails?.disputedAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Layer 2: Parties Relationship */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-nyaya-600" />
                  Identified Parties ($A \leftrightarrow B$)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Complainant / Claimant</span>
                    <span className="font-bold text-slate-800">{selectedCase.parties?.plaintiff?.name || 'Citizen Complainant'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Opposite Party / Defendant</span>
                    <span className="font-bold text-slate-800">{selectedCase.parties?.defendant?.name || 'Opposing Party'}</span>
                  </div>
                </div>
              </div>

              {/* Layer 3: Statutory Legal Basis (Milestone 2 Grounded RAG) */}
              {details && user && user.role !== 'CITIZEN' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-nyaya-600" />
                    Authoritative Statutory Provisions
                  </h4>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-nyaya-800">{details.statute}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                        Authoritative Gazette
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {details.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Layer 4: Actionable Next Steps */}
              {details && (
                <div className="p-4 bg-nyaya-50 rounded-2xl border border-nyaya-200 space-y-2 text-xs">
                  <h4 className="font-bold text-nyaya-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-nyaya-600" />
                    Recommended Action Plan
                  </h4>
                  <div className="space-y-1 text-slate-700">
                    {details.actionPlan.map((step, idx) => {
                      const parts = step.split(':');
                      return (
                        <p key={idx}>
                          {idx + 1}. <strong>{parts[0]}:</strong>{parts[1] || ''}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Case Timeline & Milestones</h3>
                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-nyaya-600 hover:text-nyaya-700 bg-nyaya-50 px-3 py-1.5 rounded-lg border border-nyaya-200 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {showEventForm ? 'Cancel' : 'Add Milestone Event'}
                </button>
              </div>

              {showEventForm && (
                <form onSubmit={handleAddEvent} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Event Type</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      >
                        <option value="EMPLOYMENT_STARTED">Employment Started</option>
                        <option value="SALARY_DUE">Salary Due Date</option>
                        <option value="HR_CONTACTED">HR Contacted</option>
                        <option value="LEGAL_NOTICE_SENT">Legal Notice Sent</option>
                        <option value="COMPLAINT_FILED">Complaint Filed</option>
                        <option value="CUSTOM_EVENT">Custom Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Event Date</label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sent formal demand letter to HR"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description / Notes</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Detailed notes on what occurred on this date..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-nyaya-600 text-white rounded-lg text-xs font-medium hover:bg-nyaya-700"
                  >
                    Save Timeline Event
                  </button>
                </form>
              )}

              <div className="relative pl-6 border-l-2 border-nyaya-200 space-y-4">
                {timelineEvents.map((evt, idx) => (
                  <div key={evt._id || idx} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-nyaya-600 border-2 border-white ring-2 ring-nyaya-200"></div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-nyaya-700 bg-nyaya-50 px-2 py-0.5 rounded">
                          {evt.eventType?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(evt.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Case Documents & Evidence</h3>
                <button
                  onClick={() => setShowDocForm(!showDocForm)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-nyaya-600 hover:text-nyaya-700 bg-nyaya-50 px-3 py-1.5 rounded-lg border border-nyaya-200 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {showDocForm ? 'Cancel' : 'Upload Document'}
                </button>
              </div>

              {showDocForm && (
                <form onSubmit={handleAddDoc} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Document Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Appointment Letter"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      >
                        <option value="EMPLOYMENT_CONTRACT">Employment Contract</option>
                        <option value="SALARY_SLIP">Salary Slip</option>
                        <option value="LEGAL_NOTICE">Legal Notice</option>
                        <option value="BANK_STATEMENT">Bank Statement</option>
                        <option value="RENT_AGREEMENT">Rent Agreement</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-nyaya-600 text-white rounded-lg text-xs font-medium hover:bg-nyaya-700"
                  >
                    Register Document Metadata
                  </button>
                </form>
              )}

              {documents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                  <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No documents registered for this case yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((d) => (
                    <div key={d._id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-nyaya-50 text-nyaya-600 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{d.title}</h4>
                          <p className="text-[11px] text-slate-500">{d.documentType}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        {d.processingStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Facts & Narrative</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedCase.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2">Plaintiff (Filing Party)</h4>
                  <p className="text-slate-600">Name: {selectedCase.parties?.plaintiff?.name || 'Not specified'}</p>
                  <p className="text-slate-600">Location: {selectedCase.location?.city}, {selectedCase.location?.state}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2">Defendant (Opposite Party)</h4>
                  <p className="text-slate-600">Organization: {selectedCase.parties?.defendant?.organization || selectedCase.parties?.defendant?.name || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
