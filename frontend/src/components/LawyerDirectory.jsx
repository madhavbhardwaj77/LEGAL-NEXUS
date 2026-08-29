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
  UserCheck,
  Gavel,
  Inbox,
  Send,
  Calendar,
  Clock,
  Building,
  User,
  AlertCircle,
  FileText,
  Eye,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

export default function LawyerDirectory({ user, onOpenAuth }) {
  const isLawyer = user?.role === 'LAWYER';

  // Sub-tabs:
  // For lawyer: incomingRequests | ongoingCases | directory | caseStudies
  // For citizen: directory | myRequests | caseStudies
  const [activeSubTab, setActiveSubTab] = useState(isLawyer ? 'incomingRequests' : 'directory');

  // Directory state
  const [lawyers, setLawyers] = useState([]);
  const [matchedLawyers, setMatchedLawyers] = useState(null);
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [search, setSearch] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState(0);
  const [selectedLawyerExplanation, setSelectedLawyerExplanation] = useState(null);

  // Advocate Full Profile & Portfolio Modal
  const [selectedAdvocateProfile, setSelectedAdvocateProfile] = useState(null);
  const [loadingAdvocateDetail, setLoadingAdvocateDetail] = useState(false);

  // Incoming Requests state (for lawyer)
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [acceptModalData, setAcceptModalData] = useState(null);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Ongoing Assigned Cases state (for lawyer)
  const [ongoingCases, setOngoingCases] = useState([]);
  const [loadingOngoing, setLoadingOngoing] = useState(false);
  const [selectedOngoingCase, setSelectedOngoingCase] = useState(null);

  // Citizen Requests state (for citizen)
  const [citizenRequests, setCitizenRequests] = useState([]);
  const [loadingCitizenRequests, setLoadingCitizenRequests] = useState(false);

  // Citizen Consultation Request Modal
  const [consultModalAdvocate, setConsultModalAdvocate] = useState(null);
  const [citizenUserCases, setCitizenUserCases] = useState([]);
  const [selectedCaseForConsult, setSelectedCaseForConsult] = useState('');
  const [consultMessage, setConsultMessage] = useState('');
  const [sendingConsult, setSendingConsult] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (activeSubTab === 'directory') {
      loadLawyers();
      if (user && !isLawyer) loadCitizenRequests();
    } else if (activeSubTab === 'caseStudies') {
      loadCaseStudies();
    } else if (activeSubTab === 'incomingRequests' && isLawyer) {
      loadIncomingRequests();
    } else if (activeSubTab === 'ongoingCases' && isLawyer) {
      loadOngoingCases();
    } else if (activeSubTab === 'myRequests' && !isLawyer) {
      loadCitizenRequests();
    }
  }, [activeSubTab, practiceArea, roleFilter, experienceFilter]);

  useEffect(() => {
    if (isLawyer) {
      loadIncomingRequests();
      loadOngoingCases();
    } else if (user) {
      loadCitizenRequests();
    }
  }, [user]);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (practiceArea) params.practiceArea = practiceArea;
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      if (experienceFilter > 0) params.minExperience = experienceFilter;

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

  const loadIncomingRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/lawyers/requests/incoming');
      setIncomingRequests(res.data.data || []);
    } catch (err) {
      console.error('Failed to load incoming requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadOngoingCases = async () => {
    try {
      setLoadingOngoing(true);
      const res = await api.get('/lawyers/ongoing-cases');
      setOngoingCases(res.data.data || []);
    } catch (err) {
      console.error('Failed to load ongoing cases:', err);
    } finally {
      setLoadingOngoing(false);
    }
  };

  const loadCitizenRequests = async () => {
    try {
      setLoadingCitizenRequests(true);
      const res = await api.get('/lawyers/requests/citizen');
      setCitizenRequests(res.data.data || []);
    } catch (err) {
      console.error('Failed to load citizen requests:', err);
    } finally {
      setLoadingCitizenRequests(false);
    }
  };

  const handleRespondToRequest = async (requestId, action, reason = '') => {
    try {
      setRespondingId(requestId);
      await api.patch(`/lawyers/requests/${requestId}/respond`, {
        action,
        rejectionReason: reason,
      });
      setAcceptModalData(null);
      setRejectModalData(null);
      setRejectionReason('');
      showToast(action === 'ACCEPT' ? 'Request accepted! Case added to Ongoing Cases.' : 'Request declined.');
      loadIncomingRequests();
      loadOngoingCases();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update request response', 'error');
    } finally {
      setRespondingId(null);
    }
  };

  const openAdvocateProfileModal = async (prof) => {
    try {
      setLoadingAdvocateDetail(true);
      setSelectedAdvocateProfile(prof);
      const res = await api.get(`/lawyers/${prof._id}`);
      setSelectedAdvocateProfile(res.data.data?.profile || prof);
      if (res.data.data?.experiences) {
        setSelectedAdvocateProfile((prev) => ({
          ...prev,
          experiences: res.data.data.experiences,
          caseHistories: res.data.data.caseHistories,
        }));
      }
    } catch (err) {
      console.error('Failed to load advocate details:', err);
    } finally {
      setLoadingAdvocateDetail(false);
    }
  };

  const openConsultModal = async (prof) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setConsultModalAdvocate(prof);
    setConsultSuccess(false);
    setConsultMessage('');
    try {
      const res = await api.get('/cases');
      const list = res.data.data || [];
      setCitizenUserCases(list);
      if (list.length > 0) {
        setSelectedCaseForConsult(list[0]._id);
      }
    } catch {
      setCitizenUserCases([]);
    }
  };

  const handleSendConsultation = async (e) => {
    e.preventDefault();
    if (!selectedCaseForConsult) {
      alert('Please select or file a case first.');
      return;
    }
    try {
      setSendingConsult(true);
      await api.post('/lawyers/request-consultation', {
        caseId: selectedCaseForConsult,
        lawyerId: consultModalAdvocate.user?._id || consultModalAdvocate.user || consultModalAdvocate._id,
        message: consultMessage,
      });
      setConsultSuccess(true);
      setTimeout(() => {
        setConsultModalAdvocate(null);
        setConsultSuccess(false);
      }, 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send consultation request');
    } finally {
      setSendingConsult(false);
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

  const pendingRequestsCount = incomingRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Directory Header */}
      <div className="bg-[#0B1F33] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-legal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-legal-blue/20 text-sky-300 border border-legal-blue/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
              {isLawyer ? 'Advocate Command Center' : 'Verified Legal Ecosystem'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isLawyer ? 'Advocate Hub & Client Inquiries' : 'Verified Advocates & Legal Ecosystem'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {isLawyer
              ? 'Review and accept incoming representation requests from citizens, explore all ongoing open legal matters, and connect with peer advocates.'
              : 'Find Bar Council verified advocates, review their uploaded past experiences & case histories, and dispatch direct case consultation requests.'}
          </p>
        </div>

        {/* Action Button */}
        {!isLawyer && (
          <button
            onClick={handleMatchForCase}
            disabled={matching}
            className="px-6 py-3.5 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {matching ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-legal-gold" />
                <span>Find Best Match for My Case</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in slide-in-from-top-2 text-white ${
            toastMessage.type === 'error' ? 'bg-red-700' : 'bg-emerald-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        {isLawyer && (
          <>
            <button
              onClick={() => setActiveSubTab('incomingRequests')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'incomingRequests'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Incoming Requests ({incomingRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('ongoingCases')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'ongoingCases'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Ongoing Cases ({ongoingCases.length})</span>
            </button>
          </>
        )}

        {!isLawyer && (
          <button
            onClick={() => setActiveSubTab('myRequests')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'myRequests'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Legal Requests ({citizenRequests.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'directory'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Advocates Directory ({lawyers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('caseStudies')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'caseStudies'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Precedent Case Studies ({caseStudies.length})</span>
        </button>
      </div>

      {/* ── 1. INCOMING REQUESTS VIEW (FOR LAWYERS) ─────────────── */}
      {activeSubTab === 'incomingRequests' && isLawyer && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-legal-blue" />
                <span>Client Legal Assistance Requests</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Incoming representation requests awaiting your acceptance or rejection.
              </p>
            </div>
            <button
              onClick={loadIncomingRequests}
              disabled={loadingRequests}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRequests ? 'animate-spin' : ''}`} />
              <span>Refresh Requests</span>
            </button>
          </div>

          {loadingRequests ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle">
              <div className="animate-spin w-8 h-8 border-4 border-legal-blue border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Checking incoming client inquiries...</p>
            </div>
          ) : incomingRequests.filter((r) => r.status === 'PENDING').length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-8 max-w-md mx-auto space-y-3">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No new legal assistance requests.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When citizens request consultation with you from the directory or matching system, they will appear here for you to accept or decline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests
                .filter((r) => r.status === 'PENDING')
                .map((req) => {
                  const caseItem = req.case || {};
                  const citizen = req.citizen || caseItem.user || {};

                  return (
                    <div
                      key={req._id}
                      className="bg-white p-6 rounded-3xl border border-amber-200/90 bg-amber-50/10 shadow-subtle space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-legal-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {caseItem.caseNumber || 'CASE'}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                PENDING REVIEW
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-2">{caseItem.title || 'Case Inquiry'}</h4>
                          </div>

                          {caseItem.urgency && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              {caseItem.urgency}
                            </span>
                          )}
                        </div>

                        {/* Citizen Info */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1 text-slate-700">
                          <p className="font-semibold flex items-center gap-1.5 text-slate-900">
                            <User className="w-3.5 h-3.5 text-legal-blue" />
                            <span>Client: {citizen.email || 'Citizen User'}</span>
                          </p>
                          {citizen.phone && (
                            <p className="text-[11px] text-slate-500">Contact: {citizen.phone}</p>
                          )}
                        </div>

                        {/* Case summary */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {caseItem.description || caseItem.issue}
                        </p>

                        {/* Citizen note */}
                        {req.requestMessage && (
                          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-slate-700">
                            <strong className="text-legal-blue block text-[10px] uppercase tracking-wider mb-0.5">
                              Client Request Note:
                            </strong>
                            <span>"{req.requestMessage}"</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(req.createdAt).toLocaleDateString('en-IN')}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRejectModalData(req)}
                            disabled={respondingId === req._id}
                            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setAcceptModalData(req)}
                            disabled={respondingId === req._id}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept Request</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── 2. ONGOING ASSIGNED CASES VIEW (FOR LAWYERS) ────────── */}
      {activeSubTab === 'ongoingCases' && isLawyer && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-legal-blue" />
                <span>My Ongoing Cases</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cases where you are designated as the assigned legal counsel.
              </p>
            </div>
            <button
              onClick={loadOngoingCases}
              disabled={loadingOngoing}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOngoing ? 'animate-spin' : ''}`} />
              <span>Refresh Cases</span>
            </button>
          </div>

          {loadingOngoing ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle">
              <div className="animate-spin w-8 h-8 border-4 border-legal-blue border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading ongoing cases...</p>
            </div>
          ) : ongoingCases.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-8 max-w-md mx-auto space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">You don't have any ongoing cases yet.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Accepted client requests will automatically appear here as ongoing active matters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ongoingCases.map((c) => (
                <div
                  key={c._id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/90 hover:border-legal-blue/50 shadow-subtle space-y-4 flex flex-col justify-between transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-legal-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {c.caseNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {c.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-2">{c.title}</h4>
                      </div>

                      {c.urgency && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {c.urgency}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                      <p><strong>Domain:</strong> {c.category} • <strong>Issue:</strong> {c.issue}</p>
                      {c.financialDetails?.disputedAmount > 0 && (
                        <p><strong>Disputed Quantum:</strong> ₹{Number(c.financialDetails.disputedAmount).toLocaleString('en-IN')}</p>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Updated: {new Date(c.updatedAt || c.createdAt).toLocaleDateString('en-IN')}
                    </span>

                    <button
                      onClick={() => setSelectedOngoingCase(c)}
                      className="px-3.5 py-2 bg-legal-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Dossier</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 3. CITIZEN MY REQUESTS VIEW ─────────────────────────── */}
      {activeSubTab === 'myRequests' && !isLawyer && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-legal-blue" />
                <span>My Sent Legal Assistance Requests</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status updates from advocates you have requested representation from.
              </p>
            </div>
            <button
              onClick={loadCitizenRequests}
              disabled={loadingCitizenRequests}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCitizenRequests ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingCitizenRequests ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle">
              <div className="animate-spin w-8 h-8 border-4 border-legal-blue border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading sent requests...</p>
            </div>
          ) : citizenRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-8 max-w-md mx-auto space-y-3">
              <Send className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Legal Assistance Requests Sent</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse the Advocate Directory to find verified counsel and send a consultation request for your case.
              </p>
              <button
                onClick={() => setActiveSubTab('directory')}
                className="px-4 py-2 bg-legal-blue text-white text-xs font-bold rounded-xl shadow"
              >
                Explore Advocate Directory
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {citizenRequests.map((req) => {
                const law = req.lawyer || {};
                const c = req.case || {};
                const isPending = req.status === 'PENDING';
                const isAccepted = req.status === 'ACCEPTED';
                const isRejected = req.status === 'REJECTED' || req.status === 'DECLINED';

                return (
                  <div
                    key={req._id}
                    className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-legal-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {c.caseNumber || 'CASE'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{c.title || 'Case File'}</h4>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isAccepted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Requested Advocate: <strong>{law.email || 'Advocate'}</strong> • Sent on {new Date(req.createdAt).toLocaleDateString('en-IN')}
                      </p>

                      {isRejected && req.rejectionReason && (
                        <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800">
                          <strong>Decline Note from Advocate: </strong>{req.rejectionReason}
                        </div>
                      )}

                      {isAccepted && (
                        <p className="text-xs text-emerald-700 font-semibold">
                          ✓ Advocate has accepted representation for this case.
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isRejected && (
                        <button
                          onClick={() => setActiveSubTab('directory')}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow"
                        >
                          Find Another Lawyer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. ADVOCATES DIRECTORY VIEW ─────────────────────────── */}
      {activeSubTab === 'directory' && (
        <>
          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="relative md:col-span-6">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by advocate name, court, city, or practice area..."
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
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Civil Law">Civil Law</option>
                  <option value="Family & Matrimonial">Family & Matrimonial</option>
                  <option value="Corporate & Commercial">Corporate & Commercial</option>
                  <option value="Property & Real Estate">Property & Real Estate</option>
                  <option value="Cyber Law & Data Privacy">Cyber Law & Data Privacy</option>
                  <option value="Consumer Protection">Consumer Protection</option>
                  <option value="Labour & Employment">Labour & Employment</option>
                  <option value="Taxation & GST">Taxation & GST</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue text-slate-700 font-medium shadow-subtle"
                >
                  <option value={0}>Any Experience Level</option>
                  <option value={3}>3+ Years Experience</option>
                  <option value={5}>5+ Years Experience</option>
                  <option value={10}>10+ Years Experience</option>
                </select>
              </div>
            </div>

            {/* Quick Practice Area Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Filter:</span>
              {[
                'Criminal Law',
                'Civil Law',
                'Family & Matrimonial',
                'Corporate & Commercial',
                'Property & Real Estate',
                'Cyber Law & Data Privacy',
                'Consumer Protection',
              ].map((area) => (
                <button
                  key={area}
                  onClick={() => setPracticeArea(practiceArea === area ? '' : area)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                    practiceArea === area
                      ? 'bg-legal-blue text-white border-legal-blue shadow-subtle'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {area}
                </button>
              ))}
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
              <div className="animate-spin w-8 h-8 border-4 border-legal-blue border-t-transparent rounded-full mx-auto mb-3" />
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
                const profUserId = prof.user?._id || prof.user || prof._id;
                const sentReq = citizenRequests.find(
                  (r) =>
                    (r.lawyer?._id && (r.lawyer._id === profUserId || r.lawyer._id === prof._id)) ||
                    (r.lawyer && (r.lawyer === profUserId || r.lawyer === prof._id))
                );

                return (
                  <div
                    key={prof._id}
                    className="bg-white p-6 rounded-3xl border border-slate-200/90 hover:border-legal-blue/50 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-4 shadow-subtle"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#0B1F33] text-legal-gold flex items-center justify-center font-extrabold text-sm border border-slate-700 shadow-sm overflow-hidden shrink-0">
                            {prof.avatar ? (
                              <img src={prof.avatar} alt={prof.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{prof.fullName?.charAt(0) || 'L'}</span>
                            )}
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

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {prof.location?.city || 'Delhi'}, {prof.location?.state || 'India'}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <Award className="w-3.5 h-3.5 text-legal-gold" />
                          {prof.experienceYears || 0} yrs exp
                        </span>
                      </div>

                      {/* Action buttons on card */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => openAdvocateProfileModal(prof)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-legal-blue" />
                          <span>View Profile</span>
                        </button>

                        {!isLawyer && (
                          <>
                            {sentReq?.status === 'PENDING' ? (
                              <button
                                disabled
                                className="px-2.5 py-2 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-xl border border-amber-300 opacity-90 cursor-not-allowed text-center"
                              >
                                Request Pending
                              </button>
                            ) : sentReq?.status === 'ACCEPTED' ? (
                              <div className="px-2.5 py-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-300 text-center">
                                ✓ Assigned Advocate
                              </div>
                            ) : sentReq?.status === 'REJECTED' || sentReq?.status === 'DECLINED' ? (
                              <button
                                onClick={() => openConsultModal(prof)}
                                className="px-2.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold rounded-xl border border-red-200 transition text-center"
                              >
                                Re-request
                              </button>
                            ) : (
                              <button
                                onClick={() => openConsultModal(prof)}
                                className="px-2.5 py-2 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-[11px] font-bold rounded-xl shadow transition flex items-center justify-center gap-1"
                              >
                                <Send className="w-3.5 h-3.5 text-legal-gold" />
                                <span>Request Help</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── 4. ANONYMIZED CASE STUDIES VIEW ─────────────────────── */}
      {activeSubTab === 'caseStudies' && (
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

      {/* ── MODAL: ADVOCATE FULL PROFILE & PORTFOLIO ────────────── */}
      {selectedAdvocateProfile && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B1F33] text-legal-gold flex items-center justify-center font-extrabold text-lg border border-slate-700 shadow-sm">
                  {selectedAdvocateProfile.fullName?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedAdvocateProfile.fullName}</h3>
                  <p className="text-xs text-legal-blue font-semibold">{selectedAdvocateProfile.title || 'Advocate on Record'}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAdvocateProfile(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Advocate Details */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">About & Profile</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {selectedAdvocateProfile.bio || 'Advocate handling trial litigation and dispute resolution.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Bar Enrolment</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedAdvocateProfile.barCouncilRegistration?.registrationNumber || 'Registered'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Experience</span>
                  <span className="font-bold text-slate-800">{selectedAdvocateProfile.experienceYears || 0} Years</span>
                </div>
              </div>

              {/* Uploaded Past Experiences */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-legal-blue" />
                  <span>Past Work Experiences ({selectedAdvocateProfile.experiences?.length || 0})</span>
                </h4>
                {!selectedAdvocateProfile.experiences || selectedAdvocateProfile.experiences.length === 0 ? (
                  <p className="text-slate-400 italic">No past experiences listed.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAdvocateProfile.experiences.map((exp, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{exp.role}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {exp.isCurrent ? 'Present' : `${exp.fromYear} - ${exp.toYear}`}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium">{exp.organization} • {exp.location}</p>
                        {exp.description && <p className="text-slate-600 text-[11px]">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Uploaded Case Histories */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-legal-blue" />
                  <span>Case Histories & Precedents ({selectedAdvocateProfile.caseHistories?.length || 0})</span>
                </h4>
                {!selectedAdvocateProfile.caseHistories || selectedAdvocateProfile.caseHistories.length === 0 ? (
                  <p className="text-slate-400 italic">No case histories uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAdvocateProfile.caseHistories.map((ch, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{ch.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{ch.year}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{ch.forum} • {ch.category}</p>
                        <p className="text-slate-600">{ch.summary}</p>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900 text-[11px]">
                          <strong>Outcome: </strong>{ch.outcome}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedAdvocateProfile(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              {!isLawyer && (
                <button
                  onClick={() => {
                    const prof = selectedAdvocateProfile;
                    setSelectedAdvocateProfile(null);
                    openConsultModal(prof);
                  }}
                  className="px-5 py-2.5 bg-legal-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-legal-gold" />
                  <span>Request Consultation for My Case</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CITIZEN REQUEST CONSULTATION ─────────────────── */}
      {consultModalAdvocate && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Request Representation / Consultation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send your case details to <strong className="text-legal-blue">{consultModalAdvocate.fullName}</strong>
                </p>
              </div>
              <button
                onClick={() => setConsultModalAdvocate(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {consultSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Request Sent Successfully!</h4>
                <p className="text-xs text-emerald-700">
                  The advocate will review your case file in their incoming requests and respond promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendConsultation} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Your Case File *
                  </label>
                  {citizenUserCases.length === 0 ? (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                      You have no registered cases. Please file a case first from Case Management or AI Assistant.
                    </div>
                  ) : (
                    <select
                      value={selectedCaseForConsult}
                      onChange={(e) => setSelectedCaseForConsult(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue font-medium"
                    >
                      {citizenUserCases.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.caseNumber || 'CASE'} — {c.title} ({c.category})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Message / Special Instructions for Advocate
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide context on when you need consultation, court hearing dates, or urgency details..."
                    value={consultMessage}
                    onChange={(e) => setConsultMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setConsultModalAdvocate(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingConsult || citizenUserCases.length === 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                  >
                    {sendingConsult ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-legal-gold" />
                        <span>Dispatch Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: REJECT INCOMING REQUEST WITH REASON ───────────── */}
      {rejectModalData && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Decline Client Request</h3>
              <button
                onClick={() => setRejectModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to decline this request for case{' '}
              <strong>{rejectModalData.case?.title || rejectModalData.case?.caseNumber}</strong>?
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason / Note for Client (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Current court schedule full / Outside practice jurisdiction..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectModalData(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRespondToRequest(rejectModalData._id, 'REJECT', rejectionReason)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow"
              >
                Confirm Decline
              </button>
            </div>
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

      {/* ── MODAL: ACCEPT INCOMING REQUEST CONFIRMATION ─────────── */}
      {acceptModalData && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Accept Legal Assistance Request</span>
              </h3>
              <button
                onClick={() => setAcceptModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Accept this legal assistance request? This will add the case to your ongoing cases and establish your formal advocate assignment.
            </p>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <p className="font-bold text-slate-900">{acceptModalData.case?.title || 'Legal Dispute'}</p>
              <p className="text-slate-500 font-mono text-[11px]">Case Number: {acceptModalData.case?.caseNumber || 'N/A'}</p>
              <p className="text-slate-600">
                Complainant: <strong>{acceptModalData.citizen?.email || acceptModalData.case?.user?.email || 'Citizen User'}</strong>
              </p>
              {acceptModalData.requestMessage && (
                <p className="text-slate-500 italic text-[11px] pt-1 border-t border-slate-200">
                  "{acceptModalData.requestMessage}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAcceptModalData(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRespondToRequest(acceptModalData._id, 'ACCEPT')}
                disabled={respondingId === acceptModalData._id}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
              >
                {respondingId === acceptModalData._id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Confirm & Accept Case</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ONGOING CASE DOSSIER ─────────────────────────── */}
      {selectedOngoingCase && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-legal-blue bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {selectedOngoingCase.caseNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedOngoingCase.title}</h3>
              </div>
              <button
                onClick={() => setSelectedOngoingCase(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Domain</span>
                  <span className="font-bold text-slate-800">{selectedOngoingCase.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-bold text-emerald-700">{selectedOngoingCase.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Urgency</span>
                  <span className="font-bold text-red-600">{selectedOngoingCase.urgency}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Issue Under Dispute</h4>
                <p className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed text-slate-700">
                  {selectedOngoingCase.issue}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Detailed Case Narrative</h4>
                <p className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed text-slate-700">
                  {selectedOngoingCase.description}
                </p>
              </div>

              {selectedOngoingCase.financialDetails?.disputedAmount > 0 && (
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <span className="font-bold text-slate-700">Disputed Financial Quantum:</span>
                  <span className="font-bold text-base font-mono text-legal-blue">
                    ₹{Number(selectedOngoingCase.financialDetails.disputedAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedOngoingCase(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow hover:bg-slate-800 transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

