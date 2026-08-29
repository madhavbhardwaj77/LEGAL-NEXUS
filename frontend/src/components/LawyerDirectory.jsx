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
  X,
  Scale,
  Check,
  Filter,
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
      <div className="bg-[#0B1F33] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-legal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-legal-blue/20 text-sky-300 border border-legal-blue/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Verified Legal Ecosystem
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Verified Advocates & Legal Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Find Bar Council verified advocates, run multi-factor transparent matching (30% Practice, 25% Exp, 15% Location, 10% Lang, 10% Budget, 10% Availability), and browse anonymized precedent case studies.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleMatchForCase}
          disabled={matching}
          className="px-6 py-3.5 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-2 shrink-0"
        >
          {matching ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-legal-gold" />
              <span>Find Best Match for My Case</span>
            </>
          )}
        </button>
      </div>

      {/* Sub-tabs: Directory vs Case Studies */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-4 py-2 rounded-xl transition ${
            activeSubTab === 'directory'
              ? 'bg-legal-blue text-white shadow-subtle'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Advocates Directory ({lawyers.length})
        </button>
        <button
          onClick={() => setActiveSubTab('caseStudies')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeSubTab === 'caseStudies'
              ? 'bg-legal-blue text-white shadow-subtle'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Anonymized Case Studies ({caseStudies.length})</span>
        </button>
      </div>

      {activeSubTab === 'directory' ? (
        <>
          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="relative md:col-span-6">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by advocate name, court, or practice area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue shadow-subtle"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={practiceArea}
                onChange={(e) => setPracticeArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue text-slate-700 font-medium shadow-subtle"
              >
                <option value="">All Practice Areas</option>
                <option value="Employment">Employment & Labour</option>
                <option value="Consumer">Consumer Protection</option>
                <option value="Property">Property & Real Estate</option>
                <option value="Cyber">Cybercrime & IT Act</option>
                <option value="Family">Family & Matrimonial</option>
                <option value="Corporate">Corporate & Contracts</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue text-slate-700 font-medium shadow-subtle"
              >
                <option value="">All Roles</option>
                <option value="LAWYER">Advocate / Lawyer</option>
                <option value="LAW_STUDENT">Law Student</option>
              </select>
            </div>
          </div>

          {/* Matched Banner Notice */}
          {matchedLawyers && (
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between text-xs animate-in fade-in">
              <span className="font-semibold text-legal-blue flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-legal-gold" />
                Multi-Factor Ranking Applied (Practice 30%, Exp 25%, Location 15%, Lang 10%, Budget 10%, Availability 10%)
              </span>
              <button
                onClick={() => setMatchedLawyers(null)}
                className="text-[11px] text-slate-600 font-bold hover:underline"
              >
                Reset Matching
              </button>
            </div>
          )}

          {/* Lawyers Grid */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle">
              <div className="animate-spin w-8 h-8 border-4 border-legal-blue border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-medium">Searching advocate directory...</p>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 max-w-md mx-auto space-y-3">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Legal Professionals Found</h3>
              <p className="text-xs text-slate-500">Try broadening your practice area or keyword search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lawyers.map((prof) => {
                const matchInfo = matchedLawyers?.find((m) => m.lawyerId === prof._id);

                return (
                  <div
                    key={prof._id}
                    className="bg-white p-6 rounded-3xl border border-slate-200/90 hover:border-legal-blue/50 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-4 shadow-subtle"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#0B1F33] text-legal-gold flex items-center justify-center font-extrabold text-sm border border-slate-700 shadow-sm">
                            {prof.fullName?.charAt(0) || 'L'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{prof.fullName}</h4>
                            <p className="text-xs text-legal-blue font-semibold">{prof.title || 'Advocate on Record'}</p>
                          </div>
                        </div>

                        {prof.verificationStatus === 'VERIFIED' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                            🔵 Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {prof.professionalRole === 'LAW_STUDENT' ? 'Student' : 'Advocate'}
                          </span>
                        )}
                      </div>

                      {/* Transparent Match Score Badge */}
                      {matchInfo && (
                        <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900 flex items-center gap-1 text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            {matchInfo.matchPercentage}% Match
                          </span>
                          <button
                            onClick={() => setSelectedLawyerExplanation(matchInfo)}
                            className="text-[10px] text-emerald-800 underline font-bold"
                          >
                            Why this match?
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {prof.bio || 'Experienced legal counsel offering assistance across judicial forums and tribunals.'}
                      </p>

                      {prof.practiceAreas && prof.practiceAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {prof.practiceAreas.map((pa, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200"
                            >
                              {pa}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {prof.location?.city || 'Delhi'}, {prof.location?.state || 'India'}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <Award className="w-3.5 h-3.5 text-legal-gold" />
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
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-legal-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                    {cs.practiceArea}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{cs.year || 2026}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{cs.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{cs.summary}</p>
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <strong className="text-emerald-800 block mb-0.5">Judicial Outcome:</strong>
                  <span className="text-slate-700">{cs.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transparent Match Breakdown Modal */}
      {selectedLawyerExplanation && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  Transparent Match Breakdown
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedLawyerExplanation.fullName} ({selectedLawyerExplanation.matchPercentage}% Match)
                </h3>
              </div>
              <button
                onClick={() => setSelectedLawyerExplanation(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{selectedLawyerExplanation.summaryExplanation}</p>

            <div className="space-y-2">
              {selectedLawyerExplanation.explanationBreakdown?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${item.matched ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-slate-800 block">{item.factor}</span>
                      <span className="text-[11px] text-slate-500">{item.label}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-legal-blue">
                    +{item.points}/{item.maxPoints}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedLawyerExplanation(null)}
              className="w-full py-3 bg-[#0B1F33] text-white font-bold text-xs rounded-2xl transition shadow"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
