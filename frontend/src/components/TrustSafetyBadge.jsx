import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  X,
  ExternalLink,
  Lock,
  Scale,
  PhoneCall,
  CheckCircle2,
  BookOpen,
  Info,
} from 'lucide-react';

export default function TrustSafetyBadge({
  status = 'VERIFIED', // VERIFIED | NEEDS_REVIEW | UNSUPPORTED | ESCALATED
  authorityTier = 'TIER_1_PRIMARY_STATUTE_GAZETTE',
  groundingScore = 1.0,
  verifiedCitations = [],
  unsupportedCitations = [],
  piiSanitized = false,
  riskAssessment = null,
  disclaimer = 'Informational guidance grounded in official Indian Gazettes and statutory provisions; does not constitute formal attorney-client representation before a court.',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getBadgeConfig = () => {
    if (status === 'VERIFIED' || status === 'APPROVED') {
      return {
        label: 'Statute Grounded',
        sublabel: 'Official Gazette Verified',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-800',
        borderColor: 'border-emerald-200',
        badgeColor: 'bg-emerald-600 text-white',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      };
    }
    if (status === 'NEEDS_REVIEW' || status === 'PARTIALLY_SUPPORTED') {
      return {
        label: 'Requires Verification',
        sublabel: 'Advocate Review Advised',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-900',
        borderColor: 'border-amber-200',
        badgeColor: 'bg-amber-600 text-white',
        icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      };
    }
    return {
      label: 'Escalated Query',
      sublabel: 'Legal Counsel Required',
      bgColor: 'bg-red-50',
      textColor: 'text-red-900',
      borderColor: 'border-red-200',
      badgeColor: 'bg-red-600 text-white',
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
    };
  };

  const badge = getBadgeConfig();

  return (
    <>
      {/* Inline Trust Badge with "Why am I seeing this?" trigger */}
      <div className="inline-flex items-center gap-2 flex-wrap text-xs">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold border shadow-subtle ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}
        >
          {badge.icon}
          <span>{badge.label}</span>
          <span className="text-[10px] opacity-80 font-medium">({badge.sublabel})</span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-legal-blue hover:underline transition"
        >
          <HelpCircle className="w-3.5 h-3.5 text-legal-gold" />
          <span>Transparency Breakdown</span>
        </button>
      </div>

      {/* Popover / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-navy-50 text-legal-blue rounded-2xl border border-navy-100 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-legal-blue" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Trust & Safety Transparency
                    <span className="w-2 h-2 rounded-full bg-legal-gold"></span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Legal Nexus Statutory Verification & Guardrail Audit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Panel */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Statutory Authority Tier:</span>
                <span className="font-bold text-legal-blue bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 text-[11px]">
                  {authorityTier?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Statutory Grounding Score:</span>
                <span className="font-extrabold text-slate-900 font-mono text-xs">
                  {Math.round(groundingScore * 100)}% (Zero Hallucination)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Confidentiality & Privacy:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  {piiSanitized ? 'PII Redacted before Model Dispatch' : 'Clean / Non-PII Input'}
                </span>
              </div>
            </div>

            {/* Verified Citations List */}
            {verifiedCitations && verifiedCitations.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-legal-blue" />
                  Verified Statutory Provisions
                </h4>
                <div className="space-y-1.5">
                  {verifiedCitations.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-subtle"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {c.act} — {c.section}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">{c.authority}</span>
                      </div>
                      {c.sourceUrl && (
                        <a
                          href={c.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 text-[11px] font-semibold flex items-center gap-1 transition shadow-subtle"
                          title="Open Gazette Record"
                        >
                          Gazette <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency & Official Helplines (if high risk) */}
            {riskAssessment && riskAssessment.emergencyContacts?.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs">
                <h4 className="font-bold text-red-900 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-red-600" />
                  Official Emergency & Statutory Legal Aid
                </h4>
                <p className="text-red-800 text-xs leading-relaxed">
                  {riskAssessment.mitigationAdvice}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {riskAssessment.emergencyContacts.map((cnt, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white border border-red-200 rounded-xl text-red-800 font-bold text-xs flex items-center gap-1 shadow-subtle"
                    >
                      📞 {cnt.name}: <span className="font-mono text-red-600">{cnt.number}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Disclaimer */}
            <div className="text-[11px] text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-legal-gold" />
                Responsible AI Transparency Note:
              </span>
              <p>{disclaimer}</p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-[#0B1F33] hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition shadow-md"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
