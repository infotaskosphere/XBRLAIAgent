import React from 'react';
import { Settings, Cpu, ShieldCheck, Database, Layers, Sparkles } from 'lucide-react';
import { TaxonomyStandard } from '../types';

interface HeaderProps {
  taxonomy: TaxonomyStandard;
  onTaxonomyChange: (t: TaxonomyStandard) => void;
  onOpenSettings: () => void;
  aiConnected: boolean;
  onDetectSag: () => void;
  onQuickRun: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  taxonomy,
  onTaxonomyChange,
  onOpenSettings,
  aiConnected,
  onDetectSag,
  onQuickRun,
  isProcessing
}) => {
  return (
    <header className="bg-[#071b36] border-b border-[#14325a] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          {/* Custom SVG logo identical to MainForm.cs Vector */}
          <div className="flex items-center gap-3 bg-[#0d274c] px-3.5 py-2 rounded-lg border border-[#1d4273]">
            <div className="relative flex items-end gap-1 h-8 w-11 pb-1">
              <div className="w-2.5 h-4 bg-[#145ca8] rounded-t-sm" />
              <div className="w-2.5 h-6 bg-[#12cbe6] rounded-t-sm" />
              <div className="w-2.5 h-8 bg-[#145ca8] rounded-t-sm" />
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 44 32">
                <path d="M 4 28 L 15 18 L 26 27 L 40 8" stroke="#12cbe6" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-extrabold text-lg tracking-wider text-white">XBRL</span>
                <span className="font-extrabold text-lg text-[#12cbe6]">AI</span>
              </div>
              <p className="text-[10px] tracking-widest font-semibold text-[#8eb0d8] uppercase mt-0.5">
                Gen XBRL Intelligence
              </p>
            </div>
          </div>

          <div className="hidden lg:block border-l border-[#1d4273] pl-4">
            <span className="text-xs font-semibold text-[#a5c5eb] block">MCA Autonomous Bridge</span>
            <span className="text-[11px] text-slate-300">Reference-aware preparation • SAG automation</span>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          {/* Taxonomy Standard Toggle */}
          <div className="bg-[#0b2447] p-1 rounded-lg border border-[#1e4677] flex items-center shadow-inner">
            <span className="text-[11px] font-semibold text-[#8db1db] px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#12cbe6]" />
              Taxonomy:
            </span>
            <button
              onClick={() => onTaxonomyChange('IND_AS')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                taxonomy === 'IND_AS'
                  ? 'bg-[#145ca8] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#123663]'
              }`}
            >
              MCA Ind AS
            </button>
            <button
              onClick={() => onTaxonomyChange('NON_IND_AS')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                taxonomy === 'NON_IND_AS'
                  ? 'bg-[#145ca8] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#123663]'
              }`}
            >
              Non-Ind AS (AS)
            </button>
          </div>

          {/* Detect Gen XBRL button */}
          <button
            onClick={onDetectSag}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0f2e56] hover:bg-[#163f73] border border-[#23538c] text-white rounded-lg transition-colors shadow-sm"
            title="Scan for local SAG Gen XBRL installation"
          >
            <Database className="w-3.5 h-3.5 text-[#12cbe6]" />
            <span className="hidden sm:inline">Detect</span> Gen XBRL
          </button>

          {/* AI Status Badge */}
          <div 
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              aiConnected 
                ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/50 border-amber-600/60 text-amber-300 hover:bg-amber-900/50'
            }`}
            title="Click to configure AI Provider"
          >
            <span className={`w-2 h-2 rounded-full ${aiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{aiConnected ? 'AI Connected' : 'Autonomous Heuristics'}</span>
          </div>

          {/* Run Mapping Trigger */}
          <button
            onClick={onQuickRun}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#145ca8] hover:bg-[#186dc4] active:bg-[#114f91] text-white rounded-lg transition-all shadow-md disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#12cbe6] ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Mapping...' : 'Run AI Mapping'}</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-300 hover:text-white bg-[#0f2e56] hover:bg-[#163f73] border border-[#23538c] rounded-lg transition-colors"
            title="AI & Filing Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
