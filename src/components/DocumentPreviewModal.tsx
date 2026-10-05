import React from 'react';
import { X, FileText, FileSpreadsheet, FileCode, Copy, CheckCircle2 } from 'lucide-react';
import { UploadedDocument } from '../types';

interface DocumentPreviewModalProps {
  document: UploadedDocument | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!document) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(document.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#071b36] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {document.type === 'excel' ? (
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            ) : document.type === 'xml' ? (
              <FileCode className="w-5 h-5 text-amber-400" />
            ) : (
              <FileText className="w-5 h-5 text-[#12cbe6]" />
            )}
            <div>
              <h3 className="font-bold text-base leading-tight">{document.name}</h3>
              <p className="text-xs text-slate-400">
                {(document.size / 1024).toFixed(1)} KB • {document.charCount.toLocaleString()} extracted characters
                {document.extractedTables ? ` • ${document.extractedTables.length} table(s)/sheet(s)` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Tables Preview (if Excel or parsed XML) */}
          {document.extractedTables && document.extractedTables.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Extracted Worksheet Tables:
              </h4>
              {document.extractedTables.map((t, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 text-xs">
                    {t.sheetName || `Table ${idx + 1}`} ({t.rows.length} rows previewed)
                  </div>
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-left text-[11px]">
                      {t.headers && t.headers.length > 0 && (
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            {t.headers.map((h, i) => (
                              <th key={i} className="p-2 font-semibold text-slate-700">{h}</th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody className="divide-y divide-slate-100">
                        {t.rows.slice(0, 30).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 text-slate-600 truncate max-w-xs">
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full Extracted Text Stream */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              Full Text Stream Content:
            </h4>
            <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-xs whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
              {document.extractedText || 'No text stream extracted.'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Processed locally in browser memory</span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#145ca8] hover:bg-[#186dc4] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Extracted Text'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
