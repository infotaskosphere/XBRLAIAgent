import React, { useRef } from 'react';
import { Upload, FileCode, FileText, Plus, Trash2, Eye, ShieldCheck, CheckCircle2, ArrowRight, Layers, FileSpreadsheet } from 'lucide-react';
import { UploadedDocument, FileRole } from '../types';
import { PreviousYearReference } from '../services/previousYearTaggingEngine';

interface PreviousYearTabProps {
  documents: UploadedDocument[];
  onUpload: (files: FileList | File[], role: FileRole, year: 'PREVIOUS') => void;
  onRemove: (id: string) => void;
  onPreview: (doc: UploadedDocument) => void;
  onBuildReference: () => void;
  isProcessing: boolean;
  reference?: PreviousYearReference | null;
}

export const PreviousYearTab: React.FC<PreviousYearTabProps> = ({
  documents,
  onUpload,
  onRemove,
  onPreview,
  onBuildReference,
  isProcessing,
  reference
}) => {
  const xmlInputRef = useRef<HTMLInputElement>(null);
  const financialInputRef = useRef<HTMLInputElement>(null);
  const auditInputRef = useRef<HTMLInputElement>(null);
  const multiSupportingInputRef = useRef<HTMLInputElement>(null);

  const xmlDoc = documents.find(d => d.role === 'PY_XBRL_XML' || d.role === 'PY_SAG_XAG');
  const financialDoc = documents.find(d => d.role === 'PY_FINANCIAL_STATEMENTS');
  const auditDoc = documents.find(d => d.role === 'PY_AUDIT_REPORT');
  const supportingDocs = documents.filter(d => d.role === 'PY_SUPPORTING');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, role: FileRole) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files, role, 'PREVIOUS');
    }
  };

  const getFileBadge = (type: string) => {
    switch (type) {
      case 'xml':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><FileCode className="w-3 h-3 text-amber-600" /> XBRL XML/XAG</span>;
      case 'excel':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><FileSpreadsheet className="w-3 h-3 text-emerald-600" /> Excel Sheet</span>;
      case 'word':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><FileText className="w-3 h-3 text-blue-600" /> Word Doc</span>;
      default:
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><FileText className="w-3 h-3 text-red-600" /> PDF Document</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#145ca8] text-white text-xs font-bold px-2 py-0.5 rounded">STEP 02</span>
              <h2 className="text-xl font-bold text-[#071b36]">Previous-Year Reference & Taxonomy Grounding</h2>
            </div>
            <p className="text-sm text-slate-600 max-w-3xl">
              Upload the previous year's XBRL XML or SAG XAG file. The engine analyzes every concept, role, period context, 
              dimensional member, and populated schedule used previously so that new filings replicate the exact audited structure with zero discrepancies.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBuildReference}
              disabled={documents.length === 0 || isProcessing}
              className="px-5 py-2.5 bg-[#145ca8] hover:bg-[#186dc4] active:bg-[#114f91] text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isProcessing ? 'Tagging Previous-Year Evidence...' : 'Build Reference Map'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {reference ? (
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <div className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Previous-Year Tagging Engine</div>
              <div className="text-sm font-bold text-[#071b36] mt-1">
                {reference.tags.length} facts tagged • {reference.coverage.toFixed(1)}% coverage
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {reference.xbrlFactCount} XBRL • {reference.tabularFactCount} tabular • {reference.textFactCount} text matches
                {reference.contexts ? ' • ' + reference.contexts + ' contexts parsed' : ''}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Authoritative PY linked</span>
              {reference.conflicts.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-red-50 text-red-800 border border-red-200">
                  {reference.conflicts.length} conflicts
                </span>
              )}
              {reference.warnings.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {reference.warnings.length} warnings
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {/* Main Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Slot 1: Previous Year XBRL / XML / XAG */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'PY_XBRL_XML')}
          className={`bg-white rounded-xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between ${
            xmlDoc ? 'border-amber-300 bg-amber-50/20' : 'border-dashed border-slate-300 hover:border-[#145ca8]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Authoritative XBRL Structure</span>
              {xmlDoc ? (
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Loaded
                </span>
              ) : (
                <span className="text-xs text-amber-600 font-semibold">Critical Reference</span>
              )}
            </div>
            <h3 className="font-bold text-[#071b36] text-base mb-1">Previous XBRL / XML / XAG</h3>
            <p className="text-xs text-slate-500 mb-4">Last year's official MCA XBRL instance document (.xml), SAG XAG file, or MCA zip package.</p>

            {xmlDoc ? (
              <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs text-slate-800 break-all">{xmlDoc.name}</span>
                  <button onClick={() => onRemove(xmlDoc.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{(xmlDoc.size / 1024).toFixed(1)} KB</span>
                  {getFileBadge(xmlDoc.type)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Extracted Facts: <strong className="text-slate-700">{xmlDoc.charCount.toLocaleString()}</strong> characters parsed
                </div>
                <button
                  onClick={() => onPreview(xmlDoc)}
                  className="w-full mt-2 py-1 px-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect XML Structure
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <input
              type="file"
              ref={xmlInputRef}
              onChange={(e) => e.target.files && onUpload(e.target.files, 'PY_XBRL_XML', 'PREVIOUS')}
              accept=".xml,.xag,.zip"
              className="hidden"
            />
            <button
              onClick={() => xmlInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#145ca8] hover:text-white border border-slate-300 hover:border-[#145ca8] text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{xmlDoc ? 'Replace XBRL/XML' : 'Browse / Drop Previous XBRL XML'}</span>
            </button>
          </div>
        </div>

        {/* Slot 2: Previous Year Financial / XBRL PDF */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'PY_FINANCIAL_STATEMENTS')}
          className={`bg-white rounded-xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between ${
            financialDoc ? 'border-emerald-300 bg-emerald-50/20' : 'border-dashed border-slate-300 hover:border-[#145ca8]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comparative Values</span>
              {financialDoc ? (
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Ready
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">Recommended</span>
              )}
            </div>
            <h3 className="font-bold text-[#071b36] text-base mb-1">Previous Financial Statements</h3>
            <p className="text-xs text-slate-500 mb-4">Audited Balance Sheet, P&L, and schedules for the preceding financial year.</p>

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
                <button
                  onClick={() => onPreview(financialDoc)}
                  className="w-full mt-2 py-1 px-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect Financials
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <input
              type="file"
              ref={financialInputRef}
              onChange={(e) => e.target.files && onUpload(e.target.files, 'PY_FINANCIAL_STATEMENTS', 'PREVIOUS')}
              accept=".pdf,.xlsx,.xls,.docx,.doc"
              className="hidden"
            />
            <button
              onClick={() => financialInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#145ca8] hover:text-white border border-slate-300 hover:border-[#145ca8] text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{financialDoc ? 'Replace Financials' : 'Browse / Drop Prior Financials'}</span>
            </button>
          </div>
        </div>

        {/* Slot 3: Previous Year Audit Report */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'PY_AUDIT_REPORT')}
          className={`bg-white rounded-xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between ${
            auditDoc ? 'border-emerald-300 bg-emerald-50/20' : 'border-dashed border-slate-300 hover:border-[#145ca8]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auditor Reference</span>
              {auditDoc ? (
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Ready
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">Recommended</span>
              )}
            </div>
            <h3 className="font-bold text-[#071b36] text-base mb-1">Previous Audit Report</h3>
            <p className="text-xs text-slate-500 mb-4">Previous auditor report, CARO clauses, qualifications, and emphasis of matter notes.</p>

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
                <button
                  onClick={() => onPreview(auditDoc)}
                  className="w-full mt-2 py-1 px-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect Report Text
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <input
              type="file"
              ref={auditInputRef}
              onChange={(e) => e.target.files && onUpload(e.target.files, 'PY_AUDIT_REPORT', 'PREVIOUS')}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
            <button
              onClick={() => auditInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#145ca8] hover:text-white border border-slate-300 hover:border-[#145ca8] text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{auditDoc ? 'Replace Audit Report' : 'Browse / Drop Prior Audit'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Multiple Other Supporting Reference Documents */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-[#071b36] text-base">Previous-Year Supporting & Taxonomy Schedules</h3>
            <p className="text-xs text-slate-500">Upload previous Excel groupings, Word disclosure notes, or custom linkbase files.</p>
          </div>
          <div>
            <input
              type="file"
              ref={multiSupportingInputRef}
              onChange={(e) => e.target.files && onUpload(e.target.files, 'PY_SUPPORTING', 'PREVIOUS')}
              accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.txt"
              multiple
              className="hidden"
            />
            <button
              onClick={() => multiSupportingInputRef.current?.click()}
              className="px-4 py-2 bg-[#f0f4f9] hover:bg-[#145ca8] hover:text-white text-[#145ca8] font-bold text-xs rounded-lg transition-colors border border-blue-200 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Prior Year Supporting (PDF / Excel / Word)</span>
            </button>
          </div>
        </div>

        {supportingDocs.length === 0 ? (
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'PY_SUPPORTING')}
            className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50/50"
          >
            <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 mb-0.5">No additional prior-year documents attached</p>
            <p className="text-[11px] text-slate-400">Attach earlier tax audits, general ledger groupings, or notes to enrich prior year concept mapping</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {supportingDocs.map((doc, idx) => (
              <div key={doc.id} className="p-3 flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  {getFileBadge(doc.type)}
                  <div className="truncate">
                    <span className="font-semibold text-xs text-slate-800 block truncate">{doc.name}</span>
                    <span className="text-[11px] text-slate-500">{(doc.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreview(doc)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
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

      {/* Structural Reference Rule */}
      <div className="bg-[#eff9fc] border border-[#bee3ed] rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#145ca8] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#204a6e] space-y-1">
          <strong className="font-bold text-[#071b36] block">Authoritative Reference Guarantee</strong>
          <p>
            The previous XML/XAG instance document serves as the ground truth for concept taxonomy naming, dimension axes, 
            and context hierarchy. The financial PDFs and supporting documents provide contextual validation for notes and disclosures. 
            This ensures that your new SAG Gen XBRL filing complies with previously accepted MCA filings while seamlessly reflecting current numbers.
          </p>
        </div>
      </div>

    </div>
  );
};
