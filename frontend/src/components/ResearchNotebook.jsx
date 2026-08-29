import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FolderPlus,
  Plus,
  Search,
  Tag,
  Pin,
  Trash2,
  Edit3,
  Download,
  Share2,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Save,
  Check,
  Folder,
  Copy,
  Clock,
  X,
} from 'lucide-react';
import api from '../services/api';

export default function ResearchNotebook({ user, onOpenAuth, onSelectTab }) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(false);

  // Note editor state
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    folder: 'General Research',
    tags: '',
    isPinned: false,
    color: '#0B1F33',
  });
  const [saving, setSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedMarkdown, setExportedMarkdown] = useState('');
  const [copied, setCopied] = useState(false);

  // New folder dialog
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (user) {
      loadNotes();
      loadFolders();
    }
  }, [user, activeFolder, selectedTag]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeFolder !== 'ALL') params.folder = activeFolder;
      if (selectedTag) params.tag = selectedTag;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/notebook', { params });
      setNotes(res.data.data || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const res = await api.get('/notebook/folders');
      setFolders(res.data.data || []);
    } catch {
      setFolders([]);
    }
  };

  const handleCreateNewNote = () => {
    const fresh = {
      title: 'New Legal Research Note',
      content: '### Case Notes & Strategy\n- Core Issue:\n- Key Precedents to Cite:\n- Factual Evidentiary Checklist:',
      folder: activeFolder !== 'ALL' ? activeFolder : 'General Research',
      tags: 'Research, Brief',
      isPinned: false,
      color: '#0B1F33',
    };
    setSelectedNote(null);
    setNoteForm(fresh);
    setIsEditing(true);
  };

  const handleSelectNoteToEdit = (note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content || '',
      folder: note.folder || 'General Research',
      tags: note.tags?.join(', ') || '',
      isPinned: note.isPinned || false,
      color: note.color || '#0B1F33',
    });
    setIsEditing(true);
  };

  const handleSaveNote = async (e) => {
    e?.preventDefault();
    if (!noteForm.title.trim()) return;

    try {
      setSaving(true);
      const payload = {
        title: noteForm.title.trim(),
        content: noteForm.content,
        folder: noteForm.folder.trim(),
        tags: noteForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isPinned: noteForm.isPinned,
        color: noteForm.color,
      };

      if (selectedNote?._id) {
        await api.put(`/notebook/${selectedNote._id}`, payload);
      } else {
        await api.post('/notebook', payload);
      }

      await loadNotes();
      await loadFolders();
      setIsEditing(false);
      setSelectedNote(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this research note from your notebook?')) return;
    try {
      await api.delete(`/notebook/${noteId}`);
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
      await loadNotes();
      await loadFolders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportBrief = async () => {
    try {
      const res = await api.post('/notebook/export', {
        title: activeFolder !== 'ALL' ? `${activeFolder} Research Brief` : 'Comprehensive Legal Research Brief',
      });
      setExportedMarkdown(res.data.data?.markdown || '');
      setShowExportModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    setActiveFolder(newFolderName.trim());
    setShowNewFolderModal(false);
    setNewFolderName('');
    handleCreateNewNote();
  };

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-[#0B1F33] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-legal-gold bg-legal-gold/10 px-2.5 py-0.5 rounded-full border border-legal-gold/20">
              Lawyer Workspace
            </span>
            <span className="text-xs text-slate-400 font-mono">Persistent Research Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-legal-gold" />
            <span>Advocate Research Notebook</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Save statutory citations, annotate judicial precedents, organize by case folders, and generate exportable
            legal research memorandums.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportBrief}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 shadow flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-legal-gold" />
            <span>Export Brief</span>
          </button>

          <button
            onClick={handleCreateNewNote}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Note</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Notes / Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Folders & Tags Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Folders Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-legal-blue" />
                <span>Folders</span>
              </h3>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="text-slate-400 hover:text-legal-blue p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                title="New Folder"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setActiveFolder('ALL')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFolder === 'ALL'
                    ? 'bg-blue-50 text-legal-blue border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Research Notes</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">{notes.length}</span>
              </button>

              {folders.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setActiveFolder(f.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeFolder === f.name
                      ? 'bg-blue-50 text-legal-blue font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{f.name}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter Card */}
          {allTags.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-legal-blue" />
                  <span>Tags</span>
                </h3>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag('')}
                    className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(selectedTag === t ? '' : t)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                      selectedTag === t
                        ? 'bg-legal-blue text-white border-legal-blue'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Notes List OR Active Editor */}
        <div className="lg:col-span-9 space-y-4">
          {/* Search & Actions Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-subtle flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search notes, statutory sections, or clipped precedents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadNotes()}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={loadNotes}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Active Note Editor */}
          {isEditing ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-legal-blue" />
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedNote ? 'Edit Research Note' : 'Create Research Note'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedNote(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Note'}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-slate-500 text-[11px] mb-1">Note Title</label>
                  <input
                    type="text"
                    required
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Precedent analysis on Section 138 NI Act limitation"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-slate-500 text-[11px] mb-1">Folder</label>
                    <input
                      type="text"
                      value={noteForm.folder}
                      onChange={(e) => setNoteForm({ ...noteForm, folder: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-slate-500 text-[11px] mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={noteForm.tags}
                      onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Labour, High Court, Bail"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 text-[11px] mb-1">
                    Research Content & Legal Analysis (Markdown Supported)
                  </label>
                  <textarea
                    rows={10}
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                    placeholder="Jot down legal arguments, case notes, statutory sections, and judicial precedents..."
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noteForm.isPinned}
                      onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-700">Pin to Top of Notebook</span>
                  </label>
                </div>
              </form>
            </div>
          ) : (
            /* Notes Grid List */
            <>
              {loading ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-subtle">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-medium">Loading research notebook...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-subtle p-8 max-w-md mx-auto space-y-4">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">Your Research Notebook is Empty</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Create research notes, clip bare act sections from the Statutory Research portal, or save comparative
                    case analyses here.
                  </p>
                  <button
                    onClick={handleCreateNewNote}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Create First Note
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.map((n) => (
                    <div
                      key={n._id}
                      className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-300 shadow-subtle hover:shadow-card transition flex flex-col justify-between space-y-3 relative group"
                    >
                      {n.isPinned && (
                        <div className="absolute top-4 right-4">
                          <Pin className="w-4 h-4 text-legal-gold fill-legal-gold" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-legal-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {n.folder}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(n.updatedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{n.title}</h4>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {n.content || 'No text summary added.'}
                        </p>

                        {/* Clipped Sources */}
                        {n.clippedSources && n.clippedSources.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Clipped Authorities ({n.clippedSources.length})
                            </span>
                            {n.clippedSources.slice(0, 2).map((cs, idx) => (
                              <div
                                key={idx}
                                className="text-[11px] p-2 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-center justify-between text-emerald-950 font-medium"
                              >
                                <span>
                                  {cs.actName} ({cs.section})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tags */}
                        {n.tags && n.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {n.tags.map((t, idx) => (
                              <span key={idx} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSelectNoteToEdit(n)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteNote(n._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {n.caseId && (
                          <span className="text-[10px] font-mono text-legal-blue bg-blue-50 px-2 py-0.5 rounded">
                            {n.caseId.caseNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Export Brief Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-legal-gold bg-legal-blue px-2.5 py-0.5 rounded-full">
                  Ready-to-File
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Consolidated Legal Research Memorandum</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {exportedMarkdown}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportedMarkdown);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown'}</span>
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Create New Research Folder</h3>
            <input
              type="text"
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Criminal Appeals & Bail"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
