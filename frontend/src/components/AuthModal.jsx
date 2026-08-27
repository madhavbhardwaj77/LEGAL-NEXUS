import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, Briefcase, GraduationCap } from 'lucide-react';
import api from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [practiceAreas, setPracticeAreas] = useState('Employment, Consumer');
  const [barNumber, setBarNumber] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        const profileData = { fullName };
        if (role === 'LAWYER' || role === 'LAW_STUDENT') {
          profileData.practiceAreas = practiceAreas.split(',').map((s) => s.trim());
          if (barNumber) {
            profileData.barCouncilRegistration = { registrationNumber: barNumber };
          }
        }

        const res = await api.post('/auth/signup', {
          email,
          password,
          role,
          phone,
          profileData,
        });

        localStorage.setItem('nyaya_access_token', res.data.data.tokens.accessToken);
        localStorage.setItem('nyaya_refresh_token', res.data.data.tokens.refreshToken);
        onAuthSuccess(res.data.data.user);
        onClose();
      } else {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('nyaya_access_token', res.data.data.tokens.accessToken);
        localStorage.setItem('nyaya_refresh_token', res.data.data.tokens.refreshToken);
        onAuthSuccess(res.data.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-nyaya-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">
              {isSignup ? 'Create Nyaya Setu Account' : 'Sign in to Nyaya Setu'}
            </h3>
            <p className="text-xs text-slate-300">Access justice ecosystem services</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {isSignup && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CITIZEN', label: 'Citizen', icon: User },
                  { id: 'LAWYER', label: 'Advocate', icon: Briefcase },
                  { id: 'LAW_STUDENT', label: 'Student', icon: GraduationCap },
                ].map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition ${
                        active
                          ? 'border-nyaya-600 bg-nyaya-50 text-nyaya-800 font-semibold ring-1 ring-nyaya-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-nyaya-600' : 'text-slate-500'}`} />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adv. Rajesh Kumar"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              />
            </div>
          </div>

          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {isSignup && (role === 'LAWYER' || role === 'LAW_STUDENT') && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {role === 'LAWYER' ? 'Bar Registration / Roll No' : 'Student Roll No / Institution'}
              </label>
              <input
                type="text"
                value={barNumber}
                onChange={(e) => setBarNumber(e.target.value)}
                placeholder={role === 'LAWYER' ? 'e.g. D/1234/2018' : 'e.g. Faculty of Law, DU'}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-nyaya-600 hover:bg-nyaya-700 text-white rounded-lg font-medium text-sm shadow transition duration-150 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
              }}
              className="text-xs text-nyaya-600 hover:underline font-medium"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Register here"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
