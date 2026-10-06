import { MappedFact, UploadedDocument, XbrlConcept } from '../types';

export interface PreviousYearTag {
  factId: string;
  conceptName: string;
  label: string;
  value: number | string | null;
  unit?: string;
  contextRef?: string;
  periodEnd?: string;
  dimension?: string;
  member?: string;
  sourceDoc: string;
  sourceLocation: string;
  confidence: number;
  method: 'XBRL_EXACT' | 'XBRL_LOCAL_NAME' | 'TABULAR_MATCH' | 'TEXT_MATCH';
}

export interface PreviousYearReference {
  tags: PreviousYearTag[];
  coverage: number;
  xbrlFactCount: number;
  tabularFactCount: number;
  textFactCount: number;
  conflicts: string[];
  contexts: number;
  sourceDocsRead: string[];
  warnings: string[];
}

const normalize = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const localName = (value: string) => {
  const clean = String(value || '');
  return clean.includes(':') ? clean.split(':').pop() || clean : clean;
};

const parseAmount = (value: string): number | string | null => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  let normalized = raw
    .replace(/₹/g, '')
    .replace(/INR/gi, '')
    .replace(/Rs\.?/gi, '')
    .replace(/,/g, '')
    .trim();

  if (normalized.startsWith('(') && normalized.endsWith(')')) {
    normalized = '-' + normalized.slice(1, -1).trim();
  }

  if (/^-?[0-9]+(?:\.[0-9]+)?$/.test(normalized)) {
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }

  return raw;
};

const textCandidates = (label: string, conceptName: string) => {
  const concept = localName(conceptName);
  const aliases = new Set<string>([
    label,
    concept.replace(/([a-z])([A-Z])/g, '$1 $2'),
    concept.replace(/And/g, ' & ').replace(/Of/g, ' of ')
  ]);

  if (concept.includes('PropertyPlantAndEquipment')) aliases.add('property plant and equipment');
  if (concept.includes('TradeReceivables')) aliases.add('trade receivables');
  if (concept.includes('TradePayables')) aliases.add('trade payables');
  if (concept.includes('ProfitLoss')) aliases.add('profit loss');
  if (concept.includes('RevenueFromOperations')) aliases.add('revenue from operations');
  if (concept.includes('EquityAndLiabilities')) aliases.add('equity and liabilities');
  if (concept.includes('CashAndBank')) aliases.add('cash and bank balances');
  if (concept.includes('CashAndCashEquivalents')) aliases.add('cash and cash equivalents');

  return Array.from(aliases).filter(Boolean);
};

interface XmlCandidate {
  localName: string;
  qualifiedName: string;
  value: string;
  contextRef: string;
  unitRef: string;
  periodEnd?: string;
  dimension?: string;
  member?: string;
}

function buildXmlCandidates(text: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    return { candidates: [] as XmlCandidate[], contexts: 0, warnings: ['Previous XBRL/XML could not be parsed as valid XML.'] };
  }

  const contextMap = new Map<string, { end?: string; dimension?: string; member?: string; hasDimension: boolean }>();
  Array.from(xmlDoc.getElementsByTagName('*'))
    .filter(el => el.localName === 'context')
    .forEach(context => {
      const instant = Array.from(context.getElementsByTagName('*')).find(x => x.localName === 'instant')?.textContent?.trim();
      const endDate = Array.from(context.getElementsByTagName('*')).find(x => x.localName === 'endDate')?.textContent?.trim();
      const explicitMember = Array.from(context.getElementsByTagName('*')).find(x => x.localName === 'explicitMember');
      const dimension = explicitMember?.getAttribute('dimension') || undefined;
      const member = explicitMember?.textContent?.trim() || undefined;
      const id = context.getAttribute('id') || '';
      if (id) {
        contextMap.set(id, {
          end: instant || endDate,
          dimension,
          member,
          hasDimension: Boolean(dimension || member)
        });
      }
    });

  const candidates: XmlCandidate[] = [];
  Array.from(xmlDoc.getElementsByTagName('*'))
    .filter(el => el.children.length === 0 && el.textContent?.trim())
    .forEach(el => {
      const contextRef = el.getAttribute('contextRef') || '';
      const context = contextMap.get(contextRef);
      candidates.push({
        localName: el.localName || el.tagName.split(':').pop() || '',
        qualifiedName: el.tagName,
        value: el.textContent?.trim() || '',
        contextRef,
        unitRef: el.getAttribute('unitRef') || '',
        periodEnd: context?.end,
        dimension: context?.dimension,
        member: context?.member
      });
    });

  return { candidates, contexts: contextMap.size, warnings: [] as string[] };
}

