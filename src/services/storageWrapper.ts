import { UserProfile } from '../types';

/**
 * LocalStorageWrapper: Enterprise-grade client-side storage persistence engine
 * Specifically engineered to persist Auditor Authentication Sessions, Profile Data,
 * and MCA filing preferences on the auditor's local machine using window.localStorage.
 * 
 * Features:
 * - Safe fallback to in-memory storage if window.localStorage is blocked or quota is exceeded
 * - Cross-tab synchronization via storage event listeners
 * - Schema versioning and data corruption recovery
 * - Heartbeat touch to keep session alive across browser restarts
 */

export interface PersistedSessionEnvelope {
  version: number;
  storedAt: string;
  lastActiveAt: string;
  rememberMe: boolean;
  profile: UserProfile;
}

const STORAGE_NAMESPACE = 'xbrl_auditor_';
const SESSION_KEY = `${STORAGE_NAMESPACE}session_v2`;
const LEGACY_SESSION_KEY = 'xbrl_auditor_session';
const REGISTERED_USERS_KEY = `${STORAGE_NAMESPACE}registered_users_v2`;
const LEGACY_USERS_KEY = 'xbrl_registered_users';
const MONGO_CONFIG_KEY = `${STORAGE_NAMESPACE}mongo_config_v2`;
const CURRENT_VERSION = 2;

class LocalStorageWrapper {
  private memoryFallback: Map<string, string> = new Map();
  private isStorageAvailable: boolean;

  constructor() {
    this.isStorageAvailable = this.checkAvailability();
    this.migrateLegacyStorage();
  }

  /**
   * Validates whether window.localStorage is fully operational on this machine
   */
  private checkAvailability(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const testKey = `__xbrl_test_probe_${Date.now()}__`;
      window.localStorage.setItem(testKey, 'probe');
      const val = window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      return val === 'probe';
    } catch (e) {
      console.warn('[LocalStorageWrapper] window.localStorage unavailable. Falling back to in-memory store.', e);
      return false;
    }
  }

  /**
   * Automatically migrates legacy session records if present
   */
  private migrateLegacyStorage(): void {
    try {
      if (!this.isStorageAvailable) return;

      // Migrate session
      if (!window.localStorage.getItem(SESSION_KEY)) {
        const legacySession = window.localStorage.getItem(LEGACY_SESSION_KEY);
        if (legacySession) {
          const parsed = JSON.parse(legacySession);
          if (parsed && parsed.email) {
            this.saveAuditorSession(parsed, true);
          }
        }
      }

      // Migrate users
      if (!window.localStorage.getItem(REGISTERED_USERS_KEY)) {
        const legacyUsers = window.localStorage.getItem(LEGACY_USERS_KEY);
        if (legacyUsers) {
          window.localStorage.setItem(REGISTERED_USERS_KEY, legacyUsers);
        }
      }
    } catch (e) {
      console.warn('[LocalStorageWrapper] Migration notice:', e);
    }
  }

  /**
   * Generic get item with type safety and default fallback
   */
  public get<T>(key: string, defaultValue: T): T {
    try {
      const raw = this.isStorageAvailable 
        ? window.localStorage.getItem(key) 
        : this.memoryFallback.get(key);

      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[LocalStorageWrapper] Error parsing key "${key}":`, err);
      return defaultValue;
    }
  }

  /**
   * Generic set item with quota handling and memory synchronization
   */
  public set<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      if (this.isStorageAvailable) {
        window.localStorage.setItem(key, serialized);
      }
      this.memoryFallback.set(key, serialized);
      return true;
    } catch (err) {
      console.error(`[LocalStorageWrapper] Failed to set key "${key}":`, err);
      // Still write to memory so the active session doesn't abruptly crash
      this.memoryFallback.set(key, JSON.stringify(value));
      return false;
    }
  }

  /**
   * Remove item from both persistent storage and memory fallback
   */
  public remove(key: string): void {
    try {
      if (this.isStorageAvailable) {
        window.localStorage.removeItem(key);
      }
      this.memoryFallback.delete(key);
    } catch (err) {
      console.error(`[LocalStorageWrapper] Failed to remove key "${key}":`, err);
    }
  }

  /**
   * Explicitly persists the Auditor's Session and Profile onto the machine.
   * Ensures the session survives browser restarts, reloads, and tab closures.
   */
  public saveAuditorSession(profile: UserProfile, rememberMe: boolean = true): boolean {
    const envelope: PersistedSessionEnvelope = {
      version: CURRENT_VERSION,
      storedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      rememberMe,
      profile: {
        ...profile,
        rememberMe
      }
    };

    // Store in versioned key
    const success = this.set(SESSION_KEY, envelope);
    
    // Also mirror to legacy key for backwards-compatibility with existing components
    if (this.isStorageAvailable) {
      try {
        window.localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify(profile));
      } catch {}
    }

    return success;
  }

  /**
   * Loads the active Auditor session from the auditor's local machine.
   * Returns null only if no session exists or user explicitly signed out.
   */
  public getAuditorSession(): UserProfile | null {
    // 1. Try versioned envelope first
    const envelope = this.get<PersistedSessionEnvelope | null>(SESSION_KEY, null);
    if (envelope && envelope.profile) {
      // Touch last-active time on the auditor's computer
      this.touchSession(envelope);
      return envelope.profile;
    }

    // 2. Fallback to legacy key
    const legacy = this.get<UserProfile | null>(LEGACY_SESSION_KEY, null);
    if (legacy && legacy.email) {
      // Upgrade to envelope
      this.saveAuditorSession(legacy, true);
      return legacy;
    }

    return null;
  }

  /**
   * Updates last-active timestamp on local machine
   */
  private touchSession(envelope: PersistedSessionEnvelope): void {
    try {
      envelope.lastActiveAt = new Date().toISOString();
      if (this.isStorageAvailable) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(envelope));
      }
    } catch {}
  }

  /**
   * Clears the auditor's active session upon explicit logout
   */
  public clearAuditorSession(): void {
    this.remove(SESSION_KEY);
    this.remove(LEGACY_SESSION_KEY);
  }

  /**
   * Subscribe to cross-tab session changes
   */
  public onSessionChange(callback: (user: UserProfile | null) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = (e: StorageEvent) => {
      if (e.key === SESSION_KEY || e.key === LEGACY_SESSION_KEY) {
        const currentUser = this.getAuditorSession();
        callback(currentUser);
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
}

// Export singleton instance
export const storageWrapper = new LocalStorageWrapper();
