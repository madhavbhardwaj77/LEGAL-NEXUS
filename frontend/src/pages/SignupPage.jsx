import React, { useState } from 'react';
import { Scale, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, User, Phone, MapPin, Award, GraduationCap, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function SignupPage({ onAuthSuccess, onNavigateToLogin }) {
  const [role, setRole] = useState('CITIZEN'); // CITIZEN | LAWYER | LAW_STUDENT
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [barRegNumber, setBarRegNumber] = useState('');
  const [institution, setInstitution] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password,
        role,
        phone,
        profileData: {
          fullName,
          location: { city, state },
          ...(role === 'LAWYER' && {
            barCouncilRegistration: { registrationNumber: barRegNumber },
          }),
          ...(role === 'LAW_STUDENT' && {
            lawStudentDetails: { institution },
          }),
        },
      };

      const res = await api.post('/auth/signup', payload);
      const { user, tokens } = res.data.data;
      localStorage.setItem('nyaya_access_token', tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem('nyaya_refresh_token', tokens.refreshToken);
      }

      onAuthSuccess(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card max-w-xl w-full p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-legal-blue to-sky-400 p-2.5 text-white mx-auto shadow-md shadow-legal-blue/20 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Legal Nexus Account</h1>
          <p className="text-xs text-slate-500">
            Select your account type to access specialized legal intelligence workspaces
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
          {[
            { id: 'CITIZEN', label: 'Citizen', desc: 'Case navigation & notices', icon: User },
            { id: 'LAWYER', label: 'Advocate', desc: 'Case briefs & directory', icon: Award },
            { id: 'LAW_STUDENT', label: 'Law Student', desc: 'Research & clinic', icon: GraduationCap },
          ].map((r) => {
            const Icon = r.icon;
            const active = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`py-2.5 px-3 rounded-xl transition flex flex-col items-center gap-1 ${
                  active
                    ? 'bg-white text-legal-blue font-bold shadow-subtle border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue focus:bg-white transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue focus:bg-white transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue focus:bg-white transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue focus:bg-white transition"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Delhi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Delhi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue focus:bg-white transition"
              />
            </div>
          </div>

          {/* Conditional Role-Specific Fields */}
          {role === 'LAWYER' && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in">
              <label className="block text-[11px] font-bold text-legal-blue uppercase tracking-wider">
                Bar Council Enrolment Number
              </label>
              <input
                type="text"
                required
                value={barRegNumber}
                onChange={(e) => setBarRegNumber(e.target.value)}
                placeholder="e.g. D/1234/2020"
                className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue"
              />
            </div>
          )}

          {role === 'LAW_STUDENT' && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in">
              <label className="block text-[11px] font-bold text-legal-blue uppercase tracking-wider">
                Law College / University Institution
              </label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Faculty of Law, University of Delhi"
                className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4 text-legal-gold" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-2 text-xs text-slate-500">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-legal-blue font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
