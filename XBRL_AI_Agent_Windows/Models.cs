using System;
using System.Collections.Generic;

namespace XBRLAIAgent;

public enum TaxonomyStandard
{
    IndAS,
    NonIndAS
}

public enum MappingStatus
{
    CONFIRMED,
    CHANGED,
    REVIEW_REQUIRED,
    NEW_ITEM
}

public sealed class AnomalyAlert
{
    public bool IsAnomaly { get; set; } = true;
    public string Severity { get; set; } = "HIGH"; // HIGH, MEDIUM
    public string Type { get; set; } = "GROWTH_SPIKE";
    public double PctChange { get; set; } = 0;
    public string Message { get; set; } = "";
    public string RecommendedAction { get; set; } = "";
}

public sealed class FactHistoryEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public DateTime Timestamp { get; set; } = DateTime.Now;
    public string Type { get; set; } = "AI_INITIAL_EXTRACTION"; // AI_INITIAL_EXTRACTION, MANUAL_OVERRIDE, REVERTED
    public string Author { get; set; } = "AI Agent";
    public string PreviousValue { get; set; } = "";
    public string NewValue { get; set; } = "";
    public string Notes { get; set; } = "";
    public int Confidence { get; set; } = 95;
    public string SourceDoc { get; set; } = "";
}

public sealed class MappedFact
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string ConceptName { get; set; } = "";
    public TaxonomyStandard Standard { get; set; } = TaxonomyStandard.IndAS;
    public string Label { get; set; } = "";
    public string Schedule { get; set; } = "BALANCE_SHEET"; // BALANCE_SHEET, PROFIT_LOSS, CARO, GENERAL
    public string Period { get; set; } = "Instant: 2024-03-31";
    public string PreviousValue { get; set; } = "";
    public string CurrentValue { get; set; } = "";
    public string Unit { get; set; } = "INR";
    public MappingStatus Status { get; set; } = MappingStatus.CONFIRMED;
    public int Confidence { get; set; } = 95;
    public string SourceDoc { get; set; } = "";
    public string SourcePageOrSheet { get; set; } = "";
    public string SagFieldId { get; set; } = "";
    public string SagScreenRef { get; set; } = "";
    public bool EditedManually { get; set; } = false;
    public AnomalyAlert? Anomaly { get; set; }
    public List<FactHistoryEntry> History { get; set; } = new();

    public void AddHistory(string newValue, string author = "Auditor", string type = "MANUAL_OVERRIDE", string notes = "")
    {
        History.Insert(0, new FactHistoryEntry
        {
            Timestamp = DateTime.Now,
            Author = author,
            Type = type,
            PreviousValue = CurrentValue,
            NewValue = newValue,
            Notes = string.IsNullOrWhiteSpace(notes) ? "Manual override by auditor" : notes,
            Confidence = Confidence,
            SourceDoc = SourceDoc
        });
        CurrentValue = newValue;
        EditedManually = true;
        Status = MappingStatus.CONFIRMED;
    }

    public void RevertTo(FactHistoryEntry entry)
    {
        History.Insert(0, new FactHistoryEntry
        {
            Timestamp = DateTime.Now,
            Author = "Auditor",
            Type = "REVERTED",
            PreviousValue = CurrentValue,
            NewValue = entry.NewValue,
            Notes = $"Reverted to version from {entry.Timestamp:yyyy-MM-dd HH:mm}",
            Confidence = entry.Confidence,
            SourceDoc = entry.SourceDoc
        });
        CurrentValue = entry.NewValue;
        EditedManually = false;
        Status = MappingStatus.CONFIRMED;
    }
}

public sealed class SagExportOptions
{
    public string CompanyCin { get; set; } = "L17110MH1995PLC085000";
    public string CompanyName { get; set; } = "TASKOSPHERE ENTERPRISE SOLUTIONS LIMITED";
    public string YearStartDate { get; set; } = "2023-04-01";
    public string YearEndDate { get; set; } = "2024-03-31";
    public TaxonomyStandard Taxonomy { get; set; } = TaxonomyStandard.IndAS;
    public string UnitScale { get; set; } = "LAKHS"; // EXACT, THOUSANDS, LAKHS, CRORES
    public string NatureOfReport { get; set; } = "Standalone"; // Standalone, Consolidated
    public bool IncludeCaro { get; set; } = true;
    public bool IncludeAuditReport { get; set; } = true;
}

public sealed class AuditorUser
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Chartered Accountant (ICAI)";
    public string MembershipNumber { get; set; } = string.Empty;
    public string FirmName { get; set; } = string.Empty;
    public string FirmRegistrationNumber { get; set; } = string.Empty;
    public bool RememberOnThisComputer { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class MongoDbSettings
{
    public string ConnectionUri { get; set; } = "mongodb://localhost:27017";
    public string DatabaseName { get; set; } = "xbrl_auditor_db";
    public string FactsCollection { get; set; } = "filing_facts";
    public string UsersCollection { get; set; } = "auditor_profiles";
    public string AuditTrailCollection { get; set; } = "change_history";
    public bool IsConnected { get; set; } = true;
    public DateTime LastTestedAt { get; set; } = DateTime.UtcNow;
}
