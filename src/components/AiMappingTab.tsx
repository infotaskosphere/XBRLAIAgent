import React, { useState } from 'react';
import { Search, Sparkles, Filter, CheckCircle2, AlertTriangle, RefreshCw, FileText, ArrowUpDown, Edit2, ShieldAlert, History } from 'lucide-react';
import { MappedFact, TaxonomyStandard, MappingStatus, FactHistoryEntry } from '../types';
import { FactHistorySidebar } from './FactHistorySidebar';

interface AiMappingTabProps {
  facts: MappedFact[];
  taxonomy: TaxonomyStandard;
  onUpdateFact: (id: string, updated: Partial<MappedFact>, historyMeta?: any) => void;
  onRunMapping: () => void;
  isProcessing: boolean;
  onNavigateToSag: () => void;
}

export const AiMappingTab: React.FC<AiMappingTabProps> = ({
  facts,
  taxonomy,
  onUpdateFact,
  onRunMapping,
  isProcessing,
  onNavigateToSag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryFact, setSelectedHistoryFact] = useState<MappedFact | null>(null);

  const filteredFacts = facts.filter(f => {
    const matchesSearch = 
      f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.conceptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.sourceDoc && f.sourceDoc.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesSchedule = scheduleFilter === 'ALL' || f.schedule === scheduleFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;

    return matchesSearch && matchesSchedule && matchesStatus;
  });

  const totalCount = facts.length;
  const confirmedCount = facts.filter(f => f.status === 'CONFIRMED').length;
  const changedCount = facts.filter(f => f.status === 'CHANGED').length;
  const reviewCount = facts.filter(f => f.status === 'REVIEW_REQUIRED').length;

  // Math check
  const totalAssets = facts.find(f => f.conceptName.includes('Assets') && !f.conceptName.includes('Current') && !f.conceptName.includes('Noncurrent'))?.currentValue;
  const totalLiab = facts.find(f => f.conceptName.includes('EquityAndLiabilities'))?.currentValue;
  const isBalanced = totalAssets && totalLiab && Number(totalAssets) === Number(totalLiab);

  const startEdit = (fact: MappedFact) => {
    setEditingFactId(fact.id);
    setEditValue(String(fact.currentValue ?? ''));
  };

  const saveEdit = (factId: string) => {
    const num = Number(editValue.replace(/,/g, ''));
    const finalVal = isNaN(num) || editValue.trim() === '' ? editValue : num;
    onUpdateFact(factId, {
      currentValue: finalVal,
      editedManually: true,
      status: 'CONFIRMED'
    });
    setEditingFactId(null);
  };

  const handleRevertFact = (factId: string, entry: FactHistoryEntry) => {
    onUpdateFact(factId, {
      currentValue: entry.newValue,
      conceptName: entry.newConcept || undefined,
      editedManually: false,
      status: 'CONFIRMED'
    }, {
      isRevert: true,
      reason: `Reverted to historical version from ${new Date(entry.timestamp).toLocaleDateString()}`
    });
  };

  const getStatusBadge = (status: MappingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Confirmed</span>;
      case 'CHANGED':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">Changed</span>;
      case 'REVIEW_REQUIRED':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Review</span>;
      case 'NEW_ITEM':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">New Fact</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  const formatValue = (val: string | number | null | undefined, unit: string) => {
    if (val === null || val === undefined || val === '') return <span className="text-slate-400">—</span>;
    if (typeof val === 'number') {
      return (
        <span className="font-mono">
          {unit === 'INR' ? '₹ ' : ''}
          {val.toLocaleString('en-IN')}
        </span>
      );
    }
    return <span className="truncate max-w-[200px] inline-block">{String(val)}</span>;
  };

  const calculateVariance = (py: number | string | null, cy: number | string | null) => {
    if (typeof py !== 'number' || typeof cy !== 'number' || py === 0) return null;
    const diff = cy - py;
    const pct = (diff / Math.abs(py)) * 100;
    return {
      diff,
      pct,
      isPositive: diff >= 0
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Summary Stats */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#145ca8] text-white text-xs font-bold px-2 py-0.5 rounded">STEP 03</span>
              <h2 className="text-xl font-bold text-[#071b36]">
                AI Comparison & Taxonomy Tagging ({taxonomy === 'IND_AS' ? 'MCA Ind AS' : 'MCA Non-Ind AS'})
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              Cross-mapping current-year documents with the previous-year XBRL reference structure. 
              Review matched concepts, variance percentages, and confidence scores before writing into SAG Gen XBRL.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setSelectedHistoryFact(null);
                setIsHistoryOpen(true);
              }}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              title="Open Audit Trail & Change History Sidebar"
            >
              <History className="w-3.5 h-3.5 text-[#145ca8]" />
              <span>Audit History</span>
              {facts.some(f => (f.history || []).some(h => h.type === 'MANUAL_OVERRIDE')) && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={onRunMapping}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#145ca8] hover:bg-[#186dc4] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Processing...' : 'Re-Run AI Mapping'}</span>
            </button>
            <button
              onClick={onNavigateToSag}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Export to SAG Gen XBRL</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Facts Tagged</span>
            <span className="text-xl font-extrabold text-[#071b36]">{totalCount}</span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-700 block">Confirmed / Static</span>
            <span className="text-xl font-extrabold text-emerald-800">{confirmedCount}</span>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-700 block">Updated Current Values</span>
            <span className="text-xl font-extrabold text-blue-800">{changedCount}</span>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-700 block">Requires Auditor Review</span>
            <span className="text-xl font-extrabold text-amber-800">{reviewCount}</span>
          </div>

          <div className={`p-3 rounded-lg border col-span-2 sm:col-span-1 ${
            isBalanced ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            <span className="text-[11px] font-semibold block">Balance Sheet Math</span>
            <span className="text-sm font-bold flex items-center gap-1 mt-1">
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Balanced (A = L+E)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Check Differences</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search concept or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#145ca8] focus:bg-white"
          />
        </div>

        {/* Schedule Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Schedule:
          </span>
          {['ALL', 'BALANCE_SHEET', 'PROFIT_LOSS', 'CARO', 'GENERAL'].map((sch) => (
            <button
              key={sch}
              onClick={() => setScheduleFilter(sch)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                scheduleFilter === sch
                  ? 'bg-[#145ca8] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sch.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed Only</option>
            <option value="CHANGED">Changed Values</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
          </select>
        </div>
      </div>

      {/* Main High-Density Mapping Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#071b36] text-white uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5 font-bold">Concept Tag</th>
                <th className="py-3 px-3 font-bold">Line Item Description</th>
                <th className="py-3 px-3 font-bold text-right">PY Value (Audited)</th>
                <th className="py-3 px-3 font-bold text-right">CY Value (Extracted)</th>
                <th className="py-3 px-3 font-bold text-center">Variance</th>
                <th className="py-3 px-3 font-bold text-center">Status</th>
                <th className="py-3 px-3 font-bold">Source Reference</th>
                <th className="py-3 px-3 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredFacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No taxonomy concepts match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredFacts.map((fact) => {
                  const variance = calculateVariance(fact.previousValue, fact.currentValue);
                  const isEditing = editingFactId === fact.id;

                  return (
                    <tr key={fact.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Concept Tag */}
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-[#145ca8] font-semibold max-w-[220px] truncate" title={fact.conceptName}>
                        {fact.conceptName}
                      </td>

                      {/* Description */}
                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        <div>{fact.label}</div>
                        <span className="text-[10px] text-slate-400 block">{fact.schedule} • {fact.period}</span>
                      </td>

                      {/* PY Value */}
                      <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                        {formatValue(fact.previousValue, fact.unit)}
                      </td>

                      {/* CY Value (with inline edit) */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-28 px-1.5 py-0.5 text-xs text-right border border-[#145ca8] rounded bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(fact.id)}
                              className="px-1.5 py-0.5 text-[11px] bg-emerald-600 text-white rounded font-bold"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => startEdit(fact)}
                            className="cursor-pointer hover:text-[#145ca8] group flex items-center justify-end gap-1"
                            title="Click to manually override"
                          >
                            <span>{formatValue(fact.currentValue, fact.unit)}</span>
                            <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-[#145ca8] opacity-0 group-hover:opacity-100" />
                          </div>
                        )}
                      </td>

                      {/* Variance */}
                      <td className="py-2.5 px-3 text-center">
                        {variance ? (
                          <span className={`text-[11px] font-mono font-bold ${
                            Math.abs(variance.pct) > 20 
                              ? 'text-amber-600' 
                              : variance.isPositive ? 'text-emerald-600' : 'text-slate-600'
                          }`}>
                            {variance.pct > 0 ? '+' : ''}{variance.pct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">0.0%</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        {getStatusBadge(fact.status)}
                      </td>

                      {/* Source */}
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[180px] truncate" title={`${fact.sourceDoc} - ${fact.sourcePageOrSheet}`}>
                        <span className="font-semibold text-slate-700 block truncate">{fact.sourceDoc || 'Direct Master'}</span>
                        <span className="text-slate-400 block truncate">{fact.sourcePageOrSheet || 'Page 1'}</span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(fact)}
                            className="px-2 py-1 text-[11px] text-[#145ca8] hover:bg-blue-50 rounded font-semibold transition-colors"
                            title="Edit value"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHistoryFact(fact);
                              setIsHistoryOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-[#145ca8] hover:bg-blue-50 rounded transition-colors relative"
                            title="View fact history & revert overrides"
                          >
                            <History className="w-3.5 h-3.5" />
                            {fact.history && fact.history.some(h => h.type === 'MANUAL_OVERRIDE') && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-0.5 right-0.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-[#eff9fc] border border-[#bee3ed] rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#145ca8] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#204a6e] space-y-1">
          <strong className="font-bold text-[#071b36] block">AI Safety & Review Assurance</strong>
          <p>
            Items marked <span className="font-bold text-amber-700">REVIEW REQUIRED</span> exhibit a high variance (&gt; 25%) 
            or missing cross-references between the audit report and trial balance. 
            You can click on any value to override it directly before creating the SAG Gen XBRL files.
          </p>
        </div>
      </div>

      {/* Fact History & Audit Trail Sidebar */}
      <FactHistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        selectedFact={selectedHistoryFact}
        allFacts={facts}
        onSelectFact={setSelectedHistoryFact}
        onRevertFact={handleRevertFact}
      />

    </div>
  );
};
