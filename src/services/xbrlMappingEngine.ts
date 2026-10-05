import { MappedFact, TaxonomyStandard, UploadedDocument } from '../types';
import { getTaxonomyConcepts } from './taxonomyData';

// Generates robust default initial mapping data for the selected taxonomy standard
export function generateInitialFacts(standard: TaxonomyStandard): MappedFact[] {
  const concepts = getTaxonomyConcepts(standard);

  if (standard === 'IND_AS') {
    return [
      {
        id: 'fact-1',
        conceptName: 'ind-as:CorporateIdentityNumber',
        standard: 'IND_AS',
        label: 'Corporate Identity Number (CIN)',
        schedule: 'GENERAL',
        period: 'Instant: 2024-03-31',
        previousValue: 'L17110MH1995PLC085000',
        currentValue: 'L17110MH1995PLC085000',
        unit: 'string',
        status: 'CONFIRMED',
        confidence: 100,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Page 1 (Company Master)'
      },
      {
        id: 'fact-2',
        conceptName: 'ind-as:NameOfTheCompany',
        standard: 'IND_AS',
        label: 'Name of the Company',
        schedule: 'GENERAL',
        period: 'Instant: 2024-03-31',
        previousValue: 'TASKOSPHERE ENTERPRISE SOLUTIONS LIMITED',
        currentValue: 'TASKOSPHERE ENTERPRISE SOLUTIONS LIMITED',
        unit: 'string',
        status: 'CONFIRMED',
        confidence: 100,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Page 1'
      },
      {
        id: 'fact-3',
        conceptName: 'ind-as:PropertyPlantAndEquipment',
        standard: 'IND_AS',
        label: 'Property, Plant and Equipment (PPE)',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 485000000,
        currentValue: 532400000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 96,
        sourceDoc: 'Financial_Statements_CY.xlsx',
        sourcePageOrSheet: 'BS_Schedule_Note_4'
      },
      {
        id: 'fact-4',
        conceptName: 'ind-as:RightOfUseAssets',
        standard: 'IND_AS',
        label: 'Right-of-Use Assets (Ind AS 116)',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 42000000,
        currentValue: 38500000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 92,
        sourceDoc: 'CY Notes to Accounts.docx',
        sourcePageOrSheet: 'Note 5 (Leases)'
      },
      {
        id: 'fact-5',
        conceptName: 'ind-as:Inventories',
        standard: 'IND_AS',
        label: 'Inventories',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 125000000,
        currentValue: 148200000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 95,
        sourceDoc: 'Financial_Statements_CY.xlsx',
        sourcePageOrSheet: 'BS_Schedule_Note_8'
      },
      {
        id: 'fact-6',
        conceptName: 'ind-as:TradeReceivables',
        standard: 'IND_AS',
        label: 'Trade Receivables',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 210000000,
        currentValue: 245600000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 94,
        sourceDoc: 'Financial_Statements_CY.xlsx',
        sourcePageOrSheet: 'BS_Schedule_Note_9'
      },
      {
        id: 'fact-7',
        conceptName: 'ind-as:CashAndCashEquivalents',
        standard: 'IND_AS',
        label: 'Cash and Cash Equivalents',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 78500000,
        currentValue: 92100000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 98,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Balance Sheet Page 14'
      },
      {
        id: 'fact-8',
        conceptName: 'ind-as:Assets',
        standard: 'IND_AS',
        label: 'Total Assets',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 940500000,
        currentValue: 1056800000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 99,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Balance Sheet Page 14'
      },
      {
        id: 'fact-9',
        conceptName: 'ind-as:EquityShareCapital',
        standard: 'IND_AS',
        label: 'Equity Share Capital',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 250000000,
        currentValue: 250000000,
        unit: 'INR',
        status: 'CONFIRMED',
        confidence: 100,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Note 14'
      },
      {
        id: 'fact-10',
        conceptName: 'ind-as:OtherEquity',
        standard: 'IND_AS',
        label: 'Other Equity (Reserves & Surplus)',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 380500000,
        currentValue: 476800000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 96,
        sourceDoc: 'Financial_Statements_CY.xlsx',
        sourcePageOrSheet: 'SOCIE Sheet'
      },
      {
        id: 'fact-11',
        conceptName: 'ind-as:TradePayables',
        standard: 'IND_AS',
        label: 'Trade Payables',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 145000000,
        currentValue: 165000000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 93,
        sourceDoc: 'Financial_Statements_CY.xlsx',
        sourcePageOrSheet: 'BS_Schedule_Note_18'
      },
      {
        id: 'fact-12',
        conceptName: 'ind-as:EquityAndLiabilities',
        standard: 'IND_AS',
        label: 'Total Equity and Liabilities',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 940500000,
        currentValue: 1056800000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 99,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Balance Sheet Page 14'
      },
      {
        id: 'fact-13',
        conceptName: 'ind-as:RevenueFromOperations',
        standard: 'IND_AS',
        label: 'Revenue from Operations',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 1420000000,
        currentValue: 1685000000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 98,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'P&L Statement Page 15'
      },
      {
        id: 'fact-14',
        conceptName: 'ind-as:OtherIncome',
        standard: 'IND_AS',
        label: 'Other Income',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 18500000,
        currentValue: 24200000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 95,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'P&L Note 21'
      },
      {
        id: 'fact-15',
        conceptName: 'ind-as:EmployeeBenefitExpense',
        standard: 'IND_AS',
        label: 'Employee Benefit Expense',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 310000000,
        currentValue: 365000000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 97,
        sourceDoc: 'Financial_Statements_CY.xlsx',
        sourcePageOrSheet: 'PL_Note_24'
      },
      {
        id: 'fact-16',
        conceptName: 'ind-as:FinanceCosts',
        standard: 'IND_AS',
        label: 'Finance Costs',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 22000000,
        currentValue: 18500000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 96,
        sourceDoc: 'Financial_Statements_CY.xlsx',
        sourcePageOrSheet: 'PL_Note_25'
      },
      {
        id: 'fact-17',
        conceptName: 'ind-as:DepreciationAndAmortisationExpense',
        standard: 'IND_AS',
        label: 'Depreciation and Amortisation Expense',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 46000000,
        currentValue: 51200000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 97,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'P&L Statement Page 15'
      },
      {
        id: 'fact-18',
        conceptName: 'ind-as:ProfitBeforeTax',
        standard: 'IND_AS',
        label: 'Profit Before Tax',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 154000000,
        currentValue: 182400000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 99,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'P&L Statement Page 15'
      },
      {
        id: 'fact-19',
        conceptName: 'ind-as:CurrentTax',
        standard: 'IND_AS',
        label: 'Current Tax Expense',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 39500000,
        currentValue: 46100000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 98,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'P&L Note 30'
      },
      {
        id: 'fact-20',
        conceptName: 'ind-as:ProfitLossForPeriod',
        standard: 'IND_AS',
        label: 'Profit / (Loss) for the Period (PAT)',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 114500000,
        currentValue: 136300000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 99,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'P&L Statement Page 15'
      },
      {
        id: 'fact-21',
        conceptName: 'ind-as:BasicEarningsLossPerShareFromContinuingOperations',
        standard: 'IND_AS',
        label: 'Basic Earnings Per Share (INR)',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 4.58,
        currentValue: 5.45,
        unit: 'pure',
        status: 'CHANGED',
        confidence: 99,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'P&L Statement Page 15'
      },
      {
        id: 'fact-22',
        conceptName: 'ind-as:WhetherCompaniesAuditorsReportOrderApplicable',
        standard: 'IND_AS',
        label: 'Whether CARO 2020 Applicable',
        schedule: 'CARO',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 'true',
        currentValue: 'true',
        unit: 'string',
        status: 'CONFIRMED',
        confidence: 100,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Annexure A to Auditor Report'
      }
    ];
  } else {
    // Non-Ind AS
    return [
      {
        id: 'fact-non-1',
        conceptName: 'in-ca:CorporateIdentityNumber',
        standard: 'NON_IND_AS',
        label: 'Corporate Identity Number (CIN)',
        schedule: 'GENERAL',
        period: 'Instant: 2024-03-31',
        previousValue: 'U72900MH2012PTC229999',
        currentValue: 'U72900MH2012PTC229999',
        unit: 'string',
        status: 'CONFIRMED',
        confidence: 100,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'General Information'
      },
      {
        id: 'fact-non-2',
        conceptName: 'in-ca:NameOfTheCompany',
        standard: 'NON_IND_AS',
        label: 'Name of the Company',
        schedule: 'GENERAL',
        period: 'Instant: 2024-03-31',
        previousValue: 'SAGARIKA INFOTECH PRIVATE LIMITED',
        currentValue: 'SAGARIKA INFOTECH PRIVATE LIMITED',
        unit: 'string',
        status: 'CONFIRMED',
        confidence: 100,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'General Information'
      },
      {
        id: 'fact-non-3',
        conceptName: 'in-ca:ShareCapital',
        standard: 'NON_IND_AS',
        label: 'Share Capital (Schedule III)',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 50000000,
        currentValue: 50000000,
        unit: 'INR',
        status: 'CONFIRMED',
        confidence: 100,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Balance Sheet Page 2'
      },
      {
        id: 'fact-non-4',
        conceptName: 'in-ca:ReservesAndSurplus',
        standard: 'NON_IND_AS',
        label: 'Reserves and Surplus',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 125000000,
        currentValue: 168000000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 96,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Note 2'
      },
      {
        id: 'fact-non-5',
        conceptName: 'in-ca:LongTermBorrowings',
        standard: 'NON_IND_AS',
        label: 'Long-Term Borrowings',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 45000000,
        currentValue: 32000000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 95,
        sourceDoc: 'Financial_Schedules.xlsx',
        sourcePageOrSheet: 'Note 3 Borrowings'
      },
      {
        id: 'fact-non-6',
        conceptName: 'in-ca:TradePayables',
        standard: 'NON_IND_AS',
        label: 'Trade Payables',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 62000000,
        currentValue: 71500000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 94,
        sourceDoc: 'Financial_Schedules.xlsx',
        sourcePageOrSheet: 'Note 5 Trade Payables'
      },
      {
        id: 'fact-non-7',
        conceptName: 'in-ca:EquityAndLiabilities',
        standard: 'NON_IND_AS',
        label: 'Total Equity and Liabilities',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 282000000,
        currentValue: 321500000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 99,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Balance Sheet Page 2'
      },
      {
        id: 'fact-non-8',
        conceptName: 'in-ca:TangibleAssets',
        standard: 'NON_IND_AS',
        label: 'Tangible Assets (PPE Schedule II)',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 142000000,
        currentValue: 156000000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 97,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Schedule II Fixed Assets'
      },
      {
        id: 'fact-non-9',
        conceptName: 'in-ca:Inventories',
        standard: 'NON_IND_AS',
        label: 'Inventories',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 48000000,
        currentValue: 56500000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 95,
        sourceDoc: 'Financial_Schedules.xlsx',
        sourcePageOrSheet: 'Note 11 Inventories'
      },
      {
        id: 'fact-non-10',
        conceptName: 'in-ca:TradeReceivables',
        standard: 'NON_IND_AS',
        label: 'Trade Receivables',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 64000000,
        currentValue: 74200000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 94,
        sourceDoc: 'Financial_Schedules.xlsx',
        sourcePageOrSheet: 'Note 12 Receivables'
      },
      {
        id: 'fact-non-11',
        conceptName: 'in-ca:CashAndBankBalances',
        standard: 'NON_IND_AS',
        label: 'Cash and Bank Balances',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 28000000,
        currentValue: 34800000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 98,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Balance Sheet Page 2'
      },
      {
        id: 'fact-non-12',
        conceptName: 'in-ca:Assets',
        standard: 'NON_IND_AS',
        label: 'Total Assets',
        schedule: 'BALANCE_SHEET',
        period: 'Instant: 2024-03-31',
        previousValue: 282000000,
        currentValue: 321500000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 99,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Balance Sheet Page 2'
      },
      {
        id: 'fact-non-13',
        conceptName: 'in-ca:RevenueFromOperations',
        standard: 'NON_IND_AS',
        label: 'Revenue from Operations',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 395000000,
        currentValue: 472000000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 98,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Profit & Loss Page 3'
      },
      {
        id: 'fact-non-14',
        conceptName: 'in-ca:ProfitBeforeTax',
        standard: 'NON_IND_AS',
        label: 'Profit Before Tax',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 58000000,
        currentValue: 71200000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 98,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Profit & Loss Page 3'
      },
      {
        id: 'fact-non-15',
        conceptName: 'in-ca:ProfitLossForPeriodFromContinuingOperations',
        standard: 'NON_IND_AS',
        label: 'Profit / (Loss) for the Period',
        schedule: 'PROFIT_LOSS',
        period: 'Duration: 2023-04-01 to 2024-03-31',
        previousValue: 43500000,
        currentValue: 53400000,
        unit: 'INR',
        status: 'CHANGED',
        confidence: 99,
        sourceDoc: 'CY Audit Report.pdf',
        sourcePageOrSheet: 'Profit & Loss Page 3'
      }
    ];
  }
}

