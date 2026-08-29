import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  PlusCircle,
  Scale,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  Info,
  Calendar,
  DollarSign,
  Briefcase,
  Home,
  ShoppingBag,
  HeartHandshake,
  ShieldAlert,
  Globe,
  Landmark,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

// Dynamic category configuration defining custom fields, default issues, applicable laws, and tailored action plans
const CATEGORY_SCHEMAS = {
  'Employment': {
    icon: Briefcase,
    label: 'Employment & Labor Law',
    isMonetaryDefault: true,
    amountLabel: 'Total Disputed Unpaid Dues (₹)',
    amountOptional: false,
    defaultIssues: ['Unpaid Salary / Withheld Dues', 'Wrongful Termination without Notice Pay', 'PF / Gratuity Default', 'Workplace Harassment'],
    statutes: 'Payment of Wages Act, 1936 (Sec 15) • Industrial Disputes Act, 1947 (Sec 25F)',
    applicableCharges: ['Unlawful Withholding of Wages', 'Retrenchment without Notice Pay', 'Breach of Employment Contract'],
    quickRecommendations: [
      'Collate appointment letter, salary slips, and bank statements.',
      'Serve a formal 15-day statutory legal notice for full & final settlement.',
      'File online conciliation grievance on the Ministry of Labour SAMADHAN portal.',
      'Approach the Labour Commissioner / Authority for recovery with penalty.',
    ],
    fields: [
      { key: 'employerName', label: 'Employer / Company Name', type: 'text', placeholder: 'e.g. Apex Software Solutions Pvt Ltd', required: true },
      { key: 'designation', label: 'Your Job Role / Designation', type: 'text', placeholder: 'e.g. Senior Software Engineer', required: false },
      { key: 'monthlySalary', label: 'Monthly In-Hand Salary (₹)', type: 'number', placeholder: 'e.g. 60000', required: false },
      { key: 'joiningDate', label: 'Date of Joining / Tenure', type: 'text', placeholder: 'e.g. Jan 2024 - July 2026', required: false },
    ],
  },

  'Property & Real Estate': {
    icon: Home,
    label: 'Property, Tenancy & Real Estate',
    isMonetaryDefault: true,
    amountLabel: 'Disputed Security Deposit / Rent Claim (₹)',
    amountOptional: true,
    amountHelper: 'Optional — leave blank for non-monetary matters like eviction or boundary dispute.',
    defaultIssues: ['Non-Refund of Rental Security Deposit', 'Unlawful Eviction Notice', 'Property Encroachment / Boundary Dispute', 'Builder Possession Delay'],
    statutes: 'Model Tenancy Act, 2021 (Sec 21) • Transfer of Property Act, 1882 (Sec 108) • RERA, 2016',
    applicableCharges: ['Wrongful Withholding of Security Deposit', 'Breach of Lease Agreement', 'Unlawful Dispossession / Trespass'],
    quickRecommendations: [
      'Assemble signed rent agreement, deposit bank slips, and handover inspection proof.',
      'Serve a formal 15-day statutory notice calling for deposit refund with 18% interest.',
      'Lodge a summary petition before the local Rent Authority / Rent Court.',
      'If high-value commercial dispute, file summary recovery suit under Order 37 CPC.',
    ],
    fields: [
      { key: 'propertyType', label: 'Property Type', type: 'select', options: ['Residential Flat / Apartment', 'Independent House', 'Commercial Office / Shop', 'Agricultural Land / Plot'], required: true },
      { key: 'userRole', label: 'Your Capacity / Role', type: 'select', options: ['Tenant', 'Landlord / Property Owner', 'Property Buyer', 'Co-Owner / Heir'], required: true },
      { key: 'propertyAddress', label: 'Property Address / Locality', type: 'text', placeholder: 'e.g. Flat 402, Green Meadows, Whitefield', required: true },
      { key: 'agreementDate', label: 'Agreement / Lease Date', type: 'text', placeholder: 'e.g. 1st August 2025 to 31st July 2026', required: false },
    ],
  },

  'Consumer Dispute': {
    icon: ShoppingBag,
    label: 'Consumer Protection & Defective Goods',
    isMonetaryDefault: true,
    amountLabel: 'Amount Paid / Claim Value (₹)',
    amountOptional: false,
    defaultIssues: ['Defective Product / Hardware Failure', 'Refusal of 7-Day Replacement / Refund', 'Deficiency in Service', 'Flight / Travel Cancellation Refund'],
    statutes: 'Consumer Protection Act, 2019 (Sec 35 & 84 - Product Liability & Deficiency of Service)',
    applicableCharges: ['Deficiency in Service (Sec 2(11) CPA)', 'Unfair Trade Practice (Sec 2(47) CPA)', 'Breach of Manufacturer Warranty'],
    quickRecommendations: [
      'Preserve tax invoice, warranty card, product photos, and service center job sheets.',
      'Lodge a pre-litigation complaint on the National Consumer Helpline (NCH / Dial 1915).',
      'Serve a 15-day legal notice demanding replacement, refund, and damages.',
      'File an electronic consumer complaint on e-Daakhil (edaakhil.nic.in) before District Commission.',
    ],
    fields: [
      { key: 'productName', label: 'Product / Service Name', type: 'text', placeholder: 'e.g. Dell XPS 15 Laptop / Airline Ticket', required: true },
      { key: 'sellerName', label: 'Seller / E-commerce Brand', type: 'text', placeholder: 'e.g. TechRetail Store & Brand India Ltd', required: true },
      { key: 'orderInvoiceId', label: 'Order ID / Invoice Number', type: 'text', placeholder: 'e.g. OD-2026-8849102', required: false },
      { key: 'warrantyStatus', label: 'Warranty Status', type: 'select', options: ['Under Active Manufacturer Warranty', 'Within 7-Day Return Window', 'Out of Warranty (Service Defect)'], required: false },
    ],
  },

  'Family & Matrimonial': {
    icon: HeartHandshake,
    label: 'Family & Matrimonial Law',
    isMonetaryDefault: false,
    amountLabel: 'Monthly Maintenance Claim (₹/month)',
    amountOptional: true,
    amountHelper: 'Optional — only specify if seeking monthly maintenance or alimony.',
    defaultIssues: ['Matrimonial Maintenance & Alimony', 'Mutual Consent Divorce', 'Child Custody & Visitation Rights', 'Domestic Violence & Protection Order'],
    statutes: 'Protection of Women from Domestic Violence Act, 2005 (Sec 12) • Section 144 BNSS / 125 CrPC • Hindu Marriage Act, 1955',
    applicableCharges: ['Domestic Violence (Sec 3 DV Act)', 'Failure of Maintenance', 'Cruelty (Sec 85/86 BNS / 498A IPC)'],
    quickRecommendations: [
      'Collate marriage certificate, communication records, and income documents.',
      'Approach nearest Protection Officer / Women Safety Cell for counseling.',
      'Apply for pre-litigation mediation at the District Legal Services Authority (DLSA).',
      'File petition under Sec 12 DV Act or Sec 144 BNSS in Family Court / Magistrate.',
    ],
    fields: [
      { key: 'matterSubtype', label: 'Matrimonial Matter Type', type: 'select', options: ['Maintenance & Financial Support', 'Mutual Consent Divorce', 'Child Custody & Guardianship', 'Domestic Violence Protection', 'Restitution of Conjugal Rights'], required: true },
      { key: 'marriageDate', label: 'Date / Year of Marriage', type: 'text', placeholder: 'e.g. 15th December 2021', required: false },
      { key: 'childrenDetails', label: 'Children Details (if any)', type: 'text', placeholder: 'e.g. 1 child (Age 4 years)', required: false },
      { key: 'cawStatus', label: 'Police / CAW Cell Status', type: 'select', options: ['No Complaint Filed Yet', 'Complaint Submitted to CAW Cell', 'FIR Registered'], required: false },
    ],
  },

  'Criminal Law': {
    icon: ShieldAlert,
    label: 'Criminal Law & Public Offenses',
    isMonetaryDefault: false,
    amountLabel: 'Value of Stolen Property / Financial Loss (₹)',
    amountOptional: true,
    amountHelper: 'Optional — only specify for theft, burglary, or monetary extortion.',
    defaultIssues: ['Physical Assault & Bodily Harm', 'Criminal Intimidation & Severe Threats', 'Stalking & Harassment', 'Theft, Burglary & Property Recovery'],
    statutes: 'Bharatiya Nyaya Sanhita, 2023 (BNS Sec 115, 351, 78) • Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS Sec 173 - Mandatory FIR)',
    applicableCharges: ['Criminal Intimidation (Sec 351 BNS)', 'Voluntarily Causing Hurt (Sec 115 BNS)', 'Stalking (Sec 78 BNS)', 'Theft (Sec 303 BNS)'],
    quickRecommendations: [
      'Obtain Medico-Legal Examination (MLC) from government hospital if injured.',
      'Lodge signed written complaint for FIR registration under Sec 173 BNSS.',
      'If police refuse FIR, send complaint to SP/DCP by registered post (Sec 173(4) BNSS).',
      'File application under Sec 175(3) BNSS before Judicial Magistrate for investigation order.',
    ],
    fields: [
      { key: 'offenseType', label: 'Primary Offense', type: 'select', options: ['Physical Assault / Battery', 'Criminal Threats & Intimidation', 'Stalking / Unlawful Follow', 'Theft / Robbery', 'Cheating & Extortion'], required: true },
      { key: 'incidentDate', label: 'Date & Time of Occurrence', type: 'text', placeholder: 'e.g. 25th August 2026 at 9:30 PM', required: true },
      { key: 'accusedDetails', label: 'Accused Party Status', type: 'select', options: ['Known Individual(s)', 'Organization / Group', 'Unknown Accused'], required: false },
      { key: 'policeStationStatus', label: 'Police Complaint / FIR Status', type: 'select', options: ['Not Yet Filed (Seeking Guidance)', 'Written Complaint Given / GD Entry', 'FIR Formally Registered', 'Police Refused Registration'], required: true },
    ],
  },

  'Cyber Law & Data Privacy': {
    icon: Globe,
    label: 'Cyber Law, IT Act & Online Fraud',
    isMonetaryDefault: true,
    amountLabel: 'Unauthorized Financial Loss (₹)',
    amountOptional: true,
    amountHelper: 'Optional — leave blank for non-financial cyber stalking or impersonation.',
    defaultIssues: ['Unauthorized UPI Fraud / Phishing Link', 'Social Media Impersonation / Fake Account', 'Cyber Stalking & Harassment', 'Unauthorized Data Breach'],
    statutes: 'Information Technology Act, 2000 (Sec 66D, 43A) • Bharatiya Nyaya Sanhita, 2023 (Sec 318(4) - Cheating by Personation)',
    applicableCharges: ['Cheating by Personation (Sec 66D IT Act)', 'Identity Theft (Sec 66C IT Act)', 'Criminal Breach of Trust (Sec 316 BNS)'],
    quickRecommendations: [
      'Contact bank branch immediately to freeze payment channels and dispute debit.',
      'Call 1930 National Cyber Fraud Helpline immediately to freeze recipient accounts.',
      'Register detailed cyber complaint with logs on cybercrime.gov.in.',
      'Escalate to RBI Banking Ombudsman (cms.rbi.org.in) for unauthorized debit refund.',
    ],
    fields: [
      { key: 'incidentSubtype', label: 'Cyber Incident Type', type: 'select', options: ['UPI / Netbanking Fraud Call', 'Phishing Link / Malicious APK', 'Social Media Fake Profile / Impersonation', 'Cyber Harassment / Blackmail', 'Data Theft / Account Takeover'], required: true },
      { key: 'platformInvolved', label: 'Platform / App Involved', type: 'text', placeholder: 'e.g. Google Pay, SBI YONO, Instagram, WhatsApp', required: true },
      { key: 'cyberAckId', label: '1930 / Cyber Portal Ack Reference (if filed)', type: 'text', placeholder: 'e.g. 2026/CYBER/994812', required: false },
    ],
  },

  'Banking & Financial Dispute': {
    icon: Landmark,
    label: 'Banking & Financial Dispute',
    isMonetaryDefault: true,
    amountLabel: 'Disputed Claim Amount (₹)',
    amountOptional: false,
    defaultIssues: ['Dishonour of Cheque (Section 138 NI Act)', 'Harassment by Loan Recovery Agents', 'Unauthorized Banking Charges / Penalties', 'Erroneous CIBIL Credit Score Record'],
    statutes: 'Negotiable Instruments Act, 1881 (Sec 138) • RBI Fair Practices Code for Lenders',
    applicableCharges: ['Cheque Dishonour (Sec 138 NI Act)', 'Violation of RBI Fair Lending Code', 'Defamatory Credit Reporting'],
    quickRecommendations: [
      'Collect bank account statements, loan agreement, and cheque return memo.',
      'Submit formal written grievance to the Principal Nodal Officer of the Bank/NBFC.',
      'Escalate to RBI Integrated Ombudsman (cms.rbi.org.in) if unresolved in 30 days.',
      'If cheque bounce, issue statutory 30-day notice under Sec 138 of the NI Act.',
    ],
    fields: [
      { key: 'bankName', label: 'Bank / NBFC Name', type: 'text', placeholder: 'e.g. HDFC Bank Ltd / Bajaj Finance', required: true },
      { key: 'accountType', label: 'Account / Facility Type', type: 'select', options: ['Savings / Current Account', 'Personal / Business Loan', 'Credit Card Account', 'Cheque / Clearing Facility'], required: true },
      { key: 'disputeSubtype', label: 'Financial Issue Type', type: 'select', options: ['Cheque Bounce (Sec 138)', 'Recovery Agent Intimidation', 'Unauthorized Deductions', 'CIBIL Dispute'], required: true },
    ],
  },

  'Corporate & Commercial': {
    icon: Scale,
    label: 'Corporate, Commercial & Contracts',
    isMonetaryDefault: true,
    amountLabel: 'Disputed Contract Value (₹)',
    amountOptional: false,
    defaultIssues: ['Freelance / Vendor Milestone Payment Default', 'Breach of Commercial Service Agreement', 'NDA & Non-Disclosure Violation', 'Partnership / Shareholder Dispute'],
    statutes: 'Indian Contract Act, 1872 (Sec 73) • Commercial Courts Act, 2015 (Sec 12A) • MSMED Act, 2006',
    applicableCharges: ['Breach of Contract (Sec 73 Contract Act)', 'Delayed Payment to MSME (Sec 15 MSMED Act)', 'Unjust Enrichment'],
    quickRecommendations: [
      'Assemble signed contract, SOW, milestone deliverables, and approval emails.',
      'Serve a formal 15-day pre-suit legal notice claiming contract dues with interest.',
      'If registered as MSME, lodge complaint on MSME Samadhaan Portal for statutory arbitration.',
      'Initiate mandatory pre-institution mediation under Section 12A Commercial Courts Act.',
    ],
    fields: [
      { key: 'agreementTitle', label: 'Contract / Agreement Title', type: 'text', placeholder: 'e.g. Master Service Agreement / Freelance Contract', required: true },
      { key: 'counterpartyOrg', label: 'Client / Counterparty Company', type: 'text', placeholder: 'e.g. Nova Media Agency Pvt Ltd', required: true },
      { key: 'breachType', label: 'Breach Nature', type: 'select', options: ['Milestone Payment Default', 'Non-Delivery of Services', 'Confidentiality / NDA Breach', 'Unilateral Termination'], required: true },
    ],
  },
};

