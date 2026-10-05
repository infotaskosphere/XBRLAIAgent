# XBRL AI Agent — Windows/.NET Foundation

Native Windows foundation for the planned XBRL AI Agent.

## Target workflow

Previous year: XBRL XML, audit report PDF, SAG XAG/data export.

Current year: audit report PDF.

Then: analyze previous-year structure, extract current-year information, compare and map concepts, validate, generate SAG-compatible data, and import/verify in Gen XBRL.

## Current implementation

- Native WinForms UI
- Current Year tab
- Previous Year Reference tab
- AI Comparison & Mapping tab
- Previous XML/XAG structural analysis
- Gen XBRL installation detection
- No modification of SAG data

## Phase A

GitHub Actions builds a self-contained Windows x64 EXE. The AI/PDF extraction and native SAG connector are next phases.