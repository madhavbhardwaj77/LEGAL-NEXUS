import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  Clock,
  MapPin,
  AlertCircle,
  FileText,
  ChevronRight,
  Briefcase,
  Scale,
  DollarSign,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Filter,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export default function CaseList({ cases = [], loading, onSelectCase, onNewCase, user }) {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate metrics
  const totalDisputedAmount = cases.reduce((acc, c) => {
    return acc + (parseFloat(c.financialDetails?.disputedAmount) || 0);
  }, 0);

  const urgentCasesCount = cases.filter(
    (c) => c.urgency === 'CRITICAL' || c.urgency === 'HIGH' || c.urgency === 'URGENT_ASSISTANCE'
  ).length;

  const resolvedCasesCount = cases.filter((c) => c.status === 'RESOLVED').length;

  const filteredCases = cases.filter((c) => {
    const matchesCategory = !filterCategory || c.category === filterCategory;
    const matchesUrgency = !filterUrgency || c.urgency === filterUrgency;
    const matchesStatus = !filterStatus || c.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parties?.plaintiff?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parties?.defendant?.organization?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesUrgency && matchesStatus && matchesSearch;
  });

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
      case 'URGENT_ASSISTANCE':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'HIGH':
      case 'ATTENTION_RECOMMENDED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'LAWYER_ASSIGNED':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'RESOLVED':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE WELCOME & ACTION BAR */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-subtle border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-legal-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Workspace Overview
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.profileData?.fullName || user?.email?.split('@')[0] || 'Legal Counsel'}
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
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-xs rounded-2xl shadow-md shadow-legal-blue/20 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-legal-gold" />
            <span>File New Legal Case</span>
          </button>
        )}
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Cases</span>
            <div className="p-2 bg-blue-50 text-legal-blue rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{cases.length}</span>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Active Case Files</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Disputed Quantum</span>
            <div className="p-2 bg-amber-50 text-legal-gold rounded-xl">
              <Scale className="w-4 h-4 text-legal-gold" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">
              ₹{totalDisputedAmount.toLocaleString('en-IN')}
            </span>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Aggregated Claims</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Urgent Matters</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-red-600">{urgentCasesCount}</span>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">High / Critical Urgency</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved / Closed</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-700">{resolvedCasesCount}</span>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Settled or Closed</p>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Search Input (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by case title, number (e.g. LN-2026...), or party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue"
            />
          </div>

          {/* Category Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue text-slate-700 font-medium"
            >
              <option value="">All Legal Domains</option>
              <option value="Employment">Employment & Labor</option>
              <option value="Property & Real Estate">Property & Tenancy</option>
              <option value="Consumer Dispute">Consumer Disputes</option>
              <option value="Cyber Law & Data Privacy">Cybercrime & IT Act</option>
              <option value="Family & Matrimonial">Family & Matrimonial</option>
              <option value="Criminal Law">Criminal Law</option>
              <option value="Corporate & Commercial">Corporate & Contracts</option>
            </select>
          </div>

          {/* Urgency Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue text-slate-700 font-medium"
            >
              <option value="">All Urgencies</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Status Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue text-slate-700 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="LAWYER_ASSIGNED">Counsel Assigned</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Active Filters summary if any */}
        {(filterCategory || filterUrgency || filterStatus || searchQuery) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 px-1">
            <span>
              Showing {filteredCases.length} of {cases.length} case records
            </span>
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterUrgency('');
                setFilterStatus('');
                setSearchQuery('');
              }}
              className="text-legal-blue font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. CASE GRID / EMPTY STATE */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle">
          <div className="animate-spin w-8 h-8 border-4 border-legal-blue border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Loading case dossiers from database...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-8 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-navy-50 text-legal-blue flex items-center justify-center mx-auto border border-navy-100 shadow-sm">
            <FileText className="w-7 h-7 text-legal-blue" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Legal Cases Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {user
                ? 'Your workspace is clear. Create your first case intake or launch the AI storytelling assistant to build one.'
                : 'Sign in to file a structured case and access pre-litigation workflows.'}
            </p>
          </div>
          {user && (
            <button
              onClick={onNewCase}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-legal-blue text-white text-xs font-bold rounded-xl shadow transition hover:bg-blue-700"
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
              className="group bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 hover:border-legal-blue/60 hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Card Top: Case Number & Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-legal-blue bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {c.caseNumber || 'LN-CASE'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getUrgencyBadge(c.urgency)}`}>
                      {c.urgency}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(c.status)}`}>
                      {c.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Case Title */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-legal-blue transition line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Domain: <span className="text-slate-800">{c.category}</span> • Issue: <span className="text-slate-800">{c.issue}</span>
                  </p>
                </div>

                {/* Narrative Preview */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {c.description}
                </p>

                {/* Disputed Amount if available */}
                {c.financialDetails?.disputedAmount > 0 && (
                  <div className="flex items-center justify-between text-xs px-2">
                    <span className="text-slate-500 font-medium">Disputed Quantum:</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      ₹{Number(c.financialDetails.disputedAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata & Details link */}
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

                <span className="flex items-center gap-1 text-legal-blue font-bold group-hover:translate-x-1 transition text-xs">
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
