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
  Sparkles,
  GitCompare,
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
  const navItems = [
    { id: 'cases', label: 'Case Management', icon: LayoutDashboard, role: 'all' },
    { id: 'intake', label: 'Case Story Intake', icon: Bot, role: 'CITIZEN' },
    { id: 'documents', label: 'Document Intelligence', icon: FileText, role: 'all' },
    { id: 'drafts', label: 'Legal Drafts Generator', icon: PenTool, role: 'all' },
    { id: 'comparator', label: 'Case Comparator', icon: GitCompare, role: 'LAWYER' },
    { id: 'notebook', label: 'Advocate Notebook', icon: BookOpen, role: 'LAWYER' },
    { id: 'research', label: 'Legal Research Portal', icon: Sparkles, role: 'all' },
    { id: 'lawyers', label: 'Advocate Directory', icon: Scale, role: 'all' },
  ];

  // Role → gradient for avatar
  const roleGrad = {
    CITIZEN:     'from-blue-500 to-sky-400',
    LAWYER:      'from-legal-gold to-amber-400',
    LAW_STUDENT: 'from-emerald-500 to-teal-400',
    ADMIN:       'from-purple-500 to-violet-400',
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onSelectTab(item.id)}
        title={collapsed ? item.label : undefined}
        className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group cursor-pointer ${
          active
            ? 'bg-blue-600 text-white shadow-md font-bold'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
        }`}
      >
        {active && (
          <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-legal-gold rounded-r-full shadow-gold-glow" />
        )}

        <div
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-150 group-hover:scale-110 ${
            active
              ? 'bg-white/15 text-white'
              : 'bg-slate-800/70 text-slate-500 group-hover:text-white group-hover:bg-slate-700/80'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        {!collapsed && (
          <div className="flex-1 flex items-center justify-between truncate">
            <span className="truncate">{item.label}</span>
          </div>
        )}

        {collapsed && (
          <span className="sidebar-tooltip">{item.label}</span>
        )}
      </button>
    );
  };

  const visibleNavItems = navItems.filter((item) => {
    if (item.role === 'all') return true;
    if (user?.role === 'ADMIN') return true;
    return user?.role === item.role;
  });

  return (
    <aside
      className={`flex flex-col border-r border-slate-800 bg-[#0B1522] transition-all duration-300 relative z-30 shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="p-3 flex items-center justify-between border-b border-slate-800/80">
        {!collapsed && (
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-1 font-bold">
            Workspaces
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ml-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>

      <div className="p-2 border-t border-slate-800 space-y-1">
        <button
          onClick={() => onSelectTab('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          {!collapsed && <span>My Profile</span>}
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span>Settings</span>}
        </button>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => onSelectTab('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white'
                : 'text-purple-300 hover:bg-purple-900/40 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            {!collapsed && <span>Admin Dashboard</span>}
          </button>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
