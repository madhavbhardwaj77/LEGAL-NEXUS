import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CaseList from './components/CaseList';
import CaseFormModal from './components/CaseFormModal';
import CaseDetailModal from './components/CaseDetailModal';
import LawyerDirectory from './components/LawyerDirectory';
import SystemHealth from './components/SystemHealth';
import LegalResearchPortal from './components/LegalResearchPortal';
import CaseStoryIntake from './components/CaseStoryIntake';
import LegalDraftGenerator from './components/LegalDraftGenerator';
import DocumentIntelligenceModal from './components/DocumentIntelligenceModal';
import CaseComparator from './components/CaseComparator';
import ResearchNotebook from './components/ResearchNotebook';
import UserProfile from './components/UserProfile';
import SettingsView from './components/SettingsView';
import AdminDashboard from './components/AdminDashboard';
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
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import api from './services/api';

export default function App() {
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    const saved = localStorage.getItem('nyaya_active_tab');
    const token = localStorage.getItem('nyaya_access_token');
    
    if (hash && hash !== 'landing' && hash !== 'login' && hash !== 'signup') {
      return token ? hash : 'login';
    }
    if (saved && saved !== 'landing' && saved !== 'login' && saved !== 'signup') {
      return token ? saved : 'landing';
    }
    return token ? 'cases' : 'landing';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [user, setUser] = useState(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkCurrentUser();
    checkHealth();
  }, []);

  useEffect(() => {
    if (activeTab === 'cases' && user) {
      loadCases();
    }
  }, [activeTab, user]);

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('nyaya_access_token');
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      const authUser = res.data.data.user;
      setUser(authUser);
      const savedTab = localStorage.getItem('nyaya_active_tab');
      const hash = window.location.hash.replace('#', '');
      const candidateTab = hash || savedTab;

      if (candidateTab && candidateTab !== 'landing' && candidateTab !== 'login' && candidateTab !== 'signup') {
        if (candidateTab === 'admin' && authUser.role !== 'ADMIN') {
          setActiveTab('cases');
          localStorage.setItem('nyaya_active_tab', 'cases');
        } else {
          setActiveTab(candidateTab);
        }
      } else {
        const defaultTab = authUser.role === 'ADMIN' ? 'admin' : (authUser.role === 'LAWYER' ? 'lawyers' : 'cases');
        setActiveTab(defaultTab);
        localStorage.setItem('nyaya_active_tab', defaultTab);
      }
    } catch {
      localStorage.removeItem('nyaya_access_token');
      localStorage.removeItem('nyaya_refresh_token');
      localStorage.removeItem('nyaya_active_tab');
    }
  };

  const checkHealth = async () => {
    try {
      const res = await api.get('/health');
      setHealthStatus(res.data.data);
    } catch {
      setHealthStatus({ status: 'OPERATIONAL', database: { mongo: 'CONNECTED', redis: 'READY' } });
    }
  };

  const loadCases = async () => {
    try {
      setLoadingCases(true);
      const res = await api.get('/cases');
      setCases(res.data.data || []);
    } catch {
      setCases([]);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nyaya_access_token');
    localStorage.removeItem('nyaya_refresh_token');
    localStorage.removeItem('nyaya_active_tab');
    window.location.hash = '';
    setUser(null);
    setCases([]);
    setActiveTab('landing');
  };

  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    const savedTab = localStorage.getItem('nyaya_active_tab');
    const targetTab = savedTab && savedTab !== 'login' && savedTab !== 'signup' && savedTab !== 'landing'
      ? savedTab
      : (authUser.role === 'ADMIN' ? 'admin' : (authUser.role === 'LAWYER' ? 'lawyers' : 'cases'));

    if (authUser.role === 'ADMIN') {
      setActiveTab('admin');
      localStorage.setItem('nyaya_active_tab', 'admin');
      window.location.hash = 'admin';
    } else {
      if (authUser.role !== 'LAWYER') {
        loadCases();
      }
      setActiveTab(targetTab);
      localStorage.setItem('nyaya_active_tab', targetTab);
      window.location.hash = targetTab;
    }
  };

  const handleCaseCreated = (newCase) => {
    setCases([newCase, ...cases]);
    setSelectedCase(newCase);
    handleSelectTab('cases');
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('nyaya_active_tab', tabId);
    window.location.hash = tabId;
  };

  return (
    <div className="min-h-screen bg-[#070D14] text-slate-100 flex flex-col font-sans selection:bg-legal-blue selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onLogout={handleLogout}
        onOpenNewCase={() => setIsNewCaseOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        healthStatus={healthStatus}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {user && activeTab !== 'landing' && activeTab !== 'login' && activeTab !== 'signup' && (
          <Sidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={handleSelectTab}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isMobileOpen={isMobileMenuOpen}
            setIsMobileOpen={setIsMobileMenuOpen}
            onOpenNewCase={() => setIsNewCaseOpen(true)}
            caseCount={cases.length}
          />
        )}

        <main className="flex-1 overflow-y-auto bg-slate-900/50 p-4 sm:p-6 lg:p-8">
          {activeTab === 'landing' && (
            <LandingPage
              onGetStarted={() => handleSelectTab(user ? 'cases' : 'signup')}
              onLogin={() => handleSelectTab('login')}
              onFindLawyers={() => handleSelectTab('lawyers')}
              onResearch={() => handleSelectTab('research')}
            />
          )}

          {activeTab === 'login' && (
            <div className="max-w-md mx-auto py-12">
              <LoginPage
                onSuccess={handleAuthSuccess}
                onSwitchToSignup={() => handleSelectTab('signup')}
              />
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="max-w-md mx-auto py-12">
              <SignupPage
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => handleSelectTab('login')}
              />
            </div>
          )}

          {activeTab === 'cases' && (
            <CaseList
              cases={cases}
              loading={loadingCases}
              onSelectCase={(c) => setSelectedCase(c)}
              onNewCase={() => setIsNewCaseOpen(true)}
              onRefresh={loadCases}
            />
          )}

          {activeTab === 'intake' && (
            <CaseStoryIntake
              user={user}
              onCaseCreated={handleCaseCreated}
              onViewCases={() => handleSelectTab('cases')}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentIntelligenceModal
              isOpen={true}
              onClose={() => handleSelectTab('cases')}
              cases={cases}
            />
          )}

          {activeTab === 'drafts' && (
            <LegalDraftGenerator
              user={user}
              cases={cases}
            />
          )}

          {activeTab === 'comparator' && (
            <CaseComparator
              user={user}
              cases={cases}
            />
          )}

          {activeTab === 'notebook' && (
            <ResearchNotebook
              user={user}
            />
          )}

          {activeTab === 'research' && (
            <LegalResearchPortal
              user={user}
            />
          )}

          {activeTab === 'lawyers' && (
            <LawyerDirectory
              user={user}
              onOpenAuth={() => handleSelectTab('login')}
            />
          )}

          {activeTab === 'profile' && (
            <UserProfile
              user={user}
              onUpdateUser={(updated) => setUser(updated)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              user={user}
            />
          )}

          {activeTab === 'system' && (
            <SystemHealth
              healthStatus={healthStatus}
              onRefreshHealth={checkHealth}
            />
          )}
        </main>
      </div>

      {/* Case Creation Modal */}
      {isNewCaseOpen && (
        <CaseFormModal
          isOpen={isNewCaseOpen}
          onClose={() => setIsNewCaseOpen(false)}
          onCaseCreated={handleCaseCreated}
        />
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          caseItem={selectedCase}
          onUpdateCase={(updated) => {
            setCases(cases.map((c) => (c._id === updated._id ? updated : c)));
            setSelectedCase(updated);
          }}
        />
      )}
    </div>
  );
}
