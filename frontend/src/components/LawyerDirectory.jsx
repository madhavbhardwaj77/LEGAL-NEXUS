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
  FileText,
  UploadCloud,
  FolderOpen,
  AlertCircle,
  AlertTriangle,
  Languages,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Clock,
  Send,
  Star,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../services/api';

export default function LawyerDirectory({ user, onOpenAuth }) {
  const getStoredMatchedLawyers = () => {
    try {
      const stored = sessionStorage.getItem('nyaya_matched_lawyers');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const getStoredMatchedProfile = () => {
    try {
      const stored = sessionStorage.getItem('nyaya_matched_case_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const [lawyers, setLawyers] = useState([]);
  const [matchedLawyers, setMatchedLawyers] = useState(getStoredMatchedLawyers);
  const [matchedCaseProfile, setMatchedCaseProfile] = useState(getStoredMatchedProfile);
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [search, setSearch] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('directory');
  const [selectedLawyerExplanation, setSelectedLawyerExplanation] = useState(null);

  // Match Modal States
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchMode, setMatchMode] = useState('existing');
  const [userCases, setUserCases] = useState([]);
  const [loadingUserCases, setLoadingUserCases] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  
  // Custom case / PDF state & AI Auto Extraction & Validation
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [extractedPdfInfo, setExtractedPdfInfo] = useState(null);
  const [inappropriateDocError, setInappropriateDocError] = useState(null);
  const [showManualInputs, setShowManualInputs] = useState(false);
  const [customCase, setCustomCase] = useState({
    title: '',
    category: 'Employment & Labour Law',
    issue: '',
    jurisdiction: 'Delhi',
    budget: '100000',
    language: 'Hindi + English',
    fileName: '',
    fileSize: '',
  });

  // Consultation Contact Modal State
  const [consultModalLawyer, setConsultModalLawyer] = useState(null);
  const [consultSuccess, setConsultSuccess] = useState(false);

  useEffect(() => {
    loadLawyers();
    loadCaseStudies();
  }, [practiceArea]);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      const params = { role: 'LAWYER' };
      if (practiceArea) params.practiceArea = practiceArea;
      if (search) params.search = search;

      const res = await api.get('/lawyers', { params });
      setLawyers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load advocates directory:', err);
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

  // Open Matching Modal and load user cases
  const handleOpenMatchModal = async () => {
    setIsMatchModalOpen(true);
    setLoadingUserCases(true);
    setInappropriateDocError(null);
    try {
      const res = await api.get('/cases');
      const cases = res.data.data || [];
      setUserCases(cases);
      if (cases.length > 0) {
        setSelectedCaseId(cases[0]._id);
        setMatchMode('existing');
      } else {
        setMatchMode('upload_pdf');
      }
    } catch {
      setUserCases([]);
      setMatchMode('upload_pdf');
    } finally {
      setLoadingUserCases(false);
    }
  };

  // Handle PDF file selection & AI Legal Relevance Analysis
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingPdf(true);
    setExtractedPdfInfo(null);
    setInappropriateDocError(null);

    let extractedText = '';
    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      try {
        extractedText = await file.text();
      } catch (err) {}
    }

    try {
      const res = await api.post('/lawyers/extract-case-profile', {
        fileName: file.name,
        fileSize: file.size,
        fileText: extractedText,
      });

      const extracted = res.data.data;
      if (extracted) {
        // Strict Legal Relevance Check
        if (extracted.isValidLegalDocument === false || extracted.isAppropriate === false) {
          setInappropriateDocError(
            extracted.reason ||
              'Inappropriate Document: The uploaded file does not contain recognized legal dispute facts, statutory notices, or court filings. Please upload a genuine legal document.'
          );
          setExtractedPdfInfo(null);
          setCustomCase((prev) => ({
            ...prev,
            title: '',
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
          }));
        } else {
          setCustomCase({
            title: extracted.title,
            category: extracted.category,
            issue: extracted.issue,
            jurisdiction: extracted.jurisdiction,
            budget: String(extracted.budget),
            language: extracted.language || 'Hindi + English',
            fileName: file.name,
            fileSize: extracted.fileSize,
          });
          setExtractedPdfInfo(extracted);
          setInappropriateDocError(null);
        }
      }
    } catch (err) {
      setInappropriateDocError('Failed to analyze document. Please upload a valid legal document.');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  // Execute Match Request
  const handleRunMatching = async (e) => {
    if (e) e.preventDefault();
    if (inappropriateDocError) return;

    setMatching(true);
    try {
      let payload = {};
      if (matchMode === 'existing' && selectedCaseId) {
        payload = { caseId: selectedCaseId };
      } else {
        payload = {
          practiceArea: customCase.category,
          location: customCase.jurisdiction,
          language: customCase.language,
          budget: parseInt(customCase.budget, 10) || 100000,
          issue: customCase.issue || customCase.title || 'Legal Dispute Resolution',
          caseProfile: {
            title: customCase.title,
            category: customCase.category,
            issue: customCase.issue || customCase.title,
            jurisdiction: customCase.jurisdiction,
            budget: parseInt(customCase.budget, 10) || 100000,
            language: customCase.language,
            fileName: customCase.fileName,
          },
        };
      }

      const res = await api.post('/lawyers/match', payload);
      const matchedList = res.data.data?.matchedLawyers || [];
      const profile = res.data.data?.caseProfile || {};

      try {
        sessionStorage.setItem('nyaya_matched_lawyers', JSON.stringify(matchedList));
        sessionStorage.setItem('nyaya_matched_case_profile', JSON.stringify(profile));
      } catch (storageErr) {
        console.warn('Could not cache matched lawyers to sessionStorage:', storageErr);
      }

      setMatchedLawyers(matchedList);
      setMatchedCaseProfile(profile);
      setIsMatchModalOpen(false);
      setActiveSubTab('directory');
    } catch (err) {
      alert('Matching request failed. Please ensure the backend is active.');
    } finally {
      setMatching(false);
    }
  };

  const handleResetMatching = () => {
    try {
      sessionStorage.removeItem('nyaya_matched_lawyers');
      sessionStorage.removeItem('nyaya_matched_case_profile');
    } catch {
      // ignore
    }
    setMatchedLawyers(null);
    setMatchedCaseProfile(null);
  };

  // STRICT FILTER: When matching is active, ONLY display the matched relevant advocates returned by AI
  const displayedLawyers = React.useMemo(() => {
    if (!matchedLawyers || matchedLawyers.length === 0) {
      return lawyers;
    }

    return matchedLawyers
      .map((match) => {
        const fullProfile = lawyers.find((p) => p._id === match.lawyerId) || {};
        return {
          ...fullProfile,
          ...match,
          matchInfo: match,
        };
      })
      .filter((p) => (p.matchScore || 0) >= 50);
  }, [lawyers, matchedLawyers]);

  return (
    <div className="space-y-6">
      {/* Directory Header Banner */}
      <div className="bg-[#0B1F33] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-legal flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-legal-blue/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Bar Council Verified Advocates
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Verified Advocates & Legal Counsel Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Match your legal case with specialized verified advocates ranked by category experience, published precedent judgments, and court standing.
          </p>
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={handleOpenMatchModal}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Find Best Match for My Case</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs: Directory vs Precedent Case Studies */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={'px-4 py-2 rounded-xl transition flex items-center gap-2 ' + (activeSubTab === 'directory' ? 'bg-legal-blue text-white shadow-subtle' : 'text-slate-600 hover:bg-slate-100')}
        >
          <Scale className="w-4 h-4" />
          <span>Advocates Directory ({displayedLawyers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('caseStudies')}
          className={'px-4 py-2 rounded-xl transition flex items-center gap-1.5 ' + (activeSubTab === 'caseStudies' ? 'bg-legal-blue text-white shadow-subtle' : 'text-slate-600 hover:bg-slate-100')}
        >
          <BookOpen className="w-4 h-4" />
          <span>Precedent Case Studies ({caseStudies.length})</span>
        </button>
      </div>

      {activeSubTab === 'directory' ? (
        <>
          {/* Matched Banner Notice */}
          {matchedLawyers && matchedCaseProfile && (
            <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-[#0B1F33] text-white rounded-3xl border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg animate-in fade-in slide-in-from-top-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Showing {displayedLawyers.length} Relevant Advocates Matched by Category Experience & Precedents</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Target Matter: <span className="text-amber-300 font-semibold">"{matchedCaseProfile.issue || matchedCaseProfile.category}"</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Domain: <span className="font-semibold text-white bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700">{matchedCaseProfile.category}</span> • Jurisdiction: <span className="font-semibold text-white">{matchedCaseProfile.jurisdiction || 'Delhi'}</span>
                </p>
              </div>
              <button
                onClick={handleResetMatching}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20 shrink-0 self-start md:self-auto cursor-pointer"
              >
                Clear Filter (View All Advocates)
              </button>
            </div>
          )}

          {/* Search & Filters Grid */}
          {!matchedLawyers && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="relative md:col-span-8">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by advocate name, court, or practice area..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue shadow-subtle"
                />
              </div>

              <div className="md:col-span-4">
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
                  <option value="Criminal">Criminal Defense</option>
                  <option value="Civil">Civil Litigation</option>
                </select>
              </div>

              {/* Verified Trust Notice */}
              <div className="md:col-span-12">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs font-semibold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Advocate Directory — All listed advocates hold authentic, verified Bar Council credentials.</span>
                </div>
              </div>
            </div>
          )}

          {/* Advocates Grid */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle">
              <div className="animate-spin w-8 h-8 border-4 border-legal-blue border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-medium">Searching verified advocate directory...</p>
            </div>
          ) : displayedLawyers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 max-w-md mx-auto space-y-3">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Advocates Matched for this Domain</h3>
              <p className="text-xs text-slate-500">Try broadening your case category or location.</p>
              {matchedLawyers && (
                <button
                  onClick={handleResetMatching}
                  className="px-4 py-2 bg-legal-blue text-white rounded-xl text-xs font-bold"
                >
                  View All Verified Advocates
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedLawyers.map((prof, index) => {
                const matchInfo = prof.matchInfo;
                const isHighRecommend = prof.isHighRecommend;
                const hasPrecedent = prof.publishedCaseStudies && prof.publishedCaseStudies.length > 0;

                return (
                  <div
                    key={prof._id || prof.lawyerId}
                    className={'bg-white p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-subtle relative ' + (isHighRecommend ? 'border-amber-400 bg-gradient-to-b from-amber-50/20 to-white ring-2 ring-amber-400/40 shadow-card-hover' : 'border-slate-200/90 hover:border-legal-blue/50 hover:shadow-card-hover')}
                  >
                    {/* High Recommend & Ranking Header */}
                    {matchedLawyers && matchInfo && (
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        {isHighRecommend ? (
                          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 bg-amber-500 text-slate-950 shadow-sm">
                            <Star className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Highly Recommended • {matchInfo.matchPercentage}% Fit</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 bg-blue-50 text-legal-blue border border-blue-200">
                            <Sparkles className="w-3 h-3" />
                            <span>Relevant Counsel • {matchInfo.matchPercentage}% Fit</span>
                          </span>
                        )}
                        <button
                          onClick={() => setSelectedLawyerExplanation(matchInfo)}
                          className="text-[11px] text-legal-blue hover:text-blue-700 font-bold hover:underline cursor-pointer"
                        >
                          Breakdown
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={'w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm border shadow-sm shrink-0 ' + (isHighRecommend ? 'bg-gradient-to-br from-[#0B1F33] to-blue-900 text-amber-300 border-amber-400/60' : 'bg-[#0B1F33] text-legal-gold border-slate-700')}>
                            {prof.fullName?.charAt(0) || 'L'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{prof.fullName}</h4>
                            <p className="text-xs text-legal-blue font-semibold">{prof.title || 'Advocate on Record'}</p>
                            {prof.barCouncilRegistration?.registrationNumber && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                Bar ID: {prof.barCouncilRegistration.registrationNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      </div>

                      {/* Published Case Study Precedent Pill */}
                      {hasPrecedent && (
                        <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200/90 space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                            <span>Published Precedent Judgment</span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-800 line-clamp-2">
                            "{prof.publishedCaseStudies[0].title}"
                          </p>
                          <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 pt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Outcome: {prof.publishedCaseStudies[0].outcome}</span>
                          </div>
                        </div>
                      )}

                      {/* Match Explanation Snippet */}
                      {matchInfo?.summaryExplanation && !hasPrecedent && (
                        <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 text-xs text-slate-700 leading-relaxed space-y-1">
                          <span className="text-[10px] font-bold text-legal-blue uppercase tracking-wider block">
                            🎯 Match Insight
                          </span>
                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            {matchInfo.summaryExplanation}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {prof.bio || 'Experienced legal counsel offering representation across High Courts, District Courts, and Tribunals.'}
                      </p>

                      {prof.practiceAreas && prof.practiceAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {prof.practiceAreas.map((pa, idx) => (
                            <span
                              key={idx}
                              className={'text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border ' + (matchedCaseProfile && pa.toLowerCase().includes((matchedCaseProfile.category || '').toLowerCase()) ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200')}
                            >
                              {pa}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {prof.location?.city || 'Delhi'}, {prof.location?.state || 'India'}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          <Award className="w-3.5 h-3.5 text-legal-gold" />
                          {prof.experienceYears || 0} Years Standing
                        </span>
                      </div>

                      {/* Contact / Consultation Action Button */}
                      <button
                        onClick={() => {
                          setConsultModalLawyer(prof);
                          setConsultSuccess(false);
                        }}
                        className={'w-full py-2.5 font-bold text-xs rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ' + (isHighRecommend ? 'bg-legal-blue hover:bg-blue-800 text-white shadow-md' : 'bg-slate-50 hover:bg-legal-blue hover:text-white text-slate-800 border-slate-200')}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Book Legal Consultation</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Precedent Case Studies Tab */
        <div className="space-y-4">
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

      {/* ========================================================================= */}
      {/* 🎯 AI CASE-ADVOCATE MATCHING MODAL (WITH RELEVANCE & LEGAL VALIDATION GUARD) */}
      {/* ========================================================================= */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-4 overflow-y-auto pt-4 sm:pt-6 pb-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    Multi-Factor Advocate Matcher
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Match Verified Advocate for Your Case
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ranks verified advocates based on domain specialization, precedent case judgments, and courtroom standing.
                </p>
              </div>
              <button
                onClick={() => setIsMatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setMatchMode('existing');
                  setInappropriateDocError(null);
                }}
                className={'py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ' + (matchMode === 'existing' ? 'bg-white text-legal-blue shadow-subtle' : 'text-slate-600 hover:text-slate-900')}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Select from My Cases ({userCases.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMatchMode('upload_pdf')}
                className={'py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ' + (matchMode === 'upload_pdf' ? 'bg-white text-legal-blue shadow-subtle' : 'text-slate-600 hover:text-slate-900')}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload PDF (Auto-Extract)</span>
              </button>
            </div>

            {/* TAB 1: EXISTING CASES SELECTION */}
            {matchMode === 'existing' && (
              <div className="space-y-3">
                {loadingUserCases ? (
                  <div className="text-center py-8 space-y-2">
                    <div className="animate-spin w-6 h-6 border-2 border-legal-blue border-t-transparent rounded-full mx-auto" />
                    <p className="text-xs text-slate-500">Loading your registered cases...</p>
                  </div>
                ) : userCases.length === 0 ? (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2.5">
                    <AlertCircle className="w-7 h-7 text-amber-500 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No Registered Cases Found</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      You have not filed any cases yet. You can upload your case PDF to auto-extract details directly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMatchMode('upload_pdf')}
                      className="px-3.5 py-1.5 bg-legal-blue text-white font-bold text-xs rounded-xl shadow-subtle cursor-pointer"
                    >
                      Switch to Upload PDF (Auto-Extract)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {userCases.map((c) => {
                      const isSelected = selectedCaseId === c._id;
                      return (
                        <div
                          key={c._id}
                          onClick={() => setSelectedCaseId(c._id)}
                          className={'p-3 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ' + (isSelected ? 'bg-blue-50/90 border-legal-blue ring-2 ring-legal-blue/20 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50')}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-legal-blue bg-blue-100 px-2 py-0.5 rounded uppercase">
                                {c.category}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {c.caseNumber || 'CASE-REG'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {c.issue || c.facts || 'Legal representation requested.'}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                              <span>📍 {c.location?.city || 'Delhi'} Courts</span>
                              {c.financialDetails?.disputedAmount > 0 && (
                                <span>💰 Disputed: ₹{c.financialDetails.disputedAmount.toLocaleString()}</span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 mt-1">
                            <div
                              className={'w-5 h-5 rounded-full border-2 flex items-center justify-center ' + (isSelected ? 'border-legal-blue bg-legal-blue text-white' : 'border-slate-300 bg-white')}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: UPLOAD CASE PDF (WITH RELEVANCE & LEGAL VALIDITY GUARD) */}
            {matchMode === 'upload_pdf' && (
              <form onSubmit={handleRunMatching} className="space-y-3.5">
                {/* PDF File Drag & Drop Box */}
                <div className="border-2 border-dashed border-slate-200 hover:border-legal-blue rounded-2xl p-4 text-center bg-slate-50 hover:bg-blue-50/40 transition group relative">
                  <input
                    type="file"
                    id="case-doc-upload"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="case-doc-upload" className="cursor-pointer block space-y-1.5">
                    <div className="w-9 h-9 bg-white rounded-xl shadow-subtle border border-slate-200 flex items-center justify-center mx-auto text-legal-blue group-hover:scale-110 transition">
                      {isExtractingPdf ? (
                        <Loader2 className="w-5 h-5 animate-spin text-legal-blue" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-legal-blue hover:underline block">
                        {isExtractingPdf ? '🔍 AI is analyzing document relevance & legal facts...' : 'Click to Upload Case Document / Legal Notice PDF'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Supports PDF, DOCX, TXT — Verified legal documents only (Notices, Petitions, Contracts, Complaints)
                      </p>
                    </div>
                  </label>

                  {customCase.fileName && !isExtractingPdf && (
                    <div className="mt-2.5 p-2 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-800">
                      <span className="font-semibold flex items-center gap-1.5 truncate max-w-xs text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-legal-blue shrink-0" />
                        {customCase.fileName} ({customCase.fileSize})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCase({
                            title: '',
                            category: 'Employment & Labour Law',
                            issue: '',
                            jurisdiction: 'Delhi',
                            budget: '100000',
                            language: 'Hindi + English',
                            fileName: '',
                            fileSize: '',
                          });
                          setExtractedPdfInfo(null);
                          setInappropriateDocError(null);
                        }}
                        className="text-slate-400 hover:text-red-500 text-[11px] font-bold px-2 py-0.5 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* ⚠️ INAPPROPRIATE / NON-LEGAL DOCUMENT WARNING CARD */}
                {inappropriateDocError && (
                  <div className="p-4 bg-red-50/95 border-2 border-red-200 rounded-2xl text-xs space-y-2.5 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                          Inappropriate / Non-Legal Document Detected
                        </h4>
                        <p className="text-[11px] text-red-700 leading-relaxed">
                          {inappropriateDocError}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-red-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-red-900 font-semibold">
                        🚫 Advocate Matching is disabled for this file.
                      </span>
                      <label
                        htmlFor="case-doc-upload"
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer transition shadow-xs"
                      >
                        Upload Valid Case PDF
                      </label>
                    </div>
                  </div>
                )}

                {/* ✅ CLEAN AUTO-EXTRACTED CASE PROFILE SUMMARY (NO ARTIFICIAL BADGES) */}
                {extractedPdfInfo && !inappropriateDocError && (
                  <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5 text-xs animate-in fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-medium block">Category</span>
                        <span className="font-bold text-slate-900 text-[11px] truncate block">{customCase.category}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-medium block">Jurisdiction</span>
                        <span className="font-bold text-slate-900 text-[11px] truncate block">{customCase.jurisdiction}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-medium block">Disputed Scale</span>
                        <span className="font-bold text-slate-900 text-[11px] truncate block">₹{Number(customCase.budget).toLocaleString()}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-medium block">Case Title</span>
                        <span className="font-bold text-legal-blue text-[11px] truncate block">{customCase.title}</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-700">
                      <strong className="text-slate-900 block mb-0.5">Dispute Summary from Document:</strong>
                      <p className="line-clamp-2 leading-relaxed text-slate-600">{customCase.issue}</p>
                    </div>

                    {/* Expandable Manual Edit Option */}
                    <div className="pt-1 flex items-center justify-between border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        Details extracted from document. Ready to match!
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowManualInputs(!showManualInputs)}
                        className="text-legal-blue hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>{showManualInputs ? 'Hide Inputs' : 'Edit Inputs (Optional)'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Fields (Visible if toggled OR if no PDF extracted yet and no error) */}
                {(!extractedPdfInfo || showManualInputs) && !inappropriateDocError && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Case Title / Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Consumer Forum Complaint"
                        value={customCase.title}
                        onChange={(e) => setCustomCase({ ...customCase, title: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-legal-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Legal Domain / Category
                      </label>
                      <select
                        value={customCase.category}
                        onChange={(e) => setCustomCase({ ...customCase, category: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-legal-blue font-medium"
                      >
                        <option value="Consumer Protection">Consumer Protection</option>
                        <option value="Employment & Labour Law">Employment & Labour</option>
                        <option value="Property & Real Estate">Property & Real Estate</option>
                        <option value="Cybercrime & IT Act">Cybercrime & IT Act</option>
                        <option value="Family & Matrimonial">Family & Matrimonial</option>
                        <option value="Corporate & Contracts">Corporate & Commercial</option>
                        <option value="Criminal Defense">Criminal Defense</option>
                        <option value="Civil Litigation">Civil Litigation</option>
                        <option value="Banking & Financial Disputes">Banking & Financial Disputes</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Key Dispute Facts / Grievance Summary
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Briefly describe the key facts, notice received, or relief sought..."
                        value={customCase.issue}
                        onChange={(e) => setCustomCase({ ...customCase, issue: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-legal-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Court City / Jurisdiction
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi, Mumbai, Bengaluru"
                        value={customCase.jurisdiction}
                        onChange={(e) => setCustomCase({ ...customCase, jurisdiction: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-legal-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Disputed Scale / Budget (₹ INR)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 100000"
                        value={customCase.budget}
                        onChange={(e) => setCustomCase({ ...customCase, budget: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-legal-blue"
                      />
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMatchModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRunMatching}
                disabled={
                  matching ||
                  isExtractingPdf ||
                  Boolean(inappropriateDocError) ||
                  (matchMode === 'existing' && !selectedCaseId) ||
                  (matchMode === 'upload_pdf' && (!customCase.title || inappropriateDocError))
                }
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {matching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Matching Verified Advocates...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Run Multi-Factor Matching</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 TRANSPARENT MULTI-FACTOR MATCH BREAKDOWN MODAL */}
      {/* ========================================================================= */}
      {selectedLawyerExplanation && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-10 sm:pt-14 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  Multi-Factor Ranking Formula
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedLawyerExplanation.fullName} ({selectedLawyerExplanation.matchPercentage}% Match)
                </h3>
              </div>
              <button
                onClick={() => setSelectedLawyerExplanation(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              {selectedLawyerExplanation.summaryExplanation}
            </p>

            <div className="space-y-2">
              {selectedLawyerExplanation.explanationBreakdown?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={'w-4 h-4 ' + (item.matched ? 'text-emerald-600' : 'text-slate-400')} />
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
              className="w-full py-2.5 bg-[#0B1F33] text-white font-bold text-xs rounded-2xl transition shadow cursor-pointer"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📞 BOOK CONSULTATION MODAL */}
      {/* ========================================================================= */}
      {consultModalLawyer && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-10 sm:pt-14 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-legal-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                  Verified Legal Consultation
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Connect with {consultModalLawyer.fullName}
                </h3>
              </div>
              <button
                onClick={() => setConsultModalLawyer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {consultSuccess ? (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Consultation Request Sent!</h4>
                <p className="text-xs text-emerald-700">
                  Advocate {consultModalLawyer.fullName} has been notified and will review your case file.
                </p>
                <button
                  onClick={() => setConsultModalLawyer(null)}
                  className="mt-2 w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-0.5">
                  <div className="font-bold text-slate-900">{consultModalLawyer.fullName}</div>
                  <div className="text-slate-500 font-mono text-[10px]">
                    Bar Registration: {consultModalLawyer.barCouncilRegistration?.registrationNumber || 'Verified ID'}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Courts: {consultModalLawyer.location?.city || 'Delhi'} • Standing: {consultModalLawyer.experienceYears || 0} years
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Preferred Consultation Mode
                  </label>
                  <select className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs">
                    <option>Video Call (Confidential)</option>
                    <option>In-Person Court Chamber</option>
                    <option>Telephonic Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Short Message / Query
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide brief context for the consultation..."
                    defaultValue={matchedCaseProfile?.issue || ''}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={() => setConsultModalLawyer(null)}
                    className="w-1/2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setConsultSuccess(true)}
                    className="w-1/2 py-2 bg-legal-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Confirm Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
