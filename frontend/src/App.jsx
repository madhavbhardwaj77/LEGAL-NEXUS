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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        healthStatus={healthStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>

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
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Nyaya Setu (न्याय सेतु) — Bridge to Justice Platform for India</span>
          <span className="text-slate-400">Milestone 5 • Production Ready • Frontend, Security & CI/CD</span>
        </div>
      </footer>
    </div>
  );
}
