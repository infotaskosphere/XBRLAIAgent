import React from 'react';
import { AlertTriangle, X, ShieldAlert, ArrowRight, CheckCircle2, Edit2, FileText, Check } from 'lucide-react';
import { MappedFact } from '../types';

interface AnomalyReviewModalProps {
  fact: MappedFact | null;
  onClose: () => void;
  onAcceptValue: (fact: MappedFact) => void;
  onStartEdit: (fact: MappedFact) => void;
}

export const AnomalyReviewModal: React.FC<AnomalyReviewModalProps> = ({
  fact,
  onClose,
  onAcceptValue,
  onStartEdit
}) => {
  if (!fact || !fact.anomaly) return null;

  const anomaly = fact.anomaly;
  const isHigh = anomaly.severity === 'HIGH';

  const formatVal = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'number') return `₹ ${val.toLocaleString('en-IN')}`;
    return String(val);
  };

  const getShiftAmount = () => {
    const py = typeof fact.previousValue === 'number' ? fact.previousValue : Number(String(fact.previousValue).replace(/,/g, ''));
    const cy = typeof fact.currentValue === 'number' ? fact.currentValue : Number(String(fact.currentValue).replace(/,/g, ''));
    if (!isNaN(py) && !isNaN(cy)) {
      const diff = cy - py;
      return {
        amount: Math.abs(diff),
        isPositive: diff >= 0
      };
    }
    return null;
  };

  const shift = getShiftAmount();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          isHigh ? 'bg-gradient-to-r from-red-900 to-red-800' : 'bg-gradient-to-r from-amber-900 to-amber-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/20 inline-block mb-0.5">
                {isHigh ? 'High Severity Outlier' : 'Auditor Review Alert'}
              </span>
              <h3 className="font-bold text-sm leading-tight">Automated Anomaly Detection</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          
          {/* Fact Identity */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#145ca8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                {fact.schedule}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{fact.period}</span>
            </div>
            <h4 className="font-bold text-base text-[#071b36]">{fact.label}</h4>
            <p className="font-mono text-xs text-slate-500">{fact.conceptName}</p>
          </div>

          {/* YoY Value Transition Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">PY Audited Baseline</span>
                <span className="font-mono font-bold text-slate-700 text-sm">{formatVal(fact.previousValue)}</span>
              </div>

              <div className="flex flex-col items-center px-2">
                <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  isHigh ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {anomaly.pctChange > 0 ? '+' : ''}{anomaly.pctChange}%
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 my-0.5" />
                {shift && (
                  <span className="text-[9px] font-semibold text-slate-500 whitespace-nowrap">
                    {shift.isPositive ? '+' : '-'} ₹ {shift.amount.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">CY Extracted Figure</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{formatVal(fact.currentValue)}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Finding */}
          <div className="bg-red-50/60 border border-red-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-red-950 font-bold block">Finding: {anomaly.type.replace('_', ' ')}</strong>
                <p className="text-red-900">{anomaly.message}</p>
              </div>
            </div>
          </div>

          {/* Auditor Guidance */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-[#145ca8] flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-[#071b36] font-bold block">Statutory Auditor Action Required:</strong>
                <p className="text-slate-700">{anomaly.recommendedAction}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onStartEdit(fact);
              onClose();
            }}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Override / Edit Figure</span>
          </button>

          <button
            onClick={() => {
              onAcceptValue(fact);
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Acknowledge & Confirm Value</span>
          </button>
        </div>

      </div>
    </div>
  );
};
