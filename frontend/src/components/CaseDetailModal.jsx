import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  PlusCircle,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  User,
  Paperclip,
} from 'lucide-react';
import api from '../services/api';

export default function CaseDetailModal({ selectedCase, isOpen, onClose, onCaseUpdated }) {
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | documents | details
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Timeline Event Form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventType, setEventType] = useState('HR_CONTACTED');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [eventDesc, setEventDesc] = useState('');

  // New Document Form state
  const [showDocForm, setShowDocForm] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('EMPLOYMENT_CONTRACT');
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    if (selectedCase?._id && isOpen) {
      loadTimeline();
      loadDocuments();
    }
  }, [selectedCase, isOpen]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cases/${selectedCase._id}/timeline`);
      setTimelineEvents(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await api.get(`/documents/case/${selectedCase._id}`);
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${selectedCase._id}/events`, {
        eventType,
        title: eventTitle,
        dateTime: new Date(eventDate),
        description: eventDesc,
        source: 'USER',
      });
      setEventTitle('');
      setEventDesc('');
      setShowEventForm(false);
      loadTimeline();
    } catch (err) {
      console.error('Failed to add timeline event:', err);
    }
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    try {
      await api.post('/documents', {
        caseId: selectedCase._id,
        title: docTitle,
        documentType: docType,
        fileUrl: docUrl || `https://storage.nyayasetu.in/docs/${encodeURIComponent(docTitle)}.pdf`,
      });
      setDocTitle('');
      setDocUrl('');
      setShowDocForm(false);
      loadDocuments();
    } catch (err) {
      console.error('Failed to add document:', err);
    }
  };

  if (!isOpen || !selectedCase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-nyaya-900 to-slate-900 text-white flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-slate-800 text-nyaya-300 px-2 py-0.5 rounded border border-slate-700">
                {selectedCase.caseNumber}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-nyaya-700 text-nyaya-100">
                {selectedCase.category}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-700 text-white">
                {selectedCase.status}
              </span>
            </div>
            <h2 className="text-xl font-bold">{selectedCase.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          {[
            { id: 'timeline', label: 'Chronological Timeline', count: timelineEvents.length },
            { id: 'documents', label: 'Documents & Queue', count: documents.length },
            { id: 'details', label: 'Case Summary & Parties' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'border-nyaya-600 text-nyaya-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Case Timeline & Milestones</h3>
                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-nyaya-600 hover:text-nyaya-700 bg-nyaya-50 px-3 py-1.5 rounded-lg border border-nyaya-200 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {showEventForm ? 'Cancel' : 'Add Milestone Event'}
                </button>
              </div>

              {/* Add Event Form */}
              {showEventForm && (
                <form onSubmit={handleAddEvent} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Event Type</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      >
                        <option value="EMPLOYMENT_STARTED">Employment Started</option>
                        <option value="SALARY_DUE">Salary Due Date</option>
                        <option value="HR_CONTACTED">HR Contacted</option>
                        <option value="LEGAL_NOTICE_SENT">Legal Notice Sent</option>
                        <option value="LEGAL_NOTICE_RECEIVED">Legal Notice Received</option>
                        <option value="COMPLAINT_FILED">Complaint Filed</option>
                        <option value="HEARING_SCHEDULED">Hearing Scheduled</option>
                        <option value="CUSTOM_EVENT">Custom Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Event Date</label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sent formal demand letter to HR"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description / Notes</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Detailed notes on what occurred on this date..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-nyaya-600 text-white rounded-lg text-xs font-medium hover:bg-nyaya-700"
                  >
                    Save Timeline Event
                  </button>
                </form>
              )}

              {/* Timeline Items */}
              <div className="relative pl-6 border-l-2 border-nyaya-200 space-y-6">
                {timelineEvents.map((evt, idx) => (
                  <div key={evt._id || idx} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-nyaya-600 border-2 border-white ring-2 ring-nyaya-200"></div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-nyaya-700 bg-nyaya-50 px-2 py-0.5 rounded">
                          {evt.eventType?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(evt.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{evt.description}</p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Source: {evt.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Case Documents & Background Queue</h3>
                <button
                  onClick={() => setShowDocForm(!showDocForm)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-nyaya-600 hover:text-nyaya-700 bg-nyaya-50 px-3 py-1.5 rounded-lg border border-nyaya-200 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {showDocForm ? 'Cancel' : 'Upload Document'}
                </button>
              </div>

              {showDocForm && (
                <form onSubmit={handleAddDoc} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Document Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Appointment Letter"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      >
                        <option value="EMPLOYMENT_CONTRACT">Employment Contract</option>
                        <option value="SALARY_SLIP">Salary Slip</option>
                        <option value="LEGAL_NOTICE">Legal Notice</option>
                        <option value="BANK_STATEMENT">Bank Statement</option>
                        <option value="RENT_AGREEMENT">Rent Agreement</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">File URL / Storage Link</label>
                    <input
                      type="url"
                      placeholder="https://storage.nyayasetu.in/docs/sample.pdf"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-nyaya-600 text-white rounded-lg text-xs font-medium hover:bg-nyaya-700"
                  >
                    Register Document Metadata
                  </button>
                </form>
              )}

              {documents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                  <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No documents registered for this case yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((d) => (
                    <div key={d._id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-nyaya-50 text-nyaya-600 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{d.title}</h4>
                          <p className="text-[11px] text-slate-500">{d.documentType} • {d.mimeType || 'application/pdf'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                          {d.processingStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Facts & Narrative</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedCase.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2">Plaintiff (Filing Party)</h4>
                  <p className="text-slate-600">Name: {selectedCase.parties?.plaintiff?.name || 'Not specified'}</p>
                  <p className="text-slate-600">Location: {selectedCase.location?.city}, {selectedCase.location?.state}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2">Defendant (Opposite Party)</h4>
                  <p className="text-slate-600">Organization: {selectedCase.parties?.defendant?.organization || 'Not specified'}</p>
                  <p className="text-slate-600">Designation: {selectedCase.parties?.defendant?.designation || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
