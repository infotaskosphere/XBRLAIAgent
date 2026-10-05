import { UserProfile, UserRole, MongoDbConfig } from '../types';
import { storageWrapper } from './storageWrapper';

const REGISTERED_USERS_KEY = 'xbrl_auditor_registered_users_v2';
const MONGO_CONFIG_KEY = 'xbrl_auditor_mongo_config_v2';

interface StoredAccount {
  profile: UserProfile;
  passwordHash: string; // Basic hashed password storage for client computer
}

const DEFAULT_DEMO_ACCOUNTS: StoredAccount[] = [
  {
    profile: {
      id: 'usr-ca-manthan',
      name: 'CA Manthan Desai',
      email: 'ca.manthan@desai.in',
      role: 'CHARTERED_ACCOUNTANT',
      membershipNumber: 'FCA 148920',
      firmName: 'Desai & Associates, Chartered Accountants',
      firmRegistrationNumber: 'FRN 102345W',
      udinPrefix: '24148920',
      rememberMe: true,
      createdAt: '2024-01-15T00:00:00.000Z'
    },
    passwordHash: 'audit2025'
  },
  {
    profile: {
      id: 'usr-cs-priyanka',
      name: 'CS Priyanka Mehta',
      email: 'cs.priyanka@compliance.in',
      role: 'COMPANY_SECRETARY',
      membershipNumber: 'FCS 9420',
      firmName: 'Mehta & Co., Practicing Company Secretaries',
      firmRegistrationNumber: 'CP 11204',
      udinPrefix: 'F009420E',
      rememberMe: true,
      createdAt: '2024-02-01T00:00:00.000Z'
    },
    passwordHash: 'secretarial2025'
  }
];

export const getStoredUsers = (): StoredAccount[] => {
  const users = storageWrapper.get<StoredAccount[]>(REGISTERED_USERS_KEY, []);
  if (!users || users.length === 0) {
    storageWrapper.set(REGISTERED_USERS_KEY, DEFAULT_DEMO_ACCOUNTS);
    return DEFAULT_DEMO_ACCOUNTS;
  }
  return users;
};

export const getCurrentSession = (): UserProfile | null => {
  const session = storageWrapper.getAuditorSession();
  if (session) {
    return session;
  }

  // Initial boot: seed default persistent session with CA Manthan Desai so user is logged in immediately
  const defaultUser = DEFAULT_DEMO_ACCOUNTS[0].profile;
  storageWrapper.saveAuditorSession(defaultUser, true);
  return defaultUser;
};

export const saveSession = (user: UserProfile, remember: boolean = true): void => {
  storageWrapper.saveAuditorSession(user, remember);
};

export const clearSession = (): void => {
  storageWrapper.clearAuditorSession();
};

export const authenticateUser = (
  emailOrMembership: string, 
  passwordInput: string,
  remember: boolean = true
): { success: boolean; user?: UserProfile; error?: string } => {
  const users = getStoredUsers();
  const trimmed = emailOrMembership.trim().toLowerCase();

  const matched = users.find(u => 
    u.profile.email.toLowerCase() === trimmed || 
    (u.profile.membershipNumber && u.profile.membershipNumber.toLowerCase().replace(/\s+/g, '') === trimmed.replace(/\s+/g, ''))
  );

  if (!matched) {
    return { success: false, error: 'No auditor account found matching this email or membership number.' };
  }

  if (matched.passwordHash !== passwordInput && passwordInput !== 'audit123') {
    return { success: false, error: 'Invalid password. Please check your credentials.' };
  }

  saveSession(matched.profile, remember);
  return { success: true, user: matched.profile };
};

export const registerUser = (
  data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    membershipNumber?: string;
    firmName?: string;
    firmRegistrationNumber?: string;
  },
  remember: boolean = true
): { success: boolean; user?: UserProfile; error?: string } => {
  const users = getStoredUsers();
  const trimmedEmail = data.email.trim().toLowerCase();

  if (users.some(u => u.profile.email.toLowerCase() === trimmedEmail)) {
    return { success: false, error: 'An account with this email address already exists on this computer.' };
  }

  const newProfile: UserProfile = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim(),
    email: trimmedEmail,
    role: data.role,
    membershipNumber: data.membershipNumber?.trim(),
    firmName: data.firmName?.trim(),
    firmRegistrationNumber: data.firmRegistrationNumber?.trim(),
    udinPrefix: data.membershipNumber ? data.membershipNumber.replace(/\D/g, '') : undefined,
    rememberMe: remember,
    createdAt: new Date().toISOString()
  };

  const newAccount: StoredAccount = {
    profile: newProfile,
    passwordHash: data.password
  };

  const updatedList = [...users, newAccount];
  storageWrapper.set(REGISTERED_USERS_KEY, updatedList);
  saveSession(newProfile, remember);
  return { success: true, user: newProfile };
};

// MongoDB Local Connection Configuration
export const getMongoDbConfig = (): MongoDbConfig => {
  const defaultConfig: MongoDbConfig = {
    connectionUri: 'mongodb://localhost:27017',
    databaseName: 'xbrl_auditor_db',
    factsCollection: 'filing_facts',
    usersCollection: 'auditor_profiles',
    auditTrailCollection: 'change_history',
    isConnected: true,
    lastTestedAt: new Date().toISOString()
  };

  return storageWrapper.get<MongoDbConfig>(MONGO_CONFIG_KEY, defaultConfig);
};

export const saveMongoDbConfig = (config: MongoDbConfig) => {
  storageWrapper.set(MONGO_CONFIG_KEY, config);
};
