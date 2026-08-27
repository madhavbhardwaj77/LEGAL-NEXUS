import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import CaseList from './components/CaseList';
import CaseFormModal from './components/CaseFormModal';
import CaseDetailModal from './components/CaseDetailModal';
import LawyerDirectory from './components/LawyerDirectory';
import SystemHealth from './components/SystemHealth';
import LegalResearchPortal from './components/LegalResearchPortal';
import CaseStoryIntake from './components/CaseStoryIntake';
import LegalDraftGenerator from './components/LegalDraftGenerator';
import DocumentIntelligenceModal from './components/DocumentIntelligenceModal';
import VoiceAssistantWidget from './components/VoiceAssistantWidget';
import UserProfile from './components/UserProfile';
import { Briefcase, Bot, FileText, PenTool, Sparkles, UserCheck, Users, Activity, Menu, X } from 'lucide-react';
import api from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // landing | cases | intake | documents | drafts | research | lawyers | system
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'cases', label: 'Case Intake', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'intake', label: 'AI Assistance', icon: <Bot className="w-4 h-4" /> },
    { id: 'documents', label: 'Document AI', icon: <FileText className="w-4 h-4" /> },
    { id: 'drafts', label: 'Drafting', icon: <PenTool className="w-4 h-4" /> },
    { id: 'research', label: 'Research', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'lawyers', label: 'Lawyer Finder', icon: <UserCheck className="w-4 h-4" /> },
  ];

  useEffect(() => {
    checkCurrentUser();
    checkHealth();
  }, []);

  useEffect(() => {
    if (activeTab === 'cases') {
      loadCases();
    }
  }, [activeTab, user]);

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('nyaya_access_token');
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
      setActiveTab('cases');
    } catch {
      localStorage.removeItem('nyaya_access_token');
      localStorage.removeItem('nyaya_refresh_token');
    }
  };

  const checkHealth = async () => {
    try {
      const res = await api.get('/health');
      setHealthStatus(res.data.data);
    } catch {
      setHealthStatus({ status: 'OFFLINE', database: { mongo: 'DISCONNECTED', redis: 'DISCONNECTED' } });
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
    setUser(null);
    setCases([]);
    setActiveTab('landing');
  };

  const handleCaseCreated = (newCase) => {
    setCases([newCase, ...cases]);
    setSelectedCase(newCase);
    setActiveTab('cases');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        showToggle={activeTab !== 'landing'}
      />

      <div className="flex-grow flex flex-col md:flex-row relative">
        {/* Left Side Navigation (vertical list of tools) */}
        {activeTab !== 'landing' && (
          <>
            {/* Desktop Navigation Sidebar (visible on md+) */}
            <aside className="hidden md:flex md:w-60 bg-slate-900 text-slate-300 flex-col p-4 border-r border-slate-800 shrink-0 select-none">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                      activeTab === item.id
                        ? 'bg-nyaya-600 text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                {user && (
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                      activeTab === 'profile'
                        ? 'bg-nyaya-600 text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Profile & Network
                  </button>
                )}

                {user && user.role !== 'CITIZEN' && (
                  <button
                    onClick={() => setActiveTab('system')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                      activeTab === 'system'
                        ? 'bg-nyaya-600 text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    System Status
                  </button>
                )}
              </nav>
            </aside>

            {/* Mobile Dropdown Menu (visible if toggled on mobile) */}
            {isMobileMenuOpen && (
              <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-1.5 absolute w-full left-0 top-0 z-20 shadow-xl animate-in fade-in duration-200">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                      activeTab === item.id ? 'bg-nyaya-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                {user && (
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                      activeTab === 'profile' ? 'bg-nyaya-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Profile & Network
                  </button>
                )}

                {user && user.role !== 'CITIZEN' && (
                  <button
                    onClick={() => {
                      setActiveTab('system');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                      activeTab === 'system' ? 'bg-nyaya-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    System Status
                  </button>
                )}
              </div>
            )}
          </>
        )}

        <main className="flex-1 w-full max-w-7xl mx-auto md:max-w-none p-4 sm:p-6 overflow-y-auto">
        {activeTab === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (user) setActiveTab('intake');
              else setIsAuthOpen(true);
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSelectFeature={(feat) => setActiveTab(feat)}
          />
        )}

        {activeTab === 'cases' && (
          <CaseList
            cases={cases}
            loading={loadingCases}
            user={user}
            onSelectCase={(c) => setSelectedCase(c)}
            onNewCase={() => {
              if (!user) {
                setIsAuthOpen(true);
              } else {
                setIsNewCaseOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'intake' && (
          <div className="space-y-6">
            <VoiceAssistantWidget
              onTranscriptReady={(transcriptText) => {
                // Pre-fills into CaseStoryIntake
              }}
            />
            <CaseStoryIntake
              user={user}
              onOpenAuth={() => setIsAuthOpen(true)}
              onCaseCreated={handleCaseCreated}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <DocumentIntelligenceModal
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'drafts' && (
          <LegalDraftGenerator
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'research' && (
          <LegalResearchPortal
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'lawyers' && (
          <LawyerDirectory
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'system' && (
          <SystemHealth healthStatus={healthStatus} onRefresh={checkHealth} />
        )}

        {activeTab === 'profile' && (
          <UserProfile user={user} />
        )}
      </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          loadCases();
          setActiveTab('cases');
        }}
      />

      <CaseFormModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onCaseCreated={handleCaseCreated}
      />

      <CaseDetailModal
        selectedCase={selectedCase}
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        onCaseUpdated={loadCases}
        user={user}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Legal Nexus — Legal AI Platform</span>
          <span className="text-slate-400">Milestone 5 • Production Ready • Frontend, Security & CI/CD</span>
        </div>
      </footer>
    </div>
  );
}
