import React, { useState } from 'react';
import { X, AlertCircle, PlusCircle, Scale, ShieldCheck, DollarSign, Building2, MapPin, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function CaseFormModal({ isOpen, onClose, onCaseCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Employment');
  const [issue, setIssue] = useState('Unpaid Salary');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Delhi');
  const [state, setState] = useState('Delhi');
  const [urgency, setUrgency] = useState('HIGH');
  const [plaintiffName, setPlaintiffName] = useState('');
  const [defendantOrg, setDefendantOrg] = useState('');
  const [disputedAmount, setDisputedAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setTitle('');
    setCategory('Employment');
    setIssue('');
    setDescription('');
    setCity('Delhi');
    setState('Delhi');
    setUrgency('HIGH');
    setPlaintiffName('');
    setDefendantOrg('');
    setDisputedAmount('');
    setError(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: title || `${category}: ${issue}`,
        category,
        issue,
        description,
        location: { city, state },
        urgency,
        parties: {
          plaintiff: { name: plaintiffName },
          defendant: { organization: defendantOrg },
        },
        financialDetails: {
          disputedAmount: disputedAmount ? parseFloat(disputedAmount) : 0,
          currency: 'INR',
        },
      };

      const res = await api.post('/cases', payload);
      onCaseCreated(res.data.data);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#0B1F33] text-white flex justify-between items-center shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-legal-blue to-sky-400 rounded-xl text-white shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                File a New Legal Case
                <span className="text-[10px] font-bold text-legal-gold bg-legal-gold/15 px-2 py-0.5 rounded uppercase">
                  Intake
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Structured Pleading & Case Dossier Registration</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-800 rounded-2xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Case Title / Subject
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unpaid Salary Dispute against Tech Solutions Pvt Ltd"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dispute Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none text-slate-800"
              >
                <option value="Employment">Employment & Labor</option>
                <option value="Property & Real Estate">Property & Tenancy</option>
                <option value="Consumer Dispute">Consumer Dispute</option>
                <option value="Family & Matrimonial">Family & Matrimonial</option>
                <option value="Criminal Law">Criminal Law</option>
                <option value="Civil Litigation">Civil Litigation</option>
                <option value="Corporate & Commercial">Corporate & Commercial</option>
                <option value="Cyber Law & Data Privacy">Cyber Law & IT Act</option>
                <option value="Banking & Financial Dispute">Banking & Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Issue / Claim
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unpaid Salary for 3 months"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Case Narrative & Chronological Facts
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what happened: agreed terms, dates of default, communications exchanged, and remedy sought..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none resize-none leading-relaxed"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Complainant / Plaintiff Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={plaintiffName}
                onChange={(e) => setPlaintiffName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Opposite Party / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Tech Solutions Pvt Ltd"
                value={defendantOrg}
                onChange={(e) => setDefendantOrg(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none text-slate-800"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Disputed Financial Quantum (INR)
            </label>
            <div className="relative">
              <span className="text-slate-400 absolute left-3.5 top-2.5 text-xs font-bold font-mono">₹</span>
              <input
                type="number"
                placeholder="150000"
                value={disputedAmount}
                onChange={(e) => setDisputedAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-legal-blue focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Filing Case...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-legal-gold" />
                  <span>Submit Formal Case Intake</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
