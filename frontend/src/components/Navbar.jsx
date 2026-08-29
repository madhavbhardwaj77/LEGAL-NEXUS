import React from 'react';
import {
  Scale,
  LogOut,
  LogIn,
  Menu,
  X,
  Search,
  Sparkles,
  ShieldCheck,
  Bell,
  User,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  isMobileOpen,
  onToggleMobileMenu,
  showToggle,
  activeTab = 'landing',
  onSelectTab,
  onOpenSearch,
}) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'cases':
        return 'Case Management & Intake';
      case 'intake':
        return 'AI Legal Assistant & Workspace';
      case 'documents':
        return 'Document Intelligence & Clause Audit';
      case 'drafts':
        return 'Smart Statutory Drafting Engine';
      case 'research':
        return 'Statutory Legal Search';
      case 'lawyers':
        return 'Verified Advocate Ecosystem';
      case 'profile':
        return 'User Profile & Network Hub';
      case 'settings':
        return 'Platform Settings';
      case 'system':
        return 'System Infrastructure Monitor';
      default:
        return 'Legal Intelligence Platform';
    }
  };

  return (
    <header className="bg-[#0B1F33] border-b border-slate-800 text-white h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md backdrop-blur-md">
      {/* Left: Branding & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div
          onClick={() => onSelectTab && onSelectTab('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-legal-blue to-sky-400 p-2 text-white shadow-md shadow-legal-blue/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white block">
                Legal Nexus
              </span>
              <span className="text-[9px] font-bold text-legal-gold bg-legal-gold/10 px-1.5 py-0.5 rounded border border-legal-gold/20 tracking-wider uppercase">
                AI Legal
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Enterprise Legal AI Platform</p>
          </div>
        </div>

        {/* Section Breadcrumb (Visible when not on landing) */}
        {activeTab !== 'landing' && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pl-4 border-l border-slate-800">
            <span
              onClick={() => onSelectTab && onSelectTab('landing')}
              className="hover:text-slate-200 cursor-pointer transition"
            >
              Platform
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200 font-semibold truncate max-w-xs">
              {getTabTitle(activeTab)}
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Search Shortcut */}
        {activeTab !== 'landing' && (
          <button
            onClick={() => onSelectTab && onSelectTab('research')}
            title="Search Indian statutory laws"
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-xl border border-slate-700 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search statutes & precedents...</span>
          </button>
        )}

        {/* User Actions */}
        {user ? (
          <div className="flex items-center gap-2 bg-slate-800/90 pl-3 pr-1.5 py-1 rounded-xl border border-slate-700 shadow-sm">
            <div className="flex flex-col text-right pr-1">
              <span
                className="text-xs font-bold text-white truncate max-w-[130px]"
                title={user.email}
              >
                {user.profileData?.fullName || user.email.split('@')[0]}
              </span>
              <span className="text-[9px] font-extrabold text-legal-gold uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            <button
              onClick={() => onSelectTab && onSelectTab('profile')}
              title="View Profile & Network"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <User className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab && onSelectTab('login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-legal-gold" />
              Sign In
            </button>
            <button
              onClick={() => onSelectTab && onSelectTab('signup')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl shadow-md shadow-legal-blue/20 transition transform active:scale-95"
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        {showToggle && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>
    </header>
  );
}
