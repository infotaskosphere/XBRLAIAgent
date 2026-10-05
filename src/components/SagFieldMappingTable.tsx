import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, RotateCcw, Edit2, ArrowUpDown, Database, Check, ShieldCheck, Tag } from 'lucide-react';
import { MappedFact } from '../types';
import { getDefaultSagFieldId, getDefaultSagScreenRef } from '../services/xbrlMappingEngine';

interface SagFieldMappingTableProps {
  facts: MappedFact[];
  onUpdateFact: (id: string, updated: Partial<MappedFact>) => void;
}

export const SagFieldMappingTable: React.FC<SagFieldMappingTableProps> = ({ facts, onUpdateFact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempFieldId, setTempFieldId] = useState('');
  const [tempScreenRef, setTempScreenRef] = useState('');

  const filteredFacts = facts.filter(f => {
    const fieldId = f.sagFieldId || getDefaultSagFieldId(f.conceptName, f.schedule);
    const screenRef = f.sagScreenRef || getDefaultSagScreenRef(f.schedule, f.conceptName);
    
    const matchesSearch = 
      f.conceptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fieldId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screenRef.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSchedule = scheduleFilter === 'ALL' || f.schedule === scheduleFilter;
    return matchesSearch && matchesSchedule;
  });

  const totalFacts = facts.length;
  const customAdjustedCount = facts.filter(f => {
    const defaultId = getDefaultSagFieldId(f.conceptName, f.schedule);
    return f.sagFieldId && f.sagFieldId !== defaultId;
  }).length;
  const verifiedDefaultCount = totalFacts - customAdjustedCount;

  const handleStartEdit = (fact: MappedFact) => {
    setEditingId(fact.id);
    setTempFieldId(fact.sagFieldId || getDefaultSagFieldId(fact.conceptName, fact.schedule));
    setTempScreenRef(fact.sagScreenRef || getDefaultSagScreenRef(fact.schedule, fact.conceptName));
  };

  const handleSaveEdit = (id: string) => {
    onUpdateFact(id, {
      sagFieldId: tempFieldId.trim().toUpperCase(),
      sagScreenRef: tempScreenRef.trim()
    });
    setEditingId(null);
  };

  const handleResetToDefault = (fact: MappedFact) => {
    const defaultId = getDefaultSagFieldId(fact.conceptName, fact.schedule);
    const defaultScreen = getDefaultSagScreenRef(fact.schedule, fact.conceptName);
    onUpdateFact(fact.id, {
      sagFieldId: defaultId,
      sagScreenRef: defaultScreen
    });
    if (editingId === fact.id) {
      setEditingId(null);
    }
  };

  const handleResetAll = () => {
    facts.forEach(fact => {
      const defaultId = getDefaultSagFieldId(fact.conceptName, fact.schedule);
      const defaultScreen = getDefaultSagScreenRef(fact.schedule, fact.conceptName);
      onUpdateFact(fact.id, {
        sagFieldId: defaultId,
        sagScreenRef: defaultScreen
      });
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#145ca8] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                Field Mapping Verification
              </span>
              <h3 className="font-bold text-[#071b36] text-base">
                Internal AI Facts ➔ SAG Gen XBRL Field IDs
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Verify and adjust the direct field linkage used by SAG Gen XBRL during import. 
              Custom field IDs are instantly updated in all exported files (<code className="text-slate-800 font-bold">.csv, .json, .xag, .xlsx</code>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAll}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Reset all mappings back to official SAG Gen XBRL factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset All to SAG Defaults</span>
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-bold text-slate-800">{totalFacts}</span> Total Fields Mapped
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold">{verifiedDefaultCount}</span> Verified SAG Defaults
          </div>
          {customAdjustedCount > 0 && (
            <div className="flex items-center gap-1.5 text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold">{customAdjustedCount}</span> Custom Field ID(s) Adjusted
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI Concept or SAG Field ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#145ca8] focus:bg-white"
          />
        </div>

        {/* Schedule Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'BALANCE_SHEET', 'PROFIT_LOSS', 'CARO', 'GENERAL'].map(sch => (
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
      </div>

      {/* Field Mapping Table */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#071b36] text-white sticky top-0 z-10 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3 font-bold">Internal AI Concept Tag</th>
              <th className="py-2.5 px-3 font-bold">Line Item Description</th>
              <th className="py-2.5 px-3 font-bold text-right">CY Value</th>
              <th className="py-2.5 px-3 font-bold text-[#12cbe6]">SAG Gen XBRL Target Field ID</th>
              <th className="py-2.5 px-3 font-bold">SAG Form / Grid Location</th>
              <th className="py-2.5 px-3 font-bold text-center">Status</th>
              <th className="py-2.5 px-3 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredFacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No matching field mappings found.
                </td>
              </tr>
            ) : (
              filteredFacts.map(fact => {
                const defaultId = getDefaultSagFieldId(fact.conceptName, fact.schedule);
                const isCustom = fact.sagFieldId && fact.sagFieldId !== defaultId;
                const currentFieldId = fact.sagFieldId || defaultId;
                const currentScreen = fact.sagScreenRef || getDefaultSagScreenRef(fact.schedule, fact.conceptName);
                const isEditing = editingId === fact.id;

                return (
                  <tr key={fact.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Concept Tag */}
                    <td className="py-2 px-3 font-mono text-[11px] text-[#145ca8] font-semibold max-w-[200px] truncate" title={fact.conceptName}>
                      <div>{fact.conceptName}</div>
                      <span className="text-[10px] text-slate-400 font-sans">{fact.schedule}</span>
                    </td>

                    {/* Description */}
                    <td className="py-2 px-3 text-slate-800 font-medium max-w-[200px] truncate" title={fact.label}>
                      {fact.label}
                    </td>

                    {/* Value */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-700 whitespace-nowrap">
                      {fact.currentValue !== null && fact.currentValue !== undefined 
                        ? (typeof fact.currentValue === 'number' ? `₹ ${fact.currentValue.toLocaleString('en-IN')}` : String(fact.currentValue))
                        : '—'}
                    </td>

                    {/* SAG Gen XBRL Target Field ID (Editable) */}
                    <td className="py-2 px-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tempFieldId}
                            onChange={(e) => setTempFieldId(e.target.value.toUpperCase())}
                            className="px-2 py-0.5 text-xs font-mono font-bold border border-[#145ca8] rounded bg-white text-slate-900 w-36 uppercase"
                            placeholder="e.g. SAG_BS_101"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(fact.id)}
                            className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                            title="Save Field ID"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => handleStartEdit(fact)}
                          className="cursor-pointer group flex items-center gap-1.5"
                          title="Click to adjust SAG Field ID"
                        >
                          <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${
                            isCustom 
                              ? 'bg-blue-100 text-blue-900 border-blue-300' 
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            {currentFieldId}
                          </span>
                          <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Screen / Form Reference */}
                    <td className="py-2 px-3 text-slate-600 text-[11px] max-w-[200px] truncate" title={currentScreen}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempScreenRef}
                          onChange={(e) => setTempScreenRef(e.target.value)}
                          className="px-2 py-0.5 text-xs border border-slate-300 rounded bg-white text-slate-800 w-full"
                          placeholder="e.g. Balance Sheet > Assets"
                        />
                      ) : (
                        <span>{currentScreen}</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      {isCustom ? (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Custom ID
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> SAG Default
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(fact.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-800 font-bold px-1.5 py-0.5"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(fact)}
                            className="text-xs text-[#145ca8] hover:text-blue-800 font-semibold px-1.5 py-0.5 hover:bg-blue-50 rounded"
                          >
                            Adjust
                          </button>
                        )}
                        {isCustom && (
                          <button
                            onClick={() => handleResetToDefault(fact)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5"
                            title="Reset to default SAG Field ID"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Guidance */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>💡 Clicking <strong>Adjust</strong> allows you to modify the exact field tag or control name mapped into Gen XBRL.</span>
        <span className="font-semibold text-slate-700">{filteredFacts.length} entries displayed</span>
      </div>

    </div>
  );
};
