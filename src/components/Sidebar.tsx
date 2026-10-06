import React from 'react';
import {
  LayoutDashboard,
  FileText,
  History,
  GitCompare,
  FileOutput,
  BookOpen,
  Settings,
  ChevronRight
} from 'lucide-react';

export type AppSection = 'DASHBOARD' | 'CURRENT' | 'PREVIOUS' | 'MAPPING' | 'SAG' | 'LIBRARY';

interface SidebarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  currentCount: number;
  previousCount: number;
  mappingCount: number;
  onOpenSettings: () => void;
}

const items = [
  { id: 'DASHBOARD', step: '', title: 'Dashboard', icon: LayoutDashboard },
  { id: 'CURRENT', step: '01', title: 'Current Year', icon: FileText },
  { id: 'PREVIOUS', step: '02', title: 'Previous Reference', icon: History },
  { id: 'MAPPING', step: '03', title: 'AI Mapping & Comparison', icon: GitCompare },
  { id: 'SAG', step: '04', title: 'SAG Gen XBRL Autowriter', icon: FileOutput, highlight: true },
  { id: 'LIBRARY', step: '05', title: 'Must-Read Guides', icon: BookOpen }
] as const;

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  currentCount,
  previousCount,
  mappingCount,
  onOpenSettings
}) => {
  const badges: Record<string, number> = {
    CURRENT: currentCount,
    PREVIOUS: previousCount,
    MAPPING: mappingCount
  };

  return (
    <aside className="hidden lg:flex w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white sticky top-[105px] h-[calc(100vh-105px)]">
      <div className="px-4 pt-5 pb-3">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.16em] px-2">
          Workspace
        </div>
      </div>

      <nav className="px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = activeSection === item.id;
          const Icon = item.icon;
          const badge = badges[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as AppSection)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all border ${
                active
                  ? 'bg-[#071b36] text-white border-[#071b36] shadow-sm'
                  : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                active
                  ? 'bg-[#12cbe6] text-[#071b36]'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {item.step && (
                    <span className={`text-[9px] font-extrabold tracking-wider ${
                      active ? 'text-[#12cbe6]' : 'text-slate-400'
                    }`}>
                      {item.step}
                    </span>
                  )}
                  <span className="text-xs font-extrabold truncate">{item.title}</span>
                </div>
                {item.id === 'DASHBOARD' && (
                  <div className={`text-[10px] mt-0.5 ${
                    active ? 'text-slate-300' : 'text-slate-400'
                  }`}>
                    Filing health overview
                  </div>
                )}
              </div>

              {badge !== undefined && badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  active
                    ? 'bg-[#145ca8] text-white'
                    : 'bg-blue-50 text-[#145ca8]'
                }`}>
                  {badge}
                </span>
              )}

              {item.highlight && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              )}

              {active && <ChevronRight className="w-3.5 h-3.5 text-[#12cbe6] shrink-0" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-3 border-t border-slate-200">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-[#071b36] text-white flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-extrabold text-slate-800">Settings</div>
            <div className="text-[10px] text-slate-400">AI & filing configuration</div>
          </div>
        </button>
      </div>
    </aside>
  );
};
