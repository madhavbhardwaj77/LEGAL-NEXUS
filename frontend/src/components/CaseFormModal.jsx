import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
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
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-nyaya-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">File a New Legal Case</h3>
            <p className="text-xs text-slate-300">Structured Case Intake Form</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Case Title / Subject
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unpaid Salary Dispute against Tech Solutions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              >
                <option value="Employment">Employment & Labor</option>
                <option value="Property & Real Estate">Property & Real Estate</option>
                <option value="Consumer Dispute">Consumer Dispute</option>
                <option value="Family & Matrimonial">Family & Matrimonial</option>
                <option value="Criminal Law">Criminal Law</option>
                <option value="Civil Litigation">Civil Litigation</option>
                <option value="Corporate & Commercial">Corporate & Commercial</option>
                <option value="Cyber Law & Data Privacy">Cyber Law</option>
                <option value="Banking & Financial Dispute">Banking & Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Primary Issue
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unpaid Salary for 3 months"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Case Narrative & Facts
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what happened chronologically: dates of joining, agreed compensation, when the default happened, communications with employer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Name (Plaintiff)
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={plaintiffName}
                onChange={(e) => setPlaintiffName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Opposite Party / Organization (Defendant)
              </label>
              <input
                type="text"
                placeholder="e.g. Tech Solutions Pvt Ltd"
                value={defendantOrg}
                onChange={(e) => setDefendantOrg(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Disputed Amount (INR) (Optional)
            </label>
            <input
              type="number"
              placeholder="e.g. 150000"
              value={disputedAmount}
              onChange={(e) => setDisputedAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-nyaya-600 hover:bg-nyaya-700 text-white font-medium rounded-lg shadow transition disabled:opacity-50"
            >
              {loading ? 'Filing Case...' : 'Submit Case Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
