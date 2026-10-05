import React, { useState } from 'react';
import { X, Key, Cpu, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { AiSettings } from '../types';
import { testAiConnection } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AiSettings;
  onSave: (newSettings: AiSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<AiSettings>(settings);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const msg = await testAiConnection(formData);
      setTestResult({ success: true, message: msg });
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#071b36] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[#12cbe6]" />
            <h3 className="font-bold text-base">AI Engine & Filing Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs font-sans">
          
          {/* Provider */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">AI Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => {
                const prov = e.target.value as any;
                setFormData({
                  ...formData,
                  provider: prov,
                  model: prov === 'Gemini' ? 'gemini-1.5-flash' : prov === 'OpenAI' ? 'gpt-4o' : 'claude-3-5-sonnet-20241022'
                });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-[#145ca8]"
            >
              <option value="Gemini">Google Gemini (Recommended - Native Multimodal PDF vision)</option>
              <option value="OpenAI">OpenAI (GPT-4o)</option>
              <option value="Anthropic">Anthropic (Claude 3.5 Sonnet)</option>
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              API Key (Optional - Software runs autonomously without key)
            </label>
            <input
              type="password"
              placeholder="Enter your AI API Key or leave blank for local autonomous mode..."
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#145ca8]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Even without an API key, the built-in financial rule engine maps accounts, matches previous tags, and writes SAG Gen XBRL files.
            </span>
          </div>

          {/* Model */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Model Name</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-[#145ca8]"
            />
          </div>

          {/* Test connection results */}
          {testResult && (
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-red-50 border-red-300 text-red-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-xs break-all">{testResult.message}</span>
            </div>
          )}

          {/* Test Button */}
          <div>
            <button
              onClick={handleTest}
              disabled={testing || !formData.apiKey}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing connection...' : 'Test AI Connection'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#145ca8] hover:bg-[#186dc4] text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
};
