import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileCode, Terminal, CheckCircle2, Copy, Eye, Database, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { MappedFact, SagExportOptions, TaxonomyStandard } from '../types';
import { generateSagXagContent, generateSagExcelWorkbook, generateMcaXbrlInstance, generateSagWindowsScript } from '../services/sagGenXbrlGenerator';

interface SagGenXbrlTabProps {
  facts: MappedFact[];
  taxonomy: TaxonomyStandard;
}

export const SagGenXbrlTab: React.FC<SagGenXbrlTabProps> = ({ facts, taxonomy }) => {
  const [options, setOptions] = useState<SagExportOptions>({
    companyCin: 'L17110MH1995PLC085000',
    companyName: 'TASKOSPHERE ENTERPRISE SOLUTIONS LIMITED',
    yearStartDate: '2023-04-01',
    yearEndDate: '2024-03-31',
    taxonomy,
    unitScale: 'LAKHS',
    includeCaro: true,
    includeAuditReport: true,
    natureOfReport: 'Standalone'
  });

  const [activePreview, setActivePreview] = useState<'XAG' | 'MCA_XML' | 'SCRIPT'>('XAG');
  const [copied, setCopied] = useState(false);

  // Sync taxonomy if parent changes
  React.useEffect(() => {
    setOptions(prev => ({ ...prev, taxonomy }));
  }, [taxonomy]);

  const xagContent = React.useMemo(() => generateSagXagContent(facts, options), [facts, options]);
  const mcaXmlContent = React.useMemo(() => generateMcaXbrlInstance(facts, options), [facts, options]);
  const scriptContent = React.useMemo(() => generateSagWindowsScript(options), [options]);

  const downloadFile = (filename: string, content: string | Uint8Array, mimeType: string) => {
    const blob = new Blob([content as any], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadXag = () => {
    downloadFile(`SAG_GenXBRL_${options.companyCin}.xag`, xagContent, 'application/xml');
  };

  const handleDownloadExcel = () => {
    const bytes = generateSagExcelWorkbook(facts, options);
    downloadFile(`SAG_GenXBRL_Import_${options.companyCin}.xlsx`, bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  const handleDownloadMcaXml = () => {
    downloadFile(`MCA_AOC4_XBRL_${options.companyCin}.xml`, mcaXmlContent, 'application/xml');
  };

  const handleDownloadScript = () => {
    downloadFile(`sag_autowrite_${options.companyCin}.vbs`, scriptContent, 'text/plain');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-[#145ca8] text-white text-xs font-bold px-2 py-0.5 rounded">STEP 04</span>
          <h2 className="text-xl font-bold text-[#071b36]">SAG Gen XBRL Automated Writer & Data Bridge</h2>
        </div>
        <p className="text-sm text-slate-600 max-w-4xl">
          Instantly generate and write fully structured data into <span className="font-semibold text-slate-800">SAG Infotech Gen XBRL</span> without manual re-keying. 
          Choose between native SAG XAG export, multi-sheet SAG Excel templates, official MCA XML instances, or direct Windows automation scripts.
        </p>
      </div>

      {/* Company Filing Profile */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-[#071b36] text-sm mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#145ca8]" /> Filing Company Master & Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Corporate Identity Number (CIN)</label>
            <input
              type="text"
              value={options.companyCin}
              onChange={(e) => setOptions({ ...options, companyCin: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Company Name</label>
            <input
              type="text"
              value={options.companyName}
              onChange={(e) => setOptions({ ...options, companyName: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 truncate"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Financial Year End</label>
            <input
              type="date"
              value={options.yearEndDate}
              onChange={(e) => setOptions({ ...options, yearEndDate: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Monetary Unit Scale</label>
            <select
              value={options.unitScale}
              onChange={(e) => setOptions({ ...options, unitScale: e.target.value as any })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
            >
              <option value="EXACT">Exact (Rupees - 0 decimals)</option>
              <option value="THOUSANDS">Thousands (-3 decimals)</option>
              <option value="LAKHS">Lakhs (-5 decimals) [Standard]</option>
              <option value="CRORES">Crores (-7 decimals)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Primary 1-Click Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: SAG XAG Export */}
        <div className="bg-gradient-to-b from-white to-blue-50/30 p-5 rounded-xl border border-blue-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-blue-100 text-[#145ca8] rounded-lg flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">SAG Gen XBRL .XAG</h4>
            <p className="text-xs text-slate-500 mb-4">
              Native format recognized by SAG Gen XBRL. Direct import preserves prior year context tags and member mappings.
            </p>
          </div>
          <button
            onClick={handleDownloadXag}
            className="w-full py-2 px-3 bg-[#145ca8] hover:bg-[#186dc4] text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download .XAG File
          </button>
        </div>

        {/* Card 2: SAG Multi-Sheet Excel */}
        <div className="bg-gradient-to-b from-white to-emerald-50/30 p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">SAG Excel Workbook</h4>
            <p className="text-xs text-slate-500 mb-4">
              Multi-sheet Excel workbook (Gen_Info, Balance_Sheet, Profit_Loss, Notes, CARO) pre-formatted for SAG Excel Import.
            </p>
          </div>
          <button
            onClick={handleDownloadExcel}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download .XLSX Package
          </button>
        </div>

        {/* Card 3: MCA XBRL XML Instance */}
        <div className="bg-gradient-to-b from-white to-amber-50/30 p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">MCA Official Instance (.xml)</h4>
            <p className="text-xs text-slate-500 mb-4">
              Fully compliant instance document with official MCA taxonomy schemaRef, namespaces, units, and tags.
            </p>
          </div>
          <button
            onClick={handleDownloadMcaXml}
            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download MCA .XML
          </button>
        </div>

        {/* Card 4: Windows Auto-Write Script */}
        <div className="bg-gradient-to-b from-white to-purple-50/30 p-5 rounded-xl border border-purple-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center mb-3">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">SAG Windows Auto-Write</h4>
            <p className="text-xs text-slate-500 mb-4">
              Automates opening SAG Gen XBRL on Windows, staging the file into Gen XBRL import queue and initiating import.
            </p>
          </div>
          <button
            onClick={handleDownloadScript}
            className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download .VBS Script
          </button>
        </div>

      </div>

      {/* Code / Content Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePreview('XAG')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                activePreview === 'XAG' ? 'bg-[#145ca8] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              SAG .XAG Preview
            </button>
            <button
              onClick={() => setActivePreview('MCA_XML')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                activePreview === 'MCA_XML' ? 'bg-[#145ca8] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              MCA Instance XML
            </button>
            <button
              onClick={() => setActivePreview('SCRIPT')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                activePreview === 'SCRIPT' ? 'bg-[#145ca8] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Windows Automation Script
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text = activePreview === 'XAG' ? xagContent : activePreview === 'MCA_XML' ? mcaXmlContent : scriptContent;
                copyToClipboard(text);
              }}
              className="px-3 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded flex items-center gap-1 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
          {activePreview === 'XAG' ? xagContent : activePreview === 'MCA_XML' ? mcaXmlContent : scriptContent}
        </pre>
      </div>

      {/* SAG Gen XBRL Step-by-Step Execution Guide */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-[#071b36] text-base mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#145ca8]" />
          How SAG Gen XBRL Loads this Data (3 Simple Steps)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 bg-[#145ca8] text-white rounded-full flex items-center justify-center font-bold text-xs mb-3">
              1
            </div>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">Open Client in SAG Gen XBRL</h4>
            <p className="text-xs text-slate-600">
              Launch SAG Gen XBRL on your computer and open company <span className="font-semibold text-slate-800">{options.companyName}</span> ({options.companyCin}).
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 bg-[#145ca8] text-white rounded-full flex items-center justify-center font-bold text-xs mb-3">
              2
            </div>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">Import File (XAG or Excel)</h4>
            <p className="text-xs text-slate-600">
              Go to <span className="font-semibold text-slate-800">Tools / Import-Export -&gt; Import from Excel / XAG</span>, select the file downloaded above, and click <span className="font-semibold text-slate-800">Transfer Data</span>.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 bg-[#145ca8] text-white rounded-full flex items-center justify-center font-bold text-xs mb-3">
              3
            </div>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">Verify & Validate for MCA</h4>
            <p className="text-xs text-slate-600">
              All Balance Sheet, P&L, Notes, and CARO fields are instantly auto-filled. Run SAG Gen XBRL's validator to generate the final Form AOC-4 XBRL package!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
