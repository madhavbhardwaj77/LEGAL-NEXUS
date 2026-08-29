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
  Layers,
  FileCheck,
  Award,
} from 'lucide-react';
import api from '../services/api';

const getCategoryDetails = (category) => {
  const cat = (category || '').toLowerCase();

  if (cat.includes('consumer')) {
    return {
      statute: 'The Consumer Protection Act, 2019 — Section 35 & 84',
      description:
        'Defines the electronic filing of complaints (e-Daakhil) before District, State, and National Consumer Commissions and establishes strict Product Liability for defective goods and deficiency in services.',
      charges: ['Deficiency in Service (Sec 2(11) CPA)', 'Unfair Trade Practice (Sec 2(47) CPA)', 'Product Liability Failure'],
      actionPlan: [
        'Preserve Purchase & Defect Proof: Collate tax invoice, warranty card, product unboxing video, service center job sheets, and support tickets.',
        'National Consumer Helpline (NCH): Register a formal pre-litigation grievance on the NCH portal (consumerhelpline.gov.in) or call 1915.',
        '15-Day Statutory Legal Notice: Serve a formal notice demanding product replacement, refund, and compensation for mental agony.',
        'e-Daakhil Consumer Complaint: File an electronic complaint on e-Daakhil (edaakhil.nic.in) before the competent District Consumer Commission.',
      ],
    };
  }

  if (cat.includes('property') || cat.includes('real estate') || cat.includes('tenant') || cat.includes('rental')) {
    return {
      statute: 'The Model Tenancy Act, 2021 (Sec 21) • Transfer of Property Act, 1882 (Sec 108)',
      description:
        'Regulates rights and obligations between lessors and lessees, mandatory security deposit refund upon peaceful vacation, and statutory procedures for lawful tenancy termination.',
      charges: ['Wrongful Withholding of Security Deposit', 'Breach of Leave and License Agreement', 'Unlawful Dispossession / Trespass'],
      actionPlan: [
        'Assemble Rental & Handover Proof: Collect signed rent agreement, security deposit bank proof, 30-day vacation notice emails, and handover photos.',
        '15-Day Statutory Demand Notice: Serve a formal legal notice demanding immediate refund of security deposit with 18% p.a. interest.',
        'Rent Authority Petition: File a summary recovery petition before the local Rent Authority / Rent Court under the Tenancy Act.',
        'Summary Recovery Suit (Order 37 CPC): If commercial lease or high value, initiate summary civil recovery suit in competent Civil Court.',
      ],
    };
  }

  if (cat.includes('cyber') || cat.includes('privacy') || cat.includes('data')) {
    return {
      statute: 'The Information Technology Act, 2000 (Sec 66D & 43A) • BNS 318(4) / IPC 420',
      description:
        'Prescribes criminal penalties for cheating by personation using computer resources, cyber financial phishing, and statutory compensation for failure to protect sensitive personal data.',
      charges: ['Cheating by Personation (Sec 66D IT Act)', 'Identity Theft (Sec 66C IT Act)', 'Criminal Breach of Trust (Sec 316 BNS)'],
      actionPlan: [
        'Golden Hour Bank Transaction Freeze: Contact bank branch and customer care immediately to freeze payment channels and dispute unauthorized debits.',
        'National Cyber Crime Helpline (1930): Call 1930 immediately to trigger an automated lien on recipient beneficiary bank accounts.',
        'National Cyber Crime Portal: Submit formal complaint with transaction screenshots, SMS logs, and fraudster details on cybercrime.gov.in.',
        'Escalate to RBI Banking Ombudsman: File online dispute on cms.rbi.org.in if bank fails to credit unauthorized debits under zero-liability rules.',
      ],
    };
  }

  if (cat.includes('family') || cat.includes('matrimonial') || cat.includes('divorce') || cat.includes('custody')) {
    return {
      statute: 'Protection of Women from Domestic Violence Act, 2005 (Sec 12) • Section 144 BNSS / 125 CrPC',
      description:
        'Provides emergency protection orders, residence rights, monthly interim maintenance, and custody adjudication through Family Courts and Magistrates.',
      charges: ['Domestic Violence (Sec 3 DV Act)', 'Failure to Provide Maintenance', 'Cruelty & Harassment (Sec 85/86 BNS)'],
      actionPlan: [
        'Collate Matrimonial & Income Proof: Assemble marriage certificate, communication records, bank statements, and income affidavits.',
        'Approach Protection Officer / CAW Cell: Submit a formal Domestic Incident Report (DIR) to the Protection Officer or Women Safety Cell.',
        'Pre-Litigation Mediation: Apply for mediation at the District Legal Services Authority (DLSA) / Family Court Mediation Centre.',
        'Magistrate / Family Court Petition: File formal application under Sec 12 DV Act or Sec 144 BNSS for interim relief.',
      ],
    };
  }

  if (cat.includes('criminal') || cat.includes('assault') || cat.includes('threat') || cat.includes('fir')) {
    return {
      statute: 'Bharatiya Nyaya Sanhita, 2023 (Sec 115, 351, 78) • BNSS, 2023 (Sec 173 - Mandatory FIR)',
      description:
        'Defines cognizable offenses including voluntarily causing hurt, criminal intimidation, and stalking, and establishes statutory duty of police to register First Information Report (FIR).',
      charges: ['Criminal Intimidation (Sec 351 BNS)', 'Voluntarily Causing Hurt (Sec 115 BNS)', 'Stalking (Sec 78 BNS)', 'Theft (Sec 303 BNS)'],
      actionPlan: [
        'Medical Examination (MLC): Obtain Medico-Legal Certificate (MLC) from a government hospital if bodily harm was inflicted.',
        'Lodge Written Complaint (FIR): Submit signed, chronological complaint to Station House Officer (SHO) under Sec 173 BNSS.',
        'Escalate to Superintendent of Police (SP/DCP): If FIR is refused, send complaint by registered post under Sec 173(4) BNSS.',
        'Judicial Magistrate Order (Sec 175(3) BNSS): Approach Magistrate for court-monitored investigation and FIR direction.',
      ],
    };
  }

  if (cat.includes('banking') || cat.includes('finance') || cat.includes('cheque') || cat.includes('loan')) {
    return {
      statute: 'Negotiable Instruments Act, 1881 (Sec 138) • RBI Fair Practices Code for Lenders',
      description:
        'Criminal prosecution for dishonour of cheques and strict regulatory restrictions prohibiting harassment by loan recovery agents.',
      charges: ['Cheque Dishonour (Sec 138 NI Act)', 'Violation of RBI Fair Lending Code', 'Defamatory Credit Reporting'],
      actionPlan: [
        'Assemble Banking & Cheque Proof: Collect bank statements, loan ledger, cheque return memo, and recovery agent call recordings.',
        'Escalate to Principal Nodal Officer: Submit written grievance to the Bank / NBFC Grievance Redressal Officer.',
        'RBI Integrated Ombudsman: File online complaint at cms.rbi.org.in if grievance is unresolved within 30 days.',
        'Statutory 30-Day Cheque Notice: If cheque bounce, issue statutory notice under Sec 138 of the NI Act within 30 days of receiving the memo.',
      ],
    };
  }

  if (cat.includes('employment') || cat.includes('labour') || cat.includes('wage')) {
    return {
      statute: 'The Payment of Wages Act, 1936 (Sec 15) • Industrial Disputes Act, 1947 (Sec 25F & 33C)',
      description:
        'Mandates wage settlement on due dates and authorizes the Labour Authority to order wage recovery plus statutory compensation up to 10x and retrenchment severance.',
      charges: ['Unlawful Withholding of Wages (Sec 15 Payment of Wages Act)', 'Wrongful Termination without Notice Pay', 'Breach of Employment Contract'],
      actionPlan: [
        'Collate Employment & Compensation Records: Gather appointment letter, monthly salary slips, and bank statements showing unpaid months.',
        '15-Day Statutory Legal Demand Notice: Serve formal notice to the company directors and HR under the Payment of Wages Act.',
        'SAMADHAN Labour Portal Conciliation: Register a conciliation grievance on the Ministry of Labour SAMADHAN Portal (samadhan.labour.gov.in).',
        'Petition before Labour Authority: File recovery claim under Sec 15 of the Payment of Wages Act or Sec 33C(2) of the Industrial Disputes Act.',
      ],
    };
  }

  return {
    statute: 'The Code of Civil Procedure, 1908 (Sec 89) • Specific Relief Act, 1963',
    description:
      'Provides for specific performance of obligations, permanent injunctions against unlawful acts, and alternate dispute resolution (ADR) mechanisms including mediation.',
    charges: ['Breach of Legal Obligation', 'Tortious Interference', 'Civil Damages Claim'],
    actionPlan: [
      'Collate Evidence & Contracts: Assemble agreement copies, transaction history, emails, and notices exchanged.',
      'Serve Formal Pre-Suit Legal Notice: Send formal notice outlining legal grounds and giving 15 to 30 days to resolve.',
      'Pre-Litigation Mediation: Register for pre-litigation mediation at the local District Legal Services Authority (DLSA).',
      'Civil Suit for Injunction / Damages: File formal civil suit before the competent District Civil Court.',
    ],
  };
};

