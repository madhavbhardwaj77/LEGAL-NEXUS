import React from 'react';
import {
  Scale,
  Sparkles,
  Bot,
  FileText,
  PenTool,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Lock,
  Search,
  Activity,
  Globe,
  FileCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onOpenAuth, onSelectFeature, user }) {
  const pillars = [
    {
      id: 'intake',
      title: 'AI Legal Assistant & Intake',
      desc: 'Multilingual conversational storytelling in English, Hindi, and Hinglish that extracts structured case facts and assesses statutory urgency.',
      icon: Bot,
      tag: 'Agentic Workflow',
      badge: 'Interactive',
      accentColor: 'from-blue-500 to-sky-400',
      bgAccent: 'bg-blue-50',
      borderAccent: 'border-blue-100',
    },
    {
      id: 'documents',
      title: 'Document AI & Contract Auditor',
      desc: 'Upload contracts, rent agreements, and legal notices to segment clauses, audit red flags, compute safety scores, and export PDF reports.',
      icon: FileText,
      tag: 'OCR & Clause Audit',
      badge: 'PDF / Text',
      accentColor: 'from-violet-500 to-purple-400',
      bgAccent: 'bg-violet-50',
      borderAccent: 'border-violet-100',
    },
    {
      id: 'drafts',
      title: 'Smart Legal Draft Generator',
      desc: 'Generate 7 standard Indian legal drafts (15-Day Notices, e-Daakhil Petitions, Wage Grievances) with automated statutory citation grounding.',
      icon: PenTool,
      tag: 'Statutory Pleadings',
      badge: '7 Templates',
      accentColor: 'from-amber-500 to-yellow-400',
      bgAccent: 'bg-amber-50',
      borderAccent: 'border-amber-100',
    },
    {
      id: 'research',
      title: 'Hybrid Statutory Legal Search',
      desc: 'Search authoritative Indian statutes, landmark Supreme Court precedents, and official grievance portals with zero hallucinations.',
      icon: BookOpen,
      tag: 'Official Statutes',
      badge: 'Zero Hallucination',
      accentColor: 'from-emerald-500 to-teal-400',
      bgAccent: 'bg-emerald-50',
      borderAccent: 'border-emerald-100',
    },
    {
      id: 'lawyers',
      title: 'Verified Advocate Ecosystem',
      desc: 'Multi-factor weighted scoring (30% Practice, 25% Exp, 15% Location) with itemized explanation checklists and verified Bar Council advocates.',
      icon: UserCheck,
      tag: 'Bar Council Verified',
      badge: 'Transparent',
      accentColor: 'from-rose-500 to-pink-400',
      bgAccent: 'bg-rose-50',
      borderAccent: 'border-rose-100',
    },
    {
      id: 'system',
      title: 'Enterprise Infrastructure',
      desc: 'High-availability architecture backed by MongoDB persistent storage, Redis caching, and real-time system health diagnostics.',
      icon: Activity,
      tag: 'Enterprise Ready',
      badge: 'Production',
      accentColor: 'from-slate-500 to-slate-400',
      bgAccent: 'bg-slate-50',
      borderAccent: 'border-slate-100',
    },
  ];

  const trustMetrics = [
    { title: 'Authoritative Legal Grounding', desc: 'Answers cite authoritative Acts, Sections, and official statutory rolls.', icon: Scale, color: 'text-legal-blue', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: '256-Bit Confidentiality',        desc: 'Client narratives & document uploads are encrypted and PII-sanitized.',   icon: Lock,       color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100' },
    { title: 'Verified Advocates',              desc: 'Direct connection with Bar Council enrolled and validated legal counsel.',  icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Multilingual NLP',               desc: 'Seamless voice and text reasoning in English, Hindi, and Hinglish.',       icon: Globe,      color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  ];

  const handleAction = (featureId) => {
    if (!user) onOpenAuth();
    else onSelectFeature(featureId);
  };

  const steps = [
    {
      num: '01',
      color: 'bg-legal-blue',
      textColor: 'text-white',
      title: 'Narrative Intake & Document OCR',
      desc: 'Describe your legal issue via voice or text, or upload a contract PDF. The system parses clauses, extracts disputed quantum, and identifies key entities.',
      icon: Bot,
    },
    {
      num: '02',
      color: 'bg-legal-gold',
      textColor: 'text-slate-950',
      title: 'Multi-Agent Statutory Grounding',
      desc: 'Multi-agent orchestration executes domain classification, audits evidentiary gaps, checks statutes against official rolls, and scores risk.',
      icon: Zap,
    },
    {
      num: '03',
      color: 'bg-emerald-500',
      textColor: 'text-white',
      title: 'Actionable Relief & Counsel',
      desc: 'Instantly generate structured 15-day statutory notices, download PDF petitions, and connect with verified advocates filtered by transparent score.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-16 pb-12">

      {/* ── 1. HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 shadow-legal">
        {/* Animated mesh background */}
        <div
          className="absolute inset-0 hero-mesh"
          style={{
            background: 'linear-gradient(135deg, #071422 0%, #0B1F33 35%, #0d2a4a 55%, #0a1f3d 75%, #071422 100%)',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px] bg-legal-gold/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-14 lg:p-16 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Hero Left (7 cols) */}
            <div className="lg:col-span-7 space-y-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-legal-blue/15 text-blue-300 border border-legal-blue/30 text-xs font-bold rounded-full backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-legal-gold" />
                <span>AI-Powered Legal Access & Case Navigation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Making Legal Access{' '}
                <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-legal-gold bg-clip-text text-transparent">
                  Simpler & Precise
                </span>{' '}
                with AI
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Understand your rights from plain-language narratives, audit contracts for hidden liabilities, generate statutory legal demand notices, and connect with Bar Council verified advocates across India.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={onGetStarted}
                  className="btn-shimmer px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Launch AI Assistant</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>

                <button
                  onClick={() => handleAction('documents')}
                  className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white font-semibold text-sm rounded-2xl border border-slate-700 hover:border-slate-500 transition flex items-center gap-2 backdrop-blur-sm"
                >
                  <FileCheck className="w-4 h-4 text-sky-400" />
                  <span>Audit Contract / OCR</span>
                </button>

                <button
                  onClick={() => handleAction('research')}
                  className="px-5 py-3.5 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 hover:text-white font-semibold text-sm rounded-2xl border border-slate-700/50 hover:border-slate-600 transition flex items-center gap-2 backdrop-blur-sm"
                >
                  <Search className="w-4 h-4 text-legal-gold" />
                  <span>Search Laws & Precedents</span>
                </button>
              </div>

              {/* Live indicator pills */}
              <div className="pt-1 flex flex-wrap items-center gap-5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  <span>Multilingual: English • हिन्दी • Hinglish</span>
                </div>
                <div className="flex items-center gap-1.5 text-legal-gold font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authoritative Legal Grounding</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Preview card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="glass rounded-3xl p-5 shadow-2xl space-y-4">
                {/* Window chrome */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-500 ml-2">legal-nexus://workspace</span>
                  </div>
                  <span className="text-[10px] font-bold text-legal-gold bg-legal-gold/15 px-2 py-0.5 rounded-full border border-legal-gold/30">
                    Live Preview
                  </span>
                </div>

                {/* Case snippet */}
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900/80 rounded-2xl border border-white/8 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                        LN-2026-EMP-041
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                        Safety Score: 88/100
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Unpaid Wages & Termination Dispute</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      Claim for 3 months unpaid salary (₹1,50,000) under Section 15 of Payment of Wages Act.
                    </p>
                  </div>

                  {/* Statutory match */}
                  <div className="p-3 bg-slate-800/50 rounded-2xl border border-white/8 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-legal-gold" />
                        Statutory Provision Match
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        100% Grounded
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 bg-slate-900/70 p-2 rounded-xl border border-white/6 font-mono leading-relaxed">
                      "Payment of Wages Act, 1936 — Section 15: Claims arising out of deductions from wages."
                    </p>
                  </div>

                  {/* Action row */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction('drafts')}
                      className="btn-shimmer p-2.5 bg-legal-blue hover:bg-blue-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-[11px]"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      Draft Notice
                    </button>
                    <button
                      onClick={() => handleAction('lawyers')}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 text-[11px]"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-legal-gold" />
                      Match Advocate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST PILLARS ─────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Institutional Trust & Responsible Legal Standards
          </h2>
          <p className="text-sm text-slate-500">
            Built for citizens, lawyers, and enterprises requiring auditability, precision, and privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustMetrics.map((tm, idx) => {
            const Icon = tm.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-200 space-y-3 group"
              >
                <div className={`w-11 h-11 rounded-2xl ${tm.bg} ${tm.color} flex items-center justify-center border ${tm.border} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tm.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{tm.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. FEATURE CARDS ─────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-legal-blue bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Core Capabilities
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Integrated Legal Tech Workspaces
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-sm">
            Everything required to analyze, draft, verify, and resolve legal matters in one unified suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                onClick={() => handleAction(p.id)}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col overflow-hidden group relative"
              >
                {/* Top gradient accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${p.accentColor} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div className="p-6 flex flex-col flex-1 space-y-4">
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 ${p.bgAccent} rounded-2xl border ${p.borderAccent} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-5 h-5 text-slate-700" />
                    </div>
                    <span className="text-[10px] font-bold text-legal-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {p.badge}
                    </span>
                  </div>

                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                      {p.tag}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-legal-blue transition mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>

                  {/* Footer link */}
                  <div className="flex items-center gap-1 text-xs font-bold text-legal-blue group-hover:translate-x-1 transition-transform duration-200 pt-3 border-t border-slate-100">
                    <span>Launch Workspace</span>
                    <ArrowRight className="w-4 h-4 text-legal-gold" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-legal space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-legal-gold bg-legal-gold/10 px-3 py-1 rounded-full border border-legal-gold/20">
            End-to-End Navigation
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            How Legal Nexus Resolves Legal Disputes
          </h2>
          <p className="text-sm text-slate-400">
            From freeform storytelling to enforceable legal drafts and courtroom advocate handoff.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connecting dashed line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px border-t-2 border-dashed border-slate-700 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative z-10 bg-slate-800/70 p-6 rounded-2xl border border-slate-700/80 space-y-3 hover:bg-slate-800 transition-colors duration-200">
                <div className={`w-10 h-10 rounded-xl ${step.color} ${step.textColor} font-extrabold flex items-center justify-center text-sm shadow-md`}>
                  {step.num}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. DISCLAIMER ────────────────────────────────────────── */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-start gap-5">
        <div className="p-3.5 bg-navy-50 rounded-2xl border border-navy-100 shrink-0 shadow-sm">
          <Lock className="w-6 h-6 text-legal-blue" />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-base text-slate-900">Responsible AI & Legal Ethics Standards</h4>
            <span className="text-[10px] font-bold text-legal-gold bg-legal-gold/10 px-2 py-0.5 rounded border border-legal-gold/20 uppercase tracking-wider">
              Legal Compliance
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Legal Nexus is an artificial intelligence platform designed to bridge information asymmetry, structure factual narratives, audit contracts, and assist in pre-litigation documentation. It operates strictly under institutional knowledge grounding and does not substitute for licensed legal representation before a judicial court.
          </p>
        </div>
      </section>
    </div>
  );
}
