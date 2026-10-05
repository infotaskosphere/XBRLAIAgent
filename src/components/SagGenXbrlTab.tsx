import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileCode, Terminal, CheckCircle2, Copy, Eye, Database, Sparkles, ExternalLink, ShieldCheck, PlayCircle, Zap } from 'lucide-react';
import { MappedFact, SagExportOptions, TaxonomyStandard } from '../types';
import { 
  generateSagXagContent, 
  generateSagExcelWorkbook, 
  generateMcaXbrlInstance, 
  generateSagWindowsScript,
  generatePowerShellScript,
  generateAutoHotkeyScript,
  generateSagCsvContent,
  generateSagJsonContent
} from '../services/sagGenXbrlGenerator';
import { SagFieldMappingTable } from './SagFieldMappingTable';

interface SagGenXbrlTabProps {
  facts: MappedFact[];
  taxonomy: TaxonomyStandard;
  onUpdateFact?: (id: string, updated: Partial<MappedFact>) => void;
}

export const SagGenXbrlTab: React.FC<SagGenXbrlTabProps> = ({ facts, taxonomy, onUpdateFact }) => {
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

  const [activePreview, setActivePreview] = useState<'XAG' | 'MCA_XML' | 'CSV' | 'JSON' | 'PS1' | 'VBS' | 'AHK'>('CSV');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setOptions(prev => ({ ...prev, taxonomy }));
  }, [taxonomy]);

  const xagContent = React.useMemo(() => generateSagXagContent(facts, options), [facts, options]);
  const mcaXmlContent = React.useMemo(() => generateMcaXbrlInstance(facts, options), [facts, options]);
  const csvContent = React.useMemo(() => generateSagCsvContent(facts, options), [facts, options]);
  const jsonContent = React.useMemo(() => generateSagJsonContent(facts, options), [facts, options]);
  const vbsContent = React.useMemo(() => generateSagWindowsScript(options), [options]);
  const ps1Content = React.useMemo(() => generatePowerShellScript(options), [options]);
  const ahkContent = React.useMemo(() => generateAutoHotkeyScript(options), [options]);

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

  const handleDownloadCsv = () => {
    downloadFile(`SAG_GenXBRL_Mapping_${options.companyCin}.csv`, csvContent, 'text/csv');
  };

  const handleDownloadJson = () => {
    downloadFile(`SAG_GenXBRL_Interchange_${options.companyCin}.json`, jsonContent, 'application/json');
  };

  const handleDownloadMcaXml = () => {
    downloadFile(`MCA_AOC4_XBRL_${options.companyCin}.xml`, mcaXmlContent, 'application/xml');
  };

  const handleDownloadVbs = () => {
    downloadFile(`sag_autowrite_${options.companyCin}.vbs`, vbsContent, 'text/plain');
  };

  const handleDownloadPs1 = () => {
    downloadFile(`sag_autowrite_${options.companyCin}.ps1`, ps1Content, 'text/plain');
  };

  const handleDownloadAhk = () => {
    downloadFile(`sag_robotic_autofill_${options.companyCin}.ahk`, ahkContent, 'text/plain');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPreviewText = () => {
    switch (activePreview) {
      case 'CSV': return csvContent;
      case 'JSON': return jsonContent;
      case 'XAG': return xagContent;
      case 'MCA_XML': return mcaXmlContent;
      case 'PS1': return ps1Content;
      case 'VBS': return vbsContent;
      case 'AHK': return ahkContent;
      default: return csvContent;
    }
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
          <span className="font-bold text-emerald-700">Yes!</span> Once generated, this software automatically populates data in SAG Gen XBRL without any manual re-typing. 
          It supports three autonomous pipelines: direct SAG Excel import, native SAG XAG direct injection, or one-click Windows automation scripts.
        </p>
      </div>

      {/* Answer Spotlight Card: How Auto-Fill Works in SAG Gen XBRL */}
      <div className="bg-gradient-to-r from-[#071b36] to-[#0d2f5a] text-white rounded-xl p-6 shadow-md border border-[#1e4677]">
        <div className="flex items-start gap-3">
          <Zap className="w-6 h-6 text-[#12cbe6] flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-bold text-base text-white">How This Software Auto-Fills Data into SAG Gen XBRL:</h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              SAG Gen XBRL is a desktop Windows application. It does not require you to manually type figures one by one. 
              Our software bridges your audit report & financials directly into Gen XBRL through three verified methods:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#0f284c] p-3 rounded-lg border border-[#234b7d]">
                <strong className="text-xs font-bold text-[#12cbe6] block mb-1">1. Direct Excel Auto-Fill (Recommended)</strong>
                <p className="text-[11px] text-slate-300">
                  Gen XBRL has a built-in <span className="text-white font-semibold">"Import from Excel"</span> engine. 
                  Download our pre-mapped <code className="text-amber-300">.xlsx</code> package. Click "Import" in Gen XBRL and 100% of all Balance Sheet, P&L, Notes, and CARO fields fill automatically.
                </p>
              </div>

              <div className="bg-[#0f284c] p-3 rounded-lg border border-[#234b7d]">
                <strong className="text-xs font-bold text-[#12cbe6] block mb-1">2. SAG .XAG Native Injection</strong>
                <p className="text-[11px] text-slate-300">
                  Download our <code className="text-amber-300">.xag</code> file. In Gen XBRL, select <span className="text-white font-semibold">"Import from XAG"</span> or use our script to stage it into <code className="text-slate-300">%APPDATA%\SAG Infotech\GenXBRL\ImportQueue</code>. It loads the entire company instantaneously.
                </p>
              </div>

              <div className="bg-[#0f284c] p-3 rounded-lg border border-[#234b7d]">
                <strong className="text-xs font-bold text-[#12cbe6] block mb-1">3. Windows Auto-Write Script (.vbs/.ps1/.ahk)</strong>
                <p className="text-[11px] text-slate-300">
                  Double-click the generated <code className="text-amber-300">.vbs</code> or <code className="text-amber-300">.ps1</code> script on Windows. It finds <code className="text-slate-300">GenXBRL.exe</code>, stages the data payload, and opens Gen XBRL with the client already loaded.
                </p>
              </div>
            </div>
          </div>
        </div>
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

      {/* SAG Gen XBRL Field Verification & Adjustment Table */}
      <SagFieldMappingTable 
        facts={facts} 
        onUpdateFact={onUpdateFact || (() => {})} 
      />

      {/* Auto-Fill Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: SAG Excel Auto-Fill Package */}
        <div className="bg-gradient-to-b from-white to-emerald-50/40 p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 inline-block mb-1">
              Primary Auto-Fill
            </span>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">SAG Gen XBRL Excel Import</h4>
            <p className="text-xs text-slate-500 mb-4">
              Pre-mapped multi-sheet Excel file. In SAG Gen XBRL, click "Import from Excel" to auto-populate all schedules instantly.
            </p>
          </div>
          <button
            onClick={handleDownloadExcel}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download .XLSX Auto-Fill
          </button>
        </div>

        {/* Card 2: SAG Structured CSV Import */}
        <div className="bg-gradient-to-b from-white to-teal-50/40 p-5 rounded-xl border border-teal-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800 inline-block mb-1">
              Structured Delimited
            </span>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">SAG Structured CSV Format</h4>
            <p className="text-xs text-slate-500 mb-4">
              Direct CSV mapping file structured with concept codes, period types, CY & PY values, decimals, and status.
            </p>
          </div>
          <button
            onClick={handleDownloadCsv}
            className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download .CSV Import
          </button>
        </div>

        {/* Card 3: SAG Interchange JSON Bridge */}
        <div className="bg-gradient-to-b from-white to-indigo-50/40 p-5 rounded-xl border border-indigo-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 inline-block mb-1">
              JSON Data Interchange
            </span>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">SAG JSON Bridge</h4>
            <p className="text-xs text-slate-500 mb-4">
              Structured JSON interchange containing company profile metadata, tagging catalog, variance analytics, and units.
            </p>
          </div>
          <button
            onClick={handleDownloadJson}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download .JSON Bridge
          </button>
        </div>

        {/* Card 4: Native SAG .XAG File */}
        <div className="bg-gradient-to-b from-white to-blue-50/40 p-5 rounded-xl border border-blue-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-blue-100 text-[#145ca8] rounded-lg flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#145ca8] inline-block mb-1">
              SAG Native Format
            </span>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">SAG Gen XBRL .XAG</h4>
            <p className="text-xs text-slate-500 mb-4">
              Direct SAG backup/import format. Loads company master, Balance Sheet, P&L, and CARO into Gen XBRL with 1 click.
            </p>
          </div>
          <button
            onClick={handleDownloadXag}
            className="w-full py-2 px-3 bg-[#145ca8] hover:bg-[#186dc4] text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download .XAG File
          </button>
        </div>

        {/* Card 5: Official MCA XBRL XML Instance */}
        <div className="bg-gradient-to-b from-white to-amber-50/40 p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 inline-block mb-1">
              Official MCA Format
            </span>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">MCA Form AOC-4 XML</h4>
            <p className="text-xs text-slate-500 mb-4">
              Final MCA instance document compliant with official schema references. Direct import or verification in MCA tool.
            </p>
          </div>
          <button
            onClick={handleDownloadMcaXml}
            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download MCA .XML
          </button>
        </div>

        {/* Card 6: Windows Auto-Writer Script (.vbs / .ps1) */}
        <div className="bg-gradient-to-b from-white to-purple-50/40 p-5 rounded-xl border border-purple-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center mb-3">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 inline-block mb-1">
              One-Click Runner
            </span>
            <h4 className="font-bold text-sm text-[#071b36] mb-1">Windows Auto-Writer Script</h4>
            <p className="text-xs text-slate-500 mb-4">
              VBScript and PowerShell scripts that locate GenXBRL.exe on Windows and stage data into the queue automatically.
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleDownloadVbs}
              className="flex-1 py-2 px-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1 transition-colors"
              title="Download VBScript"
            >
              <Download className="w-3.5 h-3.5" /> .VBS
            </button>
            <button
              onClick={handleDownloadPs1}
              className="flex-1 py-2 px-2 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1 transition-colors"
              title="Download PowerShell"
            >
              <Download className="w-3.5 h-3.5" /> .PS1
            </button>
          </div>
        </div>

      </div>

      {/* Code / Content Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActivePreview('CSV')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                activePreview === 'CSV' ? 'bg-[#145ca8] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Structured CSV
            </button>
            <button
              onClick={() => setActivePreview('JSON')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                activePreview === 'JSON' ? 'bg-[#145ca8] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Interchange JSON
            </button>
            <button
              onClick={() => setActivePreview('XAG')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                activePreview === 'XAG' ? 'bg-[#145ca8] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              SAG .XAG Data
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
              onClick={() => setActivePreview('PS1')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                activePreview === 'PS1' ? 'bg-[#145ca8] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              PowerShell Script
            </button>
            <button
              onClick={() => setActivePreview('VBS')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                activePreview === 'VBS' ? 'bg-[#145ca8] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              VBScript
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(getPreviewText())}
              className="px-3 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded flex items-center gap-1 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
          {getPreviewText()}
        </pre>
      </div>

    </div>
  );
};
