import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { CurrentYearTab } from './components/CurrentYearTab';
import { PreviousYearTab } from './components/PreviousYearTab';
import { AiMappingTab } from './components/AiMappingTab';
import { SagGenXbrlTab } from './components/SagGenXbrlTab';
import { RegulatoryLibraryTab } from './components/RegulatoryLibraryTab';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginPage } from './components/LoginPage';
import { TaxonomyStandard, UploadedDocument, FileRole, MappedFact, AiSettings, UserProfile } from './types';
import { PreviousYearReference } from './services/previousYearTaggingEngine';
import { parseUploadedFile } from './services/documentParser';
import { mapDocumentsToTaxonomy, generateInitialFacts } from './services/xbrlMappingEngine';
import { runStructuredAiMapping } from './services/geminiService';
import { getCurrentSession, clearSession } from './services/authService';
import { storageWrapper } from './services/storageWrapper';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type WindowsTab = 'CURRENT' | 'PREVIOUS' | 'MAPPING' | 'SAG' | 'LIBRARY';

const TABS: Array<{ key: WindowsTab; step: string; label: string }> = [
  { key: 'CURRENT', step: '01', label: 'CURRENT YEAR' },
  { key: 'PREVIOUS', step: '02', label: 'PREVIOUS REFERENCE' },
  { key: 'MAPPING', step: '03', label: 'AI MAPPING & COMPARISON' },
  { key: 'SAG', step: '04', label: 'SAG GEN XBRL AUTOWRITER' },
  { key: 'LIBRARY', step: '05', label: 'MUST-READ GUIDES' }
];

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentSession());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WindowsTab>('CURRENT');
  const [taxonomy, setTaxonomy] = useState<TaxonomyStandard>('IND_AS');
  const [currentDocuments, setCurrentDocuments] = useState<UploadedDocument[]>([]);
  const [previousDocuments, setPreviousDocuments] = useState<UploadedDocument[]>([]);
  const [facts, setFacts] = useState<MappedFact[]>(() => generateInitialFacts('IND_AS'));
  const [previousYearReference, setPreviousYearReference] = useState<PreviousYearReference | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    provider: 'Gemini', apiKey: '', model: 'gemini-1.5-flash', temperature: 0.1, autoMapOnUpload: true
  });

  useEffect(() => storageWrapper.onSessionChange((user) => setCurrentUser(user)), []);

  const showToast = (type: 'success' | 'info' | 'error', text: string) => {
    setToastMessage({ type, text });
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSignOut = () => {
    clearSession();
    setCurrentUser(null);
    showToast('info', 'Signed out. Your audit profile remains saved on this computer.');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    showToast('success', `Logged in as ${user.name} (${user.membershipNumber || 'Auditor'})`);
  };

  const handleTaxonomyChange = (newTaxonomy: TaxonomyStandard) => {
    setTaxonomy(newTaxonomy);
    setFacts(generateInitialFacts(newTaxonomy));
    setPreviousYearReference(null);
    showToast('info', `Switched taxonomy to ${newTaxonomy === 'IND_AS' ? 'MCA Ind AS' : 'Non-Ind AS (AS 2021)'}`);
  };

  const handleUpload = async (files: FileList | File[], role: FileRole, year: 'CURRENT' | 'PREVIOUS') => {
    setIsProcessing(true);
    try {
      const newDocs: UploadedDocument[] = [];
      for (const file of Array.from(files)) newDocs.push(await parseUploadedFile(file, role, year));
      if (year === 'CURRENT') {
        setCurrentDocuments(prev => role === 'CY_SUPPORTING' ? [...prev, ...newDocs] : [...prev.filter(d => d.role !== role), ...newDocs]);
        showToast('success', `Loaded ${newDocs.length} Current-Year document(s) successfully!`);
      } else {
        setPreviousDocuments(prev => role === 'PY_SUPPORTING' ? [...prev, ...newDocs] : [...prev.filter(d => d.role !== role), ...newDocs]);
        showToast('success', `Loaded ${newDocs.length} Previous-Year reference document(s)!`);
      }
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Document processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveDoc = (id: string) => {
    setCurrentDocuments(prev => prev.filter(d => d.id !== id));
    setPreviousDocuments(prev => prev.filter(d => d.id !== id));
    showToast('info', 'Document removed');
  };

  const handleRunMapping = async () => {
    setIsProcessing(true);
    try {
      const result = mapDocumentsToTaxonomy(currentDocuments, previousDocuments, taxonomy, facts);
      let mappedFacts = result.mappedFacts;

      if (aiSettings.provider === 'Gemini' && aiSettings.apiKey && currentDocuments.length > 0) {
        const aiMappings = await runStructuredAiMapping(currentDocuments, previousDocuments, mappedFacts, taxonomy, aiSettings);
        const byConcept = new Map(aiMappings.map(item => [item.conceptName, item]));
        mappedFacts = mappedFacts.map(fact => {
          const ai = byConcept.get(fact.conceptName);
          if (!ai) return fact;
          const history = ai.currentValue !== null && ai.currentValue !== fact.currentValue
            ? [{
                id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                factId: fact.id,
                timestamp: new Date().toISOString(),
                type: 'AI_REMAP' as const,
                author: 'AI Agent',
                previousValue: fact.currentValue,
                newValue: ai.currentValue,
                notes: ai.reason || 'Structured Gemini evidence mapping',
                sourceDoc: ai.sourceDoc,
                confidence: ai.confidence
              }, ...(fact.history || [])]
            : (fact.history || []);
          return {
            ...fact,
            currentValue: ai.currentValue,
            confidence: ai.confidence,
            status: ai.status,
            sourceDoc: ai.sourceDoc || fact.sourceDoc,
            sourcePageOrSheet: ai.sourcePageOrSheet || fact.sourcePageOrSheet,
            reviewNotes: ai.reason || fact.reviewNotes,
            history
          };
        });
      }

      setFacts(mappedFacts);
      setPreviousYearReference(result.previousYearReference);
      setIsProcessing(false);
      const confirmed = mappedFacts.filter(f => f.status === 'CONFIRMED').length;
      const review = mappedFacts.filter(f => f.status === 'REVIEW_REQUIRED' || f.status === 'SOURCE_CONFLICT').length;
      showToast('success', `Mapping complete: ${confirmed} confirmed, ${review} requiring review.`);
      setActiveTab('MAPPING');
    } catch (error) {
      setIsProcessing(false);
      showToast('error', error instanceof Error ? error.message : 'AI mapping failed');
    }
  };

  const handleUpdateFact = (id: string, updated: Partial<MappedFact>, historyMeta?: { reason?: string; isRevert?: boolean; author?: string; revertToEntryId?: string }) => {
    setFacts(prev => prev.map(f => {
      if (f.id !== id) return f;
      const valueChanged = updated.currentValue !== undefined && updated.currentValue !== f.currentValue;
      const conceptChanged = updated.conceptName !== undefined && updated.conceptName !== f.conceptName;
      const sagChanged = updated.sagFieldId !== undefined && updated.sagFieldId !== f.sagFieldId;
      const history = f.history ? [...f.history] : [];
      if (valueChanged || conceptChanged || sagChanged || historyMeta?.isRevert) {
        history.unshift({
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          factId: f.id, timestamp: new Date().toISOString(),
          type: historyMeta?.isRevert ? 'REVERTED' : (updated.editedManually !== false ? 'MANUAL_OVERRIDE' : 'AI_REMAP'),
          author: historyMeta?.author || 'Auditor', previousValue: f.currentValue,
          newValue: updated.currentValue !== undefined ? updated.currentValue : f.currentValue,
          previousConcept: f.conceptName, newConcept: updated.conceptName || f.conceptName,
          notes: historyMeta?.reason || (historyMeta?.isRevert ? 'Reverted to historical state' : 'Manual adjustment by auditor'),
          confidence: f.confidence
        });
      }
      return { ...f, ...updated, history, editedManually: historyMeta?.isRevert ? false : (updated.editedManually ?? true) };
    }));
    showToast('success', historyMeta?.isRevert ? 'Reverted to previous version' : 'Fact updated and logged in history audit trail');
  };

  const handleDetectSag = () => showToast('info', 'SAG Gen XBRL detection requested. Direct local auto-write is available only to the Windows agent.');

  return (
    <div className="xbrl-windows-shell">
      <Header taxonomy={taxonomy} onTaxonomyChange={handleTaxonomyChange} onOpenSettings={() => setIsSettingsOpen(true)}
        aiConnected={Boolean(aiSettings.apiKey)} onDetectSag={handleDetectSag} onQuickRun={handleRunMapping}
        isProcessing={isProcessing} currentUser={currentUser} onOpenLogin={() => setIsLoginModalOpen(true)} onSignOut={handleSignOut} />

      <nav className="xbrl-windows-tabs" aria-label="XBRL workflow">
        {TABS.map(tab => (
          <button key={tab.key} type="button" className={`xbrl-windows-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            <span className="xbrl-tab-badge">{tab.step}</span><span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="xbrl-windows-content">
        {activeTab === 'CURRENT' && <CurrentYearTab documents={currentDocuments} onUpload={handleUpload} onRemove={handleRemoveDoc} onPreview={setPreviewDoc} onAnalyze={handleRunMapping} isProcessing={isProcessing} facts={facts} taxonomy={taxonomy} />}
        {activeTab === 'PREVIOUS' && <PreviousYearTab documents={previousDocuments} onUpload={handleUpload} onRemove={handleRemoveDoc} onPreview={setPreviewDoc} onBuildReference={handleRunMapping} isProcessing={isProcessing} reference={previousYearReference} />}
        {activeTab === 'MAPPING' && <AiMappingTab facts={facts} taxonomy={taxonomy} onUpdateFact={handleUpdateFact} onRunMapping={handleRunMapping} isProcessing={isProcessing} onNavigateToSag={() => setActiveTab('SAG')} />}
        {activeTab === 'SAG' && <SagGenXbrlTab facts={facts} taxonomy={taxonomy} onUpdateFact={handleUpdateFact} />}
        {activeTab === 'LIBRARY' && <RegulatoryLibraryTab />}
      </main>

      <div className="xbrl-status-bar">
        <div className="xbrl-status-progress"><div className={`xbrl-status-progress-fill ${isProcessing ? 'running' : ''}`} /></div>
        <span>{isProcessing ? 'Processing XBRL documents...' : 'Ready • Loaded standard taxonomy catalog'}</span>
        <span className="xbrl-status-sag">SAG Gen XBRL: {navigator.userAgent.includes('Windows') ? 'Windows bridge available' : 'Web export mode'}</span>
      </div>

      {toastMessage && <div className={`xbrl-toast xbrl-toast-${toastMessage.type}`}>
        {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
        {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4" />}
        {toastMessage.type === 'info' && <Info className="w-4 h-4" />}
        <span>{toastMessage.text}</span>
      </div>}

      <DocumentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={aiSettings}
        onSave={(newSettings) => { setAiSettings(newSettings); showToast('success', 'AI settings updated successfully'); }} />
      {isLoginModalOpen && <LoginPage isModal currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onClose={() => setIsLoginModalOpen(false)} />}
    </div>
  );
};
