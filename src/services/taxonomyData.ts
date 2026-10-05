import { XbrlConcept, TaxonomyStandard } from '../types';

export const IND_AS_TAXONOMY: XbrlConcept[] = [
  // General Info
  {
    id: 'ind-as-cin',
    name: 'ind-as:CorporateIdentityNumber',
    standard: 'IND_AS',
    label: 'Corporate Identity Number (CIN)',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'string',
    isMandatory: true,
    mcaRuleReference: 'MCA General Filing Requirement'
  },
  {
    id: 'ind-as-name',
    name: 'ind-as:NameOfTheCompany',
    standard: 'IND_AS',
    label: 'Name of the Company',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'string',
    isMandatory: true,
    mcaRuleReference: 'MCA Rule 3'
  },
  {
    id: 'ind-as-pan',
    name: 'ind-as:PermanentAccountNumber',
    standard: 'IND_AS',
    label: 'Permanent Account Number (PAN)',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'string',
    isMandatory: true
  },
  {
    id: 'ind-as-reporting-period-start',
    name: 'ind-as:DateOfStartOfFinancialYear',
    standard: 'IND_AS',
    label: 'Date of Start of Financial Year',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'date',
    isMandatory: true
  },
  {
    id: 'ind-as-reporting-period-end',
    name: 'ind-as:DateOfEndOfFinancialYear',
    standard: 'IND_AS',
    label: 'Date of End of Financial Year',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'date',
    isMandatory: true
  },
  {
    id: 'ind-as-agm-date',
    name: 'ind-as:DateOfAnnualGeneralMeeting',
    standard: 'IND_AS',
    label: 'Date of Annual General Meeting (AGM)',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'date',
    isMandatory: false
  },

  // Balance Sheet - Non-Current Assets
  {
    id: 'ind-as-ppe',
    name: 'ind-as:PropertyPlantAndEquipment',
    standard: 'IND_AS',
    label: 'Property, Plant and Equipment (PPE)',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-cwip',
    name: 'ind-as:CapitalWorkInProgress',
    standard: 'IND_AS',
    label: 'Capital Work-in-Progress (CWIP)',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-rou-assets',
    name: 'ind-as:RightOfUseAssets',
    standard: 'IND_AS',
    label: 'Right-of-Use Assets (Ind AS 116)',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-intangible-assets',
    name: 'ind-as:OtherIntangibleAssets',
    standard: 'IND_AS',
    label: 'Other Intangible Assets',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-nc-investments',
    name: 'ind-as:NoncurrentInvestments',
    standard: 'IND_AS',
    label: 'Non-Current Financial Investments',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-deferred-tax-assets',
    name: 'ind-as:DeferredTaxAssetsNet',
    standard: 'IND_AS',
    label: 'Deferred Tax Assets (Net)',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-other-nc-assets',
    name: 'ind-as:OtherNoncurrentAssets',
    standard: 'IND_AS',
    label: 'Other Non-Current Assets',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },

  // Balance Sheet - Current Assets
  {
    id: 'ind-as-inventories',
    name: 'ind-as:Inventories',
    standard: 'IND_AS',
    label: 'Inventories',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-trade-receivables',
    name: 'ind-as:TradeReceivables',
    standard: 'IND_AS',
    label: 'Trade Receivables',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-cash-and-cash-equivalents',
    name: 'ind-as:CashAndCashEquivalents',
    standard: 'IND_AS',
    label: 'Cash and Cash Equivalents',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-bank-balances',
    name: 'ind-as:BankBalancesOtherThanCashAndCashEquivalents',
    standard: 'IND_AS',
    label: 'Other Bank Balances',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-other-current-assets',
    name: 'ind-as:OtherCurrentAssets',
    standard: 'IND_AS',
    label: 'Other Current Assets',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-total-assets',
    name: 'ind-as:Assets',
    standard: 'IND_AS',
    label: 'Total Assets',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },

  // Balance Sheet - Equity & Liabilities
  {
    id: 'ind-as-equity-share-capital',
    name: 'ind-as:EquityShareCapital',
    standard: 'IND_AS',
    label: 'Equity Share Capital',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-other-equity',
    name: 'ind-as:OtherEquity',
    standard: 'IND_AS',
    label: 'Other Equity (Reserves & Surplus)',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-nc-borrowings',
    name: 'ind-as:NoncurrentBorrowings',
    standard: 'IND_AS',
    label: 'Non-Current Borrowings',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-nc-lease-liabilities',
    name: 'ind-as:NoncurrentLeaseLiabilities',
    standard: 'IND_AS',
    label: 'Non-Current Lease Liabilities',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-nc-provisions',
    name: 'ind-as:NoncurrentProvisions',
    standard: 'IND_AS',
    label: 'Non-Current Provisions',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-current-borrowings',
    name: 'ind-as:CurrentBorrowings',
    standard: 'IND_AS',
    label: 'Current Borrowings (Short-Term)',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-trade-payables',
    name: 'ind-as:TradePayables',
    standard: 'IND_AS',
    label: 'Trade Payables',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-other-current-liabilities',
    name: 'ind-as:OtherCurrentLiabilities',
    standard: 'IND_AS',
    label: 'Other Current Liabilities',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-current-provisions',
    name: 'ind-as:CurrentProvisions',
    standard: 'IND_AS',
    label: 'Current Provisions',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-total-equity-and-liabilities',
    name: 'ind-as:EquityAndLiabilities',
    standard: 'IND_AS',
    label: 'Total Equity and Liabilities',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },

  // Profit and Loss
  {
    id: 'ind-as-rev-operations',
    name: 'ind-as:RevenueFromOperations',
    standard: 'IND_AS',
    label: 'Revenue from Operations',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-other-income',
    name: 'ind-as:OtherIncome',
    standard: 'IND_AS',
    label: 'Other Income',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-total-income',
    name: 'ind-as:Income',
    standard: 'IND_AS',
    label: 'Total Income',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-cost-materials',
    name: 'ind-as:CostOfMaterialsConsumed',
    standard: 'IND_AS',
    label: 'Cost of Materials Consumed',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-purchase-stock',
    name: 'ind-as:PurchasesOfStockInTrade',
    standard: 'IND_AS',
    label: 'Purchases of Stock-in-Trade',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-changes-inventory',
    name: 'ind-as:ChangesInInventoriesOfFinishedGoodsWorkInProgressAndStockInTrade',
    standard: 'IND_AS',
    label: 'Changes in Inventories of Finished Goods, WIP and Stock-in-Trade',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-employee-benefit',
    name: 'ind-as:EmployeeBenefitExpense',
    standard: 'IND_AS',
    label: 'Employee Benefit Expense',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-finance-costs',
    name: 'ind-as:FinanceCosts',
    standard: 'IND_AS',
    label: 'Finance Costs',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-depreciation',
    name: 'ind-as:DepreciationAndAmortisationExpense',
    standard: 'IND_AS',
    label: 'Depreciation and Amortisation Expense',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-other-expenses',
    name: 'ind-as:OtherExpenses',
    standard: 'IND_AS',
    label: 'Other Expenses',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-total-expenses',
    name: 'ind-as:Expenses',
    standard: 'IND_AS',
    label: 'Total Expenses',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-pbt',
    name: 'ind-as:ProfitBeforeTax',
    standard: 'IND_AS',
    label: 'Profit Before Tax',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-current-tax',
    name: 'ind-as:CurrentTax',
    standard: 'IND_AS',
    label: 'Current Tax Expense',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-deferred-tax',
    name: 'ind-as:DeferredTax',
    standard: 'IND_AS',
    label: 'Deferred Tax Expense / (Income)',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-pat',
    name: 'ind-as:ProfitLossForPeriod',
    standard: 'IND_AS',
    label: 'Profit / (Loss) for the Period',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-oci',
    name: 'ind-as:OtherComprehensiveIncome',
    standard: 'IND_AS',
    label: 'Other Comprehensive Income (OCI)',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'ind-as-total-comprehensive-income',
    name: 'ind-as:TotalComprehensiveIncome',
    standard: 'IND_AS',
    label: 'Total Comprehensive Income for the Period',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'ind-as-basic-eps',
    name: 'ind-as:BasicEarningsLossPerShareFromContinuingOperations',
    standard: 'IND_AS',
    label: 'Basic Earnings Per Share (INR)',
    schedule: 'PROFIT_LOSS',
    balance: 'none',
    periodType: 'duration',
    dataType: 'pure',
    isMandatory: true
  },
  {
    id: 'ind-as-diluted-eps',
    name: 'ind-as:DilutedEarningsLossPerShareFromContinuingOperations',
    standard: 'IND_AS',
    label: 'Diluted Earnings Per Share (INR)',
    schedule: 'PROFIT_LOSS',
    balance: 'none',
    periodType: 'duration',
    dataType: 'pure',
    isMandatory: true
  },

  // CARO 2020 Reporting
  {
    id: 'ind-as-caro-applicability',
    name: 'ind-as:WhetherCompaniesAuditorsReportOrderApplicable',
    standard: 'IND_AS',
    label: 'Whether CARO 2020 Applicable',
    schedule: 'CARO',
    balance: 'none',
    periodType: 'duration',
    dataType: 'string',
    isMandatory: true
  },
  {
    id: 'ind-as-caro-ppe-records',
    name: 'ind-as:DescriptionOfProperRecordsShowingFullParticularsIncludingQuantitativeDetailsAndSituationOfPropertyPlantAndEquipment',
    standard: 'IND_AS',
    label: 'CARO Cl 3(i)(a): PPE Quantitative Records Maintained',
    schedule: 'CARO',
    balance: 'none',
    periodType: 'duration',
    dataType: 'textBlock',
    isMandatory: false
  },
  {
    id: 'ind-as-caro-inventory-verification',
    name: 'ind-as:WhetherPhysicalVerificationOfInventoryConductedAtReasonableIntervalsByManagement',
    standard: 'IND_AS',
    label: 'CARO Cl 3(ii): Physical Verification of Inventory by Management',
    schedule: 'CARO',
    balance: 'none',
    periodType: 'duration',
    dataType: 'textBlock',
    isMandatory: false
  },
  {
    id: 'ind-as-caro-statutory-dues',
    name: 'ind-as:WhetherCompanyRegularInDepositingUndisputedStatutoryDues',
    standard: 'IND_AS',
    label: 'CARO Cl 3(vii): Regularity in Depositing Statutory Dues',
    schedule: 'CARO',
    balance: 'none',
    periodType: 'duration',
    dataType: 'textBlock',
    isMandatory: false
  }
];

