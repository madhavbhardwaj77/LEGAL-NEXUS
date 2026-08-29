import React, { useState } from 'react';
import { Scale, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, CheckCircle2, User, KeyRound } from 'lucide-react';
import api from '../services/api';

export default function LoginPage({ onAuthSuccess, onNavigateToSignup, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { user, tokens } = res.data.data;
      localStorage.setItem('nyaya_access_token', tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem('nyaya_refresh_token', tokens.refreshToken);
      }

      onAuthSuccess(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('citizen@example.com');
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card max-w-md w-full p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-legal-blue to-sky-400 p-2.5 text-white mx-auto shadow-md shadow-legal-blue/20 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign In to Legal Nexus</h1>
          <p className="text-xs text-slate-500">
            Access your case dossiers, AI drafting tools, and verified legal network
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue focus:bg-white transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-[11px] text-legal-blue hover:underline font-bold"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-blue focus:bg-white transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4 text-legal-gold" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Quick test demo account:</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] text-legal-blue font-bold hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition"
          >
            Auto-fill Citizen Demo
          </button>
        </div>

        {/* Switch to Signup */}
        <div className="text-center pt-2 text-xs text-slate-500">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="text-legal-blue font-bold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
