import React, { useState, useEffect } from 'react';
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
import { parseUploadedFile } from './services/documentParser';
import { mapDocumentsToTaxonomy, generateInitialFacts } from './services/xbrlMappingEngine';
import { getCurrentSession, clearSession } from './services/authService';
import { storageWrapper } from './services/storageWrapper';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentSession());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = storageWrapper.onSessionChange((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'PREVIOUS' | 'MAPPING' | 'SAG' | 'LIBRARY'>('CURRENT');
  const [taxonomy, setTaxonomy] = useState<TaxonomyStandard>('IND_AS');
  
  const [currentDocuments, setCurrentDocuments] = useState<UploadedDocument[]>([]);
  const [previousDocuments, setPreviousDocuments] = useState<UploadedDocument[]>([]);
  const [facts, setFacts] = useState<MappedFact[]>(() => generateInitialFacts('IND_AS'));
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const [aiSettings, setAiSettings] = useState<AiSettings>({
    provider: 'Gemini',
    apiKey: '',
    model: 'gemini-1.5-flash',
    temperature: 0.1,
    autoMapOnUpload: true
  });

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

  // Re-generate default facts if taxonomy changes and user hasn't uploaded custom files yet
  const handleTaxonomyChange = (newTaxonomy: TaxonomyStandard) => {
    setTaxonomy(newTaxonomy);
    const newFacts = generateInitialFacts(newTaxonomy);
    setFacts(newFacts);
    showToast('info', `Switched taxonomy to ${newTaxonomy === 'IND_AS' ? 'MCA Ind AS' : 'Non-Ind AS (Accounting Standards)'}`);
  };

  const showToast = (type: 'success' | 'info' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Upload handler for Current / Previous documents
  const handleUpload = async (
    files: FileList | File[],
    role: FileRole,
    year: 'CURRENT' | 'PREVIOUS'
  ) => {
    setIsProcessing(true);
    const fileArray = Array.from(files);
    const newDocs: UploadedDocument[] = [];

    for (const f of fileArray) {
      const parsed = await parseUploadedFile(f, role, year);
      newDocs.push(parsed);
    }

    if (year === 'CURRENT') {
      setCurrentDocuments(prev => {
        // Replace single-slot roles, append multi supporting
        if (role === 'CY_SUPPORTING') {
          return [...prev, ...newDocs];
        }
        return [...prev.filter(d => d.role !== role), ...newDocs];
      });
      showToast('success', `Loaded ${newDocs.length} Current-Year document(s) successfully!`);
    } else {
      setPreviousDocuments(prev => {
        if (role === 'PY_SUPPORTING') {
          return [...prev, ...newDocs];
        }
        return [...prev.filter(d => d.role !== role), ...newDocs];
      });
      showToast('success', `Loaded ${newDocs.length} Previous-Year reference document(s)!`);
    }

    setIsProcessing(false);
  };

  const handleRemoveDoc = (id: string) => {
    setCurrentDocuments(prev => prev.filter(d => d.id !== id));
    setPreviousDocuments(prev => prev.filter(d => d.id !== id));
    showToast('info', 'Document removed');
  };

  // Run AI Mapping
  const handleRunMapping = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const { mappedFacts, stats } = mapDocumentsToTaxonomy(
        currentDocuments,
        previousDocuments,
        taxonomy,
        facts
      );
      setFacts(mappedFacts);
      setIsProcessing(false);
      showToast('success', `Mapping complete: ${stats.total} facts verified, ${stats.confirmed} confirmed!`);
      setActiveTab('MAPPING');
    }, 600);
  };

  // Update inline fact with history tracking
  const handleUpdateFact = (
    id: string, 
    updated: Partial<MappedFact>, 
    historyMeta?: { reason?: string; isRevert?: boolean; author?: string; revertToEntryId?: string }
  ) => {
    setFacts(prev => prev.map(f => {
      if (f.id !== id) return f;

      const isValChanged = updated.currentValue !== undefined && updated.currentValue !== f.currentValue;
      const isConceptChanged = updated.conceptName !== undefined && updated.conceptName !== f.conceptName;
      const isSagChanged = updated.sagFieldId !== undefined && updated.sagFieldId !== f.sagFieldId;

      let newHistory = f.history ? [...f.history] : [];
      if (isValChanged || isConceptChanged || isSagChanged || historyMeta?.isRevert) {
        newHistory.unshift({
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          factId: f.id,
          timestamp: new Date().toISOString(),
          type: historyMeta?.isRevert ? 'REVERTED' : (updated.editedManually !== false ? 'MANUAL_OVERRIDE' : 'AI_REMAP'),
          author: historyMeta?.author || 'Auditor',
          previousValue: f.currentValue,
          newValue: updated.currentValue !== undefined ? updated.currentValue : f.currentValue,
          previousConcept: f.conceptName,
          newConcept: updated.conceptName || f.conceptName,
          notes: historyMeta?.reason || (historyMeta?.isRevert ? 'Reverted to historical state' : 'Manual adjustment by auditor'),
          confidence: f.confidence
        });
      }

      return {
        ...f,
        ...updated,
        history: newHistory,
        editedManually: historyMeta?.isRevert ? false : (updated.editedManually ?? true)
      };
    }));
    
    showToast('success', historyMeta?.isRevert ? 'Reverted to previous version' : 'Fact updated and logged in history audit trail');
  };

  // Detect SAG Gen XBRL simulation
  const handleDetectSag = () => {
    showToast('info', 'SAG Gen XBRL detected at C:\\Program Files\\SAG Infotech\\GenXBRL\\ (Auto-write ready)');
  };

  const tabList = [
    { id: 'CURRENT', step: '01', title: 'CURRENT YEAR', badge: currentDocuments.length },
    { id: 'PREVIOUS', step: '02', title: 'PREVIOUS REFERENCE', badge: previousDocuments.length },
    { id: 'MAPPING', step: '03', title: 'AI MAPPING & COMPARISON', badge: facts.length },
    { id: 'SAG', step: '04', title: 'SAG GEN XBRL AUTOWRITER', highlight: true },
    { id: 'LIBRARY', step: '05', title: '📚 MUST-READ GUIDES', count: '6' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fc]">
      
      {/* Top Header */}
      <Header
        taxonomy={taxonomy}
        onTaxonomyChange={handleTaxonomyChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        aiConnected={Boolean(aiSettings.apiKey)}
        onDetectSag={handleDetectSag}
        onQuickRun={handleRunMapping}
        isProcessing={isProcessing}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Tab Navigation Ribbon */}
      <div className="bg-white border-b border-slate-200 sticky top-[68px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2">
            {tabList.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-[#071b36] text-white border-[#071b36] shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    active ? 'bg-[#12cbe6] text-[#071b36]' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.step}
                  </span>
                  <span>{tab.title}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      active ? 'bg-[#145ca8] text-white' : 'bg-blue-100 text-[#145ca8]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.highlight && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'CURRENT' && (
          <CurrentYearTab
            documents={currentDocuments}
            onUpload={handleUpload}
            onRemove={handleRemoveDoc}
            onPreview={setPreviewDoc}
            onAnalyze={handleRunMapping}
            isProcessing={isProcessing}
            facts={facts}
            taxonomy={taxonomy}
            onNavigateToMapping={() => setActiveTab('MAPPING')}
            onNavigateToSag={() => setActiveTab('SAG')}
          />
        )}

        {activeTab === 'PREVIOUS' && (
          <PreviousYearTab
            documents={previousDocuments}
            onUpload={handleUpload}
            onRemove={handleRemoveDoc}
            onPreview={setPreviewDoc}
            onBuildReference={handleRunMapping}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === 'MAPPING' && (
          <AiMappingTab
            facts={facts}
            taxonomy={taxonomy}
            onUpdateFact={handleUpdateFact}
            onRunMapping={handleRunMapping}
            isProcessing={isProcessing}
            onNavigateToSag={() => setActiveTab('SAG')}
          />
        )}

        {activeTab === 'SAG' && (
          <SagGenXbrlTab
            facts={facts}
            taxonomy={taxonomy}
            onUpdateFact={handleUpdateFact}
          />
        )}

        {activeTab === 'LIBRARY' && (
          <RegulatoryLibraryTab />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-900 border-emerald-600 text-white' 
              : toastMessage.type === 'error'
              ? 'bg-red-900 border-red-600 text-white'
              : 'bg-[#071b36] border-[#145ca8] text-white'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-[#12cbe6]" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSave={(newSettings) => {
          setAiSettings(newSettings);
          showToast('success', 'AI settings updated successfully');
        }}
      />

      {/* Auditor Login Modal / Required Login */}
      {isLoginModalOpen && (
        <LoginPage
          isModal
          currentUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>XBRL AI Agent • Autonomous SAG Gen XBRL Data Bridge & Tagging Engine • Compliant with MCA Ind AS & Non-Ind AS Taxonomies</p>
      </footer>

    </div>
  );
};
