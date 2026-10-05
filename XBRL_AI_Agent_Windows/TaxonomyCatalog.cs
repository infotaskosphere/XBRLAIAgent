using System;
using System.Collections.Generic;

namespace XBRLAIAgent;

public static class TaxonomyCatalog
{
    public static List<MappedFact> GetInitialFacts(TaxonomyStandard standard)
    {
        var list = new List<MappedFact>();

        if (standard == TaxonomyStandard.IndAS)
        {
            AddFact(list, "ind-as:CorporateIdentityNumber", "Corporate Identity Number (CIN)", "GENERAL", "Instant: 2024-03-31", "L17110MH1995PLC085000", "L17110MH1995PLC085000", "string", MappingStatus.CONFIRMED, 100, "CY Audit Report.pdf", "Page 1 (Master)", "SAG_GEN_CIN_001", "Company Master > Basic Details");
            AddFact(list, "ind-as:NameOfTheCompany", "Name of the Company", "GENERAL", "Instant: 2024-03-31", "TASKOSPHERE ENTERPRISE SOLUTIONS LIMITED", "TASKOSPHERE ENTERPRISE SOLUTIONS LIMITED", "string", MappingStatus.CONFIRMED, 100, "CY Audit Report.pdf", "Page 1", "SAG_GEN_NAME_002", "Company Master > Basic Details");
            AddFact(list, "ind-as:PropertyPlantAndEquipment", "Property, Plant and Equipment (PPE)", "BALANCE_SHEET", "Instant: 2024-03-31", "485000000", "532400000", "INR", MappingStatus.CHANGED, 96, "Financial_Statements_CY.xlsx", "BS_Schedule_Note_4", "SAG_BS_PPE_101", "Balance Sheet > Non-Current Assets");
            AddFact(list, "ind-as:RightOfUseAssets", "Right-of-Use Assets", "BALANCE_SHEET", "Instant: 2024-03-31", "124000000", "118000000", "INR", MappingStatus.CHANGED, 94, "Financial_Statements_CY.xlsx", "BS_Schedule_Note_5", "SAG_BS_ROU_103", "Balance Sheet > Non-Current Assets");
            AddFact(list, "ind-as:CapitalWorkInProgress", "Capital Work-in-Progress", "BALANCE_SHEET", "Instant: 2024-03-31", "34000000", "42000000", "INR", MappingStatus.CHANGED, 95, "Financial_Statements_CY.xlsx", "BS_Schedule_Note_4", "SAG_BS_CWIP_102", "Balance Sheet > Non-Current Assets");
            AddFact(list, "ind-as:Inventories", "Inventories", "BALANCE_SHEET", "Instant: 2024-03-31", "245000000", "289000000", "INR", MappingStatus.CHANGED, 97, "Financial_Statements_CY.xlsx", "BS_Schedule_Note_8", "SAG_BS_INV_110", "Balance Sheet > Current Assets");
            AddFact(list, "ind-as:TradeReceivables", "Trade Receivables", "BALANCE_SHEET", "Instant: 2024-03-31", "380000000", "415000000", "INR", MappingStatus.CHANGED, 96, "Financial_Statements_CY.xlsx", "BS_Schedule_Note_9", "SAG_BS_REC_111", "Balance Sheet > Current Assets");
            AddFact(list, "ind-as:CashAndCashEquivalents", "Cash and Cash Equivalents", "BALANCE_SHEET", "Instant: 2024-03-31", "95000000", "112000000", "INR", MappingStatus.CHANGED, 98, "Financial_Statements_CY.xlsx", "BS_Schedule_Note_10", "SAG_BS_CSH_112", "Balance Sheet > Current Assets");
            AddFact(list, "ind-as:Assets", "Total Assets", "BALANCE_SHEET", "Instant: 2024-03-31", "1363000000", "1508400000", "INR", MappingStatus.CHANGED, 99, "Financial_Statements_CY.xlsx", "Balance Sheet Face", "SAG_BS_TOT_199", "Balance Sheet > Total Assets Face");
            AddFact(list, "ind-as:EquityShareCapital", "Equity Share Capital", "BALANCE_SHEET", "Instant: 2024-03-31", "200000000", "200000000", "INR", MappingStatus.CONFIRMED, 100, "CY Audit Report.pdf", "Balance Sheet Page 2", "SAG_BS_EQC_201", "Balance Sheet > Equity");
            AddFact(list, "ind-as:OtherEquity", "Other Equity", "BALANCE_SHEET", "Instant: 2024-03-31", "680000000", "798400000", "INR", MappingStatus.CHANGED, 97, "Financial_Statements_CY.xlsx", "SOCIE Schedule", "SAG_BS_RES_202", "Balance Sheet > Equity");
            AddFact(list, "ind-as:BorrowingsNoncurrent", "Long-term Borrowings", "BALANCE_SHEET", "Instant: 2024-03-31", "250000000", "220000000", "INR", MappingStatus.CHANGED, 95, "Financial_Statements_CY.xlsx", "BS_Schedule_Note_14", "SAG_BS_BOR_205", "Balance Sheet > Non-Current Liabilities");
            AddFact(list, "ind-as:TradePayablesCurrent", "Trade Payables (Current)", "BALANCE_SHEET", "Instant: 2024-03-31", "233000000", "290000000", "INR", MappingStatus.CHANGED, 94, "Financial_Statements_CY.xlsx", "BS_Schedule_Note_18", "SAG_BS_TPY_210", "Balance Sheet > Current Liabilities");
            AddFact(list, "ind-as:EquityAndLiabilities", "Total Equity and Liabilities", "BALANCE_SHEET", "Instant: 2024-03-31", "1363000000", "1508400000", "INR", MappingStatus.CHANGED, 99, "Financial_Statements_CY.xlsx", "Balance Sheet Face", "SAG_BS_TEQ_299", "Balance Sheet > Total Liabilities Face");
            AddFact(list, "ind-as:RevenueFromOperations", "Revenue from Operations", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "1420000000", "1685000000", "INR", MappingStatus.CHANGED, 96, "CY Audit Report.pdf", "P&L Page 3", "SAG_PL_REV_301", "Profit & Loss > Part I (Income)");
            AddFact(list, "ind-as:OtherIncome", "Other Income", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "18000000", "24000000", "INR", MappingStatus.CHANGED, 95, "Financial_Statements_CY.xlsx", "PL_Schedule_Note_20", "SAG_PL_INC_302", "Profit & Loss > Part I (Income)");
            AddFact(list, "ind-as:EmployeeBenefitExpense", "Employee Benefit Expense", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "380000000", "445000000", "INR", MappingStatus.CHANGED, 96, "Financial_Statements_CY.xlsx", "PL_Schedule_Note_22", "SAG_PL_EMP_305", "Profit & Loss > Part II (Expenses)");
            AddFact(list, "ind-as:FinanceCosts", "Finance Costs", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "42000000", "38000000", "INR", MappingStatus.CHANGED, 95, "Financial_Statements_CY.xlsx", "PL_Schedule_Note_23", "SAG_PL_FIN_306", "Profit & Loss > Part II (Expenses)");
            AddFact(list, "ind-as:DepreciationAndAmortisationExpense", "Depreciation & Amortisation", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "68000000", "74000000", "INR", MappingStatus.CHANGED, 97, "Financial_Statements_CY.xlsx", "PL_Schedule_Note_24", "SAG_PL_DEP_307", "Profit & Loss > Part II (Expenses)");
            AddFact(list, "ind-as:ProfitBeforeTax", "Profit Before Tax (PBT)", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "185000000", "242000000", "INR", MappingStatus.CHANGED, 99, "CY Audit Report.pdf", "P&L Page 3", "SAG_PL_PBT_315", "Profit & Loss > Bottomline Results");
            AddFact(list, "ind-as:CurrentTax", "Current Tax Expense", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "46000000", "61000000", "INR", MappingStatus.CHANGED, 97, "Financial_Statements_CY.xlsx", "Tax Note 26", "SAG_PL_TAX_316", "Profit & Loss > Tax Expense");
            AddFact(list, "ind-as:ProfitLossForPeriod", "Profit for the Year (PAT)", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "139000000", "181000000", "INR", MappingStatus.CHANGED, 99, "CY Audit Report.pdf", "P&L Page 3", "SAG_PL_PAT_320", "Profit & Loss > Bottomline Results");
        }
        else
        {
            AddFact(list, "in-ca:CorporateIdentityNumber", "Corporate Identity Number (CIN)", "GENERAL", "Instant: 2024-03-31", "U72900MH2018PTC312000", "U72900MH2018PTC312000", "string", MappingStatus.CONFIRMED, 100, "Audit Report.pdf", "Page 1", "SAG_GEN_CIN_001", "Company Master > Basic Details");
            AddFact(list, "in-ca:NameOfTheCompany", "Name of Company", "GENERAL", "Instant: 2024-03-31", "SHREE SHARADA TRADERS PRIVATE LIMITED", "SHREE SHARADA TRADERS PRIVATE LIMITED", "string", MappingStatus.CONFIRMED, 100, "Audit Report.pdf", "Page 1", "SAG_GEN_NAME_002", "Company Master > Basic Details");
            AddFact(list, "in-ca:TangibleAssets", "Tangible Assets (Net Block)", "BALANCE_SHEET", "Instant: 2024-03-31", "85000000", "96500000", "INR", MappingStatus.CHANGED, 96, "Financial Statements.xlsx", "Note 9 Fixed Assets", "SAG_AS_TNG_201", "Balance Sheet > Non-Current Assets");
            AddFact(list, "in-ca:Inventories", "Inventories", "BALANCE_SHEET", "Instant: 2024-03-31", "42000000", "51000000", "INR", MappingStatus.CHANGED, 97, "Financial Statements.xlsx", "Note 12", "SAG_AS_INV_210", "Balance Sheet > Current Assets");
            AddFact(list, "in-ca:TradeReceivables", "Trade Receivables", "BALANCE_SHEET", "Instant: 2024-03-31", "68000000", "79000000", "INR", MappingStatus.CHANGED, 95, "Financial Statements.xlsx", "Note 13", "SAG_AS_REC_211", "Balance Sheet > Current Assets");
            AddFact(list, "in-ca:CashAndBankBalances", "Cash and Bank Balances", "BALANCE_SHEET", "Instant: 2024-03-31", "15000000", "18500000", "INR", MappingStatus.CHANGED, 98, "Financial Statements.xlsx", "Note 14", "SAG_AS_CSH_212", "Balance Sheet > Current Assets");
            AddFact(list, "in-ca:Assets", "Total Assets", "BALANCE_SHEET", "Instant: 2024-03-31", "210000000", "245000000", "INR", MappingStatus.CHANGED, 99, "Financial Statements.xlsx", "Balance Sheet Face", "SAG_AS_TOT_299", "Balance Sheet > Total Assets Face");
            AddFact(list, "in-ca:ShareCapital", "Share Capital", "BALANCE_SHEET", "Instant: 2024-03-31", "50000000", "50000000", "INR", MappingStatus.CONFIRMED, 100, "Audit Report.pdf", "Balance Sheet", "SAG_AS_SHC_101", "Balance Sheet > Shareholders Funds");
            AddFact(list, "in-ca:ReservesAndSurplus", "Reserves and Surplus", "BALANCE_SHEET", "Instant: 2024-03-31", "95000000", "121600000", "INR", MappingStatus.CHANGED, 97, "Financial Statements.xlsx", "Note 2", "SAG_AS_RES_102", "Balance Sheet > Shareholders Funds");
            AddFact(list, "in-ca:LongTermBorrowings", "Long-Term Borrowings", "BALANCE_SHEET", "Instant: 2024-03-31", "30000000", "25000000", "INR", MappingStatus.CHANGED, 95, "Financial Statements.xlsx", "Note 3", "SAG_AS_BOR_105", "Balance Sheet > Non-Current Liabilities");
            AddFact(list, "in-ca:TradePayables", "Trade Payables", "BALANCE_SHEET", "Instant: 2024-03-31", "35000000", "48400000", "INR", MappingStatus.CHANGED, 94, "Financial Statements.xlsx", "Note 5", "SAG_AS_TPY_110", "Balance Sheet > Current Liabilities");
            AddFact(list, "in-ca:EquityAndLiabilities", "Total Equity and Liabilities", "BALANCE_SHEET", "Instant: 2024-03-31", "210000000", "245000000", "INR", MappingStatus.CHANGED, 99, "Financial Statements.xlsx", "Balance Sheet Face", "SAG_AS_TEQ_199", "Balance Sheet > Total Liabilities Face");
            AddFact(list, "in-ca:RevenueFromOperations", "Revenue from Operations", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "320000000", "395000000", "INR", MappingStatus.CHANGED, 96, "Audit Report.pdf", "P&L Statement", "SAG_AS_REV_301", "Profit & Loss > Income");
            AddFact(list, "in-ca:EmployeeBenefitsExpense", "Employee Benefits Expense", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "72000000", "88000000", "INR", MappingStatus.CHANGED, 96, "Financial Statements.xlsx", "Note 18", "SAG_AS_EMP_305", "Profit & Loss > Expenses");
            AddFact(list, "in-ca:FinanceCosts", "Finance Costs", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "9000000", "7500000", "INR", MappingStatus.CHANGED, 95, "Financial Statements.xlsx", "Note 19", "SAG_AS_FIN_306", "Profit & Loss > Expenses");
            AddFact(list, "in-ca:DepreciationAndAmortizationExpense", "Depreciation & Amortization", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "12000000", "14500000", "INR", MappingStatus.CHANGED, 97, "Financial Statements.xlsx", "Note 20", "SAG_AS_DEP_307", "Profit & Loss > Expenses");
            AddFact(list, "in-ca:ProfitBeforeTax", "Profit Before Tax", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "58000000", "71000000", "INR", MappingStatus.CHANGED, 99, "Audit Report.pdf", "P&L Statement", "SAG_AS_PBT_315", "Profit & Loss > Results");
            AddFact(list, "in-ca:ProfitLossForPeriod", "Profit for the Period", "PROFIT_LOSS", "Duration: 2023-04-01 to 2024-03-31", "43500000", "53400000", "INR", MappingStatus.CHANGED, 99, "Audit Report.pdf", "P&L Statement", "SAG_AS_PAT_320", "Profit & Loss > Results");
        }

        return list;
    }

    private static void AddFact(
        List<MappedFact> list, 
        string concept, 
        string label, 
        string schedule, 
        string period, 
        string py, 
        string cy, 
        string unit, 
        MappingStatus status, 
        int confidence, 
        string doc, 
        string page,
        string sagId,
        string sagScreen)
    {
        var fact = new MappedFact
        {
            ConceptName = concept,
            Label = label,
            Schedule = schedule,
            Period = period,
            PreviousValue = py,
            CurrentValue = cy,
            Unit = unit,
            Status = status,
            Confidence = confidence,
            SourceDoc = doc,
            SourcePageOrSheet = page,
            SagFieldId = sagId,
            SagScreenRef = sagScreen
        };

        fact.History.Add(new FactHistoryEntry
        {
            Timestamp = DateTime.Now.AddHours(-2),
            Author = "AI Agent",
            Type = "AI_INITIAL_EXTRACTION",
            PreviousValue = py,
            NewValue = cy,
            Notes = $"AI auto-extracted from {doc} ({confidence}% confidence)",
            SourceDoc = doc,
            Confidence = confidence
        });

        list.Add(fact);
    }
}
