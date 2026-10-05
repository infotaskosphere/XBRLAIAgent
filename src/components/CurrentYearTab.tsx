import React, { useRef } from 'react';
import { Upload, FileText, Table, FileSpreadsheet, Plus, Trash2, Eye, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { UploadedDocument, FileRole, MappedFact, TaxonomyStandard } from '../types';
import { ExecutiveSummaryPanel } from './ExecutiveSummaryPanel';

interface CurrentYearTabProps {
  documents: UploadedDocument[];
  onUpload: (files: FileList | File[], role: FileRole, year: 'CURRENT') => void;
  onRemove: (id: string) => void;
  onPreview: (doc: UploadedDocument) => void;
  onAnalyze: () => void;
  isProcessing: boolean;
  facts?: MappedFact[];
  taxonomy?: TaxonomyStandard;
  onNavigateToMapping?: () => void;
  onNavigateToSag?: () => void;
}

export const CurrentYearTab: React.FC<CurrentYearTabProps> = ({
  documents,
  onUpload,
  onRemove,
  onPreview,
  onAnalyze,
  isProcessing,
  facts,
  taxonomy = 'IND_AS',
  onNavigateToMapping,
  onNavigateToSag
}) => {
  const auditInputRef = useRef<HTMLInputElement>(null);
  const financialInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLInputElement>(null);
  const multiSupportingInputRef = useRef<HTMLInputElement>(null);

  const auditDoc = documents.find(d => d.role === 'CY_AUDIT_REPORT');
  const financialDoc = documents.find(d => d.role === 'CY_FINANCIAL_STATEMENTS');
  const notesDoc = documents.find(d => d.role === 'CY_NOTES_ACCOUNTS');
  const supportingDocs = documents.filter(d => d.role === 'CY_SUPPORTING');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, role: FileRole) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files, role, 'CURRENT');
    }
  };

  const getFileBadge = (type: string) => {
    switch (type) {
      case 'excel':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><FileSpreadsheet className="w-3 h-3 text-emerald-600" /> Excel Sheet</span>;
      case 'word':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><FileText className="w-3 h-3 text-blue-600" /> Word Doc</span>;
      case 'pdf':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><FileText className="w-3 h-3 text-red-600" /> PDF Document</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded">File</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* High-Level Executive Summary Dashboard Panel on Landing Page */}
      {facts && facts.length > 0 && (
        <ExecutiveSummaryPanel
          facts={facts}
          taxonomy={taxonomy}
          onNavigateToMapping={onNavigateToMapping || onAnalyze}
          onNavigateToSag={onNavigateToSag || onAnalyze}
        />
      )}

      {/* Hero Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#145ca8] text-white text-xs font-bold px-2 py-0.5 rounded">STEP 01</span>
              <h2 className="text-xl font-bold text-[#071b36]">Current-Year Financial Sources</h2>
            </div>
            <p className="text-sm text-slate-600 max-w-3xl">
              Upload the current audit report plus financial statements, schedules, notes to accounts, and general ledgers. 
              The engine automatically parses and cross-verifies figures from <span className="font-semibold text-slate-800">PDF, Excel (.xlsx, .xls, .csv), and Word (.docx, .doc)</span> files.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onAnalyze}
              disabled={documents.length === 0 || isProcessing}
              className="px-5 py-2.5 bg-[#145ca8] hover:bg-[#186dc4] active:bg-[#114f91] text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isProcessing ? 'Analyzing...' : 'Analyze Current Sources'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Slot 1: Current Audit Report */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'CY_AUDIT_REPORT')}
          className={`bg-white rounded-xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between ${
            auditDoc ? 'border-emerald-300 bg-emerald-50/20' : 'border-dashed border-slate-300 hover:border-[#145ca8]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Evidence</span>
              {auditDoc ? (
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Ready
                </span>
              ) : (
                <span className="text-xs text-amber-600 font-semibold">Required</span>
              )}
            </div>
            <h3 className="font-bold text-[#071b36] text-base mb-1">Current Audit Report</h3>
            <p className="text-xs text-slate-500 mb-4">Independent Auditor's Report with opinion, CARO 2020 annexures, and signatures.</p>

            {auditDoc ? (
              <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs text-slate-800 break-all">{auditDoc.name}</span>
                  <button onClick={() => onRemove(auditDoc.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{(auditDoc.size / 1024).toFixed(1)} KB</span>
                  {getFileBadge(auditDoc.type)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Extracted: <strong className="text-slate-700">{auditDoc.charCount.toLocaleString()}</strong> characters
                </div>
                <button
                  onClick={() => onPreview(auditDoc)}
                  className="w-full mt-2 py-1 px-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect Extracted Text
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <input
              type="file"
              ref={auditInputRef}
              onChange={(e) => e.target.files && onUpload(e.target.files, 'CY_AUDIT_REPORT', 'CURRENT')}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
            <button
              onClick={() => auditInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#145ca8] hover:text-white border border-slate-300 hover:border-[#145ca8] text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{auditDoc ? 'Replace Audit Report' : 'Browse / Drop Audit Report'}</span>
            </button>
          </div>
        </div>

        {/* Slot 2: Current Financial Statements (PDF / Excel) */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'CY_FINANCIAL_STATEMENTS')}
          className={`bg-white rounded-xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between ${
            financialDoc ? 'border-emerald-300 bg-emerald-50/20' : 'border-dashed border-slate-300 hover:border-[#145ca8]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Numerical Face</span>
              {financialDoc ? (
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Ready
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">Recommended</span>
              )}
            </div>
            <h3 className="font-bold text-[#071b36] text-base mb-1">Financial Statements / Excel</h3>
            <p className="text-xs text-slate-500 mb-4">Balance Sheet, Profit & Loss statement, and Cash Flow in PDF or Excel workbook format.</p>

            {financialDoc ? (
              <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs text-slate-800 break-all">{financialDoc.name}</span>
                  <button onClick={() => onRemove(financialDoc.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{(financialDoc.size / 1024).toFixed(1)} KB</span>
                  {getFileBadge(financialDoc.type)}
                </div>
                {financialDoc.extractedTables && financialDoc.extractedTables.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    Sheets Parsed: <strong className="text-slate-700">{financialDoc.extractedTables.length}</strong> worksheet(s)
                  </div>
                )}
                <button
                  onClick={() => onPreview(financialDoc)}
                  className="w-full mt-2 py-1 px-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect Financial Data
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <input
              type="file"
              ref={financialInputRef}
              onChange={(e) => e.target.files && onUpload(e.target.files, 'CY_FINANCIAL_STATEMENTS', 'CURRENT')}
              accept=".pdf,.xlsx,.xls,.csv,.docx,.doc"
              className="hidden"
            />
            <button
              onClick={() => financialInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#145ca8] hover:text-white border border-slate-300 hover:border-[#145ca8] text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{financialDoc ? 'Replace Financials' : 'Browse / Drop Financials'}</span>
            </button>
          </div>
        </div>

        {/* Slot 3: Current Notes to Accounts / Schedules */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'CY_NOTES_ACCOUNTS')}
          className={`bg-white rounded-xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between ${
            notesDoc ? 'border-emerald-300 bg-emerald-50/20' : 'border-dashed border-slate-300 hover:border-[#145ca8]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disclosures</span>
              {notesDoc ? (
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Ready
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">Optional</span>
              )}
            </div>
            <h3 className="font-bold text-[#071b36] text-base mb-1">Notes to Accounts / Word</h3>
            <p className="text-xs text-slate-500 mb-4">Detailed notes, accounting policies, share capital disclosures, or schedule groupings.</p>

            {notesDoc ? (
              <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs text-slate-800 break-all">{notesDoc.name}</span>
                  <button onClick={() => onRemove(notesDoc.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{(notesDoc.size / 1024).toFixed(1)} KB</span>
                  {getFileBadge(notesDoc.type)}
                </div>
                <button
                  onClick={() => onPreview(notesDoc)}
                  className="w-full mt-2 py-1 px-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect Notes Content
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <input
              type="file"
              ref={notesInputRef}
              onChange={(e) => e.target.files && onUpload(e.target.files, 'CY_NOTES_ACCOUNTS', 'CURRENT')}
              accept=".docx,.doc,.pdf,.xlsx,.xls,.txt"
              className="hidden"
            />
            <button
              onClick={() => notesInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#145ca8] hover:text-white border border-slate-300 hover:border-[#145ca8] text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{notesDoc ? 'Replace Notes' : 'Browse / Drop Notes'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Multiple Other Supporting Documents Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-[#071b36] text-base">Additional Current-Year Supporting Documents</h3>
            <p className="text-xs text-slate-500">Attach multiple Excel schedules, Word directors' reports, trial balances, or tax audit reports.</p>
          </div>
          <div>
            <input
              type="file"
              ref={multiSupportingInputRef}
              onChange={(e) => e.target.files && onUpload(e.target.files, 'CY_SUPPORTING', 'CURRENT')}
              accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.txt"
              multiple
              className="hidden"
            />
            <button
              onClick={() => multiSupportingInputRef.current?.click()}
              className="px-4 py-2 bg-[#f0f4f9] hover:bg-[#145ca8] hover:text-white text-[#145ca8] font-bold text-xs rounded-lg transition-colors border border-blue-200 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Multiple Documents (PDF / Excel / Word)</span>
            </button>
          </div>
        </div>

        {supportingDocs.length === 0 ? (
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'CY_SUPPORTING')}
            className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center bg-slate-50/50"
          >
            <Table className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 mb-1">No additional supporting files attached yet</p>
            <p className="text-[11px] text-slate-400">Drag & drop multiple PDFs, Excel sheets, or Word docs here to provide supporting line item evidence</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {supportingDocs.map((doc, idx) => (
              <div key={doc.id} className="p-3.5 flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  {getFileBadge(doc.type)}
                  <div className="truncate">
                    <span className="font-semibold text-xs text-slate-800 block truncate">{doc.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {(doc.size / 1024).toFixed(1)} KB • {doc.charCount.toLocaleString()} chars
                      {doc.extractedTables && doc.extractedTables.length > 0 ? ` • ${doc.extractedTables.length} sheets` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreview(doc)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Extracted
                  </button>
                  <button
                    onClick={() => onRemove(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accuracy Rule Info Card */}
      <div className="bg-[#eff9fc] border border-[#bee3ed] rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#145ca8] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#204a6e] space-y-1">
          <strong className="font-bold text-[#071b36] block">Accuracy & Anti-Pollution Rule</strong>
          <p>
            The software strictly forbids blindly carrying forward prior-year financial figures into the current-year column. 
            Prior-year records are exclusively utilized for concept tag matching, context hierarchy, and schedule alignments. 
            Every single current-year value is substantiated by the uploaded current-year audit report, financial statements, Excel sheets, and Word notes.
          </p>
        </div>
      </div>

    </div>
  );
};