function chooseXmlCandidate(candidates: XmlCandidate[]) {
  const valid = candidates.filter(c => c.value !== '');
  if (!valid.length) return null;

  const sorted = [...valid].sort((a, b) => {
    const dimA = a.dimension || a.member ? 1 : 0;
    const dimB = b.dimension || b.member ? 1 : 0;
    if (dimA !== dimB) return dimA - dimB;
    const da = a.periodEnd ? new Date(a.periodEnd).getTime() : 0;
    const db = b.periodEnd ? new Date(b.periodEnd).getTime() : 0;
    return db - da;
  });

  return sorted[0];
}

function extractTabularMatch(doc: UploadedDocument, fact: MappedFact): { value: number | string; location: string; confidence: number } | null {
  const aliases = textCandidates(fact.label, fact.conceptName).map(normalize).filter(Boolean);

  for (const table of doc.extractedTables || []) {
    for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
      const row = table.rows[rowIndex] || [];
      const rowText = row.map(cell => String(cell ?? '')).join(' | ');
      const normalizedRow = normalize(rowText);
      if (!aliases.some(alias => normalizedRow.includes(alias))) continue;

      const numericCells = row
        .map(cell => String(cell ?? '').trim())
        .filter(Boolean)
        .map(parseAmount)
        .filter(value => typeof value === 'number') as number[];

      if (numericCells.length) {
        return {
          value: numericCells[numericCells.length - 1],
          location: table.sheetName ? `${table.sheetName} • Row ${rowIndex + 2}` : `Table Row ${rowIndex + 2}`,
          confidence: 93
        };
      }
    }
  }

  const lowerText = doc.extractedText.toLowerCase();

  for (const alias of aliases) {
    const aliasLower = alias.toLowerCase();
    const index = lowerText.indexOf(aliasLower);
    if (index < 0) continue;

    const tail = doc.extractedText.slice(index + alias.length, index + alias.length + 100);
    const match = tail.match(/-?[0-9][0-9,]*(?:\.[0-9]+)?/);
    if (!match?.[0]) continue;

    const value = parseAmount(match[0]);
    if (value !== null) {
      return {
        value,
        location: 'Extracted document text',
        confidence: 88
      };
    }
  }

  return null;
}

