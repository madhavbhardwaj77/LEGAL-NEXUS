import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Lock,
  Globe,
  Sliders,
  Download,
  Trash2,
  CheckCircle2,
  Save,
  User,
  Sparkles,
  Info,
} from 'lucide-react';

export default function SettingsView({ user, onSelectTab }) {
  const [activeTab, setActiveTab] = useState('preferences'); // preferences | security | notifications | privacy
  const [language, setLanguage] = useState('en-IN');
  const [confidenceThreshold, setConfidenceThreshold] = useState('high');
  const [piiMasking, setPiiMasking] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [caseUpdateAlerts, setCaseUpdateAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0B1F33] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-legal flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-legal-blue/20 text-sky-300 border border-legal-blue/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
              System & Workspace Configuration
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Platform Settings & Security</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Configure AI reasoning thresholds, privacy preferences, session security, and notification triggers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-subtle space-y-1">
          {[
            { id: 'preferences', label: 'AI Reasoning & Language', icon: Sliders },
            { id: 'security', label: 'Security & Access Control', icon: Shield },
            { id: 'notifications', label: 'Notification Alerts', icon: Bell },
            { id: 'privacy', label: 'Data & Privacy Export', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-subtle">
          {savedSuccess && (
            <div className="p-3.5 mb-5 text-xs bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          {/* TAB 1: AI PREFERENCES */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSavePreferences} className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-legal-blue" />
                AI Reasoning & Language Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Default Natural Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-legal-blue focus:outline-none font-medium"
                  >
                    <option value="en-IN">English (India) — Standard Legal Lexicon</option>
                    <option value="hi-IN">हिन्दी (Hindi) — Official Gazette Terms</option>
                    <option value="hinglish">Hinglish — Conversational Bilingual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Statutory Grounding Threshold
                  </label>
                  <select
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-legal-blue focus:outline-none font-medium"
                  >
                    <option value="high">Strict Gazette Grounding (Only Tier-1 Primary Acts)</option>
                    <option value="medium">Standard (Primary Acts + High Court Precedents)</option>
                    <option value="broad">Comprehensive (Acts + Secondary Commentaries)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Automatic PII Anonymization</h4>
                    <p className="text-[11px] text-slate-500">Mask Aadhaar, PAN, and bank accounts prior to AI inference.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={piiMasking}
                      onChange={(e) => setPiiMasking(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Save AI Preferences</span>
              </button>
            </form>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-legal-blue" />
                Security & Session Management
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Current Session</h4>
                      <p className="text-slate-500 text-[11px]">JWT Bearer Token • Encrypted HTTPS</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">Role-Based Access Level</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Your account is assigned the <strong>{user?.role || 'CITIZEN'}</strong> access tier. To elevate to verified advocate status, ensure your Bar Council registration is entered in your profile.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-legal-blue" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Case Status Updates</h4>
                    <p className="text-[11px] text-slate-500">Receive alerts when timeline events or evidence are updated.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={caseUpdateAlerts}
                      onChange={(e) => setCaseUpdateAlerts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-legal-blue"></div>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Advocate Match Notifications</h4>
                    <p className="text-[11px] text-slate-500">Get notified when a matched counsel accepts your case brief.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-legal-blue"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATA & PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-legal-blue" />
                Data Portability & Account Privacy
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">Export All Legal Dossiers</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Download an encrypted archive containing all filed cases, generated notices, and timeline records.
                  </p>
                  <button
                    type="button"
                    onClick={() => alert('Exporting all case dossiers...')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1F33] hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    <Download className="w-3.5 h-3.5 text-legal-gold" />
                    <span>Download Case Archive (.json)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
