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
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onOpenAuth, onSelectFeature }) {
  const pillars = [
    {
      id: 'intake',
      title: 'AI Assistance',
      desc: 'Multilingual conversational storytelling in English, Hindi, and Hinglish that builds structured legal cases with provenance tracking.',
      icon: <Bot className="w-6 h-6 text-nyaya-600" />,
      tag: 'Agentic Workflow',
    },
    {
      id: 'documents',
      title: 'Document AI & OCR',
      desc: 'Upload contracts, rent agreements, and legal notices to segment clauses, extract entities, and audit legal risk items.',
      icon: <FileText className="w-6 h-6 text-nyaya-600" />,
      tag: 'Layout & Risk',
    },
    {
      id: 'drafts',
      title: 'Smart Legal Draft Generator',
      desc: 'Generate 7 standard Indian legal drafts (Notices, e-Daakhil Petitions, Wage Grievances) with automated fact-checking.',
      icon: <PenTool className="w-6 h-6 text-nyaya-600" />,
      tag: 'Statutory Templates',
    },
    {
      id: 'lawyers',
      title: 'Lawyer Finder',
      desc: 'Multi-factor weighted scoring (30% Practice, 25% Exp, 15% Location) with itemized explanation checklists and verified advocates.',
      icon: <UserCheck className="w-6 h-6 text-nyaya-600" />,
      tag: '🔵 Verified Advocate',
    },
  ];

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-nyaya-950 to-slate-900 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-nyaya-500/20 text-nyaya-300 border border-nyaya-500/30 text-xs font-bold rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Legal Nexus • Legal AI Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            AI-Powered Legal Access & Case Navigation for India
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Understand your legal rights, build verified cases from your story, analyze contracts, generate statutory drafts, and connect with Bar Council verified advocates across India.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 bg-nyaya-600 hover:bg-nyaya-700 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-nyaya-500/25 transition flex items-center gap-2"
            >
              Get Legal Guidance
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectFeature('research')}
              className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm rounded-2xl border border-slate-700 transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-nyaya-400" />
              Explore Indian Laws (RAG)
            </button>
          </div>

          {/* Multilingual Support Badge */}
          <div className="pt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Multilingual Support: English • हिन्दी (Hindi) • Hinglish
          </div>
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Core Legal Intelligence Capabilities</h2>
            <p className="text-xs text-slate-500">Grounded in official Indian gazettes and statutory authority</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectFeature(p.id)}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-nyaya-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-nyaya-50 rounded-2xl border border-nyaya-100 group-hover:scale-105 transition">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-bold text-nyaya-700 bg-nyaya-50 px-2 py-0.5 rounded-full">
                    {p.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-nyaya-700 transition">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>

              <div className="flex items-center text-xs font-semibold text-nyaya-600 group-hover:translate-x-1 transition gap-1 pt-2 border-t border-slate-100">
                Launch Tool <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Responsible Legal Access Disclaimer */}
      <section className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex items-start gap-3.5 text-xs text-slate-600">
        <Lock className="w-5 h-5 text-nyaya-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900">Responsible AI Legal Access Standard</h4>
          <p className="leading-relaxed">
            Legal Nexus provides automated legal information, statutory reference retrieval, document layout segmentation, and pre-litigation drafting assistance. It is designed to navigate legal systems and bridge information asymmetry, not to substitute for licensed legal representation before a court of law.
          </p>
        </div>
      </section>
    </div>
  );
}
