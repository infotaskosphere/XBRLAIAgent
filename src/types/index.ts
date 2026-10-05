export type TaxonomyStandard = 'IND_AS' | 'NON_IND_AS';

export type FileRole = 
  | 'CY_AUDIT_REPORT' 
  | 'CY_FINANCIAL_STATEMENTS' 
  | 'CY_NOTES_ACCOUNTS' 
  | 'CY_SUPPORTING' 
  | 'PY_XBRL_XML' 
  | 'PY_SAG_XAG' 
  | 'PY_FINANCIAL_STATEMENTS' 
  | 'PY_AUDIT_REPORT' 
  | 'PY_SUPPORTING';

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string; // 'pdf' | 'excel' | 'word' | 'xml' | 'text' | 'other'
  role: FileRole;
  year: 'CURRENT' | 'PREVIOUS';
  uploadedAt: string;
  charCount: number;
  extractedText: string;
  extractedTables?: Array<{
    sheetName?: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
  status: 'parsing' | 'ready' | 'error';
  errorMessage?: string;
}

export interface XbrlConcept {
  id: string;
  name: string; // e.g. in-ca:RevenueFromOperations
  standard: TaxonomyStandard;
  label: string;
  schedule: 'GENERAL' | 'BALANCE_SHEET' | 'PROFIT_LOSS' | 'SOCIE' | 'CASH_FLOW' | 'NOTES' | 'CARO';
  balance: 'debit' | 'credit' | 'none';
  periodType: 'instant' | 'duration';
  dataType: 'monetary' | 'shares' | 'pure' | 'string' | 'textBlock' | 'date';
  isMandatory: boolean;
  mcaRuleReference?: string;
}

export type MappingStatus = 'CONFIRMED' | 'CHANGED' | 'REVIEW_REQUIRED' | 'NEW_ITEM' | 'SOURCE_CONFLICT';

export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';

export interface AnomalyAlert {
  isAnomaly: boolean;
  severity: AnomalySeverity;
  type: 'GROWTH_SPIKE' | 'ABRUPT_DROP' | 'SIGN_INVERSION' | 'NEW_MATERIAL_ITEM' | 'THRESHOLD_BREACH';
  pctChange: number;
  message: string;
  recommendedAction: string;
}

export interface FactHistoryEntry {
  id: string;
  factId: string;
  timestamp: string;
  type: 'AI_INITIAL_EXTRACTION' | 'MANUAL_OVERRIDE' | 'AI_REMAP' | 'REVERTED';
  author: string; // 'AI Agent' or 'Auditor'
  previousValue: number | string | null;
  newValue: number | string | null;
  previousConcept?: string;
  newConcept?: string;
  notes?: string;
  sourceDoc?: string;
  confidence?: number;
}

export interface MappedFact {
  id: string;
  conceptName: string;
  standard: TaxonomyStandard;
  label: string;
  schedule: string;
  period: string; // e.g. "Instant: 2024-03-31" or "Duration: 2023-04-01 to 2024-03-31"
  dimension?: string;
  member?: string;
  previousValue: number | string | null;
  currentValue: number | string | null;
  unit: string; // "INR", "Shares", "Pure"
  status: MappingStatus;
  confidence: number; // 0 - 100
  sourceDoc?: string;
  sourcePageOrSheet?: string;
  reviewNotes?: string;
  editedManually?: boolean;
  sagFieldId?: string;
  sagScreenRef?: string;
  history?: FactHistoryEntry[];
  anomaly?: AnomalyAlert;
}

export interface SagExportOptions {
  companyCin: string;
  companyName: string;
  yearEndDate: string;
  yearStartDate: string;
  taxonomy: TaxonomyStandard;
  unitScale: 'EXACT' | 'THOUSANDS' | 'LAKHS' | 'CRORES';
  includeCaro: boolean;
  includeAuditReport: boolean;
  natureOfReport: 'Standalone' | 'Consolidated';
}

export interface RegulatoryDocument {
  id: string;
  title: string;
  category: 'MCA_RULES' | 'IND_AS' | 'NON_IND_AS' | 'SAG_GUIDE' | 'VALIDATION_ERRORS' | 'CARO_CHECKLIST';
  issuedBy: string;
  versionDate: string;
  summary: string;
  applicableTo: string;
  keyHighlights: string[];
  fullContentMarkdown: string;
  downloadFileName: string;
}

export interface AiSettings {
  provider: 'Gemini' | 'OpenAI' | 'Anthropic';
  apiKey: string;
  model: string;
  temperature: number;
  autoMapOnUpload: boolean;
}

export type UserRole = 
  | 'CHARTERED_ACCOUNTANT' 
  | 'COMPANY_SECRETARY' 
  | 'COST_ACCOUNTANT' 
  | 'AUDIT_PARTNER' 
  | 'AUDIT_ASSISTANT';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  membershipNumber?: string; // e.g. "FCA 148920" or "FCS 9420"
  firmName?: string; // e.g. "Desai & Associates"
  firmRegistrationNumber?: string; // e.g. "FRN 102345W"
  udinPrefix?: string;
  rememberMe?: boolean;
  createdAt: string;
}

export interface MongoDbConfig {
  connectionUri: string;
  databaseName: string;
  factsCollection: string;
  usersCollection: string;
  auditTrailCollection: string;
  isConnected?: boolean;
  lastTestedAt?: string;
}