export const NON_IND_AS_TAXONOMY: XbrlConcept[] = [
  // General Info
  {
    id: 'in-ca-cin',
    name: 'in-ca:CorporateIdentityNumber',
    standard: 'NON_IND_AS',
    label: 'Corporate Identity Number (CIN)',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'string',
    isMandatory: true,
    mcaRuleReference: 'Companies Act, 2013'
  },
  {
    id: 'in-ca-name',
    name: 'in-ca:NameOfTheCompany',
    standard: 'NON_IND_AS',
    label: 'Name of the Company',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'string',
    isMandatory: true
  },
  {
    id: 'in-ca-pan',
    name: 'in-ca:PermanentAccountNumber',
    standard: 'NON_IND_AS',
    label: 'Permanent Account Number (PAN)',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'string',
    isMandatory: true
  },
  {
    id: 'in-ca-fy-start',
    name: 'in-ca:DateOfStartOfFinancialYear',
    standard: 'NON_IND_AS',
    label: 'Date of Start of Financial Year',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'date',
    isMandatory: true
  },
  {
    id: 'in-ca-fy-end',
    name: 'in-ca:DateOfEndOfFinancialYear',
    standard: 'NON_IND_AS',
    label: 'Date of End of Financial Year',
    schedule: 'GENERAL',
    balance: 'none',
    periodType: 'instant',
    dataType: 'date',
    isMandatory: true
  },

  // Balance Sheet - Equity and Liabilities
  {
    id: 'in-ca-share-capital',
    name: 'in-ca:ShareCapital',
    standard: 'NON_IND_AS',
    label: 'Share Capital (Schedule III)',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-reserves-surplus',
    name: 'in-ca:ReservesAndSurplus',
    standard: 'NON_IND_AS',
    label: 'Reserves and Surplus',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-money-share-warrants',
    name: 'in-ca:MoneyReceivedAgainstShareWarrants',
    standard: 'NON_IND_AS',
    label: 'Money Received Against Share Warrants',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-share-app-money',
    name: 'in-ca:ShareApplicationMoneyPendingAllotment',
    standard: 'NON_IND_AS',
    label: 'Share Application Money Pending Allotment',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-long-term-borrowings',
    name: 'in-ca:LongTermBorrowings',
    standard: 'NON_IND_AS',
    label: 'Long-Term Borrowings',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-deferred-tax-liabilities',
    name: 'in-ca:DeferredTaxLiabilitiesNet',
    standard: 'NON_IND_AS',
    label: 'Deferred Tax Liabilities (Net)',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-other-long-term-liabilities',
    name: 'in-ca:OtherLongTermLiabilities',
    standard: 'NON_IND_AS',
    label: 'Other Long-Term Liabilities',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-long-term-provisions',
    name: 'in-ca:LongTermProvisions',
    standard: 'NON_IND_AS',
    label: 'Long-Term Provisions',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-short-term-borrowings',
    name: 'in-ca:ShortTermBorrowings',
    standard: 'NON_IND_AS',
    label: 'Short-Term Borrowings',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-trade-payables',
    name: 'in-ca:TradePayables',
    standard: 'NON_IND_AS',
    label: 'Trade Payables',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-other-current-liabilities',
    name: 'in-ca:OtherCurrentLiabilities',
    standard: 'NON_IND_AS',
    label: 'Other Current Liabilities',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-short-term-provisions',
    name: 'in-ca:ShortTermProvisions',
    standard: 'NON_IND_AS',
    label: 'Short-Term Provisions',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-total-equity-liabilities',
    name: 'in-ca:EquityAndLiabilities',
    standard: 'NON_IND_AS',
    label: 'Total Equity and Liabilities',
    schedule: 'BALANCE_SHEET',
    balance: 'credit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },

  // Balance Sheet - Assets
  {
    id: 'in-ca-tangible-assets',
    name: 'in-ca:TangibleAssets',
    standard: 'NON_IND_AS',
    label: 'Tangible Assets (PPE Schedule II)',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-intangible-assets',
    name: 'in-ca:IntangibleAssets',
    standard: 'NON_IND_AS',
    label: 'Intangible Assets',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-cwip',
    name: 'in-ca:CapitalWorkInProgress',
    standard: 'NON_IND_AS',
    label: 'Capital Work-in-Progress',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-nc-investments',
    name: 'in-ca:NoncurrentInvestments',
    standard: 'NON_IND_AS',
    label: 'Non-Current Investments',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-long-term-loans',
    name: 'in-ca:LongTermLoansAndAdvances',
    standard: 'NON_IND_AS',
    label: 'Long-Term Loans and Advances',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-other-nc-assets',
    name: 'in-ca:OtherNoncurrentAssets',
    standard: 'NON_IND_AS',
    label: 'Other Non-Current Assets',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-current-investments',
    name: 'in-ca:CurrentInvestments',
    standard: 'NON_IND_AS',
    label: 'Current Investments',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-inventories',
    name: 'in-ca:Inventories',
    standard: 'NON_IND_AS',
    label: 'Inventories',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-trade-receivables',
    name: 'in-ca:TradeReceivables',
    standard: 'NON_IND_AS',
    label: 'Trade Receivables',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-cash-and-bank',
    name: 'in-ca:CashAndBankBalances',
    standard: 'NON_IND_AS',
    label: 'Cash and Bank Balances',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-short-term-loans',
    name: 'in-ca:ShortTermLoansAndAdvances',
    standard: 'NON_IND_AS',
    label: 'Short-Term Loans and Advances',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-other-current-assets',
    name: 'in-ca:OtherCurrentAssets',
    standard: 'NON_IND_AS',
    label: 'Other Current Assets',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-total-assets',
    name: 'in-ca:Assets',
    standard: 'NON_IND_AS',
    label: 'Total Assets',
    schedule: 'BALANCE_SHEET',
    balance: 'debit',
    periodType: 'instant',
    dataType: 'monetary',
    isMandatory: true
  },

  // Profit and Loss (Schedule III Part II)
  {
    id: 'in-ca-rev-operations',
    name: 'in-ca:RevenueFromOperations',
    standard: 'NON_IND_AS',
    label: 'Revenue from Operations',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-other-income',
    name: 'in-ca:OtherIncome',
    standard: 'NON_IND_AS',
    label: 'Other Income',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-total-revenue',
    name: 'in-ca:TotalRevenue',
    standard: 'NON_IND_AS',
    label: 'Total Revenue',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-cost-materials',
    name: 'in-ca:CostOfMaterialsConsumed',
    standard: 'NON_IND_AS',
    label: 'Cost of Materials Consumed',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-purchases-stock',
    name: 'in-ca:PurchasesOfStockInTrade',
    standard: 'NON_IND_AS',
    label: 'Purchases of Stock-in-Trade',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-changes-inventories',
    name: 'in-ca:ChangesInInventoriesOfFinishedGoodsWorkInProgressAndStockInTrade',
    standard: 'NON_IND_AS',
    label: 'Changes in Inventories of Finished Goods, WIP and Stock-in-Trade',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: false
  },
  {
    id: 'in-ca-employee-benefit',
    name: 'in-ca:EmployeeBenefitExpense',
    standard: 'NON_IND_AS',
    label: 'Employee Benefit Expense',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-finance-costs',
    name: 'in-ca:FinanceCosts',
    standard: 'NON_IND_AS',
    label: 'Finance Costs',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-depreciation',
    name: 'in-ca:DepreciationAndAmortizationExpense',
    standard: 'NON_IND_AS',
    label: 'Depreciation and Amortization Expense',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-other-expenses',
    name: 'in-ca:OtherExpenses',
    standard: 'NON_IND_AS',
    label: 'Other Expenses',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-total-expenses',
    name: 'in-ca:TotalExpenses',
    standard: 'NON_IND_AS',
    label: 'Total Expenses',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-pbt',
    name: 'in-ca:ProfitBeforeTax',
    standard: 'NON_IND_AS',
    label: 'Profit Before Tax',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-current-tax',
    name: 'in-ca:CurrentTax',
    standard: 'NON_IND_AS',
    label: 'Current Tax',
    schedule: 'PROFIT_LOSS',
    balance: 'debit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-pat',
    name: 'in-ca:ProfitLossForPeriodFromContinuingOperations',
    standard: 'NON_IND_AS',
    label: 'Profit / (Loss) for the Period',
    schedule: 'PROFIT_LOSS',
    balance: 'credit',
    periodType: 'duration',
    dataType: 'monetary',
    isMandatory: true
  },
  {
    id: 'in-ca-basic-eps',
    name: 'in-ca:BasicEarningsLossPerShare',
    standard: 'NON_IND_AS',
    label: 'Basic Earnings Per Share (INR)',
    schedule: 'PROFIT_LOSS',
    balance: 'none',
    periodType: 'duration',
    dataType: 'pure',
    isMandatory: true
  }
];

export function getTaxonomyConcepts(standard: TaxonomyStandard): XbrlConcept[] {
  return standard === 'IND_AS' ? IND_AS_TAXONOMY : NON_IND_AS_TAXONOMY;
}
