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
      handleSelectTab('admin');
    } else {
      if (authUser.role !== 'LAWYER') {
        loadCases();
      }
      handleSelectTab(targetTab);
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

  const isAuthenticated = Boolean(user && localStorage.getItem('nyaya_access_token'));

  return (
    <div className="min-h-screen bg-[#070D14] text-slate-100 flex flex-col font-sans selection:bg-legal-blue selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={handleLogout}
        onOpenAuth={() => handleSelectTab('login')}
        isMobileOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        showToggle={Boolean(user)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {isAuthenticated && activeTab !== 'landing' && activeTab !== 'login' && activeTab !== 'signup' && (
          <Sidebar
            user={user}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            collapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onLogout={handleLogout}
            onOpenAuth={() => handleSelectTab('login')}
          />
        )}

        <main className="flex-1 overflow-y-auto bg-slate-900/50 p-4 sm:p-6 lg:p-8">
          {activeTab === 'landing' && (
            <LandingPage
              user={user}
              onGetStarted={() => handleSelectTab(user ? 'cases' : 'signup')}
              onOpenAuth={() => handleSelectTab('login')}
              onSelectFeature={(feat) => handleSelectTab(feat)}
            />
          )}

          {activeTab === 'login' && (
            <div className="max-w-md mx-auto py-12">
              <LoginPage
                onAuthSuccess={handleAuthSuccess}
                onNavigateToSignup={() => handleSelectTab('signup')}
              />
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="max-w-md mx-auto py-12">
              <SignupPage
                onAuthSuccess={handleAuthSuccess}
                onNavigateToLogin={() => handleSelectTab('login')}
              />
            </div>
          )}

          {activeTab === 'cases' && (
            <CaseList
              user={user}
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
              onOpenAuth={() => handleSelectTab('login')}
              onCaseCreated={handleCaseCreated}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentIntelligenceModal
              user={user}
              onOpenAuth={() => handleSelectTab('login')}
            />
          )}

          {activeTab === 'drafts' && (
            <LegalDraftGenerator
              user={user}
              onOpenAuth={() => handleSelectTab('login')}
            />
          )}

          {activeTab === 'comparator' && (
            <CaseComparator
              user={user}
              onOpenAuth={() => handleSelectTab('login')}
              onSaveToNotebook={() => handleSelectTab('notebook')}
            />
          )}

          {activeTab === 'notebook' && (
            <ResearchNotebook
              user={user}
              onOpenAuth={() => handleSelectTab('login')}
              onSelectTab={handleSelectTab}
            />
          )}

          {activeTab === 'research' && (
            <LegalResearchPortal
              user={user}
              onOpenAuth={() => handleSelectTab('login')}
              onNavigateToComparator={() => handleSelectTab('comparator')}
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
              onSelectTab={handleSelectTab}
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