// Automatically maps uploaded documents against the previous-year XBRL reference
export function mapDocumentsToTaxonomy(
  currentDocs: UploadedDocument[],
  previousDocs: UploadedDocument[],
  standard: TaxonomyStandard,
  existingFacts: MappedFact[]
): { mappedFacts: MappedFact[]; stats: { total: number; confirmed: number; changed: number; reviewRequired: number; mathBalanced: boolean } } {
  const currentTextCombined = currentDocs.map(d => `${d.name}:\n${d.extractedText}`).join('\n\n');
  const previousXbrlDoc = previousDocs.find(d => d.role === 'PY_XBRL_XML' || d.role === 'PY_SAG_XAG');
  
  // Clone existing facts or generate base
  const facts: MappedFact[] = existingFacts.length > 0 
    ? JSON.parse(JSON.stringify(existingFacts))
    : generateInitialFacts(standard);

  // If previous XBRL doc exists, extract prior facts
  if (previousXbrlDoc && previousXbrlDoc.extractedText) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(previousXbrlDoc.extractedText, 'text/xml');
      
      facts.forEach(fact => {
        // Search by local tag name
        const tagName = fact.conceptName.split(':').pop() || '';
        const matchingElements = Array.from(xmlDoc.getElementsByTagName(tagName))
          .concat(Array.from(xmlDoc.getElementsByTagName(fact.conceptName)));
          
        if (matchingElements.length > 0) {
          const firstVal = matchingElements[0].textContent?.trim();
          if (firstVal && !isNaN(Number(firstVal))) {
            fact.previousValue = Number(firstVal);
          } else if (firstVal) {
            fact.previousValue = firstVal;
          }
        }
      });
    } catch {
      // Keep existing
    }
  }

  // Scan current documents for potential values
  facts.forEach(fact => {
    // Check if label appears in text
    const labelRegex = new RegExp(`${fact.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^0-9\\n]{1,30}([0-9,]+(?:\\.[0-9]+)?)`, 'i');
    const match = currentTextCombined.match(labelRegex);
    if (match && match[1]) {
      const cleanNum = Number(match[1].replace(/,/g, ''));
      if (!isNaN(cleanNum) && cleanNum > 0) {
        fact.currentValue = cleanNum;
        fact.confidence = 94;
        fact.status = fact.previousValue === fact.currentValue ? 'CONFIRMED' : 'CHANGED';
      }
    }

    // Flag large shifts
    if (typeof fact.previousValue === 'number' && typeof fact.currentValue === 'number') {
      const pct = Math.abs((fact.currentValue - fact.previousValue) / (fact.previousValue || 1));
      if (pct > 0.40) {
        fact.status = 'REVIEW_REQUIRED';
        fact.reviewNotes = `Significant variance: ${(pct * 100).toFixed(1)}% shift detected between PY and CY`;
      }
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
    stats: {
      total,
      confirmed,
      changed,
      reviewRequired,
      mathBalanced: Boolean(mathBalanced)
    }
  };
}
