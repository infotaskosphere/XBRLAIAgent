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
