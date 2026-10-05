import React from 'react';
import { History, X, RotateCcw, Sparkles, User, ArrowRight, ShieldCheck, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { MappedFact, FactHistoryEntry } from '../types';

interface FactHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFact: MappedFact | null;
  allFacts: MappedFact[];
  onSelectFact: (fact: MappedFact) => void;
  onRevertFact: (factId: string, entry: FactHistoryEntry) => void;
}

export const FactHistorySidebar: React.FC<FactHistorySidebarProps> = ({
  isOpen,
  onClose,
  selectedFact,
  allFacts,
  onSelectFact,
  onRevertFact
}) => {
  if (!isOpen) return null;

  // If a fact is selected, get its history; otherwise collect global history from all facts
  const historyEntries: { fact: MappedFact; entry: FactHistoryEntry }[] = React.useMemo(() => {
    if (selectedFact) {
      const hist = selectedFact.history || [];
      return hist.map(entry => ({ fact: selectedFact, entry }));
    } else {
      // Aggregate all history entries across all facts, sort descending by timestamp
      const all: { fact: MappedFact; entry: FactHistoryEntry }[] = [];
      allFacts.forEach(f => {
        (f.history || []).forEach(h => {
          all.push({ fact: f, entry: h });
        });
      });
      return all.sort((a, b) => new Date(b.entry.timestamp).getTime() - new Date(a.entry.timestamp).getTime());
    }
  }, [selectedFact, allFacts]);

  const formatValue = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'number') return `₹ ${val.toLocaleString('en-IN')}`;
    return String(val);
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out">
      
      {/* Top Header */}
      <div className="p-4 bg-[#071b36] text-white flex items-center justify-between border-b border-[#145ca8]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#145ca8] flex items-center justify-center">
            <History className="w-4 h-4 text-[#12cbe6]" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Audit Trail & History</h3>
            <p className="text-[11px] text-slate-300">
              {selectedFact ? 'Tracking overrides for selected fact' : 'Global change log across all facts'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Fact Snapshot Card */}
      {selectedFact && (
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-bold text-[#145ca8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                {selectedFact.schedule}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">{selectedFact.label}</h4>
              <p className="font-mono text-[11px] text-slate-500">{selectedFact.conceptName}</p>
            </div>
            
            <button
              onClick={() => onSelectFact(null as any)}
              className="text-[11px] text-[#145ca8] hover:underline font-semibold whitespace-nowrap"
            >
              View All History
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Active Current Value</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formatValue(selectedFact.currentValue)}
              </span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Prior Year Baseline</span>
              <span className="font-mono font-bold text-slate-600 text-sm">
                {formatValue(selectedFact.previousValue)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {historyEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No history entries logged yet.</p>
            <p className="text-xs max-w-xs mx-auto text-slate-400">
              Edits made via the Mapping tab or AI re-extractions will appear here in chronological order.
            </p>
          </div>
        ) : (
          historyEntries.map(({ fact, entry }, idx) => {
            const isManual = entry.type === 'MANUAL_OVERRIDE';
            const isAi = entry.type === 'AI_INITIAL_EXTRACTION' || entry.type === 'AI_REMAP';
            const isRevert = entry.type === 'REVERTED';
            const isCurrentActive = idx === 0 && selectedFact;

            return (
              <div
                key={entry.id || idx}
                className={`relative pl-6 pb-2 border-l-2 ${
                  isCurrentActive 
                    ? 'border-emerald-500' 
                    : isManual 
                    ? 'border-amber-400' 
                    : isRevert
                    ? 'border-purple-400'
                    : 'border-blue-400'
                }`}
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full flex items-center justify-center ${
                  isCurrentActive 
                    ? 'bg-emerald-500 text-white' 
                    : isManual 
                    ? 'bg-amber-400 text-slate-900' 
                    : isRevert
                    ? 'bg-purple-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                  {isAi && <Sparkles className="w-2.5 h-2.5" />}
                  {isManual && <User className="w-2.5 h-2.5" />}
                  {isRevert && <RotateCcw className="w-2.5 h-2.5" />}
                </div>

                {/* Entry Card */}
                <div className={`rounded-xl p-3 border shadow-sm transition-all ${
                  isCurrentActive ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        isManual 
                          ? 'bg-amber-100 text-amber-900' 
                          : isRevert 
                          ? 'bg-purple-100 text-purple-900' 
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {entry.type === 'AI_INITIAL_EXTRACTION' ? 'AI Extraction' : entry.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {entry.author}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(entry.timestamp)}</span>
                    </div>
                  </div>

                  {/* Fact Label if in Global view */}
                  {!selectedFact && (
                    <div 
                      onClick={() => onSelectFact(fact)}
                      className="cursor-pointer hover:underline text-xs font-bold text-[#145ca8] mb-1.5 truncate"
                    >
                      {fact.label} ({fact.conceptName.split(':').pop()})
                    </div>
                  )}

                  {/* Value Transition */}
                  <div className="bg-slate-50 rounded-lg p-2 my-1.5 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Previous</span>
                        <span className="font-mono text-slate-600 line-through">
                          {formatValue(entry.previousValue)}
                        </span>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-2 flex-shrink-0" />

                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-emerald-600 uppercase font-bold">New Value</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatValue(entry.newValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Reason */}
                  {entry.notes && (
                    <p className="text-xs text-slate-600 mt-1 mb-2 italic bg-slate-50/80 px-2 py-1 rounded text-[11px]">
                      "{entry.notes}"
                    </p>
                  )}

                  {/* Confidence / Source Doc */}
                  {(entry.confidence || entry.sourceDoc) && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                      {entry.sourceDoc && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]" title={entry.sourceDoc}>
                          <FileText className="w-3 h-3 text-slate-400" /> {entry.sourceDoc}
                        </span>
                      )}
                      {entry.confidence && (
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                          {entry.confidence}% match
                        </span>
                      )}
                    </div>
                  )}

                  {/* Revert Action Button */}
                  {!isCurrentActive && (
                    <button
                      onClick={() => onRevertFact(fact.id, entry)}
                      className="w-full mt-1 py-1.5 px-3 bg-slate-100 hover:bg-[#145ca8] hover:text-white text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      title="Roll back fact value and concept to this historical version"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revert to this version ({formatValue(entry.newValue)})</span>
                    </button>
                  )}

                  {isCurrentActive && (
                    <div className="text-center text-[10px] font-bold text-emerald-700 bg-emerald-50 py-1 rounded flex items-center justify-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Current Active Value
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Complete audit log preserved for MCA filing</span>
        </span>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-700 hover:text-black"
        >
          Close
        </button>
      </div>

    </div>
  );
};
