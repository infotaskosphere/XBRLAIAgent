import { MappedFact, TaxonomyStandard, UploadedDocument } from '../types';
import { getTaxonomyConcepts } from './taxonomyData';
import { detectFactAnomaly } from './anomalyDetectionEngine';
import { buildPreviousYearReference, applyPreviousYearReference, PreviousYearReference } from './previousYearTaggingEngine';

// Generates robust default initial mapping data for the selected taxonomy standard
export function generateInitialFacts(standard: TaxonomyStandard): MappedFact[] {
  // Start from the selected taxonomy catalog only. No client/company/sample
  // financial values are injected before evidence is supplied.
  const concepts = getTaxonomyConcepts(standard);

  return concepts.map((concept) => {
    const unit =
      concept.dataType === 'monetary' ? 'INR' :
      concept.dataType === 'shares' ? 'Shares' :
      concept.dataType === 'pure' ? 'pure' :
      concept.dataType;

    const period = concept.periodType === 'duration'
      ? 'Duration: Current financial year (not yet set)'
      : 'Instant: Current financial year-end (not yet set)';

    const fact: MappedFact = {
      id: `fact-${standard.toLowerCase()}-${concept.id}`,
      conceptName: concept.name,
      standard,
      label: concept.label,
      schedule: concept.schedule,
      period,
      previousValue: null,
      currentValue: null,
      unit,
      status: 'NEW_ITEM',
      confidence: 0,
      reviewNotes: concept.isMandatory
        ? 'Mandatory taxonomy concept awaiting current-year evidence.'
        : 'Taxonomy concept awaiting current-year evidence.',
      history: []
    };

    return {
      ...fact,
      sagFieldId: getDefaultSagFieldId(fact.conceptName, fact.schedule),
      sagScreenRef: getDefaultSagScreenRef(fact.schedule, fact.conceptName)
    };
  });
}

