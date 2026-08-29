import React from 'react';
import {
  LayoutDashboard,
  Bot,
  FileText,
  PenTool,
  BookOpen,
  UserCheck,
  Users,
  Activity,
  Settings,
  Scale,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Award,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  user,
  onLogout,
  onOpenAuth,
  collapsed = false,
  onToggleCollapse,
}) {
  const mainWorkspaceItems = [
    {
      id: 'cases',
      label: 'Case Management',
      shortLabel: 'Cases',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'intake',
      label: 'AI Legal Assistant',
      shortLabel: 'AI Chat',
      icon: Bot,
      badge: 'Agentic',
      highlight: true,
    },
    {
      id: 'documents',
      label: 'Document Intelligence',
      shortLabel: 'Doc AI',
      icon: FileText,
      badge: 'Audit',
    },
    {
      id: 'drafts',
      label: 'Smart Legal Drafting',
      shortLabel: 'Drafting',
      icon: PenTool,
      badge: '7 Forms',
    },
    {
      id: 'research',
      label: 'Statutory Research',
      shortLabel: 'Research',
      icon: BookOpen,
      badge: 'RAG',
    },
    {
      id: 'lawyers',
      label: 'Advocate Directory',
      shortLabel: 'Lawyers',
      icon: UserCheck,
      badge: 'Verified',
    },
  ];

  const secondaryItems = [
    {
      id: 'profile',
      label: 'Profile & Network',
      shortLabel: 'Profile',
      icon: Users,
      requireAuth: true,
    },
    {
      id: 'settings',
      label: 'Platform Settings',
      shortLabel: 'Settings',
      icon: Settings,
    },
    {
      id: 'system',
      label: 'System Status',
      shortLabel: 'System',
      icon: Activity,
      requireRole: ['LAWYER', 'ADMIN', 'LAW_STUDENT'],
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#0B1F33] text-slate-300 border-r border-slate-800 shrink-0 transition-all duration-300 select-none relative z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Sidebar Header & Collapse toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-legal-blue to-sky-400 flex items-center justify-center text-white shadow-md shadow-legal-blue/20 shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Legal Nexus
                <span className="w-1.5 h-1.5 rounded-full bg-legal-gold"></span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Enterprise Legal AI</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-xl bg-gradient-to-tr from-legal-blue to-sky-400 flex items-center justify-center text-white shadow-md">
            <Scale className="w-4 h-4" />
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 dark-scrollbar">
        {/* Core Workspace Section */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Core Legal Workspace
            </div>
          )}

          {mainWorkspaceItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group ${
                  active
                    ? 'bg-legal-blue text-white shadow-md shadow-legal-blue/25 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-800/60 text-slate-400 group-hover:text-white group-hover:bg-slate-700/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border tracking-wider ${
                          active
                            ? 'bg-white/20 text-white border-white/20'
                            : item.highlight
                            ? 'bg-legal-gold/20 text-legal-gold border-legal-gold/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Left Active indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-legal-gold rounded-r-full"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Management & Ecosystem */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Account & Ecosystem
            </div>
          )}

          {secondaryItems.map((item) => {
            if (item.requireAuth && !user) return null;
            if (item.requireRole && (!user || !item.requireRole.includes(user.role))) return null;

            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group ${
                  active
                    ? 'bg-legal-blue text-white shadow-md font-bold'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-800/60 text-slate-400 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!collapsed && <span className="truncate">{item.label}</span>}

                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-legal-gold rounded-r-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Profile Snapshot & Sign In / Out */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        {user ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-legal-gold font-bold text-xs flex items-center justify-center border border-slate-700 shrink-0">
              {user.email?.charAt(0).toUpperCase()}
            </div>

            {!collapsed && (
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-white truncate" title={user.email}>
                  {user.profileData?.fullName || user.email}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-legal-gold bg-legal-gold/10 px-1 rounded uppercase tracking-wider">
                    {user.role}
                  </span>
                  <span className="text-[9px] text-slate-500">• Online</span>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className={`w-full py-2.5 px-3 bg-legal-blue hover:bg-legal-blueDark text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
              collapsed ? 'px-0' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-legal-gold" />
            {!collapsed && <span>Sign In / Register</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
