import React, { useState } from 'react';
import { BookOpen, Search, Download, Copy, CheckCircle2, FileText, ExternalLink, ShieldCheck, Tag, X } from 'lucide-react';
import { REGULATORY_DOCUMENTS } from '../services/regulatoryDocuments';
import { RegulatoryDocument } from '../types';

export const RegulatoryLibraryTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [readingDoc, setReadingDoc] = useState<RegulatoryDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Documents' },
    { id: 'MCA_RULES', label: 'MCA Rules & Mandates' },
    { id: 'IND_AS', label: 'Ind AS Taxonomy' },
    { id: 'NON_IND_AS', label: 'Non-Ind AS Taxonomy' },
    { id: 'SAG_GUIDE', label: 'SAG Gen XBRL Manual' },
    { id: 'VALIDATION_ERRORS', label: 'Top 25 Validation Errors' },
    { id: 'CARO_CHECKLIST', label: 'CARO 2020 Checklist' }
  ];

  const filteredDocs = REGULATORY_DOCUMENTS.filter(doc => {
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.keyHighlights.some(h => h.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.applicableTo.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const downloadDoc = (doc: RegulatoryDocument) => {
    const blob = new Blob([doc.fullContentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyContent = (doc: RegulatoryDocument) => {
    navigator.clipboard.writeText(doc.fullContentMarkdown);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-[#145ca8] text-white text-xs font-bold px-2 py-0.5 rounded">STEP 05</span>
          <h2 className="text-xl font-bold text-[#071b36]">Mandatory Regulatory Library & Guidance (Must-Read Documents)</h2>
        </div>
        <p className="text-sm text-slate-600 max-w-4xl">
          The complete statutory knowledge base for MCA XBRL filing in India. 
          Contains the Companies Act Section 137 mandate, Ind AS & Non-Ind AS taxonomy manuals, SAG Gen XBRL operator instructions, CARO 2020 reporting criteria, and solutions for the top 25 MCA validation errors.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search guidelines, rules, or error codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#145ca8] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#145ca8] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-[#145ca8]/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#145ca8]">
                  {doc.category.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-400">{doc.versionDate}</span>
              </div>

              <h3 className="font-bold text-base text-[#071b36] mb-1.5">{doc.title}</h3>
              <p className="text-xs font-semibold text-slate-500 mb-2">Issued by: {doc.issuedBy}</p>
              
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3 text-xs text-slate-700">
                <strong className="text-slate-800 block text-[11px] mb-0.5">Applicability:</strong>
                {doc.applicableTo}
              </div>

              <p className="text-xs text-slate-600 mb-3 leading-relaxed">{doc.summary}</p>

              {/* Highlights */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[11px] font-bold text-slate-700 block">Key Highlights:</span>
                {doc.keyHighlights.slice(0, 3).map((hl, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="text-[#145ca8] font-bold leading-tight">•</span>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setReadingDoc(doc)}
                className="px-3.5 py-1.5 bg-[#145ca8] hover:bg-[#186dc4] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" /> Read Full Guide
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyContent(doc)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                  title="Copy text"
                >
                  {copiedId === doc.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === doc.id ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => downloadDoc(doc)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                  title="Download Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Reader Modal */}
      {readingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#071b36] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#12cbe6] tracking-wider uppercase block">
                  {readingDoc.category.replace('_', ' ')} • {readingDoc.issuedBy}
                </span>
                <h3 className="font-bold text-lg">{readingDoc.title}</h3>
              </div>
              <button
                onClick={() => setReadingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 font-sans leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                <strong>Applicability: </strong>{readingDoc.applicableTo}
              </div>

              <div className="prose prose-sm max-w-none">
                <pre className="font-sans whitespace-pre-wrap leading-relaxed text-slate-800">
                  {readingDoc.fullContentMarkdown}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Official Reference Material</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyContent(readingDoc)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Text
                </button>
                <button
                  onClick={() => downloadDoc(readingDoc)}
                  className="px-3 py-1.5 bg-[#145ca8] hover:bg-[#186dc4] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