export default function CaseFormModal({ isOpen, onClose, onCaseCreated }) {
  const [category, setCategory] = useState('Employment');
  const [title, setTitle] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Delhi');
  const [state, setState] = useState('Delhi');
  const [urgency, setUrgency] = useState('HIGH');
  const [plaintiffName, setPlaintiffName] = useState('');
  const [defendantOrg, setDefendantOrg] = useState('');
  const [disputedAmount, setDisputedAmount] = useState('');
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const schema = CATEGORY_SCHEMAS[category] || CATEGORY_SCHEMAS['Employment'];

  // Automatically update default issue when category changes
  useEffect(() => {
    if (schema.defaultIssues && schema.defaultIssues.length > 0) {
      setIssue(schema.defaultIssues[0]);
    }
    setCategoryData({});
  }, [category]);

  const handleCategoryFieldChange = (key, value) => {
    setCategoryData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Employment');
    setIssue('Unpaid Salary / Withheld Dues');
    setDescription('');
    setCity('Delhi');
    setState('Delhi');
    setUrgency('HIGH');
    setPlaintiffName('');
    setDefendantOrg('');
    setDisputedAmount('');
    setCategoryData({});
    setError(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const generatedTitle = title || `${category}: ${issue}`;
      const payload = {
        title: generatedTitle,
        category,
        issue,
        description,
        location: { city, state },
        urgency,
        parties: {
          plaintiff: { name: plaintiffName || 'Complainant' },
          defendant: {
            organization: defendantOrg || categoryData.employerName || categoryData.sellerName || categoryData.bankName || categoryData.counterpartyOrg || 'Opposing Party',
          },
        },
        financialDetails: {
          disputedAmount: disputedAmount ? parseFloat(disputedAmount) : null,
          isNonMonetary: !disputedAmount,
          currency: 'INR',
        },
        customFields: categoryData,
        tags: [category, issue],
      };

      const res = await api.post('/cases', payload);
      onCaseCreated(res.data.data);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create case. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const IconComponent = schema.icon || Scale;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0B1F33] text-white flex justify-between items-center shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-legal-blue to-sky-400 rounded-xl text-white shadow-md">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                File a New Legal Case
                <span className="text-[10px] font-bold text-legal-gold bg-legal-gold/15 px-2 py-0.5 rounded uppercase">
                  Structured Intake
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Dynamic Case Dossier & Pleading Registration</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-800 rounded-2xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              1. Select Legal Category / Domain
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-legal-blue focus:outline-none text-slate-900"
            >
              {Object.keys(CATEGORY_SCHEMAS).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {CATEGORY_SCHEMAS[catKey].label}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Statutory & Charge Badge for chosen category */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-slate-50 rounded-2xl border border-blue-200/80 space-y-2">
            <div className="flex items-start gap-2">
              <Scale className="w-4 h-4 text-legal-blue shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-slate-900 block">Governing Indian Statutes:</span>
                <span className="text-[11px] text-slate-700 font-mono font-medium">{schema.statutes}</span>
              </div>
            </div>
            {schema.applicableCharges && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-center mr-1">
                  Key Legal Violations:
                </span>
                {schema.applicableCharges.map((chg, i) => (
                  <span key={i} className="text-[10px] font-semibold bg-white border border-blue-200 text-legal-blue px-2 py-0.5 rounded-md shadow-2xs">
                    {chg}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. Specific Dispute Issue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dispute Subtype / Issue
              </label>
              <select
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none text-slate-800"
              >
                {schema.defaultIssues.map((iss, idx) => (
                  <option key={idx} value={iss}>
                    {iss}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Case Title / Subject Line
              </label>
              <input
                type="text"
                placeholder={`e.g. ${category}: ${issue}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>
          </div>

          {/* 3. DYNAMIC CATEGORY-SPECIFIC FORM FIELDS */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 pb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-legal-gold" />
              <span>Specific Information for {category}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {schema.fields.map((fld) => (
                <div key={fld.key} className={fld.type === 'select' && fld.options.length > 3 ? 'md:col-span-2' : ''}>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    {fld.label} {fld.required && <span className="text-red-500">*</span>}
                  </label>
                  {fld.type === 'select' ? (
                    <select
                      value={categoryData[fld.key] || fld.options[0]}
                      onChange={(e) => handleCategoryFieldChange(fld.key, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none text-slate-800"
                    >
                      {fld.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={fld.type}
                      required={fld.required}
                      placeholder={fld.placeholder}
                      value={categoryData[fld.key] || ''}
                      onChange={(e) => handleCategoryFieldChange(fld.key, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* DYNAMIC AMOUNT FIELD: Only formatted if relevant or clearly marked optional */}
            <div className="pt-2 border-t border-slate-200/60">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                {schema.amountLabel} {schema.amountOptional && <span className="text-slate-400 font-normal lowercase">(optional)</span>}
              </label>
              <div className="relative">
                <span className="text-slate-400 absolute left-3 top-2 text-xs font-bold font-mono">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={disputedAmount}
                  onChange={(e) => setDisputedAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none font-mono"
                />
              </div>
              {schema.amountHelper && (
                <p className="text-[10px] text-slate-500 mt-1 italic">{schema.amountHelper}</p>
              )}
            </div>
          </div>

          {/* 4. Parties & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Complainant / Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Aman Sharma"
                value={plaintiffName}
                onChange={(e) => setPlaintiffName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Opposite Party / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Software Solutions Pvt Ltd / Ramesh Kulkarni"
                value={defendantOrg}
                onChange={(e) => setDefendantOrg(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Location & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                City / Jurisdiction
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Urgency Priority
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none text-slate-800"
              >
                <option value="LOW">Low (Informational)</option>
                <option value="MEDIUM">Medium (Notice Period)</option>
                <option value="HIGH">High (Limitation / Dues Pending)</option>
                <option value="CRITICAL">Critical (Immediate Harm / Threat)</option>
              </select>
            </div>
          </div>

          {/* 6. Narrative */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Case Narrative & Detailed Factual Statement
            </label>
            <textarea
              required
              rows={3}
              placeholder={`Describe the factual background: contractual terms, dates of default or breach, communications exchanged, and exact relief sought...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-legal-blue focus:outline-none resize-none leading-relaxed"
            ></textarea>
          </div>

          {/* 7. Action Recommendations Preview */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tailored Procedural Roadmap for this Case:
            </span>
            <div className="space-y-1 text-[11px] text-slate-700 pl-4 list-decimal">
              {schema.quickRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="font-bold text-legal-blue">{i + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Filing Case...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-legal-gold" />
                  <span>Establish Structured Case</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
