# Phase A — Build Online

This project is configured to build the Windows EXE using GitHub Actions on a Microsoft-hosted Windows runner.

## What the online build produces

- `XBRLAIAgent.exe` — self-contained Windows x64 executable
- `XBRL-AI-Agent-Windows-x64.zip` — ZIP containing the EXE

The end-user PC does **not** need Python or a separate .NET runtime for this published EXE.

## Build steps

1. Open the repository's **Actions** tab.
2. Select **Build XBRL AI Agent Windows EXE**.
3. Click **Run workflow** if it has not already run from the push.
4. Wait for the green successful run.
5. Open the completed run and download the artifact named `XBRL-AI-Agent-Windows-x64`.
6. Extract it and run `XBRLAIAgent.exe` on Windows.

## Important Phase A boundary

This phase proves the online Windows build and packaging path. It does not yet claim that Gen XBRL data entry is fully automated.

Phase B will add the real document extraction/mapping engine and the SAG/Gen XBRL connector.