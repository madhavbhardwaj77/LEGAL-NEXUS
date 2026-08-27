import React from 'react';
import { Scale, LogOut, LogIn, Menu, X } from 'lucide-react';

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  isMobileOpen,
  onToggleMobileMenu,
  showToggle,
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Branding */}
      <div className="flex items-center space-x-3">
        <div className="bg-nyaya-600 p-2 rounded-2xl text-white shadow-md">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white block">Legal Nexus</span>
          <p className="text-[10px] text-slate-400 font-medium">Legal AI Platform</p>
        </div>
      </div>

      {/* User Actions & Toggle */}
      <div className="flex items-center space-x-3">
        {user ? (
          <div className="flex items-center space-x-3 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-white truncate max-w-[140px]" title={user.email}>
                {user.email}
              </span>
              <span className="text-[9px] text-nyaya-400 font-bold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-nyaya-600 hover:bg-nyaya-700 text-white rounded-xl shadow transition"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        )}

        {showToggle && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
          >
            {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}
      </div>
    </header>
  );
}
