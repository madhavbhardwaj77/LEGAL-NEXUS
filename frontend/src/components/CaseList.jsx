import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  Clock,
  MapPin,
  FileText,
  ChevronRight,
  Briefcase,
  Scale,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  X,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

// Skeleton card component
function SkeletonCard() {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="h-6 w-28 rounded-lg bg-slate-200 skeleton" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-slate-200 skeleton" />
          <div className="h-5 w-14 rounded-full bg-slate-200 skeleton" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded-lg bg-slate-200 skeleton" />
        <div className="h-4 w-1/2 rounded-lg bg-slate-100 skeleton" />
      </div>
      <div className="h-16 w-full rounded-2xl bg-slate-100 skeleton" />
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-slate-100 skeleton" />
        <div className="h-4 w-20 rounded bg-slate-100 skeleton" />
      </div>
    </div>
  );
}

// Urgency badge classes
const urgencyBadge = (urgency) => {
  switch (urgency) {
    case 'CRITICAL':
    case 'URGENT_ASSISTANCE':       return 'bg-red-50 text-red-700 border-red-200';
    case 'HIGH':
    case 'ATTENTION_RECOMMENDED':   return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'MEDIUM':                  return 'bg-blue-50 text-blue-700 border-blue-200';
    default:                        return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

// Left border accent per urgency
const urgencyBorder = (urgency) => {
  switch (urgency) {
    case 'CRITICAL':
    case 'URGENT_ASSISTANCE':     return 'border-l-red-400';
    case 'HIGH':
    case 'ATTENTION_RECOMMENDED': return 'border-l-amber-400';
    case 'MEDIUM':                return 'border-l-blue-400';
    default:                      return 'border-l-slate-300';
  }
};

const statusBadge = (status) => {
  switch (status) {
    case 'OPEN':             return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'LAWYER_ASSIGNED':  return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'IN_PROGRESS':      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'RESOLVED':         return 'bg-teal-50 text-teal-700 border-teal-200';
    default:                 return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Pill-style filter chips
const STATUSES   = ['OPEN', 'IN_PROGRESS', 'LAWYER_ASSIGNED', 'RESOLVED'];
const URGENCIES  = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const CATEGORIES = [
  'Employment', 'Property & Real Estate', 'Consumer Dispute',
  'Cyber Law & Data Privacy', 'Family & Matrimonial', 'Criminal Law', 'Corporate & Commercial',
];

export default function CaseList({ cases = [], loading, onSelectCase, onNewCase, user }) {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [searchQuery, setSearchQuery]     = useState('');
  const [showFilters, setShowFilters]     = useState(false);

  const totalDisputedAmount = cases.reduce((acc, c) => acc + (parseFloat(c.financialDetails?.disputedAmount) || 0), 0);
  const urgentCasesCount   = cases.filter((c) => ['CRITICAL','HIGH','URGENT_ASSISTANCE'].includes(c.urgency)).length;
  const resolvedCasesCount = cases.filter((c) => c.status === 'RESOLVED').length;

  const filteredCases = cases.filter((c) => {
    const matchCat    = !filterCategory || c.category === filterCategory;
    const matchUrg    = !filterUrgency  || c.urgency  === filterUrgency;
    const matchSt     = !filterStatus   || c.status   === filterStatus;
    const q           = searchQuery.toLowerCase();
    const matchSearch = !q
      || c.title?.toLowerCase().includes(q)
      || c.issue?.toLowerCase().includes(q)
      || c.caseNumber?.toLowerCase().includes(q)
      || c.parties?.plaintiff?.name?.toLowerCase().includes(q)
      || c.parties?.defendant?.organization?.toLowerCase().includes(q);
    return matchCat && matchUrg && matchSt && matchSearch;
  });

  const hasActiveFilter = filterCategory || filterUrgency || filterStatus || searchQuery;

  const clearAll = () => {
    setFilterCategory(''); setFilterUrgency(''); setFilterStatus(''); setSearchQuery('');
  };

  const metricCards = [
    {
      label: 'Total Cases',
      value: cases.length,
      sub: 'Active Case Files',
      icon: Briefcase,
      iconBg: 'bg-blue-50',
      iconColor: 'text-legal-blue',
      barColor: 'bg-legal-blue',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Disputed Quantum',
      value: `₹${totalDisputedAmount.toLocaleString('en-IN')}`,
      sub: 'Aggregated Claims',
      icon: Scale,
      iconBg: 'bg-amber-50',
      iconColor: 'text-legal-gold',
      barColor: 'bg-legal-gold',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Urgent Matters',
      value: urgentCasesCount,
      sub: 'High / Critical Urgency',
      icon: ShieldAlert,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      barColor: 'bg-red-500',
      valueColor: 'text-red-600',
    },
    {
      label: 'Resolved / Closed',
      value: resolvedCasesCount,
      sub: 'Settled or Closed',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      barColor: 'bg-emerald-500',
      valueColor: 'text-emerald-700',
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── 1. Welcome Bar ──────────────────────────────────────── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-subtle border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-legal-blue bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Workspace Overview
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {getGreeting()},{' '}
            <span className="text-legal-blue">{user?.profileData?.fullName || user?.email?.split('@')[0] || 'Legal Counsel'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user
              ? `Authorized session for ${user.email} (${user.role}) • All case records encrypted`
              : 'Sign in to file, manage, and dispatch formal legal dossiers'}
          </p>
        </div>

        {user && (
          <button
            onClick={onNewCase}
            className="btn-shimmer inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-2xl shadow-md transition shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>File New Legal Case</span>
          </button>
        )}
      </div>

      {/* ── 2. Metric Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metricCards.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3 overflow-hidden relative group hover:shadow-card transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.label}</span>
                <div className={`p-2 ${m.iconBg} ${m.iconColor} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className={`text-2xl font-extrabold ${m.valueColor} tracking-tight`}>{m.value}</span>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{m.sub}</p>
              </div>
              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl overflow-hidden">
                <div className={`h-full ${m.barColor} opacity-70`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Search & Filter Bar ───────────────────────────────── */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        {/* Search row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search case title, number (LN-2026...), or party name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue focus:bg-white transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition ${
              showFilters || hasActiveFilter
                ? 'bg-legal-blue text-white border-legal-blue'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filters
            {hasActiveFilter && (
              <span className="w-4 h-4 rounded-full bg-white text-legal-blue text-[9px] font-extrabold flex items-center justify-center">
                {(filterCategory ? 1 : 0) + (filterUrgency ? 1 : 0) + (filterStatus ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Expandable filter chips */}
        {showFilters && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Status */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                      filterStatus === s
                        ? 'bg-legal-blue text-white border-legal-blue'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Urgency</p>
              <div className="flex flex-wrap gap-2">
                {URGENCIES.map((u) => (
                  <button
                    key={u}
                    onClick={() => setFilterUrgency(filterUrgency === u ? '' : u)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                      filterUrgency === u
                        ? 'bg-legal-blue text-white border-legal-blue'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Domain</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                      filterCategory === cat
                        ? 'bg-legal-blue text-white border-legal-blue'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filter summary */}
        {hasActiveFilter && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 px-1">
            <span>
              Showing <span className="font-bold text-slate-700">{filteredCases.length}</span> of {cases.length} cases
            </span>
            <button onClick={clearAll} className="text-legal-blue font-bold hover:underline flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* ── 4. Case Grid ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto border border-navy-100 shadow-sm">
            <FileText className="w-8 h-8 text-legal-blue" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Legal Cases Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {user
                ? 'Your workspace is clear. Create your first case or use the AI legal assistant to build one.'
                : 'Sign in to file a structured case and access pre-litigation workflows.'}
            </p>
          </div>
          {user && (
            <button
              onClick={onNewCase}
              className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-legal-blue to-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:from-blue-600 hover:to-blue-800"
            >
              <PlusCircle className="w-4 h-4 text-legal-gold" />
              <span>File Case Now</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c._id}
              onClick={() => onSelectCase(c)}
              className={`group bg-white rounded-3xl border border-l-4 ${urgencyBorder(c.urgency)} border-slate-200/90 hover:border-slate-300 hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 p-5 sm:p-6 hover:-translate-y-0.5`}
            >
              <div className="space-y-3">
                {/* Case number + badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-legal-blue bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {c.caseNumber || 'LN-CASE'}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${urgencyBadge(c.urgency)}`}>
                      {c.urgency?.replace('_', ' ')}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge(c.status)}`}>
                      {c.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-legal-blue transition line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    <span className="text-slate-400">Domain: </span>
                    <span className="text-slate-700">{c.category}</span>
                    <span className="text-slate-300 mx-1.5">•</span>
                    <span className="text-slate-400">Issue: </span>
                    <span className="text-slate-700">{c.issue}</span>
                  </p>
                </div>

                {/* Narrative preview */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {c.description}
                </p>

                {/* Disputed amount */}
                {c.financialDetails?.disputedAmount > 0 && (
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-400 font-medium">Disputed Quantum:</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      ₹{Number(c.financialDetails.disputedAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Assigned Advocate Pill */}
                {c.assignedLawyer && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-emerald-600" />
                      Assigned Counsel: {c.assignedLawyer.fullName || c.assignedLawyer.email || 'Verified Advocate'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {c.location?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {c.location.city}, {c.location.state}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <span className="flex items-center gap-1 text-legal-blue font-bold group-hover:translate-x-1 transition-transform duration-200 text-xs">
                  <span>Open Dossier</span>
                  <ChevronRight className="w-4 h-4 text-legal-gold" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
