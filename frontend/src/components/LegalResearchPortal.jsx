import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
  Scale,
  FileCheck2,
  PhoneCall,
  Languages,
} from 'lucide-react';
import api from '../services/api';

export default function LegalResearchPortal({ user, onOpenAuth }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Citation Verifier sub-widget
  const [verifyAct, setVerifyAct] = useState('The Payment of Wages Act, 1936');
  const [verifySec, setVerifySec] = useState('Section 15');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const sampleScenarios = [
    {
      label: 'Unpaid Salary (Employment)',
      text: 'My employer has not paid my salary for three months and terminated me without notice period pay.',
    },
    {
      label: 'Security Deposit (Tenancy)',
      text: 'Landlord is refusing to refund my 2 months security deposit after vacating the flat.',
    },
    {
      label: 'UPI Cyber Fraud (Cybercrime)',
      text: 'Lost 50000 in online UPI phishing fraud after a fake bank KYC verification call.',
    },
    {
      label: 'Defective E-Commerce (Consumer)',
      text: 'Amazon seller delivered a counterfeit defective laptop and is refusing 30-day replacement warranty.',
    },
    {
      label: 'Hindi: मकान मालिक बेदखली',
      text: 'मकान मालिक ने बिना नोटिस के घर से निकाल दिया और बिजली-पानी काट दिया',
    },
  ];

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/research', {
        query: searchQuery,
        jurisdiction: 'India',
        language: 'en',
      });
      setResult(res.data.data);
    } catch (err) {
      if (err.response?.data?.guardrailWarning) {
        setError({
          isGuardrail: true,
          title: err.response.data.message || '⚠️ Guardrail Warning: Query Blocked',
          warning: err.response.data.warning || {},
        });
      } else {
        setError({
          isGuardrail: false,
          message: err.response?.data?.message || 'Failed to complete legal research. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCitation = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    setVerifying(true);
    try {
      const res = await api.post('/ai/verify-citation', {
        act: verifyAct,
        section: verifySec,
      });
      setVerifyResult(res.data.data);
    } catch {
      setVerifyResult({ valid: false, message: 'Citation could not be verified.' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-nyaya-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-nyaya-600/30 text-nyaya-300 rounded-full text-xs font-semibold mb-3 border border-nyaya-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Milestone 2 • Authoritative Legal Knowledge Layer & Hybrid RAG
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Legal Intelligence & Statutory Research
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Query legal situations in <span className="text-nyaya-300 font-semibold">English</span>,{' '}
            <span className="text-nyaya-300 font-semibold">हिन्दी (Hindi)</span>, or{' '}
            <span className="text-nyaya-300 font-semibold">Hinglish</span>. Retrieves grounded statutory provisions,
            landmark Supreme Court precedents, and official grievance redressal portals with zero hallucinations.
          </p>
        </div>

        {/* Search Box */}
        <div className="mt-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Describe your legal problem (e.g. 'Employer withheld 3 months salary', 'मकान मालिक डिपॉजिट नहीं दे रहा')..."
              className="w-full pl-12 pr-28 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-400 shadow-inner"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-5 bg-nyaya-500 hover:bg-nyaya-600 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Research
                </>
              )}
            </button>
          </div>

          {/* Quick Scenario Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Try scenarios:</span>
            {sampleScenarios.map((sc, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sc.text);
                  handleSearch(sc.text);
                }}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[11px] transition border border-white/10"
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        error.isGuardrail ? (
          <div className="p-6 bg-red-50 text-red-950 rounded-3xl border-2 border-red-300 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-red-200 pb-2">
              <div className="flex items-center gap-2 font-bold text-red-700 text-sm sm:text-base">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <span>{error.title}</span>
              </div>
              <span className="px-2.5 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded-full text-[11px] font-bold uppercase tracking-wider">
                {error.warning?.categoryLabel || error.warning?.category || 'Security Policy'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-red-900 leading-relaxed font-medium">
              {error.warning?.detail || 'This legal search query seeks assistance with activities prohibited under platform safety guidelines.'}
            </p>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-red-200 space-y-1.5">
              <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-red-600" />
                Lawful Guidance & Victim Redirection:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {error.warning?.guidance || 'If you are seeking legal protection as a victim, please rephrase your query to describe the harm experienced.'}
              </p>
            </div>

            {error.warning?.incidentId && (
              <div className="text-[10px] text-red-600/80 font-mono pt-1">
                Incident Reference ID: {error.warning.incidentId}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error.message || error}
          </div>
        )
      )}

      {/* Research Output Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Domain & Grounding Meta Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Classified Domain:
              </span>
              <span className="px-3 py-1 bg-nyaya-50 text-nyaya-700 text-xs font-bold rounded-lg border border-nyaya-200">
                {result.detectedDomain}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ({Math.round(result.domainConfidence * 100)}% Confidence)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Source Grounding:</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {result.confidence} CONFIDENCE
              </span>
            </div>
          </div>

          {/* Plain Language Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-nyaya-600" />
              Legal Assessment & Rights Breakdown
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
          </div>

          {/* Structured Legal Basis Cards */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-nyaya-600" />
              Authoritative Statutory Provisions & Judicial Precedents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.legalBasis.map((prov, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-nyaya-400 shadow-sm transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-nyaya-700 bg-nyaya-50 px-2.5 py-1 rounded-lg border border-nyaya-200">
                        {prov.section}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Authoritative
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1">{prov.sectionTitle}</h4>
                    <p className="text-xs font-semibold text-slate-500 mb-3">{prov.act}</p>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed font-sans mb-3 border border-slate-100">
                      "{prov.statutorySnippet}"
                    </div>

                    {prov.actionableRemedy && (
                      <div className="text-xs text-nyaya-800 bg-nyaya-50/70 p-2.5 rounded-xl border border-nyaya-200/60 mb-2">
                        <span className="font-bold">Statutory Recourse:</span> {prov.actionableRemedy}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Authority: {prov.authority?.split(',')[0]}</span>
                    {prov.sourceUrl && (
                      <a
                        href={prov.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-nyaya-600 font-semibold hover:underline"
                      >
                        Official Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Remedies & Official Grievance Portals */}
          {result.actionableRemedies && result.actionableRemedies.length > 0 && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-nyaya-400" />
                Actionable Next Steps & Official Redressal Mechanisms
              </h3>

              <div className="space-y-3">
                {result.actionableRemedies.map((rem, i) => (
                  <div key={i} className="p-3.5 bg-slate-800 rounded-xl border border-slate-700 flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-nyaya-300 block mb-1">
                        {rem.provision}
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">{rem.remedy}</p>
                    </div>
                    {rem.sourceUrl && (
                      <a
                        href={rem.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 px-3 py-1.5 bg-nyaya-600 hover:bg-nyaya-700 text-white rounded-lg text-xs font-medium transition inline-flex items-center gap-1"
                      >
                        Portal Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Citation Validation Tool Widget - Hidden for Citizens & Guests */}
      {user && user.role !== 'CITIZEN' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-nyaya-600" />
              <h3 className="text-base font-bold text-slate-900">Official Citation Validator</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Verify Statutory Authenticity</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Test any Act name and Section to check whether it exists on official Indian Gazette rolls or is a hallucination.
          </p>

          <form onSubmit={handleVerifyCitation} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={verifyAct}
              onChange={(e) => setVerifyAct(e.target.value)}
              placeholder="e.g. The Payment of Wages Act, 1936"
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
            />
            <input
              type="text"
              required
              value={verifySec}
              onChange={(e) => setVerifySec(e.target.value)}
              placeholder="e.g. Section 15"
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={verifying}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              {verifying ? 'Verifying...' : 'Validate Citation'}
            </button>
          </form>

          {verifyResult && (
            <div
              className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                verifyResult.valid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {verifyResult.valid ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <div>
                <span className="font-bold">
                  {verifyResult.valid ? 'Verified Official Citation: ' : 'Citation Invalid: '}
                </span>
                {verifyResult.valid
                  ? `${verifyResult.act} (${verifyResult.section}) is authoritative under ${verifyResult.authority}.`
                  : verifyResult.message || 'Section not found on authoritative rolls.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
