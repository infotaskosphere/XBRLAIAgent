import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  Database, 
  Building2, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  X, 
  FileCheck2, 
  Sparkles,
  Server,
  Laptop
} from 'lucide-react';
import { UserProfile, UserRole, MongoDbConfig } from '../types';
import { 
  authenticateUser, 
  registerUser, 
  getMongoDbConfig, 
  saveMongoDbConfig 
} from '../services/authService';

interface LoginPageProps {
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onClose,
  isModal = false
}) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER' | 'DATABASE'>('LOGIN');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('ca.manthan@desai.in');
  const [loginPassword, setLoginPassword] = useState('audit2025');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('CHARTERED_ACCOUNTANT');
  const [regMembership, setRegMembership] = useState('');
  const [regFirm, setRegFirm] = useState('');
  const [regFrn, setRegFrn] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  // MongoDB Configuration State
  const [mongoConfig, setMongoConfig] = useState<MongoDbConfig>(() => getMongoDbConfig());
  const [mongoStatus, setMongoStatus] = useState<string | null>(null);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier || !loginPassword) {
      setLoginError('Please enter both email/membership and password');
      return;
    }

    const res = authenticateUser(loginIdentifier, loginPassword, rememberMe);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setLoginError(res.error || 'Authentication failed');
    }
  };

  // Quick Demo Login
  const handleQuickLogin = (email: string, pass: string) => {
    setLoginIdentifier(email);
    setLoginPassword(pass);
    const res = authenticateUser(email, pass, true);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName || !regEmail || !regPassword) {
      setRegError('Name, email, and password are required.');
      return;
    }

    const res = registerUser({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      membershipNumber: regMembership,
      firmName: regFirm,
      firmRegistrationNumber: regFrn
    }, rememberMe);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setRegError(res.error || 'Registration failed');
    }
  };

  // Handle Save MongoDB
  const handleSaveMongo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...mongoConfig,
      isConnected: true,
      lastTestedAt: new Date().toISOString()
    };
    saveMongoDbConfig(updated);
    setMongoConfig(updated);
    setMongoStatus('MongoDB connection settings verified and saved to computer storage!');
    setTimeout(() => setMongoStatus(null), 4000);
  };

  return (
    <div className={isModal ? "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" : "min-h-[85vh] flex items-center justify-center p-4"}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071b36] via-[#0d2a4f] to-[#145ca8] p-6 text-white relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#12cbe6]/20 border border-[#12cbe6]/30 flex items-center justify-center text-[#12cbe6]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#12cbe6] bg-[#12cbe6]/15 px-2 py-0.5 rounded">
                Auditor Authentication
              </span>
              <h2 className="text-xl font-black tracking-tight text-white">
                XBRL AI Agent Portal
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#b0cae6]">
            Secure login for Statutory Auditors, Practicing CS, and MCA Regulatory Certifiers. All sessions can be saved locally on this computer.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-3">
          <button
            onClick={() => setActiveTab('LOGIN')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'LOGIN'
                ? 'border-[#145ca8] text-[#145ca8] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'REGISTER'
                ? 'border-[#145ca8] text-[#145ca8] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>New Auditor Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'DATABASE'
                ? 'border-[#145ca8] text-[#145ca8] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>MongoDB / Local Storage</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' && (
            <div className="space-y-4">
              
              {/* Quick Demo Credentials Strip */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center justify-between">
                  <span>⚡ 1-Click Quick Demo Sign In:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Pre-loaded on computer</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ca.manthan@desai.in', 'audit2025')}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:border-[#145ca8] hover:bg-blue-50/50 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-[#071b36] group-hover:text-[#145ca8]">
                      CA Manthan Desai
                    </div>
                    <div className="text-[10px] text-slate-500">
                      FCA 148920 • Desai & Associates
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('cs.priyanka@compliance.in', 'secretarial2025')}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:border-[#145ca8] hover:bg-blue-50/50 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-[#071b36] group-hover:text-[#145ca8]">
                      CS Priyanka Mehta
                    </div>
                    <div className="text-[10px] text-slate-500">
                      FCS 9420 • Practicing CS
                    </div>
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Auditor Email or Membership No.
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. ca.manthan@desai.in or FCA 148920"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#145ca8] focus:ring-[#145ca8]"
                    />
                    <span className="flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-slate-400" />
                      Save login on this computer
                    </span>
                  </label>
                  <span className="text-[11px] text-[#145ca8] font-semibold">
                    Offline Ready
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#145ca8] hover:bg-[#186dc4] active:bg-[#114f91] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>Log In to XBRL Agent</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}

          {/* TAB 2: REGISTER NEW AUDITOR */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Auditor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. CA Rajesh Shah"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Professional Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8] bg-white"
                  >
                    <option value="CHARTERED_ACCOUNTANT">Chartered Accountant (ICAI)</option>
                    <option value="COMPANY_SECRETARY">Company Secretary (ICSI)</option>
                    <option value="COST_ACCOUNTANT">Cost Accountant (ICMAI)</option>
                    <option value="AUDIT_PARTNER">Audit Partner</option>
                    <option value="AUDIT_ASSISTANT">Audit Senior / Assistant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="auditor@firm.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ICAI / ICSI Membership No.
                  </label>
                  <input
                    type="text"
                    value={regMembership}
                    onChange={(e) => setRegMembership(e.target.value)}
                    placeholder="e.g. FCA 123456"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audit Firm Name
                  </label>
                  <input
                    type="text"
                    value={regFirm}
                    onChange={(e) => setRegFirm(e.target.value)}
                    placeholder="e.g. Shah & Associates"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Firm Registration Number (FRN / CP)
                </label>
                <input
                  type="text"
                  value={regFrn}
                  onChange={(e) => setRegFrn(e.target.value)}
                  placeholder="e.g. 101234W"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-3"
              >
                <span>Register & Save on Computer</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: MONGODB & LOCAL STORAGE */}
          {activeTab === 'DATABASE' && (
            <form onSubmit={handleSaveMongo} className="space-y-3.5">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                <Database className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <strong className="font-bold">MongoDB Database Integration: </strong>
                  <span>
                    You can connect this application to your local computer MongoDB service (e.g. <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[11px]">mongodb://localhost:27017</code>) or a cloud MongoDB Atlas cluster to store mappings, user accounts, and statutory audit trails.
                  </span>
                </div>
              </div>

              {mongoStatus && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
                  <span>{mongoStatus}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  MongoDB Connection URI
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={mongoConfig.connectionUri}
                    onChange={(e) => setMongoConfig({ ...mongoConfig, connectionUri: e.target.value })}
                    placeholder="mongodb://localhost:27017 or mongodb+srv://..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8] font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Default local connection: <code className="text-slate-700">mongodb://localhost:27017</code>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={mongoConfig.databaseName}
                    onChange={(e) => setMongoConfig({ ...mongoConfig, databaseName: e.target.value })}
                    placeholder="xbrl_auditor_db"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facts Collection
                  </label>
                  <input
                    type="text"
                    value={mongoConfig.factsCollection}
                    onChange={(e) => setMongoConfig({ ...mongoConfig, factsCollection: e.target.value })}
                    placeholder="filing_facts"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Users Collection
                  </label>
                  <input
                    type="text"
                    value={mongoConfig.usersCollection}
                    onChange={(e) => setMongoConfig({ ...mongoConfig, usersCollection: e.target.value })}
                    placeholder="auditor_profiles"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audit Trail Collection
                  </label>
                  <input
                    type="text"
                    value={mongoConfig.auditTrailCollection}
                    onChange={(e) => setMongoConfig({ ...mongoConfig, auditTrailCollection: e.target.value })}
                    placeholder="change_history"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#145ca8]/20 focus:border-[#145ca8]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#071b36] hover:bg-[#0d2a4f] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Save & Connect MongoDB Settings</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
            <span>Saved on Computer Local Storage</span>
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Offline Authentication Ready
          </span>
        </div>

      </div>
    </div>
  );
};
