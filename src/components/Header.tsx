import React, { useState } from 'react';
import { Settings, Cpu, ShieldCheck, Database, Layers, Sparkles, User, LogOut, ChevronDown, Laptop } from 'lucide-react';
import { TaxonomyStandard, UserProfile } from '../types';

interface HeaderProps {
  taxonomy: TaxonomyStandard;
  onTaxonomyChange: (t: TaxonomyStandard) => void;
  onOpenSettings: () => void;
  aiConnected: boolean;
  onDetectSag: () => void;
  onQuickRun: () => void;
  isProcessing: boolean;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  taxonomy,
  onTaxonomyChange,
  onOpenSettings,
  aiConnected,
  onDetectSag,
  onQuickRun,
  isProcessing,
  currentUser,
  onOpenLogin,
  onSignOut
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-[#071b36] border-b border-[#14325a] text-white shadow-lg sticky top-0 z-40">
      {/* Primary blue header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3 bg-[#0d274c] px-3.5 py-1.5 rounded-lg border border-[#1d4273] shrink-0">
            <div className="relative flex items-end gap-1 h-7 w-10 pb-0.5">
              <div className="w-2.5 h-3.5 bg-[#145ca8] rounded-t-sm" />
              <div className="w-2.5 h-5 bg-[#12cbe6] rounded-t-sm" />
              <div className="w-2.5 h-7 bg-[#145ca8] rounded-t-sm" />
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 44 32">
                <path d="M 4 28 L 15 18 L 26 27 L 40 8" stroke="#12cbe6" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-extrabold text-base tracking-wider text-white">XBRL</span>
                <span className="font-extrabold text-base text-[#12cbe6]">AI</span>
              </div>
              <p className="text-[9px] tracking-widest font-semibold text-[#8eb0d8] uppercase mt-0.5">
                Gen XBRL Intelligence
              </p>
            </div>
          </div>

          <div className="hidden lg:block border-l border-[#1d4273] pl-4 min-w-0">
            <span className="text-xs font-semibold text-[#a5c5eb] block">MCA Autonomous Bridge</span>
            <span className="text-[10px] text-slate-300">Reference-aware preparation • SAG automation</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-[#0d2a4f] hover:bg-[#123663] border border-[#23538c] pl-2 pr-2.5 py-1 rounded-lg transition-all text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#145ca8] text-white font-extrabold text-[10px] flex items-center justify-center border border-[#12cbe6]/50">
                  {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-[11px] font-bold text-white max-w-[150px] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] text-[#12cbe6] font-mono">
                    {currentUser.membershipNumber || 'Auditor'}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#071b36]">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    {currentUser.firmName && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{currentUser.firmName}</p>
                    )}
                    <span className="inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 bg-blue-50 text-[#145ca8] rounded border border-blue-100">
                      {currentUser.membershipNumber || 'Verified Auditor'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-[#145ca8]" />
                      <span>Switch Auditor / Manage Account</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#12cbe6]/20 hover:bg-[#12cbe6]/30 text-[#12cbe6] border border-[#12cbe6]/40 rounded-lg transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Auditor Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Single-line control rail — intentionally below the blue header */}
      <div className="border-t border-[#14325a] bg-[#0a2344]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin">
            <div className="flex items-center gap-1 bg-[#0b2447] p-1 rounded-lg border border-[#1e4677] shrink-0">
              <span className="text-[10px] font-semibold text-[#8db1db] px-2 flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#12cbe6]" />
                Taxonomy:
              </span>
              <button
                onClick={() => onTaxonomyChange('IND_AS')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${taxonomy === 'IND_AS' ? 'bg-[#145ca8] text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-[#123663]'}`}
              >
                MCA Ind AS
              </button>
              <button
                onClick={() => onTaxonomyChange('NON_IND_AS')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${taxonomy === 'NON_IND_AS' ? 'bg-[#145ca8] text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-[#123663]'}`}
              >
                Non-Ind AS (AS)
              </button>
            </div>

            <button
              onClick={onDetectSag}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#0f2e56] hover:bg-[#163f73] border border-[#23538c] text-white rounded-lg transition-colors shadow-sm shrink-0"
              title="Scan for local SAG Gen XBRL installation"
            >
              <Database className="w-3.5 h-3.5 text-[#12cbe6]" />
              Detect Gen XBRL
            </button>

            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all shrink-0 ${aiConnected ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/60' : 'bg-amber-950/50 border-amber-600/60 text-amber-300 hover:bg-amber-900/50'}`}
              title="Click to configure AI Provider"
            >
              <span className={`w-2 h-2 rounded-full ${aiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{aiConnected ? 'AI Connected' : 'Autonomous'}</span>
            </button>

            <button
              onClick={onQuickRun}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#145ca8] hover:bg-[#186dc4] active:bg-[#114f91] text-white rounded-lg transition-all shadow-md disabled:opacity-50 shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 text-[#12cbe6] ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Mapping...' : 'Run Mapping'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="ml-auto p-2 text-slate-300 hover:text-white bg-[#0f2e56] hover:bg-[#163f73] border border-[#23538c] rounded-lg transition-colors shrink-0"
              title="AI & Filing Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

