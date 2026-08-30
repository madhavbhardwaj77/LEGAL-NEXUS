import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  BadgeCheck,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../services/api';

export default function AdminVerificationPanel({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [expandedId, setExpandedId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/verification/requests', { params: { status: statusFilter, limit: 50 } });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Failed to load verification requests:', err);
    } finally {
      setLoading(false);
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
      setToast({ type: status === 'VERIFIED' ? 'success' : 'error', message: `Request ${status === 'VERIFIED' ? 'Approved ✅' : 'Rejected ❌'}` });
      setExpandedId(null);
      setReviewNotes('');
      setRejectionReason('');
      loadRequests();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Action failed. Try again.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setReviewingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      PENDING:   { color: 'bg-yellow-50 text-yellow-800 border-yellow-200', icon: <Clock className="w-3 h-3" />, label: 'Pending' },
      IN_REVIEW: { color: 'bg-blue-50 text-blue-800 border-blue-200', icon: <RefreshCw className="w-3 h-3" />, label: 'In Review' },
      VERIFIED:  { color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Verified' },
      REJECTED:  { color: 'bg-red-50 text-red-800 border-red-200', icon: <XCircle className="w-3 h-3" />, label: 'Rejected' },
    };
    const s = map[status] || map.PENDING;
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${s.color}`}>
        {s.icon}{s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold text-white animate-in fade-in ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="bg-[#0B1F33] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-legal">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-0.5 bg-legal-blue/20 text-sky-300 border border-legal-blue/30 text-[10px] font-bold rounded-full uppercase tracking-wider">Admin Panel</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Bar Council Verification Requests</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">Review submitted Bar Registration Numbers and approve or reject lawyer verification requests.</p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-semibold flex-wrap">
        {['PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-xl transition text-xs ${statusFilter === s ? 'bg-legal-blue text-white shadow-subtle' : 'text-slate-600 hover:bg-slate-100'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
        <button onClick={loadRequests} className="ml-auto px-3 py-2 text-xs text-slate-500 hover:text-legal-blue flex items-center gap-1 hover:bg-slate-100 rounded-xl transition">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle">
          <RefreshCw className="animate-spin w-8 h-8 text-legal-blue mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading verification requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
          <BadgeCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No {statusFilter.toLowerCase()} requests</h3>
          <p className="text-xs text-slate-500">All caught up! No requests match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const isExpanded = expandedId === req._id;
            const data = req.submittedData || {};
            return (
              <div key={req._id} className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
                <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition" onClick={() => setExpandedId(isExpanded ? null : req._id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0B1F33] text-legal-gold flex items-center justify-center font-extrabold text-sm border border-slate-700">
                      {data.fullName?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{data.fullName || 'Unknown Lawyer'}</p>
                      <p className="text-xs text-slate-500">{req.professional?.email} · {req.requestedRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(req.status)}
                    <span className="text-xs text-slate-400 hidden sm:block">{new Date(req.createdAt).toLocaleDateString('en-IN')}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-5 bg-slate-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                        <p className="font-bold text-slate-700 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-legal-blue" /> Submitted Details</p>
                        <div className="space-y-1.5 text-slate-600">
                          <p><span className="font-semibold text-slate-800">Full Name:</span> {data.fullName || 'N/A'}</p>
                          <p><span className="font-semibold text-slate-800">Bar Reg. No.:</span> <span className="font-mono font-bold text-legal-blue">{data.barRegistrationNumber || 'N/A'}</span></p>
                          <p><span className="font-semibold text-slate-800">State Bar Council:</span> {data.stateBarCouncil || 'N/A'}</p>
                          <p><span className="font-semibold text-slate-800">Enrollment Year:</span> {data.enrollmentYear || 'N/A'}</p>
                          {data.institutionName && <p><span className="font-semibold text-slate-800">Institution:</span> {data.institutionName}</p>}
                          {data.additionalNotes && <p><span className="font-semibold text-slate-800">Notes:</span> {data.additionalNotes}</p>}
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                        <p className="font-bold text-slate-700 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-legal-blue" /> Account Info</p>
                        <div className="space-y-1.5 text-slate-600">
                          <p><span className="font-semibold text-slate-800">Email:</span> {req.professional?.email || 'N/A'}</p>
                          <p><span className="font-semibold text-slate-800">Role:</span> {req.requestedRole}</p>
                          <p><span className="font-semibold text-slate-800">Submitted:</span> {new Date(req.createdAt).toLocaleString('en-IN')}</p>
                          {req.reviewedAt && <p><span className="font-semibold text-slate-800">Reviewed:</span> {new Date(req.reviewedAt).toLocaleString('en-IN')}</p>}
                          {req.reviewNotes && <p><span className="font-semibold text-slate-800">Review Notes:</span> {req.reviewNotes}</p>}
                          {req.rejectionReason && <p className="text-red-700"><span className="font-semibold">Rejection Reason:</span> {req.rejectionReason}</p>}
                        </div>
                      </div>
                    </div>

                    {(req.status === 'PENDING' || req.status === 'IN_REVIEW') && (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                        <p className="text-xs font-bold text-slate-700">Review Action</p>
                        <input type="text" placeholder="Review notes (optional)..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-legal-blue" />
                        <input type="text" placeholder="Rejection reason (required if rejecting)..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-400" />
                        <div className="flex gap-3">
                          <button onClick={() => handleReview(req._id, 'VERIFIED')} disabled={reviewingId === req._id} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow disabled:opacity-60">
                            {reviewingId === req._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            Approve & Verify
                          </button>
                          <button onClick={() => handleReview(req._id, 'REJECTED')} disabled={reviewingId === req._id || !rejectionReason.trim()} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow disabled:opacity-60">
                            {reviewingId === req._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                            Reject
                          </button>
                        </div>
                        {req.status === 'PENDING' && (
                          <button onClick={() => handleReview(req._id, 'IN_REVIEW')} disabled={reviewingId === req._id} className="w-full py-2 text-xs text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-2xl font-semibold transition">
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
  );
}
