import { RegulatoryDocument } from '../types';

export const REGULATORY_DOCUMENTS: RegulatoryDocument[] = [
  {
    id: 'doc-mca-xbrl-rules',
    title: 'Companies (Filing of Documents and Forms in XBRL) Rules & Mandate',
    category: 'MCA_RULES',
    issuedBy: 'Ministry of Corporate Affairs (MCA), Government of India',
    versionDate: 'Updated for FY 2023-24 & 2024-25 Filings',
    applicableTo: 'All Indian Listed Companies, Companies with Paid-up Capital ≥ ₹5 Crore, Turnover ≥ ₹100 Crore, and Companies covered under Ind AS.',
    summary: 'The statutory governing framework issued under Section 137 of the Companies Act, 2013 mandating filing of financial statements in XBRL format using Form AOC-4 XBRL.',
    keyHighlights: [
      'Mandatory for all listed companies and their Indian subsidiaries irrespective of turnover.',
      'Mandatory for all unlisted public and private companies with paid-up capital of ₹5 Crore or more OR turnover of ₹100 Crore or more.',
      'All companies required to prepare financial statements under Companies (Ind AS) Rules, 2015 must file in Ind AS XBRL taxonomy.',
      'Once a company falls under the XBRL mandate, it continues to file in XBRL in perpetuity, even if capital or turnover reduces in subsequent years.',
      'Housing finance, banking, insurance and non-banking financial companies (NBFCs) have specific taxonomy guidelines.'
    ],
    fullContentMarkdown: `# Companies (Filing of Documents and Forms in XBRL) Rules

## 1. Statutory Authority
In exercise of the powers conferred by sub-sections (1) and (2) of Section 469 read with Section 137 of the Companies Act, 2013, the Central Government establishes the filing rules for XBRL documents.

## 2. Applicability Criteria (Rule 3)
The following classes of companies must file their financial statements and other documents under Section 137 with the Registrar in e-Form AOC-4 XBRL:
1. All companies listed with any Stock Exchange in India and their Indian subsidiaries;
2. All companies having paid up capital of Rupees Five Crore or above;
3. All companies having turnover of Rupees One Hundred Crore or above;
4. All companies which were covered under the Companies (Filing of Documents and Forms in Extensible Business Reporting Language) Rules, 2011;
5. All companies required to prepare their financial statements in accordance with Companies (Indian Accounting Standards) Rules, 2015.

## 3. Permanence of Applicability
A company once required to file its financial statements in XBRL under these rules shall continue to file its financial statements in XBRL in all subsequent years, even if it ceases to fall within the criteria specified above.

## 4. Certification & Signatures
The XBRL instance document must be certified by:
- A Chartered Accountant in whole-time practice, OR
- A Company Secretary in whole-time practice, OR
- A Cost Accountant in whole-time practice.
The e-Form AOC-4 XBRL must also be signed digitally by the Managing Director, Director, Manager, or CEO/CFO as authorized by the Board.
`,
    downloadFileName: 'MCA_XBRL_Filing_Rules_Section_137.md'
  },
  {
    id: 'doc-ind-as-taxonomy-guide',
    title: 'MCA Ind AS Taxonomy Architecture & Reporting Guidelines',
    category: 'IND_AS',
    issuedBy: 'MCA XBRL Technical Committee & ICAI',
    versionDate: 'Release 2023 / 2024 Edition',
    applicableTo: 'Companies adopting Indian Accounting Standards (Ind AS 1 through Ind AS 116)',
    summary: 'Comprehensive taxonomy architecture specification for tagging Balance Sheets, Statement of Profit & Loss, SOCIE, Cash Flow Statement, Notes to Accounts, and Corporate Governance.',
    keyHighlights: [
      'Dual context architecture: Instant contexts for Balance Sheet facts; Duration contexts for P&L and Cash Flow facts.',
      'Hypercube dimensions for Statement of Changes in Equity (SOCIE) and Share Capital classes.',
      'Explicit and typed dimensional members for segment reporting, related party transactions, and borrowings.',
      'Mandatory text blocks for significant accounting policies, contingencies, and auditor reports.',
      'Strict calculation linkbase consistency required (Assets must mathematically equal Liabilities + Equity).'
    ],
    fullContentMarkdown: `# MCA Ind AS Taxonomy Architecture Manual

## 1. Overview of Ind AS Taxonomy
The Ind AS Taxonomy is based on the IFRS Taxonomy framework adapted to the Ministry of Corporate Affairs requirements under the Companies (Ind AS) Rules, 2015.

## 2. Context Structure
Each fact in the XBRL instance document must reference an appropriate context:
- **Instant Context**: Represents point-in-time facts (e.g., as of 31st March 2024). Used for Balance Sheet assets, liabilities, and equity balances.
- **Duration Context**: Represents period-of-time facts (e.g., from 1st April 2023 to 31st March 2024). Used for Profit & Loss revenues, expenses, Cash Flows, and CARO disclosures.

## 3. Dimensional Hypercubes
Ind AS taxonomy utilizes XBRL Dimensions 1.0 specifications:
- **Statement of Changes in Equity (SOCIE)**: Uses 'TypeOfEquityAxis' and 'ComponentsOfEquityAxis'.
- **Borrowings Schedule**: Uses 'TypeOfBorrowingsAxis' and 'CategoryOfBorrowerAxis'.
- **Related Party Disclosures (Ind AS 24)**: Uses 'CategoriesOfRelatedPartiesAxis'.

## 4. Decimals and Signage Rules
- Monetary figures must declare the decimals attribute:
  - If amounts are in Lakhs: decimals="-5"
  - If amounts are in Crores: decimals="-7"
  - If amounts are in Thousands: decimals="-3"
  - If amounts are exact Rupees: decimals="0"
- Debit / Credit balance tags: The sign is governed by the taxonomy definition. Do NOT put negative numbers for normal debit or credit balances unless it represents a reversal or contrabalance.
`,
    downloadFileName: 'MCA_Ind_AS_Taxonomy_Architecture_Guide.md'
  },
  {
    id: 'doc-non-ind-as-taxonomy-guide',
    title: 'MCA Non-Ind AS (Accounting Standards / Schedule III) Filing Manual',
    category: 'NON_IND_AS',
    issuedBy: 'MCA Technical Directorate',
    versionDate: 'Revised Schedule III Edition',
    applicableTo: 'Companies preparing financial statements under Accounting Standards (AS) and Schedule III Part I & II',
    summary: 'Tagging rules and taxonomy structure for companies filing under traditional Indian GAAP (Companies Accounting Standards Rules, 2006 / 2021).',
    keyHighlights: [
      'Structure strictly aligned with Division I of Schedule III to the Companies Act, 2013.',
      'Separate schedules for Shareholders Funds, Non-Current Liabilities, Current Liabilities, Fixed Assets (Schedule II), and Current Assets.',
      'AS-3 Cash Flow Statement tagging using direct or indirect method.',
      'AS-18 Related Party Transactions and AS-13 Accounting for Investments disclosure tagging.',
      'Disclosures regarding MSME dues, aging of trade payables/receivables, and undisclosed income.'
    ],
    fullContentMarkdown: `# MCA Non-Ind AS Taxonomy Filing Manual

## 1. Scope & Framework
The Non-Ind AS Taxonomy applies to companies other than those required to comply with Ind AS. It follows the format prescribed in Division I of Schedule III to the Companies Act, 2013.

## 2. Key Taxonomy Sections
1. **General Information**: CIN, PAN, registered office, date of AGM, board approval date.
2. **Balance Sheet**:
   - Shareholders' Funds: Share Capital, Reserves & Surplus, Money Received Against Share Warrants.
   - Non-Current Liabilities: Long-Term Borrowings, Deferred Tax Liabilities, Long-Term Provisions.
   - Current Liabilities: Short-Term Borrowings, Trade Payables, Other Current Liabilities.
   - Non-Current Assets: Tangible Assets (Property, Plant and Equipment), Capital WIP, Non-Current Investments.
   - Current Assets: Inventories, Trade Receivables, Cash & Bank Balances.
3. **Statement of Profit & Loss**:
   - Revenue from Operations, Other Income, Total Revenue.
   - Cost of Materials Consumed, Employee Benefits Expense, Finance Costs, Depreciation (Schedule II).
4. **Notes to Accounts & Accounting Policies**:
   - AS-1 Disclosure of Accounting Policies, AS-2 Valuation of Inventories, AS-9 Revenue Recognition, AS-15 Employee Benefits.
`,
    downloadFileName: 'MCA_Non_Ind_AS_Filing_Manual.md'
  },
  {
    id: 'doc-sag-genxbrl-manual',
    title: 'SAG Gen XBRL Step-by-Step Operator Manual & Data Bridge Guide',
    category: 'SAG_GUIDE',
    issuedBy: 'SAG Infotech Private Limited / Certified XBRL Practice Group',
    versionDate: 'Gen XBRL 2024 / 2025 Release',
    applicableTo: 'Chartered Accountants and tax practitioners using SAG Gen XBRL software for MCA filing',
    summary: 'Complete operational workflow for SAG Gen XBRL including Master creation, Excel import template mapping, XAG file imports, automated validation, and generation of final AOC-4 XML.',
    keyHighlights: [
      'How to use SAG Gen XBRL Excel Import: mapping column headers to SAG Gen XBRL concept IDs.',
      'Importing XAG / XML data without manual re-entry: preserving prior year tagging structures.',
      'Running the built-in SAG Pre-validation tool before MCA validation.',
      'Handling footnotes, sign-off details, and director DIN verifications in Gen XBRL.',
      'Resolving SAG database locks and generating verified PDF preview reports.'
    ],
    fullContentMarkdown: `# SAG Gen XBRL Operator & Data Bridge Manual

## 1. Introduction to SAG Gen XBRL
Gen XBRL by SAG Infotech is an industry-standard desktop software for preparation and e-filing of Balance Sheet and Profit & Loss statements in XBRL format with the Ministry of Corporate Affairs.

## 2. Automated Import Workflow
To populate Gen XBRL automatically using our generated files:
1. **Option A: Excel Multi-Sheet Import**:
   - In SAG Gen XBRL, open your client company.
   - Navigate to **Tools / Import-Export -> Import From Excel**.
   - Browse and select 'SAG_Import_Template.xlsx' generated by XBRL AI Agent.
   - Click **Verify and Transfer Data**. All Balance Sheet, P&L, Notes, and CARO fields will auto-populate into Gen XBRL.
2. **Option B: Direct XAG File Transfer**:
   - Copy 'SAG_GenXBRL_Import.xag' directly to the SAG Import folder ('%APPDATA%\\SAG Infotech\\GenXBRL\\ImportQueue').
   - Run the provided Windows automation script ('sag_autowrite.vbs').
   - Gen XBRL will detect the staged file and prompt to merge facts automatically.

## 3. Verification & Filing
1. Review green tags (Confirmed facts) and amber tags (Modified facts).
2. Execute **Validate File** inside SAG Gen XBRL.
3. Generate the MCA AOC-4 XBRL Instance XML document.
`,
    downloadFileName: 'SAG_Gen_XBRL_Operator_Guide.md'
  },
  {
    id: 'doc-validation-errors-guide',
    title: 'Top 25 MCA XBRL Validation Errors & Step-by-Step Resolution Guide',
    category: 'VALIDATION_ERRORS',
    issuedBy: 'ICAI & MCA XBRL Technical Helpdesk',
    versionDate: 'Comprehensive Troubleshooting Edition',
    applicableTo: 'Practitioners encountering errors in MCA XBRL Validation Tool V2.0+',
    summary: 'A field-tested diagnostic reference solving all common MCA XBRL validation errors including calculation discrepancies, context date overlapping, and mandatory block absences.',
    keyHighlights: [
      'Error 101: Calculation inconsistency between Balance Sheet Assets and Total Liabilities.',
      'Error 204: Mandatory text block missing (Significant Accounting Policies or Auditor Report).',
      'Error 315: Context date format mismatch or duration start date later than end date.',
      'Error 420: Dimension member hypercube violation (invalid domain item assigned).',
      'Error 508: Unit consistency error - INR declared for pure EPS number.'
    ],
    fullContentMarkdown: `# Top 25 MCA XBRL Validation Errors & Resolutions

### Error 1: Calculation Inconsistency in Balance Sheet
- **Error Description**: "Calculated value of Total Assets [₹X] does not match with the sum of its child elements [₹Y]."
- **Root Cause**: Rounding discrepancies between individual schedules and the primary balance sheet face, or omission of CWIP / ROU assets.
- **Resolution**: Verify that PropertyPlantAndEquipment + CWIP + FinancialAssets + CurrentAssets exactly equals Assets. If numbers were rounded to thousands/lakhs, adjust the rounding in the largest asset category to balance precisely.

### Error 2: Mandatory General Information Incomplete
- **Error Description**: "CIN / Date of AGM / Nature of Report is mandatory but missing."
- **Root Cause**: CIN must be valid 21-character alphanumeric code matching MCA master database.
- **Resolution**: Ensure CIN, Company Name, Start of FY, and End of FY are tagged with standard instant context.

### Error 3: Unit / Decimal Conflict for Shares or EPS
- **Error Description**: "Element [BasicEarningsLossPerShare] must have unitRef pointing to Pure, not INR."
- **Root Cause**: EPS must reference xbrli:pure, and number of shares must reference xbrli:shares. Only currency items reference iso4217:INR.
- **Resolution**: Use the pre-configured units generated by XBRL AI Agent.

### Error 4: CARO 2020 Clause Inconsistency
- **Error Description**: "Whether CARO applicable is 'true' but mandatory clauses are untagged."
- **Root Cause**: If CARO applicability is set to 'true', clauses 3(i) through 3(xxi) require text blocks or explicit 'Not Applicable' tags.
- **Resolution**: XBRL AI Agent auto-populates all 21 clauses with standard auditor statements.
`,
    downloadFileName: 'Top_25_MCA_XBRL_Validation_Errors.md'
  },
  {
    id: 'doc-caro-2020-checklist',
    title: 'CARO 2020 Clause-by-Clause XBRL Reporting Checklist',
    category: 'CARO_CHECKLIST',
    issuedBy: 'Companies (Auditor\'s Report) Order, 2020',
    versionDate: 'Applicable for FY 2021-22 onwards',
    applicableTo: 'All companies where CARO 2020 applies under Section 143(11)',
    summary: 'Master checklist of all 21 clauses of CARO 2020 including property revaluation, working capital limits, benami property, internal audit, and whistle-blower complaints.',
    keyHighlights: [
      'Clause 3(i): PPE records, physical verification, title deeds of immovable properties not held in company name, revaluation proceedings, Benami transactions.',
      'Clause 3(ii): Inventory physical verification, quarterly returns filed with banks for working capital facilities > ₹5 Crore.',
      'Clause 3(iii): Investments, guarantees, security, loans/advances in the nature of loans to related/other parties.',
      'Clause 3(iv) & (v): Compliance with Section 185, 186 and public deposits under Section 73 to 76.',
      'Clause 3(vii): Undisputed and disputed statutory dues (GST, PF, ESI, Income Tax, Customs, Cess).',
      'Clause 3(xvii) & (xix): Cash losses incurred and financial ratio capability to meet liabilities within one year.'
    ],
    fullContentMarkdown: `# CARO 2020 XBRL Reporting Checklist

## Mandatory Reporting Clauses (Paragraph 3):
1. **Clause (i) - Property, Plant & Equipment and Intangible Assets**:
   - Proper records maintaining quantitative details and situation.
   - Regular physical verification program by management.
   - Title deeds of immovable properties disclosed in balance sheet.
   - Disclosures on proceedings under Benami Transactions (Prohibition) Act.
2. **Clause (ii) - Inventory & Working Capital**:
   - Physical verification at reasonable intervals; discrepancies ≥ 10%.
   - Sanctioned working capital limits from banks/FIs > ₹5 Crore based on security of current assets.
3. **Clause (vii) - Statutory Dues**:
   - Undisputed statutory dues outstanding for more than 6 months.
   - Disputed dues indicating forum where dispute is pending.
4. **Clause (xix) - Financial Ratios & Going Concern**:
   - Material uncertainty regarding company capability to meet liabilities falling due within 1 year from balance sheet date.
`,
    downloadFileName: 'CARO_2020_XBRL_Reporting_Checklist.md'
  }
];
