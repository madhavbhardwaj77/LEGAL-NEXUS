import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Users,
  BadgeCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Activity,
  Search,
  Filter,
  BarChart3,
  Scale,
  Award,
  BookOpen,
  FolderLock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard({ user, onSelectTab }) {
  const [adminTab, setAdminTab] = useState('verifications'); // 'overview' | 'verifications' | 'users' | 'audit'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Verifications State
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [verificationFilter, setVerificationFilter] = useState('PENDING');
  const [expandedReqId, setExpandedReqId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadStats();
    loadRequests();
  }, [verificationFilter]);

  useEffect(() => {
    if (adminTab === 'users') {
      loadUsers();
    } else if (adminTab === 'audit') {
      loadAuditLogs();
    } else if (adminTab === 'overview') {
      loadStats();
    }
  }, [adminTab, userRoleFilter]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/verification/requests', { params: { status: verificationFilter, limit: 50 } });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Failed to load verification requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = { limit: 50 };
      if (userRoleFilter) params.role = userRoleFilter;
      const res = await api.get('/users', { params });
      setUsersList(res.data.data?.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await api.get('/admin/audit-logs', { params: { limit: 50 } });
      setAuditLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      setReviewingId(id);
      await api.patch(`/verification/requests/${id}`, {
        status,
        reviewNotes,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      });
      setToast({
        type: status === 'VERIFIED' ? 'success' : 'error',
        message: `Request ${status === 'VERIFIED' ? 'Approved & Advocate Verified ✅' : 'Rejected ❌'}`,
      });
      setExpandedReqId(null);
      setReviewNotes('');
      setRejectionReason('');
      loadRequests();
      loadStats();
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Action failed. Try again.' });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setReviewingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      PENDING:   { color: 'bg-amber-50 text-amber-800 border-amber-200', icon: <Clock className="w-3 h-3" />, label: 'Pending Review' },
      IN_REVIEW: { color: 'bg-blue-50 text-blue-800 border-blue-200', icon: <RefreshCw className="w-3 h-3" />, label: 'Under Review' },
      VERIFIED:  { color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Verified' },
      REJECTED:  { color: 'bg-red-50 text-red-800 border-red-200', icon: <XCircle className="w-3 h-3" />, label: 'Rejected' },
    };
    const s = map[status] || map.PENDING;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${s.color}`}>
        {s.icon}
        {s.label}
      </span>
    );
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* ── Admin Command Header ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#071422] via-[#0B1F33] to-[#112d4e] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                👑 Super Admin Console
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {user?.email}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Legal Nexus Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time oversight for Advocate Bar ID verification, ecosystem user management, judicial cases, and compliance audit logs.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Pending Bar Verifications</div>
              <div className="text-lg font-extrabold text-white flex items-center gap-1.5">
                <span>{stats?.pendingVerifications ?? '...'}</span>
                <span className="text-[11px] font-normal text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                  Needs Review
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Metric Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle hover:shadow-card-hover transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Registered Users</span>
            <div className="p-2 rounded-xl bg-blue-50 text-legal-blue">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats?.totalUsers ?? '...'}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Citizens, Advocates & Scholars</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle hover:shadow-card-hover transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Pending Verifications</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            {stats?.pendingVerifications ?? '...'}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
            <span>Bar Registration queue</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle hover:shadow-card-hover transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Cases</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats?.openCases ?? '...'}
            <span className="text-xs text-slate-400 font-normal ml-1">/ {stats?.totalCases ?? '0'}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Intake & active litigation</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle hover:shadow-card-hover transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Legal Documents Processed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats?.totalDocuments ?? '...'}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <span>Statutory AI corpus ready</span>
          </div>
        </div>
      </div>

      {/* ── Admin Navigation Tabs ────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-semibold flex-wrap">
        {[
          { id: 'verifications', label: 'Bar ID Verifications', icon: ShieldCheck, badge: stats?.pendingVerifications },
          { id: 'users',         label: 'User Directory',       icon: Users,       badge: stats?.totalUsers },
          { id: 'overview',      label: 'Analytics & Insights', icon: BarChart3,   badge: null },
          { id: 'audit',         label: 'Security & Audit Logs',icon: Activity,    badge: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                active
                  ? 'bg-gradient-to-r from-legal-blue to-blue-700 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== null && tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    active ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: BAR ID VERIFICATIONS ───────────────────────────────── */}
      {adminTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center gap-2 flex-wrap">
              {['PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setVerificationFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    verificationFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
            <button
              onClick={loadRequests}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-legal-blue flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {loadingRequests ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle">
              <RefreshCw className="animate-spin w-8 h-8 text-legal-blue mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Fetching verification requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
              <BadgeCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No {verificationFilter.toLowerCase()} requests</h3>
              <p className="text-xs text-slate-500">All submissions in this queue have been processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const isExpanded = expandedReqId === req._id;
                const data = req.submittedData || {};
                return (
                  <div
                    key={req._id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle hover:border-slate-300 transition overflow-hidden"
                  >
                    <div
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition select-none"
                      onClick={() => setExpandedReqId(isExpanded ? null : req._id)}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#0B1F33] text-legal-gold flex items-center justify-center font-black text-sm border border-slate-700 shadow-sm">
                          {data.fullName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{data.fullName || 'Advocate'}</h4>
                            <span className="text-[10px] font-extrabold bg-blue-50 text-legal-blue px-2 py-0.5 rounded border border-blue-200">
                              {req.requestedRole}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {req.professional?.email} · {data.stateBarCouncil || 'Bar Council of India'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-mono font-bold text-slate-800 block">
                            {data.barRegistrationNumber || '—'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(req.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {statusBadge(req.status)}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 p-6 space-y-5 bg-slate-50/50 animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Submitted Details */}
                          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                            <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                              <Award className="w-4 h-4 text-legal-gold" />
                              <span>Bar Council Registration Details</span>
                            </p>
                            <div className="space-y-1.5 text-slate-600">
                              <p>
                                <span className="font-semibold text-slate-800">Advocate Name:</span> {data.fullName || '—'}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-800">Bar Registration No:</span>{' '}
                                <span className="font-mono font-bold text-legal-blue bg-blue-50 px-2 py-0.5 rounded">
                                  {data.barRegistrationNumber || '—'}
                                </span>
                              </p>
                              <p>
                                <span className="font-semibold text-slate-800">State Bar Council:</span>{' '}
                                {data.stateBarCouncil || '—'}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-800">Year of Enrollment:</span>{' '}
                                {data.enrollmentYear || '—'}
                              </p>
                              {data.institutionName && (
                                <p>
                                  <span className="font-semibold text-slate-800">Law School / Institution:</span>{' '}
                                  {data.institutionName}
                                </p>
                              )}
                              {data.additionalNotes && (
                                <p className="pt-1.5 border-t border-slate-100 text-slate-500 italic">
                                  "{data.additionalNotes}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Account Record */}
                          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                            <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                              <User className="w-4 h-4 text-legal-blue" />
                              <span>Account & Submission Timeline</span>
                            </p>
                            <div className="space-y-1.5 text-slate-600">
                              <p>
                                <span className="font-semibold text-slate-800">Account Email:</span>{' '}
                                {req.professional?.email || '—'}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-800">Phone Number:</span>{' '}
                                {req.professional?.phone || '—'}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-800">Submission Timestamp:</span>{' '}
                                {new Date(req.createdAt).toLocaleString('en-IN')}
                              </p>
                              {req.reviewedAt && (
                                <p>
                                  <span className="font-semibold text-slate-800">Review Completed:</span>{' '}
                                  {new Date(req.reviewedAt).toLocaleString('en-IN')}
                                </p>
                              )}
                              {req.reviewNotes && (
                                <p>
                                  <span className="font-semibold text-slate-800">Admin Notes:</span> {req.reviewNotes}
                                </p>
                              )}
                              {req.rejectionReason && (
                                <p className="text-rose-700 font-medium">
                                  <span className="font-semibold">Rejection Cause:</span> {req.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons for Pending / In Review */}
                        {(req.status === 'PENDING' || req.status === 'IN_REVIEW') && (
                          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                            <p className="text-xs font-bold text-slate-800">Review Decision & Status Update</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Optional internal review notes..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-legal-blue"
                              />
                              <input
                                type="text"
                                placeholder="Rejection reason (mandatory if rejecting)..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                              />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <button
                                onClick={() => handleReview(req._id, 'VERIFIED')}
                                disabled={reviewingId === req._id}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-md disabled:opacity-60"
                              >
                                {reviewingId === req._id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4" />
                                )}
                                <span>Approve & Grant Verified Status</span>
                              </button>
                              <button
                                onClick={() => handleReview(req._id, 'REJECTED')}
                                disabled={reviewingId === req._id || !rejectionReason.trim()}
                                className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-md disabled:opacity-60"
                              >
                                {reviewingId === req._id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ShieldAlert className="w-4 h-4" />
                                )}
                                <span>Reject Request</span>
                              </button>
                            </div>
                            {req.status === 'PENDING' && (
                              <button
                                onClick={() => handleReview(req._id, 'IN_REVIEW')}
                                disabled={reviewingId === req._id}
                                className="w-full py-2 text-xs text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-2xl font-semibold transition"
                              >
                                Mark as In Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: USER DIRECTORY ─────────────────────────────────────── */}
      {adminTab === 'users' && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search user by email or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-legal-blue"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-legal-blue"
              >
                <option value="">All Roles</option>
                <option value="CITIZEN">Citizens</option>
                <option value="LAWYER">Advocates</option>
                <option value="LAW_STUDENT">Law Students</option>
                <option value="ADMIN">Admins</option>
              </select>
              <button
                onClick={loadUsers}
                className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <div className="text-center py-16">
              <RefreshCw className="animate-spin w-8 h-8 text-legal-blue mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading platform user directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No users found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold bg-slate-50/50">
                    <th className="py-3 px-4 rounded-l-2xl">User Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 rounded-r-2xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                          {u.email?.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Unverified</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {u.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ANALYTICS & INSIGHTS ───────────────────────────────── */}
      {adminTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* User Role Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-legal-blue" />
              <span>User Base Distribution by Role</span>
            </h3>
            <div className="space-y-2.5 pt-2">
              {stats?.usersByRole?.map((r) => (
                <div key={r._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{r._id}</span>
                  <span className="font-black text-legal-blue bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                    {r.count} users
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Case Categories Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Active Case Categories</span>
            </h3>
            <div className="space-y-2.5 pt-2">
              {stats?.casesByCategory?.length > 0 ? (
                stats.casesByCategory.map((c) => (
                  <div key={c._id || 'other'} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{c._id || 'Uncategorized'}</span>
                    <span className="font-black text-purple-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      {c.count} cases
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">No cases created yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: AUDIT & SECURITY LOGS ──────────────────────────────── */}
      {adminTab === 'audit' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-legal-blue" />
              <span>Immutable System Audit Trail</span>
            </h3>
            <button
              onClick={loadAuditLogs}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-legal-blue flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          {loadingLogs ? (
            <div className="text-center py-16">
              <RefreshCw className="animate-spin w-8 h-8 text-legal-blue mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Fetching audit trail...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No audit logs captured yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-slate-700 font-medium">
                      Resource: <span className="font-semibold text-slate-900">{log.resource}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="font-mono">{log.ipAddress || '127.0.0.1'}</span>
                    <span>{new Date(log.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
