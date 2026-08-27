import React from 'react';
import { Scale, ShieldCheck, UserCheck, LogOut, LogIn, Activity, Briefcase } from 'lucide-react';

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  healthStatus,
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('cases')}>
            <div className="bg-nyaya-600 p-2 rounded-lg text-white shadow">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Nyaya Setu <span className="text-xs bg-nyaya-700 text-nyaya-100 font-semibold px-2 py-0.5 rounded-full">न्याय सेतु</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Bridge to Justice Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'cases'
                  ? 'bg-nyaya-700 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Cases & Timeline
              </span>
            </button>

            <button
              onClick={() => setActiveTab('lawyers')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'lawyers'
                  ? 'bg-nyaya-700 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Legal Directory
              </span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'system'
                  ? 'bg-nyaya-700 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                System Health
                {healthStatus?.status === 'OPERATIONAL' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </span>
            </button>
          </nav>

          {/* Right Action / Profile */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-medium text-white truncate max-w-[150px]">
                    {user.email}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-nyaya-500">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-1 text-slate-400 hover:text-red-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-nyaya-600 hover:bg-nyaya-700 text-white rounded-lg shadow transition"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
