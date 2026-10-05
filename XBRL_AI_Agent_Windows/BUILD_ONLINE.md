# XBRL AI Agent — Windows Desktop Application

This project builds a self-contained, standalone Windows x64 executable (`XBRLAIAgent.exe`) using GitHub Actions.

## What the Windows Application Includes:

1. **Tab 01: Current Year Documents**
   - Multi-format ingestion for Audit Reports, Financial Statements, Excel Trial Balances, and Supporting Disclosures.
2. **Tab 02: Previous Year Reference**
   - Prior-year XBRL XML, SAG .XAG backup, and prior audited statements to establish the structural taxonomy baseline.
3. **Tab 03: AI Mapping & Comparison**
   - **Dual Taxonomy Standard Switcher**: 1-click toggle between **Ind AS** (Indian Accounting Standards) and **Non-Ind AS** (Companies AS Rules 2021).
   - Real-time mathematical balance check (Assets = Equity & Liabilities).
   - Full interactive DataGridView with inline editing of figures.
   - **Audit Trail & History**: Complete change log tracking AI extractions, manual auditor overrides, and 1-click historical rollback (Revert).
4. **Tab 04: SAG Gen XBRL Autowriter & Exporter**
   - Company Profile configuration (CIN, Company Name, FY Dates, Unit Scale: Lakhs/Crores/Exact).
   - **SAG Gen XBRL Field Verification & Adjustment Table**: Verify and adjust internal AI tags to exact SAG Gen XBRL target field IDs (`SAG_BS_PPE_101`, `SAG_PL_REV_301`, etc.) and screen references.
   - **1-Click Export Actions**:
     - 📥 SAG Excel Auto-Fill (`.xlsx` / `.csv`)
     - 📥 Structured CSV Import (`.csv`) with SAG Field IDs
     - 📥 Interchange JSON Bridge (`.json`)
     - 📥 SAG Gen XBRL Native Package (`.xag`)
     - 📥 MCA Form AOC-4 XBRL Instance (`.xml`)
     - 📥 PowerShell Auto-Writer (`.ps1`)
     - 📥 AutoHotkey Robotic Automation (`.ahk`)
     - ⚡ Direct process detection for running `GenXBRL.exe`
5. **Tab 05: Must-Read Statutory Guides**
   - Comprehensive interactive reader for MCA taxonomy rules, CARO 2020 mandates, Non-Ind AS thresholds, and SAG Gen XBRL XML/Excel import procedures.

## Download & Run Instructions:
1. Open the repository's **Actions** tab on GitHub (`infotaskosphere/XBRLAIAgent/actions`).
2. Select the latest completed run under **Build XBRL AI Agent Windows EXE**.
3. Under **Artifacts**, download `XBRL-AI-Agent-Windows-x64-ZIP`.
4. Extract the ZIP and double-click `XBRLAIAgent.exe` to run on any 64-bit Windows PC (Windows 10/11 or Windows Server). No separate runtime installation is needed!
