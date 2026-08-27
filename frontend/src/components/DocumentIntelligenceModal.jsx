import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Scale,
  ShieldAlert,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../services/api';

export default function DocumentIntelligenceModal({ user, onOpenAuth }) {
  const [docContent, setDocContent] = useState('');
  const [filename, setFilename] = useState('employment_contract.txt');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [expandedClause, setExpandedClause] = useState(null);

  const sampleTemplates = [
    {
      label: 'Sample Employment Agreement (Non-Compete Issue)',
      filename: 'employment_agreement_sample.txt',
      content: `EMPLOYMENT AGREEMENT
Between Apex Technologies Pvt Ltd (Employer) and Rahul Verma (Employee).
Dated: 15-January-2024 at New Delhi.

1. SALARY & COMPENSATION: The Employee shall receive a fixed CTC of Rs 1,50,000 per month payable on the last working day of each calendar month.
2. NOTICE PERIOD: Either party may terminate this agreement by providing thirty (30) days prior written notice.
3. TERMINATION FOR CAUSE: The Company reserves the right to terminate employment immediately without notice or severance in case of misconduct.
4. NON-COMPETE COVENANT: The Employee shall not engage, directly or indirectly, in any competing software business for a period of two (2) years across India post-termination.
5. CONFIDENTIALITY: Both parties agree to protect proprietary source code, trade secrets, and customer records perpetually.
6. DISPUTE RESOLUTION: All disputes shall be referred to arbitration before a sole arbitrator unilaterally appointed by the Company with seat at Delhi.`,
    },
    {
      label: 'Sample Tenancy Agreement (Deposit Issue)',
      filename: 'rent_agreement_sample.txt',
      content: `RESIDENTIAL LEASE AGREEMENT
Between Shri Ramesh Gupta (Lessor/Landlord) and Priya Nair (Lessee/Tenant).
Demised Premises: Flat 304, Green Park, New Delhi.

1. MONTHLY RENT: The Tenant agrees to pay monthly rent of Rs 35,000 before the 5th of each month.
2. SECURITY DEPOSIT: The Tenant has deposited a refundable sum of Rs 1,05,000 (3 months rent) with the Landlord.
3. NOTICE TO VACATE: A 30 days written notice shall be given by either party prior to vacation of premises.
4. REFUND OF DEPOSIT: Landlord shall refund the entire deposit within 7 days of handover subject to inspection.
5. UTILITIES: Landlord shall not disconnect electricity or water under any circumstances during tenancy.`,
    },
  ];

  const handleAnalyze = async (contentToAnalyze = docContent, fileToAnalyze = filename) => {
    if (!contentToAnalyze.trim()) return;
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/documents/analyze-text', {
        content: contentToAnalyze,
        filename: fileToAnalyze,
      });
      setAnalysisResult(res.data.data);
    } catch (err) {
      alert('Failed to analyze document. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-nyaya-500/20 text-nyaya-300 border border-nyaya-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Milestone 4 • Document AI & OCR
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Contract & Document Intelligence</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Upload or paste any legal contract, agreement, or notice to parse layout, classify document type, extract key entities, and audit clauses for legal attention items.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-nyaya-600" />
                Input Legal Document Text
              </h3>
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 block">Try sample contracts:</span>
              <div className="flex flex-col gap-1.5">
                {sampleTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDocContent(t.content);
                      setFilename(t.filename);
                      handleAnalyze(t.content, t.filename);
                    }}
                    className="text-left px-3 py-2 bg-slate-50 hover:bg-nyaya-50 text-slate-700 hover:text-nyaya-800 text-xs rounded-xl border border-slate-200 transition"
                  >
                    ⚡ {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Document Content</label>
              <textarea
                rows={10}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Paste contract, employment agreement, rent agreement, or legal notice text here..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-nyaya-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !docContent.trim()}
              className="w-full py-3 bg-nyaya-600 hover:bg-nyaya-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Document & Extract Clauses
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Analysis Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Classification Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-nyaya-700 bg-nyaya-50 px-2 py-0.5 rounded uppercase">
                      Classification
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {analysisResult.classification?.categoryLabel}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {Math.round(analysisResult.classification?.confidence * 100)}% Confidence
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{analysisResult.summary}</p>

                {/* Extracted Entities Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Parties</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {analysisResult.entities?.parties?.partyOne || 'Party 1'} vs {analysisResult.entities?.parties?.partyTwo || 'Party 2'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Jurisdiction</span>
                    <span className="font-semibold text-slate-800 block">
                      {analysisResult.entities?.jurisdiction || 'India'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Notice Period</span>
                    <span className="font-semibold text-slate-800 block">
                      {analysisResult.entities?.noticePeriods?.[0] || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attention Items Alert */}
              {analysisResult.attentionSummary && analysisResult.attentionSummary.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Legal Attention Items Detected ({analysisResult.attentionSummary.length}):
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.attentionSummary.map((att, i) => (
                      <div key={i} className="p-2 bg-white/80 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                        <strong>{att.clauseTitle}: </strong>
                        <span>{att.assessment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Segmented Clauses */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Segmented Key Clauses ({analysisResult.clauses?.length || 0})
                </h4>

                <div className="space-y-2">
                  {analysisResult.clauses?.map((c, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                      <div
                        onClick={() => setExpandedClause(expandedClause === idx ? null : idx)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{c.title}</span>
                          {c.requiresAttention && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                              Review Recommended
                            </span>
                          )}
                        </div>
                        {expandedClause === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>

                      {expandedClause === idx && (
                        <div className="p-3 bg-white space-y-2 border-t border-slate-100">
                          <p className="font-mono text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl whitespace-pre-wrap">
                            {c.text}
                          </p>
                          {c.attentionAssessment && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg">
                              ⚠️ {c.attentionAssessment}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center text-slate-400 space-y-3 min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Document Intelligence Report</h4>
              <p className="text-xs max-w-sm leading-relaxed">
                Click a sample preset on the left or paste your agreement text to view automated OCR layout, entity extraction, and clause risk assessment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
