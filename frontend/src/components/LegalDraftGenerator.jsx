import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  ShieldCheck,
  Scale,
  Send,
  Building2,
  User,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../services/api';

export default function LegalDraftGenerator({ user, onOpenAuth }) {
  const [draftType, setDraftType] = useState('STATUTORY_LEGAL_NOTICE');
  const [formData, setFormData] = useState({
    plaintiffName: user?.profileData?.fullName || '',
    defendantName: '',
    defendantOrg: '',
    disputedAmount: '150000',
    jurisdiction: 'Delhi',
    issue: 'Unpaid Salary for 3 Months',
    category: 'Employment & Labour Law',
  });
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [copied, setCopied] = useState(false);

  const draftOptions = [
    { id: 'STATUTORY_LEGAL_NOTICE', title: '15-Day Statutory Legal Demand Notice', category: 'General / Labour / Civil' },
    { id: 'CONSUMER_FORUM_COMPLAINT', title: 'Consumer Court Complaint Petition (e-Daakhil)', category: 'Consumer Protection' },
    { id: 'EMPLOYER_WAGE_GRIEVANCE', title: 'Employer Wage Grievance / Section 15 Claim', category: 'Labour & Wages' },
    { id: 'LANDLORD_SECURITY_DEPOSIT_NOTICE', title: 'Security Deposit Refund Notice', category: 'Rental & Tenancy' },
    { id: 'POLICE_CYBER_CRIME_COMPLAINT', title: 'Cyber Financial Fraud Complaint (1930 / Zero FIR)', category: 'Cybercrime' },
    { id: 'RTI_APPLICATION', title: 'RTI Application under Section 6(1)', category: 'Public Records' },
    { id: 'LEGAL_INFORMATION_SUMMARY', title: 'Case Facts & Strategy Summary', category: 'Counsel Brief' },
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/drafts/generate-ai', {
        draftType,
        variables: {
          ...formData,
          disputedAmount: parseFloat(formData.disputedAmount) || 0,
        },
      });

      setGeneratedDraft(res.data.data);
    } catch (err) {
      alert('Failed to generate draft. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft.contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedDraft) return;
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "normal");
      
      // Document Title Header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const titleText = generatedDraft.title || "Legal Notice";
      doc.text(titleText, 15, 20);
      
      doc.setDrawColor(180, 180, 180);
      doc.line(15, 25, 195, 25);
      
      // Body Text Formatting
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      const rawText = generatedDraft.contentMarkdown || "";
      const cleanText = rawText
        .replace(/^[#\s*]+/gm, '')      // Remove leading #, *
        .replace(/^[-\s*]+/gm, '')      // Remove leading -
        .replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold formatting **
      
      const splitText = doc.splitTextToSize(cleanText, 180);
      let y = 35;
      const pageHeight = doc.internal.pageSize.height;
      
      for (let i = 0; i < splitText.length; i++) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitText[i], 15, y);
        y += 6;
      }
      
      doc.save(`${draftType.toLowerCase()}_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF download.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-nyaya-500/20 text-nyaya-300 border border-nyaya-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Milestone 4 • Smart Drafting Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Legal Notice & Draft Generator</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Generate formal legal notices, consumer complaints, and wage recovery petitions grounded in Indian statutory provisions and verified against case facts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Draft Type & Case Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleGenerate} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-nyaya-600" />
              1. Select Legal Document Template
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Draft Type</label>
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              >
                {draftOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title} ({opt.category})
                  </option>
                ))}
              </select>
            </div>

            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pt-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-nyaya-600" />
              2. Case Facts & Party Details
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Complainant / Client Name</label>
                <input
                  type="text"
                  value={formData.plaintiffName}
                  onChange={(e) => setFormData({ ...formData, plaintiffName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Opposite Party / Organization</label>
                <input
                  type="text"
                  value={formData.defendantName}
                  onChange={(e) => setFormData({ ...formData, defendantName: e.target.value })}
                  placeholder="e.g. Tech Services Pvt Ltd / Landlord Name"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Disputed Amount (INR)</label>
                  <input
                    type="number"
                    value={formData.disputedAmount}
                    onChange={(e) => setFormData({ ...formData, disputedAmount: e.target.value })}
                    placeholder="150000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jurisdiction / City</label>
                  <input
                    type="text"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    placeholder="Delhi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Primary Issue / Cause of Action</label>
                <textarea
                  rows={2}
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="e.g. Unpaid wages for 3 months despite multiple email demands"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-nyaya-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-nyaya-600 hover:bg-nyaya-700 text-white font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Grounded Draft with AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Preview Column: Formatted Draft & Fact-Checker Badges (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {generatedDraft ? (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-300">
              {/* Draft Header & Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-nyaya-700 bg-nyaya-50 px-2 py-0.5 rounded uppercase">
                    {generatedDraft.draftType}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{generatedDraft.title}</h3>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 bg-nyaya-600 hover:bg-nyaya-700 text-white text-xs rounded-xl flex items-center gap-1.5 shadow transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download (.pdf)
                  </button>
                </div>
              </div>

              {/* Fact Checker Verification Status */}
              {generatedDraft.variables?.verification && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    Fact-Checked & Grounded (Score: {generatedDraft.variables.verification.groundingScore * 100}%)
                  </div>
                  <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {generatedDraft.variables.verification.status}
                  </span>
                </div>
              )}

              {/* Draft Content Box */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {generatedDraft.contentMarkdown}
              </div>

              {/* Mandatory Review Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Notice:</strong> {generatedDraft.variables?.disclaimer || 'AI-generated draft — requires user/professional review before submission.'}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center text-slate-400 space-y-3 min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Grounded Legal Draft Preview</h4>
              <p className="text-xs max-w-sm leading-relaxed">
                Select a draft template on the left and provide party details to generate a formatted Indian legal notice, consumer petition, or grievance claim.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
