import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  User,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  FileText,
  HelpCircle,
  FolderPlus,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  Calendar,
} from 'lucide-react';
import api from '../services/api';

export default function CaseStoryIntake({ user, onOpenAuth, onCaseCreated }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! I am the Legal Nexus AI Assistant. Tell me your legal issue in your own words in English, हिन्दी (Hindi), or Hinglish. I will help understand your rights, build your structured case, and identify what evidence is needed.',
    },
  ]);
  const [inputStory, setInputStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingCase, setCreatingCase] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  const sampleStarters = [
    'Employer withheld 3 months salary of 1.5 lakhs in Delhi without notice.',
    'Landlord refused to return 50000 security deposit after I vacated the flat.',
    'Lost 45000 in online UPI phishing fraud after a fake bank KYC call.',
    'Flipkart delivered a fake duplicate phone and refused replacement.',
  ];

  const handleSendMessage = async (textToSend = inputStory) => {
    if (!textToSend.trim()) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputStory('');
    setLoading(true);

    try {
      // 1. Analyze case narrative via AI Engine
      const res = await api.post('/ai/analyze', {
        story: textToSend,
        existingCase: analysisResult?.case || null,
      });

      const data = res.data.data;
      if (data.case?.status === 'BLOCKED' || data.blocked || data.case?.caseNumber === 'BLOCKED-SECURITY') {
        setAnalysisResult(null);
      } else {
        setAnalysisResult(data);
      }

      // 2. Add assistant response to conversation
      const assistantText = data.responseExplanation || data.reply || 'I have analyzed your statement and updated your structured case details.';
      const assistantMsg = {
        sender: 'assistant',
        text: assistantText,
        clarifyingQuestions: data.intake?.clarifyingQuestions || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Sorry, I encountered an error analyzing your case. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFormalCase = async () => {
    if (!analysisResult?.case || !user || successNotice) {
      if (!user) onOpenAuth();
      return;
    }

    setCreatingCase(true);
    try {
      const res = await api.post('/ai/intake-to-case', {
        structuredCase: analysisResult.case,
        intakeNarrative: messages.filter((m) => m.sender === 'user').map((m) => m.text).join('\n\n'),
      });
      setSuccessNotice(`Case ${res.data.data.caseNumber} formally filed and recorded in the database!`);
      if (onCaseCreated) {
        onCaseCreated(res.data.data);
      }
    } catch (err) {
      alert('Failed to register formal case. Please try again.');
    } finally {
      setCreatingCase(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    if (!urgency) return null;
    const level = urgency.urgencyLevel;
    if (level === 'URGENT_ASSISTANCE') {
      return (
        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-lg flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          Urgent Assistance Required
        </span>
      );
    }
    if (level === 'ATTENTION_RECOMMENDED') {
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Attention Recommended
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        General Legal Guidance
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Chat & Intake Interaction Column (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
        {/* Assistant Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-nyaya-600 flex items-center justify-center text-white shadow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                Legal Nexus AI Assistant
                <span className="text-[10px] bg-nyaya-500/30 text-nyaya-300 px-2 py-0.5 rounded-full border border-nyaya-500/30">
                  LangGraph Agentic Workflow
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Continuous fact extraction & grounded legal reasoning</p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[500px]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-nyaya-50 text-nyaya-700 border border-nyaya-200 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-nyaya-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Clarifying Questions Quick Chips */}
                {m.clarifyingQuestions && m.clarifyingQuestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-nyaya-600" />
                      Key Clarifying Questions (Click to answer):
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {m.clarifyingQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInputStory(`Answering: ${q} — `)}
                          className="text-left px-3 py-1.5 bg-white hover:bg-nyaya-50 text-slate-700 hover:text-nyaya-800 text-xs rounded-xl border border-slate-200 transition"
                        >
                          → {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-3 bg-slate-50 rounded-2xl w-fit">
              <span className="w-3.5 h-3.5 border-2 border-nyaya-600 border-t-transparent rounded-full animate-spin"></span>
              Agents executing: Intake → Classification → Case Builder → Research → Evidence → Urgency...
            </div>
          )}
        </div>

        {/* Story Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] shrink-0">Quick scenarios:</span>
            {sampleStarters.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] border border-slate-200 shrink-0 transition"
              >
                {s.split(' ')[0]} {s.split(' ')[1]}...
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={inputStory}
              onChange={(e) => setInputStory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your story in English, Hindi, or Hinglish (e.g. 'Mere boss ne salary rok li hai')..."
              className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500 shadow-sm resize-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputStory.trim()}
              className="absolute right-2.5 bottom-3.5 p-2 bg-nyaya-600 hover:bg-nyaya-700 disabled:bg-slate-300 text-white rounded-xl transition shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Structured Case Preview Column (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        {analysisResult ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
            {/* Structured Case Summary Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-nyaya-700 bg-nyaya-50 px-2 py-0.5 rounded">
                    {analysisResult.case?.caseNumber || 'NS-DRAFT'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {analysisResult.case?.issue}
                  </h3>
                </div>
                {getUrgencyBadge(analysisResult.urgency)}
              </div>

              {/* Category & Parties */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
                  <span className="font-semibold text-slate-800">{analysisResult.case?.category}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Jurisdiction</span>
                  <span className="font-semibold text-slate-800">{analysisResult.case?.jurisdiction}</span>
                </div>
              </div>

              {/* Financial Claim */}
              {analysisResult.case?.financialDetails?.disputedAmount && (
                <div className="p-3 bg-nyaya-50 rounded-2xl border border-nyaya-200 flex items-center justify-between text-xs">
                  <span className="font-medium text-nyaya-900">Disputed Financial Claim:</span>
                  <span className="font-extrabold text-nyaya-800 text-sm">
                    ₹{Number(analysisResult.case.financialDetails.disputedAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Grounded Legal Basis */}
              {analysisResult.research?.legalBasis && analysisResult.research.legalBasis.length > 0 && user && user.role !== 'CITIZEN' && (
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mb-2">
                    <Scale className="w-3.5 h-3.5 text-nyaya-600" />
                    Applicable Statutory Provisions:
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.research.legalBasis.slice(0, 2).map((prov, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-nyaya-800">{prov.section}: </span>
                        <span className="text-slate-700">{prov.sectionTitle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Checklist */}
              {analysisResult.evidence && (
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mb-2">
                    <FileText className="w-3.5 h-3.5 text-nyaya-600" />
                    Evidence Audit Checklist:
                  </span>
                  <div className="space-y-1 text-xs">
                    {analysisResult.evidence.available?.map((e, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/70 px-2 py-1 rounded-lg">
                        <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                        <span className="truncate">{e.name}</span>
                      </div>
                    ))}
                    {analysisResult.evidence.missing?.slice(0, 2).map((e, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-amber-700 bg-amber-50/70 px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
                        <span className="truncate">Need: {e.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Convert to Formal Case Button */}
              <button
                onClick={handleCreateFormalCase}
                disabled={creatingCase || !!successNotice}
                className="w-full py-3 bg-nyaya-600 hover:bg-nyaya-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2"
              >
                {creatingCase ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    Save & Create Formal Case Record
                  </>
                )}
              </button>

              {successNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  {successNotice}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State Placeholder */
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center text-slate-400 space-y-3 min-h-[400px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Live Case Summary</h4>
            <p className="text-xs max-w-xs leading-relaxed">
              As you describe your situation to the assistant, the Case Intelligence Engine will extract facts, verify legal provisions, audit evidence, and display your structured case here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
