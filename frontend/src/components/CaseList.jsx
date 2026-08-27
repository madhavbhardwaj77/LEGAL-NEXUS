import React, { useState } from 'react';
import { PlusCircle, Search, Clock, MapPin, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export default function CaseList({ cases, loading, onSelectCase, onNewCase, user }) {
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter((c) => {
    const matchesCategory = !filterCategory || c.category === filterCategory;
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LAWYER_ASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'RESOLVED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Case Intake & Management</h2>
          <p className="text-sm text-slate-500">
            {user
              ? `Showing structured legal cases for ${user.email} (${user.role})`
              : 'Sign in to file and manage legal cases'}
          </p>
        </div>

        {user && (
          <button
            onClick={onNewCase}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-nyaya-600 hover:bg-nyaya-700 text-white font-medium text-sm rounded-xl shadow transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            File New Case
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by case title, issue, or case number (e.g. NYA-2026...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500 text-slate-700"
        >
          <option value="">All Categories</option>
          <option value="Employment">Employment & Labor</option>
          <option value="Property & Real Estate">Property & Real Estate</option>
          <option value="Consumer Dispute">Consumer Dispute</option>
          <option value="Family & Matrimonial">Family & Matrimonial</option>
          <option value="Criminal Law">Criminal Law</option>
          <option value="Cyber Law & Data Privacy">Cyber Law</option>
        </select>
      </div>

      {/* Case Grid / Cards */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="animate-spin w-8 h-8 border-4 border-nyaya-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading cases from MongoDB...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No cases found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {user
              ? 'Get started by creating your first legal case intake.'
              : 'Sign in to file a case and access legal workflows.'}
          </p>
          {user && (
            <button
              onClick={onNewCase}
              className="inline-flex items-center gap-2 px-4 py-2 bg-nyaya-600 text-white text-sm font-medium rounded-xl hover:bg-nyaya-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              File Case Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c._id}
              onClick={() => onSelectCase(c)}
              className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-nyaya-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {c.caseNumber || 'NYA-CASE'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getUrgencyBadge(c.urgency)}`}>
                      {c.urgency}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-nyaya-700 transition line-clamp-1">
                  {c.title}
                </h3>

                <p className="text-xs font-semibold text-nyaya-600 mt-0.5 mb-2">
                  Category: {c.category} • Issue: {c.issue}
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {c.description}
                </p>
              </div>

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
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <span className="flex items-center text-nyaya-600 font-semibold group-hover:translate-x-0.5 transition">
                  Details <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
