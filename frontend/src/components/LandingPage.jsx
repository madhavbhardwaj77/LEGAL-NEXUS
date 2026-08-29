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
  Mic,
  BookOpen,
  CheckCircle2,
  Lock,
  Search,
  Activity,
  Layers,
  ChevronRight,
  ShieldAlert,
  Award,
  Zap,
  Globe,
  FileCheck,
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onOpenAuth, onSelectFeature, user }) {
  const pillars = [
    {
      id: 'intake',
      title: 'AI Legal Assistant & Intake',
      desc: 'Multilingual conversational storytelling in English, Hindi, and Hinglish that extracts structured case facts and assesses statutory urgency.',
      icon: <Bot className="w-6 h-6 text-legal-blue" />,
      tag: 'Agentic Workflow',
      badge: 'Interactive',
    },
    {
      id: 'documents',
      title: 'Document AI & Contract Auditor',
      desc: 'Upload contracts, rent agreements, and legal notices to segment clauses, audit red flags, compute safety scores, and export PDF reports.',
      icon: <FileText className="w-6 h-6 text-legal-blue" />,
      tag: 'OCR & Clause Audit',
      badge: 'PDF / Text',
    },
    {
      id: 'drafts',
      title: 'Smart Legal Draft Generator',
      desc: 'Generate 7 standard Indian legal drafts (15-Day Notices, e-Daakhil Petitions, Wage Grievances) with automated statutory citation grounding.',
      icon: <PenTool className="w-6 h-6 text-legal-blue" />,
      tag: 'Statutory Pleadings',
      badge: '7 Templates',
    },
    {
      id: 'research',
      title: 'Hybrid Statutory Legal Search',
      desc: 'Search authoritative Indian statutes, landmark Supreme Court precedents, and official grievance portals with zero hallucinations.',
      icon: <BookOpen className="w-6 h-6 text-legal-blue" />,
      tag: 'Official Statutes',
      badge: 'Zero Hallucination',
    },
    {
      id: 'lawyers',
      title: 'Verified Advocate Ecosystem',
      desc: 'Multi-factor weighted scoring (30% Practice, 25% Exp, 15% Location) with itemized explanation checklists and verified Bar Council advocates.',
      icon: <UserCheck className="w-6 h-6 text-legal-blue" />,
      tag: 'Bar Council Verified',
      badge: 'Transparent',
    },
    {
      id: 'system',
      title: 'Enterprise Infrastructure',
      desc: 'High-availability architecture backed by MongoDB persistent storage, Redis caching, and real-time system health diagnostics.',
      icon: <Activity className="w-6 h-6 text-legal-blue" />,
      tag: 'Enterprise Ready',
      badge: 'Production',
    },
  ];

  const trustMetrics = [
    {
      title: 'Authoritative Legal Grounding',
      desc: 'Answers cite authoritative Acts, Sections, and official statutory rolls.',
      icon: Scale,
    },
    {
      title: '256-Bit Confidentiality',
      desc: 'Client narratives & document uploads are encrypted and PII-sanitized.',
      icon: Lock,
    },
    {
      title: 'Verified Advocates',
      desc: 'Direct connection with Bar Council enrolled and validated legal counsel.',
      icon: ShieldCheck,
    },
    {
      title: 'Multilingual NLP',
      desc: 'Seamless voice and text reasoning in English, Hindi, and Hinglish.',
      icon: Globe,
    },
  ];

  const handleAction = (featureId) => {
    if (!user) {
      onOpenAuth();
    } else {
      onSelectFeature(featureId);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071422] via-[#0B1F33] to-[#0B2540] text-white p-8 sm:p-14 lg:p-16 border border-slate-800 shadow-legal">
        {/* Background decorative subtle glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-legal-blue/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-legal-gold/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Hero Left Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-legal-blue/15 text-blue-300 border border-legal-blue/30 text-xs font-bold rounded-full shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-legal-gold" />
              <span>AI-Powered Legal Access & Case Navigation</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              Making Legal Access <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-legal-gold bg-clip-text text-transparent">
                Simpler & Precise
              </span>{' '}
              with AI
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Understand your rights from plain-language narratives, audit contracts for hidden liabilities, generate statutory legal demand notices, and connect with Bar Council verified advocates across India.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-legal-blue/30 hover:shadow-legal-blue/50 transition-all transform active:scale-95 flex items-center gap-2"
              >
                <span>Launch AI Assistant</span>
                <ArrowRight className="w-4 h-4 text-legal-gold" />
              </button>

              <button
                onClick={() => handleAction('documents')}
                className="px-5 py-3.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm rounded-2xl border border-slate-700 hover:border-slate-600 transition flex items-center gap-2 shadow-sm"
              >
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>Audit Contract / OCR</span>
              </button>

              <button
                onClick={() => handleAction('research')}
                className="px-5 py-3.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm rounded-2xl border border-slate-700/60 transition flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-legal-gold" />
                <span>Search Laws & Precedents</span>
              </button>
            </div>

            {/* Live Indicator Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Multilingual: English • हिन्दी (Hindi) • Hinglish</span>
              </div>
              <div className="flex items-center gap-1.5 text-legal-gold font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authoritative Legal Grounding</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Product Preview Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#0F172A]/90 border border-slate-700/80 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-4">
              {/* Card Window Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-[11px] font-mono text-slate-400 ml-2">legal-nexus://workspace</span>
                </div>
                <span className="text-[10px] font-bold text-legal-gold bg-legal-gold/15 px-2 py-0.5 rounded-full border border-legal-gold/30">
                  Live Preview
                </span>
              </div>

              {/* Sample Case Dossier Snippet */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                      LN-2026-EMP-041
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      Safety Score: 88/100
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Unpaid Wages & Termination Dispute</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    Claim for 3 months unpaid salary (₹1,50,000) under Section 15 of Payment of Wages Act.
                  </p>
                </div>

                {/* AI Grounded Provision Pill */}
                <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-legal-gold" />
                      Statutory Provision Match
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">100% Grounded</span>
                  </div>
                  <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-xl border border-slate-800 font-mono">
                    "Payment of Wages Act, 1936 — Section 15: Claims arising out of deductions from wages."
                  </p>
                </div>

                {/* Action Row */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleAction('drafts')}
                    className="p-2.5 bg-legal-blue hover:bg-blue-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-[11px]"
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
      </section>

      {/* 2. TRUST & INSTITUTIONAL PILLARS */}
      <section className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Institutional Trust & Responsible Legal Standards
          </h2>
          <p className="text-xs text-slate-500">
            Built for citizens, lawyers, and enterprises requiring auditability, precision, and privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustMetrics.map((tm, idx) => {
            const Icon = tm.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-navy-50 text-legal-blue flex items-center justify-center border border-navy-100 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{tm.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{tm.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CORE LEGAL INTELLIGENCE PILLARS GRID */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-legal-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Core Capabilities
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Integrated Legal Tech Workspaces
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Everything required to analyze, draft, verify, and resolve legal matters in one unified suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p) => (
            <div
              key={p.id}
              onClick={() => handleAction(p.id)}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 hover:border-legal-blue/50 hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              {/* Top Bar inside Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-slate-50 group-hover:bg-blue-50 rounded-2xl border border-slate-100 group-hover:border-blue-200 group-hover:scale-105 transition duration-200">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-bold text-legal-blue bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {p.badge}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                    {p.tag}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-legal-blue transition">
                    {p.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>

              {/* Card Footer Link */}
              <div className="flex items-center justify-between text-xs font-bold text-legal-blue group-hover:translate-x-1 transition gap-1 pt-3 border-t border-slate-100">
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4 text-legal-gold" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THREE-STEP LEGAL WORKFLOW */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-legal space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-legal-gold bg-legal-gold/10 px-3 py-1 rounded-full border border-legal-gold/20">
            End-to-End Navigation
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How Legal Nexus Resolves Legal Disputes</h2>
          <p className="text-xs text-slate-400">
            From freeform storytelling to enforceable legal drafts and courtroom advocate handoff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-legal-blue text-white font-extrabold flex items-center justify-center text-xs">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Narrative Intake & Document OCR</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Describe your legal issue via voice or text, or upload a contract PDF. The system parses clauses, extracts disputed quantum, and identifies key entities.
            </p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-legal-gold text-slate-950 font-extrabold flex items-center justify-center text-xs">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Agent Statutory Grounding</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multi-agent orchestration executes domain classification, audits evidentiary gaps, checks statutes against official rolls, and scores risk.
            </p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-xs">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Actionable Relief & Counsel</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly generate structured 15-day statutory notices, download PDF petitions, and connect with verified advocates filtered by transparent score.
            </p>
          </div>
        </div>
      </section>

      {/* 5. RESPONSIBLE LEGAL ACCESS DISCLAIMER */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-start gap-4 text-xs text-slate-600">
        <div className="p-3 bg-navy-50 text-legal-blue rounded-2xl border border-navy-100 shrink-0 shadow-sm">
          <Lock className="w-6 h-6 text-legal-blue" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            Responsible AI & Legal Ethics Standards
            <span className="text-[10px] font-bold text-legal-gold bg-legal-gold/10 px-2 py-0.5 rounded border border-legal-gold/20 uppercase tracking-wider">
              Legal Compliance
            </span>
          </h4>
          <p className="leading-relaxed text-slate-600">
            Legal Nexus is an artificial intelligence platform designed to bridge information asymmetry, structure factual narratives, audit contracts, and assist in pre-litigation documentation. It operates strictly under institutional knowledge grounding and does not substitute for licensed legal representation before a judicial court.
          </p>
        </div>
      </section>
    </div>
  );
}
