import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  UploadCloud,
  FileCheck,
  X,
  AlertCircle,
  Layers,
  ArrowRight,
  Info,
  HelpCircle,
  FileCode,
  Check,
  RefreshCw,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../services/api';

export default function DocumentIntelligenceModal({ user, onOpenAuth }) {
  const [docContent, setDocContent] = useState('');
  const [filename, setFilename] = useState('employment_contract.txt');
  const [uploadedFile, setUploadedFile] = useState(null); // { name, size, pageCount, type }
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [expandedClause, setExpandedClause] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState('overview'); // 'overview' | 'clauses' | 'gaps' | 'compliance'
  const [clauseFilter, setClauseFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'STANDARD'

  const sampleTemplates = [
    {
      label: 'Sample Employment Agreement (Non-Compete & Arbitrary Termination)',
      filename: 'employment_agreement_sample.txt',
      type: 'TXT',
      size: '1.2 KB',
      pageCount: 1,
      content: `EMPLOYMENT AGREEMENT
Between Apex Technologies Pvt Ltd (Employer) and Rahul Verma (Employee).
Dated: 15-January-2024 at New Delhi.

1. SALARY & COMPENSATION: The Employee shall receive a fixed CTC of Rs 1,50,000 per month payable on the last working day of each calendar month.
2. NOTICE PERIOD: Either party may terminate this agreement by providing thirty (30) days prior written notice.
3. TERMINATION FOR CAUSE: The Company reserves the right to terminate employment immediately without notice or severance in case of any misconduct or performance deficiency.
4. NON-COMPETE COVENANT: The Employee shall not engage, directly or indirectly, in any competing software business for a period of two (2) years across India post-termination.
5. CONFIDENTIALITY: Both parties agree to protect proprietary source code, trade secrets, and customer records perpetually.
6. DISPUTE RESOLUTION: All disputes shall be referred to arbitration before a sole arbitrator unilaterally appointed by the Company with exclusive seat at Delhi.
7. INDEMNITY: The Employee agrees to indemnify and hold harmless the Company against all losses, legal costs, and third-party damages without limit.`,
    },
    {
      label: 'Sample Residential Tenancy Agreement (Deposit & Deduction Issue)',
      filename: 'residential_lease_sample.txt',
      type: 'TXT',
      size: '1.0 KB',
      pageCount: 1,
      content: `RESIDENTIAL LEASE AGREEMENT
Between Shri Ramesh Gupta (Lessor/Landlord) and Priya Nair (Lessee/Tenant).
Demised Premises: Flat 304, Green Park, New Delhi.
Dated: 01-March-2024.

1. MONTHLY RENT: The Tenant agrees to pay monthly rent of Rs 35,000 before the 5th of each calendar month.
2. SECURITY DEPOSIT: The Tenant has deposited an advance sum of Rs 1,05,000 (3 months rent) with the Landlord.
3. NOTICE TO VACATE: A 30 days written notice shall be given by either party prior to vacation of premises.
4. REFUND OF DEPOSIT: Landlord shall inspect premises and refund deposit within 30 days of handover after deducting repainting, deep cleaning, and refurbishment charges.
5. UTILITIES & DISCONNECTION: Landlord reserves the right to disconnect electricity and water supply in the event of any rent delay exceeding 10 days.
6. DISPUTE RESOLUTION: Disputes to be settled in Civil Courts at Delhi.`,
    },
  ];

  const loadPdfJS = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const processSelectedFile = async (file) => {
    if (!file) return;

    setLoading(true);
    setUploadProgress('Reading file...');
    setFilename(file.name);
    setDocContent('');
    setAnalysisResult(null);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const fileSizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    try {
      if (isPdf) {
        setUploadProgress('Loading PDF extractor engine...');
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target.result;
            const pdfjsLib = await loadPdfJS();
            setUploadProgress('Extracting PDF text layer...');
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
              setUploadProgress(`Extracting text from page ${i} of ${pdf.numPages}...`);
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item) => item.str).join(' ');
              fullText += `--- Page ${i} ---\n` + pageText + '\n\n';
            }

            if (!fullText.replace(/--- Page \d+ ---/g, '').trim()) {
              alert(
                'Could not extract text. This PDF appears to be a scanned image without a text layer. Please copy-paste the contract text directly into the editor.'
              );
              setLoading(false);
              setUploadProgress('');
              return;
            }

            setDocContent(fullText);
            setUploadedFile({
              name: file.name,
              size: fileSizeFormatted,
              pageCount: pdf.numPages,
              type: 'PDF',
            });
            setUploadProgress('Auditing document with AI...');
            handleAnalyze(fullText, file.name);
          } catch (pdfErr) {
            console.error('PDF parsing error:', pdfErr);
            alert('Failed to parse PDF text. You can paste the contract text directly into the editor.');
            setLoading(false);
            setUploadProgress('');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          setDocContent(text);
          setUploadedFile({
            name: file.name,
            size: fileSizeFormatted,
            pageCount: 1,
            type: 'TXT',
          });
          setUploadProgress('Auditing document...');
          handleAnalyze(text, file.name);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error(err);
      alert('Error reading uploaded file.');
      setLoading(false);
      setUploadProgress('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setDocContent('');
    setFilename('contract.txt');
    setAnalysisResult(null);
    setUploadProgress('');
  };

  const handleAnalyze = async (contentToAnalyze = docContent, fileToAnalyze = filename) => {
    if (!contentToAnalyze.trim()) return;
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setUploadProgress('Document Intelligence: Segmenting & Auditing Clauses...');
    try {
      const res = await api.post('/documents/analyze-text', {
        content: contentToAnalyze,
        filename: fileToAnalyze,
      });
      setAnalysisResult(res.data.data);
      setActiveReportTab('overview');
    } catch (err) {
      alert('Failed to analyze document. Please verify your connection.');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const handleDownloadReportPdf = () => {
    if (!analysisResult) return;

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 45;
      let cursorY = 50;

      // Header Banner
      doc.setFillColor(11, 31, 51); // deep navy
      doc.rect(0, 0, 595, 65, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('LEGAL NEXUS — CONTRACT INTELLIGENCE AUDIT REPORT', margin, 35);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(201, 162, 39); // legal gold
      doc.text(
        `Generated: ${new Date().toLocaleDateString('en-IN')} | Document: ${analysisResult.filename}`,
        margin,
        52
      );

      cursorY = 85;

      // Document Classification & Safety Score
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, cursorY, 505, 60, 6, 6, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(
        `Classification: ${analysisResult.classification?.categoryLabel || 'Legal Agreement'}`,
        margin + 15,
        cursorY + 22
      );

      const score = analysisResult.riskAssessment?.overallScore || 75;
      const rating = analysisResult.riskAssessment?.riskBadge || 'Review Advised';
      doc.setFontSize(10);
      doc.text(`Overall Safety Score: ${score}/100 (${rating})`, margin + 15, cursorY + 42);

      cursorY += 75;

      // Executive Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('1. EXECUTIVE AUDIT SUMMARY', margin, cursorY);
      cursorY += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const splitSummary = doc.splitTextToSize(analysisResult.summary || '', 505);
      doc.text(splitSummary, margin, cursorY);
      cursorY += splitSummary.length * 12 + 15;

      // Key Extracted Entities
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('2. EXTRACTED CONTRACT METADATA', margin, cursorY);
      cursorY += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const party1 =
        analysisResult.entities?.parties?.partyOne ||
        analysisResult.entities?.parties?.employer ||
        analysisResult.entities?.parties?.landlord ||
        'Party 1';
      const party2 =
        analysisResult.entities?.parties?.partyTwo ||
        analysisResult.entities?.parties?.employee ||
        analysisResult.entities?.parties?.tenant ||
        'Party 2';
      const jurisdiction = analysisResult.entities?.jurisdiction || 'India';
      const notice = analysisResult.entities?.noticePeriods?.[0] || 'Standard';

      doc.text(`• Identified Parties: ${party1} vs ${party2}`, margin + 10, cursorY);
      cursorY += 14;
      doc.text(`• Governing Jurisdiction: ${jurisdiction}`, margin + 10, cursorY);
      cursorY += 14;
      doc.text(`• Notice Period: ${notice}`, margin + 10, cursorY);
      cursorY += 20;

      // Attention Items
      if (analysisResult.attentionSummary && analysisResult.attentionSummary.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(180, 83, 9);
        doc.text(`3. RED FLAGS & ATTENTION ITEMS (${analysisResult.attentionSummary.length} Found)`, margin, cursorY);
        cursorY += 15;

        analysisResult.attentionSummary.forEach((att) => {
          if (cursorY > 740) {
            doc.addPage();
            cursorY = 45;
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(`• ${att.clauseTitle}:`, margin + 10, cursorY);
          cursorY += 12;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          const splitAssessment = doc.splitTextToSize(`Assessment: ${att.assessment}`, 480);
          doc.text(splitAssessment, margin + 20, cursorY);
          cursorY += splitAssessment.length * 11 + 4;

          if (att.recommendation) {
            doc.setTextColor(3, 105, 161);
            const splitRec = doc.splitTextToSize(`Proposed Redline: ${att.recommendation}`, 480);
            doc.text(splitRec, margin + 20, cursorY);
            cursorY += splitRec.length * 11 + 8;
          }
        });
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Legal Nexus Document AI • Page ${p} of ${totalPages} • Grounded in Indian Law`, margin, 810);
      }

      doc.save(`LegalNexus_Audit_${(analysisResult.filename || 'report').replace(/\.[^/.]+$/, '')}.pdf`);
    } catch (pdfErr) {
      console.error('Failed to export PDF:', pdfErr);
      alert('Failed to generate PDF audit report.');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-red-800 bg-red-50 border-red-200';
  };

  const getRiskPill = (riskLevel) => {
    if (riskLevel === 'HIGH') {
      return (
        <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold rounded-md flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-red-600" />
          High Risk / Red Flag
        </span>
      );
    }
    if (riskLevel === 'MEDIUM') {
      return (
        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-md flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Review Advised
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-md flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Standard Term
      </span>
    );
  };

  const filteredClauses = (analysisResult?.clauses || []).filter((c) => {
    if (clauseFilter === 'ALL') return true;
    if (clauseFilter === 'HIGH') return c.riskLevel === 'HIGH';
    if (clauseFilter === 'MEDIUM') return c.riskLevel === 'MEDIUM';
    if (clauseFilter === 'STANDARD') return c.riskLevel === 'STANDARD' || c.riskLevel === 'LOW';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0B1F33] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-legal flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 bg-legal-blue/20 text-sky-300 border border-legal-blue/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Document Intelligence & OCR
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Contract & Legal Document Auditor
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Upload PDF contracts, employment agreements, leases, or notices to extract clauses, detect hidden liabilities, check statutory compliance, and get redline recommendations.
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={handleDownloadReportPdf}
            className="px-5 py-3 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4 text-legal-gold" />
            <span>Download Audit Report (PDF)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input & Upload Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-legal-blue" />
                Upload or Paste Contract
              </h3>
            </div>

            {/* UPLOAD STATUS / FILE CARD */}
            {uploadedFile ? (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl text-white font-bold text-xs shadow ${
                        uploadedFile.type === 'PDF' ? 'bg-red-600' : 'bg-legal-blue'
                      }`}
                    >
                      {uploadedFile.type}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={uploadedFile.name}>
                        {uploadedFile.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {uploadedFile.size} • {uploadedFile.pageCount}{' '}
                        {uploadedFile.pageCount === 1 ? 'Page' : 'Pages'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearFile}
                    title="Remove file"
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-blue-100">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    File Text Extracted & Loaded
                  </span>
                  <label className="text-legal-blue hover:underline font-bold cursor-pointer">
                    Change File
                    <input
                      type="file"
                      accept=".pdf,.txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>
            ) : (
              /* Drag & Drop File Upload Area */
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Select Legal Document:
                </span>
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center border-2 border-dashed px-4 py-6 rounded-2xl cursor-pointer transition ${
                    isDragging
                      ? 'border-legal-blue bg-blue-50/60 scale-[0.99]'
                      : 'border-slate-300 hover:border-legal-blue/60 bg-slate-50/70 hover:bg-blue-50/20'
                  }`}
                >
                  <div className="p-3 bg-white rounded-2xl shadow-subtle border border-slate-200 mb-2">
                    <UploadCloud className="w-6 h-6 text-legal-blue" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {isDragging ? 'Drop your file here' : 'Click to browse or drag & drop'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Supports <strong>.PDF</strong> (page-by-page OCR), <strong>.TXT</strong>, <strong>.MD</strong>
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
            )}

            {/* Quick Sample Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Or test with standard samples:
              </span>
              <div className="flex flex-col gap-1.5">
                {sampleTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDocContent(t.content);
                      setFilename(t.filename);
                      setUploadedFile({
                        name: t.filename,
                        size: t.size,
                        pageCount: t.pageCount,
                        type: t.type,
                      });
                      handleAnalyze(t.content, t.filename);
                    }}
                    className="text-left px-3.5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-legal-blue text-xs rounded-xl border border-slate-200 transition flex items-center justify-between shadow-subtle"
                  >
                    <span className="truncate max-w-[280px] font-medium">⚡ {t.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border">
                      {t.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea for Direct Content or Extracted View */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Extracted Document Text
                </label>
                {docContent && (
                  <span className="text-[10px] text-slate-400 font-mono">{docContent.length} chars</span>
                )}
              </div>
              <textarea
                rows={7}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Contract text extracted from PDF or pasted directly will appear here..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-legal-blue focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Loading & Progress status */}
            {loading && uploadProgress && (
              <div className="p-3 bg-blue-50 text-legal-blue border border-blue-200 rounded-2xl text-xs flex items-center gap-2.5 animate-pulse">
                <span className="w-3.5 h-3.5 border-2 border-legal-blue border-t-transparent rounded-full animate-spin"></span>
                <span className="font-medium">{uploadProgress}</span>
              </div>
            )}

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !docContent.trim()}
              className="w-full py-3 bg-gradient-to-r from-legal-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Auditing Document Clauses...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-legal-gold" />
                  <span>Run Legal Audit & Risk Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Structured Analysis Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* 1. EXECUTIVE DASHBOARD & RISK GAUGE */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-legal-blue bg-blue-50 px-2 py-0.5 rounded uppercase">
                        {analysisResult.classification?.categoryLabel || 'Contract Document'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {analysisResult.pageCount || 1} {analysisResult.pageCount === 1 ? 'Page' : 'Pages'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Legal Risk & Clause Compliance Audit
                    </h3>
                  </div>

                  {/* Safety Score Pill */}
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Safety Score</span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {analysisResult.riskAssessment?.overallScore || 70}/100
                      </span>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${getScoreColor(
                        analysisResult.riskAssessment?.overallScore || 70
                      )}`}
                    >
                      {analysisResult.riskAssessment?.riskBadge || 'Review Advised'}
                    </div>
                  </div>
                </div>

                {/* 4 Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Clauses Audited</span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {analysisResult.clauses?.length || 0} Identified
                    </span>
                  </div>

                  <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100">
                    <span className="text-[10px] text-red-500 font-bold uppercase block">Red Flags</span>
                    <span className="font-extrabold text-red-700 text-sm">
                      {analysisResult.attentionSummary?.length || 0} Detected
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Jurisdiction</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {analysisResult.entities?.jurisdiction || 'India'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Notice Period</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {analysisResult.entities?.noticePeriods?.[0] || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. REPORT NAVIGATION TABS */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto text-xs font-semibold">
                  {[
                    { id: 'overview', label: '1. Executive Brief', icon: <Info className="w-3.5 h-3.5" /> },
                    {
                      id: 'clauses',
                      label: `2. Clause Audit (${analysisResult.clauses?.length || 0})`,
                      icon: <FileCode className="w-3.5 h-3.5" />,
                    },
                    {
                      id: 'gaps',
                      label: `3. Missing Protections (${analysisResult.missingProtections?.length || 0})`,
                      icon: <ShieldAlert className="w-3.5 h-3.5" />,
                    },
                    { id: 'compliance', label: '4. Statutory Citations', icon: <Scale className="w-3.5 h-3.5" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveReportTab(tab.id)}
                      className={`py-3.5 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                        activeReportTab === tab.id
                          ? 'border-legal-blue text-legal-blue bg-white font-bold'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5 sm:p-6">
                  {/* TAB 1: EXECUTIVE BRIEF */}
                  {activeReportTab === 'overview' && (
                    <div className="space-y-4">
                      {/* Summary Text */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-legal-blue" />
                          Plain-Language Legal Assessment:
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{analysisResult.summary}</p>
                      </div>

                      {/* Identified Parties */}
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-legal-blue" />
                          Contractual Relationship (Party 1 & Party 2)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Party 1</span>
                            <span className="font-bold text-slate-800">
                              {analysisResult.entities?.parties?.partyOne ||
                                analysisResult.entities?.parties?.employer ||
                                analysisResult.entities?.parties?.landlord ||
                                'First Party'}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Party 2</span>
                            <span className="font-bold text-slate-800">
                              {analysisResult.entities?.parties?.partyTwo ||
                                analysisResult.entities?.parties?.employee ||
                                analysisResult.entities?.parties?.tenant ||
                                'Second Party'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Attention Items Warning */}
                      {analysisResult.attentionSummary && analysisResult.attentionSummary.length > 0 && (
                        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              Critical Clauses Requiring Review or Amendment:
                            </span>
                            <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                              {analysisResult.attentionSummary.length} Flags
                            </span>
                          </div>
                          <div className="space-y-2">
                            {analysisResult.attentionSummary.map((att, i) => (
                              <div key={i} className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <strong className="text-slate-900">{att.clauseTitle}</strong>
                                  {getRiskPill(att.riskLevel || 'HIGH')}
                                </div>
                                <p className="text-amber-900 text-[11px] leading-relaxed">{att.assessment}</p>
                                {att.recommendation && (
                                  <div className="text-[11px] text-legal-blue bg-blue-50 p-2.5 rounded-lg mt-1 border border-blue-100 font-medium">
                                    💡 <strong>Suggested Amendment:</strong> {att.recommendation}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: CLAUSE-BY-CLAUSE AUDIT */}
                  {activeReportTab === 'clauses' && (
                    <div className="space-y-4">
                      {/* Filter Chips */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                        <span className="text-slate-400 text-[11px] shrink-0 font-medium">Filter by:</span>
                        {[
                          { id: 'ALL', label: `All (${analysisResult.clauses?.length || 0})` },
                          {
                            id: 'HIGH',
                            label: `🛑 Red Flags (${
                              analysisResult.clauses?.filter((c) => c.riskLevel === 'HIGH').length || 0
                            })`,
                          },
                          {
                            id: 'MEDIUM',
                            label: `⚠️ Review Advised (${
                              analysisResult.clauses?.filter((c) => c.riskLevel === 'MEDIUM').length || 0
                            })`,
                          },
                          {
                            id: 'STANDARD',
                            label: `✅ Standard (${
                              analysisResult.clauses?.filter(
                                (c) => c.riskLevel === 'STANDARD' || c.riskLevel === 'LOW'
                              ).length || 0
                            })`,
                          },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setClauseFilter(btn.id)}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition ${
                              clauseFilter === btn.id
                                ? 'bg-[#0B1F33] text-white border-slate-900'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      {/* Clauses Accordion */}
                      <div className="space-y-2.5">
                        {filteredClauses.map((c, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                            <div
                              onClick={() => setExpandedClause(expandedClause === idx ? null : idx)}
                              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="font-bold text-slate-800">{c.title}</span>
                                {getRiskPill(c.riskLevel || (c.requiresAttention ? 'HIGH' : 'STANDARD'))}
                              </div>
                              {expandedClause === idx ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>

                            {expandedClause === idx && (
                              <div className="p-4 bg-white space-y-3 border-t border-slate-100">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                    Original Clause Text:
                                  </span>
                                  <p className="font-mono text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                                    {c.text}
                                  </p>
                                </div>

                                {c.riskAssessment && (
                                  <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                      Risk Assessment:
                                    </span>
                                    <p className="text-slate-800 leading-relaxed font-medium">{c.riskAssessment}</p>
                                  </div>
                                )}

                                {c.recommendation && (
                                  <div className="p-3 bg-blue-50 text-legal-blue rounded-xl border border-blue-100 text-[11px]">
                                    💡 <strong>Recommended Redline:</strong> {c.recommendation}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MISSING PROTECTIONS */}
                  {activeReportTab === 'gaps' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">
                        Standard statutory and protective clauses that are absent from this contract draft:
                      </p>
                      {analysisResult.missingProtections?.map((gap, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            {gap.protectionName || gap.title || 'Missing Protection Clause'}
                          </h4>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {gap.rationale || gap.description || 'Recommended for mutual balance and legal compliance.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 4: STATUTORY CITATIONS */}
                  {activeReportTab === 'compliance' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">
                        Applicable statutory acts governing this agreement category under Indian law:
                      </p>
                      {analysisResult.statutoryCitations?.map((stat, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-900">{stat.act} — {stat.section}</strong>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Authoritative
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{stat.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-subtle text-center text-slate-400 space-y-3 min-h-[480px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-navy-50 text-legal-blue flex items-center justify-center border border-navy-100 shadow-sm">
                <FileCheck className="w-7 h-7 text-legal-blue" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Document Intelligence & Clause Auditor</h4>
              <p className="text-xs max-w-sm leading-relaxed text-slate-500">
                Upload your legal agreement or contract on the left. The AI auditor will calculate safety scores, identify red flags, segment clauses, and check compliance against Indian statutory standards.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
