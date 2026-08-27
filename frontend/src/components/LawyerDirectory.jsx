import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  MapPin,
  Award,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../services/api';

export default function LawyerDirectory({ user, onOpenAuth }) {
  const [lawyers, setLawyers] = useState([]);
  const [matchedLawyers, setMatchedLawyers] = useState(null);
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [search, setSearch] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('directory'); // directory | caseStudies
  const [selectedLawyerExplanation, setSelectedLawyerExplanation] = useState(null);

  useEffect(() => {
    loadLawyers();
    loadCaseStudies();
  }, [practiceArea, roleFilter]);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (practiceArea) params.practiceArea = practiceArea;
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const res = await api.get('/lawyers', { params });
      setLawyers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load lawyers directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseStudies = async () => {
    try {
      const res = await api.get('/lawyers/case-studies');
      setCaseStudies(res.data.data || []);
    } catch {
      setCaseStudies([]);
    }
  };

  const handleMatchForCase = async () => {
    setMatching(true);
    try {
      const res = await api.post('/lawyers/match', {
        practiceArea: practiceArea || 'Employment & Labour Law',
        location: 'Delhi',
        language: 'Hindi',
        budget: 100000,
      });

      const matchedList = res.data.data?.matchedLawyers || [];
      setMatchedLawyers(matchedList);
    } catch (err) {
      alert('Matching request failed. Please check backend connection.');
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Directory Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-nyaya-500/20 text-nyaya-300 border border-nyaya-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Milestone 4 • Transparent Ecosystem
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Legal Professionals & Ecosystem</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Find Bar Council verified advocates, run multi-factor transparent matching (30% Practice, 25% Exp, 15% Location, 10% Lang, 10% Budget, 10% Availability), and browse anonymized precedent case studies.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleMatchForCase}
          disabled={matching}
          className="px-5 py-3 bg-nyaya-600 hover:bg-nyaya-700 text-white font-bold text-xs rounded-2xl shadow transition flex items-center gap-2 shrink-0"
        >
          {matching ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Find Best Match for My Case
            </>
          )}
        </button>
      </div>

      {/* Sub-tabs: Directory vs Case Studies */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-medium">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-4 py-2 rounded-xl transition ${
            activeSubTab === 'directory'
              ? 'bg-nyaya-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Advocates Directory
        </button>
        <button
          onClick={() => setActiveSubTab('caseStudies')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeSubTab === 'caseStudies'
              ? 'bg-nyaya-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Anonymized Case Studies ({caseStudies.length})
        </button>
      </div>

      {activeSubTab === 'directory' ? (
        <>
          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by advocate name, court, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500"
              />
            </div>

            <select
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500 text-slate-700"
            >
              <option value="">All Practice Areas</option>
              <option value="Employment">Employment & Labour</option>
              <option value="Consumer">Consumer Protection</option>
              <option value="Property">Property & Real Estate</option>
              <option value="Cyber">Cybercrime & IT Act</option>
              <option value="Family">Family & Matrimonial</option>
              <option value="Corporate">Corporate & Contracts</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500 text-slate-700"
            >
              <option value="">All Roles</option>
              <option value="LAWYER">Advocate / Lawyer</option>
              <option value="LAW_STUDENT">Law Student</option>
            </select>
          </div>

          {/* Matched Banner Notice */}
          {matchedLawyers && (
            <div className="p-4 bg-nyaya-50 rounded-2xl border border-nyaya-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-nyaya-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-nyaya-600" />
                Multi-Factor Ranking Applied (Practice Area 30%, Exp 25%, Location 15%, Lang 10%, Budget 10%, Availability 10%)
              </span>
              <button
                onClick={() => setMatchedLawyers(null)}
                className="text-[11px] text-nyaya-700 font-bold hover:underline"
              >
                Reset Matching
              </button>
            </div>
          )}

          {/* Lawyers Grid */}
          {loading ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <div className="animate-spin w-8 h-8 border-4 border-nyaya-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Searching directory...</p>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No legal professionals found</h3>
              <p className="text-xs text-slate-500 mt-1">Try broadening your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lawyers.map((prof) => {
                const matchInfo = matchedLawyers?.find((m) => m.lawyerId === prof._id);

                return (
                  <div
                    key={prof._id}
                    className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-nyaya-400 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                            {prof.fullName?.charAt(0) || 'L'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{prof.fullName}</h4>
                            <p className="text-xs text-nyaya-600 font-medium">{prof.title || 'Advocate on Record'}</p>
                          </div>
                        </div>

                        {prof.verificationStatus === 'VERIFIED' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                            🔵 Verified Advocate
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {prof.professionalRole === 'LAW_STUDENT' ? 'Student' : 'Advocate'}
                          </span>
                        )}
                      </div>

                      {/* Transparent Match Score Badge */}
                      {matchInfo && (
                        <div className="mb-3 p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-800 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            {matchInfo.matchPercentage}% Match
                          </span>
                          <button
                            onClick={() => setSelectedLawyerExplanation(matchInfo)}
                            className="text-[10px] text-emerald-700 underline font-semibold"
                          >
                            Why this match?
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                        {prof.bio || 'Experienced legal counsel offering assistance across judicial forums and tribunals.'}
                      </p>

                      {prof.practiceAreas && prof.practiceAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {prof.practiceAreas.map((pa, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              {pa}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {prof.location?.city || 'Delhi'}, {prof.location?.state || 'India'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Award className="w-3.5 h-3.5 text-nyaya-600" />
                        {prof.experienceYears || 0} yrs exp
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Anonymized Case Studies View */
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <strong>Legal Precedents & Case Studies:</strong> Verified advocates publish anonymized case strategies and judicial outcomes with 100% confidential client privacy.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseStudies.map((cs, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-nyaya-700 bg-nyaya-50 px-2 py-0.5 rounded uppercase">
                    {cs.practiceArea}
                  </span>
                  <span className="text-xs text-slate-400">{cs.year || 2026}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{cs.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{cs.summary}</p>
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <strong className="text-emerald-700 block">Outcome:</strong>
                  <span className="text-slate-700">{cs.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transparent Match Breakdown Modal */}
      {selectedLawyerExplanation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                  Transparent Match Breakdown
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedLawyerExplanation.fullName} ({selectedLawyerExplanation.matchPercentage}% Match)
                </h3>
              </div>
              <button
                onClick={() => setSelectedLawyerExplanation(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">{selectedLawyerExplanation.summaryExplanation}</p>

            <div className="space-y-2">
              {selectedLawyerExplanation.explanationBreakdown?.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${item.matched ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-slate-800 block">{item.factor}</span>
                      <span className="text-[11px] text-slate-500">{item.label}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-nyaya-700">
                    +{item.points}/{item.maxPoints}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedLawyerExplanation(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl transition"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
