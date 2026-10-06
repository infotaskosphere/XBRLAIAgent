import React from 'react';
import { Settings, Database, Layers, Sparkles, User, LogOut, ChevronDown } from 'lucide-react';
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
  taxonomy, onTaxonomyChange, onOpenSettings, aiConnected, onDetectSag,
  onQuickRun, isProcessing, currentUser, onOpenLogin, onSignOut
}) => (
  <header className="xbrl-windows-header">
    <div className="xbrl-brand-panel">
      <div className="xbrl-logo-mark">
        <span className="bar b1" /><span className="bar b2" /><span className="bar b3" />
        <svg viewBox="0 0 70 55" aria-hidden="true"><path d="M3 50 25 27 43 47 67 5" /></svg>
      </div>
      <div>
        <div className="xbrl-logo-text"><b>XBRL</b><strong>AI</strong></div>
        <div className="xbrl-logo-subtitle">INTELLIGENCE</div>
      </div>
    </div>

    <div className="xbrl-bridge-panel">
      <div>MCA Autonomous Bridge</div>
      <small>Reference-aware preparation • SAG automation</small>
    </div>

    <div className="xbrl-title-panel">
      <strong>XBRL AI Automation Engine</strong>
      <small>MCA Taxonomy (Ind AS / AS 2021) • Intelligent SAG Gen XBRL Direct Autowriter</small>
    </div>

    <div className="xbrl-header-controls">
      <span className="xbrl-control-label"><Layers size={13} /> Taxonomy:</span>
      <button className={`xbrl-header-btn ${taxonomy === 'IND_AS' ? 'selected' : ''}`} onClick={() => onTaxonomyChange('IND_AS')}>Ind AS</button>
      <button className={`xbrl-header-btn ${taxonomy === 'NON_IND_AS' ? 'selected' : ''}`} onClick={() => onTaxonomyChange('NON_IND_AS')}>Non-Ind AS</button>

      <button className="xbrl-header-btn muted" onClick={onDetectSag}><Database size={13} /> Detect Gen XBRL</button>

      <button className={`xbrl-ai-status ${aiConnected ? 'connected' : ''}`} onClick={onOpenSettings}>
        <span /> {aiConnected ? 'AI Connected' : 'Autonomous'}
      </button>

      <button className="xbrl-run-btn" onClick={onQuickRun} disabled={isProcessing}>
        <Sparkles size={13} /> {isProcessing ? 'Mapping...' : 'Run Mapping'}
      </button>

      {currentUser ? (
        <div className="xbrl-user-wrap">
          <button className="xbrl-user-btn" onClick={onOpenLogin}>
            <span className="xbrl-user-avatar">{currentUser.name.split(' ').map(n => n[0]).slice(0,2).join('')}</span>
            <span className="xbrl-user-name">{currentUser.name}</span><ChevronDown size={12} />
          </button>
          <button className="xbrl-settings-btn" onClick={onOpenSettings} title="AI settings"><Settings size={16} /></button>
        </div>
      ) : (
        <div className="xbrl-user-wrap">
          <button className="xbrl-user-btn" onClick={onOpenLogin}><User size={14} /> Auditor Login</button>
          <button className="xbrl-settings-btn" onClick={onOpenSettings} title="AI settings"><Settings size={16} /></button>
        </div>
      )}
    </div>
  </header>
);