function parseEvidenceNumber(raw: string): number | null {
  let value = String(raw || '').trim().replace(/₹/g, '').replace(/INR/gi, '').replace(/Rs\.?/gi, '').replace(/,/g, '').trim();
  if (value.startsWith('(') && value.endsWith(')')) value = '-' + value.slice(1, -1).trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizedEvidenceLabel(value: string): string {
  return String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function findCurrentEvidence(fact: MappedFact, docs: UploadedDocument[]): { value: number; sourceDoc: string; sourceLocation: string; confidence: number } | null {
  const aliases = [fact.label, fact.conceptName.split(':').pop() || fact.conceptName].map(normalizedEvidenceLabel).filter(Boolean);
  for (const doc of docs) {
    for (const table of doc.extractedTables || []) {
      for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
        const row = table.rows[rowIndex] || [];
        const rowText = row.map(cell => String(cell ?? '')).join(' | ');
        if (!aliases.some(alias => normalizedEvidenceLabel(rowText).includes(alias))) continue;
        const numeric = row.map(cell => parseEvidenceNumber(String(cell ?? ''))).filter((v): v is number => v !== null);
        if (numeric.length) return { value: numeric[numeric.length - 1], sourceDoc: doc.name, sourceLocation: table.sheetName ? table.sheetName + ' • Row ' + (rowIndex + 2) : 'Table Row ' + (rowIndex + 2), confidence: 97 };
      }
    }
  }
  for (const doc of docs) {
    const text = doc.extractedText || '';
    for (const alias of aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const expression = new RegExp(escaped + '[^\\n\\r0-9()\\-]{0,50}(-?\\(?[0-9][0-9,]*(?:\\.[0-9]+)?\\)?)', 'i');
      const match = text.match(expression);
      if (!match?.[1]) continue;
      const value = parseEvidenceNumber(match[1]);
      if (value !== null) return { value, sourceDoc: doc.name, sourceLocation: 'Extracted document text', confidence: 91 };
    }
  }
  return null;
}

// Automatically maps uploaded documents against the previous-year XBRL reference
export function mapDocumentsToTaxonomy(
  currentDocs: UploadedDocument[],
  previousDocs: UploadedDocument[],
  standard: TaxonomyStandard,
  existingFacts: MappedFact[]
): {
  mappedFacts: MappedFact[];
  previousYearReference: PreviousYearReference;
  stats: {
    total: number;
    confirmed: number;
    changed: number;
    reviewRequired: number;
    mathBalanced: boolean;
    previousYearCoverage: number;
    previousYearConflicts: number;
  };
} {
  const currentTextCombined = currentDocs.map(d => `${d.name}:\n${d.extractedText}`).join('\n\n');
  
  // Clone existing facts or generate base
  let facts: MappedFact[] = existingFacts.length > 0
    ? JSON.parse(JSON.stringify(existingFacts))
    : generateInitialFacts(standard);

  // Previous-year evidence is a first-class input to mapping.
  // The reference engine reads the prior XBRL/XAG plus prior financial,
  // audit and supporting documents before current-year extraction runs.
  const previousYearReference: PreviousYearReference = buildPreviousYearReference(
    previousDocs,
    facts,
    getTaxonomyConcepts(standard)
  );
  facts = applyPreviousYearReference(facts, previousYearReference);

  // Scan current-year evidence only. Previous-year values are never used as CY evidence.
  facts.forEach(fact => {
    const evidence = findCurrentEvidence(fact, currentDocs);
    if (evidence) {
      fact.currentValue = evidence.value;
      fact.sourceDoc = evidence.sourceDoc;
      fact.sourcePageOrSheet = evidence.sourceLocation;
      fact.confidence = evidence.confidence;
      fact.status = fact.previousValue === fact.currentValue ? 'CONFIRMED' : 'CHANGED';
      fact.reviewNotes = 'Current-year value extracted from uploaded evidence; verify against the source document.';
    }
    // Flag large shifts and anomalies
    const anomaly = detectFactAnomaly(fact);
    if (anomaly) {
      fact.anomaly = anomaly;
      if (anomaly.severity === 'HIGH') {
        fact.status = 'REVIEW_REQUIRED';
      }
      fact.reviewNotes = anomaly.message;
    } else if (typeof fact.previousValue === 'number' && typeof fact.currentValue === 'number') {
      const pct = Math.abs((fact.currentValue - fact.previousValue) / (fact.previousValue || 1));
      if (pct > 0.40) {
        fact.status = 'REVIEW_REQUIRED';
        fact.reviewNotes = `Significant variance: ${(pct * 100).toFixed(1)}% shift detected between PY and CY`;
      }
    }

    // Ensure SAG Gen XBRL field identifiers are populated
    if (!fact.sagFieldId) {
      fact.sagFieldId = getDefaultSagFieldId(fact.conceptName, fact.schedule);
    }
    if (!fact.sagScreenRef) {
      fact.sagScreenRef = getDefaultSagScreenRef(fact.schedule, fact.conceptName);
    }
  });

  const total = facts.length;
  const confirmed = facts.filter(f => f.status === 'CONFIRMED').length;
  const changed = facts.filter(f => f.status === 'CHANGED').length;
  const reviewRequired = facts.filter(f => f.status === 'REVIEW_REQUIRED').length;

  // Validate balance sheet equality
  const totalAssetsFact = facts.find(f => f.conceptName.includes('Assets') && !f.conceptName.includes('Current') && !f.conceptName.includes('Noncurrent'));
  const totalLiabFact = facts.find(f => f.conceptName.includes('EquityAndLiabilities'));
  const mathBalanced = totalAssetsFact && totalLiabFact && totalAssetsFact.currentValue === totalLiabFact.currentValue;

  return {
    mappedFacts: facts,
    previousYearReference,
    stats: {
      total,
      confirmed,
      changed,
      reviewRequired,
      mathBalanced: Boolean(mathBalanced),
      previousYearCoverage: previousYearReference.coverage,
      previousYearConflicts: previousYearReference.conflicts.length
    }
  };
}

export function getDefaultSagFieldId(conceptName: string, schedule: string): string {
  const clean = conceptName.split(':').pop() || '';
  if (schedule === 'GENERAL') {
    if (clean.includes('CorporateIdentityNumber')) return 'SAG_GEN_CIN_001';
    if (clean.includes('NameOf')) return 'SAG_GEN_NAME_002';
    if (clean.includes('PermanentAccountNumber')) return 'SAG_GEN_PAN_003';
    return `SAG_GEN_${clean.slice(0, 8).toUpperCase()}`;
  }
  if (schedule === 'BALANCE_SHEET') {
    if (clean.includes('PropertyPlantAndEquipment') || clean.includes('TangibleAssets')) return 'SAG_BS_PPE_101';
    if (clean.includes('CapitalWorkInProgress')) return 'SAG_BS_CWIP_102';
    if (clean.includes('RightOfUseAssets')) return 'SAG_BS_ROU_103';
    if (clean.includes('Intangible')) return 'SAG_BS_INT_104';
    if (clean.includes('Inventories')) return 'SAG_BS_INV_110';
    if (clean.includes('TradeReceivables')) return 'SAG_BS_REC_111';
    if (clean.includes('CashAndCashEquivalents') || clean.includes('CashAndBank')) return 'SAG_BS_CSH_112';
    if (clean.includes('Assets') && !clean.includes('Current')) return 'SAG_BS_TOT_199';
    if (clean.includes('EquityShareCapital') || clean.includes('ShareCapital')) return 'SAG_BS_EQC_201';
    if (clean.includes('OtherEquity') || clean.includes('ReservesAndSurplus')) return 'SAG_BS_RES_202';
    if (clean.includes('Borrowings')) return 'SAG_BS_BOR_205';
    if (clean.includes('TradePayables')) return 'SAG_BS_TPY_210';
    if (clean.includes('EquityAndLiabilities')) return 'SAG_BS_TEQ_299';
    return `SAG_BS_${clean.slice(0, 8).toUpperCase()}`;
  }
  if (schedule === 'PROFIT_LOSS') {
    if (clean.includes('RevenueFromOperations')) return 'SAG_PL_REV_301';
    if (clean.includes('OtherIncome')) return 'SAG_PL_INC_302';
    if (clean.includes('EmployeeBenefit')) return 'SAG_PL_EMP_305';
    if (clean.includes('FinanceCost')) return 'SAG_PL_FIN_306';
    if (clean.includes('Depreciation')) return 'SAG_PL_DEP_307';
    if (clean.includes('ProfitBeforeTax')) return 'SAG_PL_PBT_315';
    if (clean.includes('CurrentTax')) return 'SAG_PL_TAX_316';
    if (clean.includes('ProfitLossForPeriod')) return 'SAG_PL_PAT_320';
    if (clean.includes('Earnings')) return 'SAG_PL_EPS_325';
    return `SAG_PL_${clean.slice(0, 8).toUpperCase()}`;
  }
  if (schedule === 'CARO') {
    return `SAG_CARO_${clean.slice(0, 8).toUpperCase()}`;
  }
  return `SAG_FLD_${clean.slice(0, 8).toUpperCase()}`;
}

export function getDefaultSagScreenRef(schedule: string, conceptName: string): string {
  const clean = conceptName.split(':').pop() || '';
  if (schedule === 'GENERAL') return 'Company Master > Basic Details';
  if (schedule === 'BALANCE_SHEET') {
    if (clean.includes('Assets') && !clean.includes('Current')) return 'Balance Sheet > Total Assets Face';
    if (clean.includes('PPE') || clean.includes('Tangible') || clean.includes('RightOfUse') || clean.includes('Intangible')) return 'Balance Sheet > Non-Current Assets';
    if (clean.includes('Inventories') || clean.includes('Receivables') || clean.includes('Cash')) return 'Balance Sheet > Current Assets';
    if (clean.includes('Capital') || clean.includes('Equity') || clean.includes('Reserves')) return 'Balance Sheet > Equity / Shareholders Funds';
    if (clean.includes('Liabilities') || clean.includes('Payables') || clean.includes('Borrowings')) return 'Balance Sheet > Liabilities';
    return 'Balance Sheet Schedule';
  }
  if (schedule === 'PROFIT_LOSS') {
    if (clean.includes('Revenue') || clean.includes('Income')) return 'Profit & Loss > Part I (Income)';
    if (clean.includes('Tax')) return 'Profit & Loss > Tax Expense';
    if (clean.includes('Profit')) return 'Profit & Loss > Bottomline Results';
    return 'Profit & Loss > Part II (Expenses)';
  }
  if (schedule === 'CARO') return 'Auditors Report > CARO 2020 Annexure';
  return 'Financial Schedules & Disclosures';
}