export default function CaseDetailModal({ selectedCase, isOpen, onClose, onCaseUpdated, user }) {
  const details = selectedCase ? getCategoryDetails(selectedCase.category) : null;
  const [activeTab, setActiveTab] = useState('workspace'); // workspace | timeline | documents | details
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
    if (u === 'EMERGENCY' || u === 'URGENT_ASSISTANCE' || u === 'HIGH' || u === 'CRITICAL') {
      return (
        <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-subtle">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          Urgent Attention Required
        </span>
      );
    }
    if (u === 'ATTENTION_RECOMMENDED' || u === 'MEDIUM') {
      return (
        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-subtle">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Attention Recommended
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-subtle">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        General Legal Guidance
      </span>
    );
  };

  if (!isOpen || !selectedCase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 my-6 flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-[#0B1F33] text-white flex justify-between items-start shrink-0 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-mono bg-slate-800 text-sky-400 px-2 py-0.5 rounded-md border border-slate-700 font-bold">
                {selectedCase.caseNumber}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-legal-blue text-white">
                {selectedCase.category}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-100">
                {selectedCase.status}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{selectedCase.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {getUrgencyBadge(selectedCase.urgency)}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'workspace', label: '1. Case Workspace Overview' },
            { id: 'timeline', label: '2. Case Timeline Events', count: timelineEvents.length },
            { id: 'documents', label: '3. Documents & Evidence', count: documents.length },
            { id: 'details', label: '4. Parties & Facts' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3.5 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                activeTab === t.id
                  ? 'border-legal-blue text-legal-blue font-bold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: CASE WORKSPACE OVERVIEW */}
          {activeTab === 'workspace' && (
            <div className="space-y-5">
              {/* Layer 1: Metric Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dispute Domain</span>
                  <span className="text-xs font-bold text-slate-800">{selectedCase.category}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Court Jurisdiction</span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedCase.location?.city || 'Delhi'}, {selectedCase.location?.state || 'India'}
                  </span>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-legal-blue block mb-1">Disputed Quantum</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    ₹{Number(selectedCase.financialDetails?.disputedAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Layer 2: Parties Relationship */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-legal-blue" />
                  Identified Parties (Complainant & Opposite Party)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Complainant / Claimant</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {selectedCase.parties?.plaintiff?.name || 'Citizen Complainant'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Opposite Party / Defendant</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {selectedCase.parties?.defendant?.organization || selectedCase.parties?.defendant?.name || 'Opposing Party'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Layer 3: Statutory Legal Basis & Charges */}
              {details && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-legal-blue" />
                    Authoritative Statutory Basis & Governing Laws
                  </h4>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{details.statute}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                        Authoritative
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{details.description}</p>
                    {details.charges && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
                          Applicable Charges:
                        </span>
                        {details.charges.map((chg, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-blue-50 text-legal-blue px-2 py-0.5 rounded border border-blue-200">
                            {chg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Layer 4: Actionable Next Steps */}
              {details && (
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-legal-gold" />
                    Recommended Action Plan
                  </h4>
                  <div className="space-y-1 text-slate-700">
                    {details.actionPlan.map((step, idx) => {
                      const parts = step.split(':');
                      return (
                        <p key={idx} className="leading-relaxed">
                          {idx + 1}. <strong className="text-slate-900">{parts[0]}:</strong>
                          {parts[1] || ''}
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
                <h3 className="text-sm font-bold text-slate-800">Case Timeline & Events</h3>
                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-legal-blue hover:text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-legal-gold" />
                  {showEventForm ? 'Cancel Form' : 'Add Timeline Event'}
                </button>
              </div>

              {showEventForm && (
                <form onSubmit={handleAddEvent} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date</label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sent formal demand letter to HR"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Detailed notes on what occurred on this date..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-legal-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow"
                  >
                    Save Timeline Event
                  </button>
                </form>
              )}

              <div className="relative pl-6 border-l-2 border-legal-blue/40 space-y-4">
                {timelineEvents.map((evt, idx) => (
                  <div key={evt._id || idx} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-legal-blue border-2 border-white ring-2 ring-blue-200"></div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle space-y-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-legal-blue bg-blue-50 px-2 py-0.5 rounded">
                          {evt.eventType?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(evt.dateTime).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
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
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-legal-blue hover:text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-legal-gold" />
                  {showDocForm ? 'Cancel Form' : 'Register Document'}
                </button>
              </div>

              {showDocForm && (
                <form onSubmit={handleAddDoc} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Appointment Letter"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
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
                    className="px-4 py-2 bg-legal-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow"
                  >
                    Register Document Metadata
                  </button>
                </form>
              )}

              {documents.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No documents registered for this case yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((d) => (
                    <div
                      key={d._id}
                      className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-subtle"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-legal-blue rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{d.title}</h4>
                          <p className="text-[11px] text-slate-500">{d.documentType}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200">
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
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm mb-2">Facts & Primary Narrative</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedCase.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">Plaintiff (Filing Party)</h4>
                  <p className="text-slate-600">Name: {selectedCase.parties?.plaintiff?.name || 'Not specified'}</p>
                  <p className="text-slate-600">
                    Location: {selectedCase.location?.city}, {selectedCase.location?.state}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">Defendant (Opposite Party)</h4>
                  <p className="text-slate-600">
                    Organization:{' '}
                    {selectedCase.parties?.defendant?.organization ||
                      selectedCase.parties?.defendant?.name ||
                      'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