export function buildPreviousYearReference(
  previousDocs: UploadedDocument[],
  facts: MappedFact[],
  concepts: XbrlConcept[]
): PreviousYearReference {
  const tags: PreviousYearTag[] = [];
  const conflicts: string[] = [];
  const warnings: string[] = [];
  const sourceDocsRead = previousDocs.map(d => d.name);

  const xbrlDocs = previousDocs.filter(d => d.role === 'PY_XBRL_XML' || d.role === 'PY_SAG_XAG');
  const structuredDocs = previousDocs.filter(d => ['PY_FINANCIAL_STATEMENTS', 'PY_AUDIT_REPORT', 'PY_SUPPORTING'].includes(d.role));

  let xbrlFactCount = 0;
  let tabularFactCount = 0;
  let textFactCount = 0;
  let contexts = 0;

  const conceptByName = new Map(concepts.map(c => [c.name, c]));
  const xmlPools: Array<{ doc: UploadedDocument; candidates: XmlCandidate[] }> = [];

  for (const doc of xbrlDocs) {
    const parsed = buildXmlCandidates(doc.extractedText || '');
    contexts += parsed.contexts;
    warnings.push(...parsed.warnings);
    xmlPools.push({ doc, candidates: parsed.candidates });
  }

  for (const fact of facts) {
    const local = localName(fact.conceptName);
    const exactCandidates: Array<{ candidate: XmlCandidate; doc: UploadedDocument; method: 'XBRL_EXACT' | 'XBRL_LOCAL_NAME' }> = [];

    for (const pool of xmlPools) {
      const exact = pool.candidates.filter(c => c.qualifiedName === fact.conceptName);
      const localMatches = pool.candidates.filter(c => c.localName === local);
      for (const candidate of exact) exactCandidates.push({ candidate, doc: pool.doc, method: 'XBRL_EXACT' });
      if (!exact.length) {
        for (const candidate of localMatches) exactCandidates.push({ candidate, doc: pool.doc, method: 'XBRL_LOCAL_NAME' });
      }
    }

    const chosen = chooseXmlCandidate(exactCandidates.map(x => x.candidate));
    if (chosen) {
      const source = exactCandidates.find(x => x.candidate === chosen);
      const parsedValue = parseAmount(chosen.value);
      if (parsedValue !== null) {
        const competing = exactCandidates
          .map(x => parseAmount(x.candidate.value))
          .filter(v => v !== null)
          .map(String);
        if (new Set(competing).size > 1) {
          conflicts.push(`${fact.label}: multiple previous-year XBRL values found (${competing.join(', ')}).`);
        }
        tags.push({
          factId: fact.id,
          conceptName: fact.conceptName,
          label: fact.label,
          value: parsedValue,
          unit: fact.unit,
          contextRef: chosen.contextRef,
          periodEnd: chosen.periodEnd,
          dimension: chosen.dimension,
          member: chosen.member,
          sourceDoc: source?.doc.name || xbrlDocs[0]?.name || 'Previous XBRL',
          sourceLocation: chosen.contextRef ? `Context ${chosen.contextRef}` : 'XBRL fact',
          confidence: source?.method === 'XBRL_EXACT' ? 100 : 96,
          method: source?.method || 'XBRL_LOCAL_NAME'
        });
        xbrlFactCount += 1;
        continue;
      }
    }

    let matched = false;
    for (const doc of structuredDocs) {
      const result = extractTabularMatch(doc, fact);
      if (result) {
        tags.push({
          factId: fact.id,
          conceptName: fact.conceptName,
          label: fact.label,
          value: result.value,
          unit: fact.unit,
          sourceDoc: doc.name,
          sourceLocation: result.location,
          confidence: result.confidence,
          method: (doc.extractedTables || []).length ? 'TABULAR_MATCH' : 'TEXT_MATCH'
        });
        if ((doc.extractedTables || []).length) tabularFactCount += 1;
        else textFactCount += 1;
        matched = true;
        break;
      }
    }

    if (!matched && !conceptByName.has(fact.conceptName)) {
      warnings.push(`No taxonomy concept metadata found for ${fact.conceptName}.`);
    }
  }

  const uniqueFacts = new Set(tags.map(t => t.factId));
  const coverage = facts.length ? Math.round((uniqueFacts.size / facts.length) * 1000) / 10 : 0;

  return {
    tags,
    coverage,
    xbrlFactCount,
    tabularFactCount,
    textFactCount,
    conflicts,
    contexts,
    sourceDocsRead,
    warnings
  };
}

export function applyPreviousYearReference(
  facts: MappedFact[],
  reference: PreviousYearReference
): MappedFact[] {
  const byFact = new Map(reference.tags.map(tag => [tag.factId, tag]));

  return facts.map(fact => {
    const tag = byFact.get(fact.id);
    if (!tag) return fact;

    return {
      ...fact,
      previousValue: tag.value,
      previousSourceDoc: tag.sourceDoc,
      previousSourcePageOrSheet: tag.sourceLocation,
      reviewNotes: reference.conflicts.some(message => message.startsWith(`${fact.label}:`))
        ? `Previous-year source conflict detected. Verify against the authoritative prior-year filing.`
        : fact.reviewNotes,
      history: fact.history || []
    };
  });
}
