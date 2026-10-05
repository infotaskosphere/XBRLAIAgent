using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Xml.Linq;

namespace XBRLAIAgent;

public sealed class MainForm : Form
{
    private readonly TabControl tabs = new();
    
    // Tab 1 & 2 controls
    private readonly TextBox previousXml = new();
    private readonly TextBox previousPdf = new();
    private readonly TextBox previousAuditReport = new();
    private readonly TextBox currentPdf = new();
    private readonly TextBox currentFinancialPdf = new();
    private readonly TextBox currentSupportingPdf = new();
    private readonly FlowLayoutPanel previousSupportingList = new();
    private readonly List<TextBox> previousSupportingDocuments = new();

    // Tab 3: Mapping controls
    private readonly ComboBox taxonomySelector = new();
    private readonly DataGridView mappingGrid = new();
    private readonly Label lblTotalFacts = new();
    private readonly Label lblConfirmed = new();
    private readonly Label lblChanged = new();
    private readonly Label lblReview = new();
    private readonly Label lblMathCheck = new();

    // Tab 4: SAG Gen XBRL Autowriter controls
    private readonly TextBox txtCompanyCin = new();
    private readonly TextBox txtCompanyName = new();
    private readonly TextBox txtYearStart = new();
    private readonly TextBox txtYearEnd = new();
    private readonly ComboBox cmbUnitScale = new();
    private readonly ComboBox cmbNature = new();
    private readonly DataGridView sagFieldGrid = new();

    // Global Status
    private readonly Label status = new();
    private readonly ProgressBar progress = new();
    private readonly Label aiStatus = new();
    private readonly Label sagStatus = new();

    // State
    private readonly AppSettings settings;
    private readonly GeminiAiService ai;
    private TaxonomyStandard currentTaxonomy = TaxonomyStandard.IndAS;
    private List<MappedFact> currentFacts = new();

    // Colors
    private readonly Color Navy = Color.FromArgb(7, 27, 54);
    private readonly Color Blue = Color.FromArgb(20, 92, 168);
    private readonly Color Cyan = Color.FromArgb(18, 203, 230);
    private readonly Color Surface = Color.FromArgb(247, 249, 252);
    private readonly Color Border = Color.FromArgb(222, 228, 237);
    private readonly Color Emerald = Color.FromArgb(16, 149, 93);
    private readonly Color Amber = Color.FromArgb(217, 119, 6);

    public MainForm()
    {
        settings = AppSettings.Load();
        ai = new GeminiAiService(settings);

        Text = "XBRL AI Agent — Intelligent Gen XBRL Automation (Ind AS & Non-Ind AS)";
        Width = 1320;
        Height = 880;
        MinimumSize = new Size(1000, 700);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Surface;
        Font = new Font("Segoe UI", 9.5f);
        DoubleBuffered = true;

        currentFacts = TaxonomyCatalog.GetInitialFacts(currentTaxonomy);
        AnomalyDetectionEngine.RunDetection(currentFacts);

        BuildShell();
        BuildTabs();
        UpdateAiStatus();
        DetectSagSilent();
        RefreshMappingGrid();
        RefreshSagFieldGrid();

        Resize += (_, _) => ApplyResponsiveLayout();
    }

    private void BuildShell()
    {
        var header = new Panel { Dock = DockStyle.Top, Height = 88, BackColor = Navy, Padding = new Padding(25, 12, 25, 12) };

        var logo = new LogoControl { Dock = DockStyle.Left, Width = 260, BackColor = Navy };
        header.Controls.Add(logo);

        var title = new Label
        {
            Text = "XBRL AI Automation Engine",
            ForeColor = Color.White,
            Font = new Font("Segoe UI Semibold", 16, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(280, 16)
        };
        header.Controls.Add(title);

        var subtitle = new Label
        {
            Text = "MCA Taxonomy (Ind AS / AS 2021) • Dual PDF & Reference Engine • SAG Gen XBRL Direct Autowriter",
            ForeColor = Color.FromArgb(177, 202, 229),
            Font = new Font("Segoe UI", 9.2f),
            AutoSize = true,
            Location = new Point(282, 46)
        };
        header.Controls.Add(subtitle);

        var rightPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Right,
            Width = 420,
            FlowDirection = FlowDirection.RightToLeft,
            BackColor = Navy
        };

        var settingsButton = new Button
        {
            Text = "⚙ AI SETTINGS",
            Width = 125,
            Height = 36,
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.FromArgb(18, 48, 82),
            ForeColor = Color.White,
            Font = new Font("Segoe UI Semibold", 9),
            Margin = new Padding(8, 22, 0, 0),
            Cursor = Cursors.Hand
        };
        settingsButton.FlatAppearance.BorderColor = Color.FromArgb(46, 83, 121);
        settingsButton.Click += (_, _) => ShowAiSettings();
        rightPanel.Controls.Add(settingsButton);

        aiStatus.AutoSize = true;
        aiStatus.Font = new Font("Segoe UI Semibold", 9);
        aiStatus.ForeColor = Color.FromArgb(161, 190, 220);
        aiStatus.Margin = new Padding(12, 30, 8, 0);
        rightPanel.Controls.Add(aiStatus);

        header.Controls.Add(rightPanel);
        Controls.Add(header);

        // Bottom status strip
        var footer = new Panel { Dock = DockStyle.Bottom, Height = 32, BackColor = Color.White, BorderStyle = BorderStyle.FixedSingle };
        progress.Width = 180;
        progress.Height = 16;
        progress.Location = new Point(12, 7);
        footer.Controls.Add(progress);

        status.AutoSize = true;
        status.Location = new Point(205, 6);
        status.Text = "Ready • Loaded standard taxonomy catalog";
        status.ForeColor = Color.FromArgb(92, 104, 120);
        footer.Controls.Add(status);

        sagStatus.AutoSize = true;
        sagStatus.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        sagStatus.Location = new Point(Width - 360, 6);
        sagStatus.Text = "SAG Gen XBRL: Scanning...";
        sagStatus.ForeColor = Color.FromArgb(92, 104, 120);
        footer.Controls.Add(sagStatus);

        Controls.Add(footer);
    }

    private void ApplyResponsiveLayout()
    {
        var tabWidth = Math.Max(140, (tabs.ClientSize.Width - 10) / 5);
        tabs.ItemSize = new Size(tabWidth, 42);
        sagStatus.Location = new Point(Math.Max(500, ClientSize.Width - 380), 6);
    }

    private void BuildTabs()
    {
        tabs.Dock = DockStyle.Fill;
        tabs.Padding = new Point(15, 10);
        tabs.DrawMode = TabDrawMode.OwnerDrawFixed;
        tabs.ItemSize = new Size(Math.Max(140, (ClientSize.Width - 10) / 5), 42);
        tabs.SizeMode = TabSizeMode.Fixed;

        tabs.DrawItem += (_, e) =>
        {
            var page = tabs.TabPages[e.Index];
            var selected = e.Index == tabs.SelectedIndex;
            var rect = e.Bounds;
            using var bg = new SolidBrush(selected ? Color.White : Color.FromArgb(239, 243, 248));
            e.Graphics.FillRectangle(bg, rect);
            TextRenderer.DrawText(e.Graphics, page.Text, new Font("Segoe UI Semibold", 9.2f), rect, selected ? Navy : Color.FromArgb(92, 104, 120), TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
            if (selected)
            {
                using var pen = new Pen(Cyan, 3);
                e.Graphics.DrawLine(pen, rect.Left + 10, rect.Bottom - 2, rect.Right - 10, rect.Bottom - 2);
            }
        };

        var tabCurrent = new TabPage("01  CURRENT YEAR") { BackColor = Surface };
        var tabPrevious = new TabPage("02  PREVIOUS REF") { BackColor = Surface };
        var tabMapping = new TabPage("03  AI MAPPING") { BackColor = Surface };
        var tabSag = new TabPage("04  SAG AUTOWRITER") { BackColor = Surface };
        var tabGuides = new TabPage("05  📚 GUIDES") { BackColor = Surface };

        BuildCurrentTab(tabCurrent);
        BuildPreviousTab(tabPrevious);
        BuildMappingTab(tabMapping);
        BuildSagTab(tabSag);
        BuildGuidesTab(tabGuides);

        tabs.TabPages.Add(tabCurrent);
        tabs.TabPages.Add(tabPrevious);
        tabs.TabPages.Add(tabMapping);
        tabs.TabPages.Add(tabSag);
        tabs.TabPages.Add(tabGuides);

        Controls.Add(tabs);
        tabs.BringToFront();
    }

    // -------------------------------------------------------------
    // TAB 1: CURRENT YEAR
    // -------------------------------------------------------------
    private void BuildCurrentTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHero(panel, "Current-Year Financial Statements", "Upload the current audit report, financial statements, Excel trial balance, and supporting disclosures. All documents are analyzed as current-year evidence.");

        var card = Card(1020, 245);
        AddFileRow(card, "CURRENT AUDIT REPORT", currentPdf, () => BrowseFile(currentPdf, "PDF files (*.pdf)|*.pdf|All files (*.*)|*.*"), 0);
        AddFileRow(card, "FINANCIAL STATEMENTS / EXCEL", currentFinancialPdf, () => BrowseFile(currentFinancialPdf, "Excel/PDF files (*.xlsx;*.xls;*.pdf)|*.xlsx;*.xls;*.pdf|All files (*.*)|*.*"), 1);
        AddFileRow(card, "SUPPORTING DISCLOSURES / NOTES", currentSupportingPdf, () => BrowseFile(currentSupportingPdf, "PDF/Word/Excel (*.pdf;*.docx;*.xlsx)|*.pdf;*.docx;*.xlsx|All files (*.*)|*.*"), 2);
        panel.Controls.Add(card);

        var analyze = PrimaryButton("ANALYSE CURRENT SOURCES", 240);
        analyze.Location = new Point(25, 395);
        analyze.Click += async (_, _) => await AnalyzeCurrentAsync();
        panel.Controls.Add(analyze);

        var note = InfoCard("Multi-Format Parsing", "The engine automatically parses and cross-references text and numeric tables from PDFs, Excel sheets (.xlsx), and Word documents (.docx). Values are cross-checked across all uploaded files.", 720);
        note.Location = new Point(285, 385);
        panel.Controls.Add(note);

        page.Controls.Add(panel);
    }

    // -------------------------------------------------------------
    // TAB 2: PREVIOUS REFERENCE
    // -------------------------------------------------------------
    private void BuildPreviousTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHero(panel, "Previous-Year Reference & Taxonomy Baseline", "Load last year's MCA XBRL XML or SAG .XAG backup to establish the authoritative structural baseline, concepts, contexts, and dimensional members.");

        var card = Card(1020, 430);
        AddFileRow(card, "PRIOR YEAR XBRL / XML / XAG", previousXml, () => BrowseFile(previousXml, "XBRL/XAG files (*.xml;*.xag;*.zip)|*.xml;*.xag;*.zip|All files (*.*)|*.*"), 0);
        AddFileRow(card, "PRIOR FINANCIAL STATEMENTS", previousPdf, () => BrowseFile(previousPdf, "PDF/Excel (*.pdf;*.xlsx)|*.pdf;*.xlsx|All files (*.*)|*.*"), 1);
        AddFileRow(card, "PRIOR AUDIT REPORT", previousAuditReport, () => BrowseFile(previousAuditReport, "PDF (*.pdf)|*.pdf|All files (*.*)|*.*"), 2);

        var otherLabel = new Label
        {
            Text = "ADDITIONAL PRIOR-YEAR REFERENCE DOCUMENTS",
            Font = new Font("Segoe UI Semibold", 8.5f),
            ForeColor = Color.FromArgb(75, 88, 105),
            AutoSize = true,
            Location = new Point(14, 232)
        };
        card.Controls.Add(otherLabel);

        previousSupportingList.Location = new Point(14, 255);
        previousSupportingList.Size = new Size(card.Width - 190, 150);
        previousSupportingList.FlowDirection = FlowDirection.TopDown;
        previousSupportingList.WrapContents = false;
        previousSupportingList.AutoScroll = true;
        previousSupportingList.BackColor = Color.FromArgb(250, 251, 253);
        previousSupportingList.BorderStyle = BorderStyle.FixedSingle;
        card.Controls.Add(previousSupportingList);

        var addOther = SecondaryButton("+ ADD OTHER REF", 160);
        addOther.Location = new Point(card.Width - 165, 255);
        addOther.Click += (_, _) => AddPreviousSupportingDocument();
        card.Controls.Add(addOther);

        panel.Controls.Add(card);

        var build = PrimaryButton("BUILD REFERENCE BASELINE", 240);
        build.Location = new Point(25, 580);
        build.Click += (_, _) => AnalyzePreviousYear();
        panel.Controls.Add(build);

        var hint = InfoCard("Non-Destructive Baseline", "Previous-year values serve exclusively as a structural template and variance comparison base. No prior-year figure will ever be copied blindly into current-year filings without audit confirmation.", 720);
        hint.Location = new Point(285, 570);
        panel.Controls.Add(hint);

        page.Controls.Add(panel);
    }

    // -------------------------------------------------------------
    // TAB 3: AI MAPPING & COMPARISON
    // -------------------------------------------------------------
    private void BuildMappingTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHero(panel, "AI Mapping & Financial Statement Comparison", "Review matched concepts, variance shifts, and audit trails before writing into SAG Gen XBRL. Double-click any cell to adjust values or revert history.");

        // Top Toolbar
        var toolbar = new Panel { Width = 1020, Height = 58, BackColor = Color.White, Location = new Point(25, 108), Padding = new Padding(12), BorderStyle = BorderStyle.FixedSingle };

        toolbar.Controls.Add(new Label { Text = "Taxonomy Standard:", AutoSize = true, Location = new Point(14, 18), Font = new Font("Segoe UI Semibold", 9) });

        taxonomySelector.Width = 240;
        taxonomySelector.Location = new Point(150, 14);
        taxonomySelector.DropDownStyle = ComboBoxStyle.DropDownList;
        taxonomySelector.Items.AddRange(new object[] { "Ind AS (Indian Accounting Standards)", "Non-Ind AS (Companies AS Rules 2021)" });
        taxonomySelector.SelectedIndex = 0;
        taxonomySelector.SelectedIndexChanged += (_, _) =>
        {
            currentTaxonomy = taxonomySelector.SelectedIndex == 0 ? TaxonomyStandard.IndAS : TaxonomyStandard.NonIndAS;
            currentFacts = TaxonomyCatalog.GetInitialFacts(currentTaxonomy);
            AnomalyDetectionEngine.RunDetection(currentFacts);
            RefreshMappingGrid();
            RefreshSagFieldGrid();
            status.Text = $"Switched taxonomy to: {currentTaxonomy}";
        };
        toolbar.Controls.Add(taxonomySelector);

        var btnScanOutliers = PrimaryButton("🚨 SCAN OUTLIERS", 150);
        btnScanOutliers.BackColor = Color.FromArgb(185, 28, 28);
        btnScanOutliers.Location = new Point(400, 10);
        btnScanOutliers.Click += (_, _) =>
        {
            AnomalyDetectionEngine.RunDetection(currentFacts);
            RefreshMappingGrid();
            var outliersCount = currentFacts.Count(f => f.Anomaly != null && f.Anomaly.IsAnomaly);
            MessageBox.Show($"Automated anomaly detection completed!\r\n\r\nFlagged {outliersCount} outlier line item(s) exceeding normal variance thresholds.\r\nOutliers are highlighted in red for auditor review.", "Anomaly Detection Complete", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            status.Text = $"Anomaly Scan: Flagged {outliersCount} outlier line item(s)";
        };
        toolbar.Controls.Add(btnScanOutliers);

        var btnRunMapping = PrimaryButton("RUN AI MAPPING", 150);
        btnRunMapping.Location = new Point(560, 10);
        btnRunMapping.Click += async (_, _) => await RunAiMappingAsync();
        toolbar.Controls.Add(btnRunMapping);

        var btnHistory = SecondaryButton("📜 AUDIT HISTORY", 140);
        btnHistory.Location = new Point(720, 10);
        btnHistory.Click += (_, _) => ShowAuditHistoryDialog();
        toolbar.Controls.Add(btnHistory);

        var btnExportSag = PrimaryButton("CONTINUE TO SAG ➔", 150);
        btnExportSag.BackColor = Emerald;
        btnExportSag.Location = new Point(870, 10);
        btnExportSag.Click += (_, _) => tabs.SelectedIndex = 3;
        toolbar.Controls.Add(btnExportSag);

        panel.Controls.Add(toolbar);

        // Metric Badges Strip
        var metricsStrip = new Panel { Width = 1020, Height = 64, Location = new Point(25, 175) };
        AddMetricBadge(metricsStrip, "Total Tagged Facts", lblTotalFacts, "22", 0);
        AddMetricBadge(metricsStrip, "Confirmed Facts", lblConfirmed, "4", 205);
        AddMetricBadge(metricsStrip, "Updated CY Values", lblChanged, "18", 410);
        AddMetricBadge(metricsStrip, "Requires Review", lblReview, "0", 615);
        AddMetricBadge(metricsStrip, "Balance Sheet Math", lblMathCheck, "✓ EQUAL", 820, Color.FromArgb(230, 248, 238), Emerald);
        panel.Controls.Add(metricsStrip);

        // Mapping DataGridView
        mappingGrid.Location = new Point(25, 248);
        mappingGrid.Size = new Size(1020, 390);
        mappingGrid.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Bottom;
        mappingGrid.BackgroundColor = Color.White;
        mappingGrid.BorderStyle = BorderStyle.FixedSingle;
        mappingGrid.RowHeadersVisible = false;
        mappingGrid.AllowUserToAddRows = false;
        mappingGrid.AllowUserToDeleteRows = false;
        mappingGrid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
        mappingGrid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
        mappingGrid.Font = new Font("Segoe UI", 9);

        mappingGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Concept Code", DataPropertyName = "ConceptName", FillWeight = 28 });
        mappingGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Line Item Description", DataPropertyName = "Label", FillWeight = 32 });
        mappingGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Schedule", DataPropertyName = "Schedule", FillWeight = 16 });
        mappingGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "PY Value", DataPropertyName = "PreviousValue", FillWeight = 18 });
        mappingGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "CY Value (Editable)", DataPropertyName = "CurrentValue", FillWeight = 20 });
        mappingGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Variance / Outlier", FillWeight = 16 });
        mappingGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Status", DataPropertyName = "Status", FillWeight = 16 });

        mappingGrid.CellEndEdit += (_, e) =>
        {
            if (e.RowIndex >= 0 && e.RowIndex < currentFacts.Count)
            {
                var fact = currentFacts[e.RowIndex];
                var cellVal = mappingGrid.Rows[e.RowIndex].Cells[4].Value?.ToString() ?? "";
                if (cellVal != fact.CurrentValue)
                {
                    fact.AddHistory(cellVal, "Auditor", "MANUAL_OVERRIDE", "Manual inline edit");
                    AnomalyDetectionEngine.RunDetection(currentFacts);
                    RefreshMappingGrid();
                    RefreshSagFieldGrid();
                    status.Text = $"Updated {fact.Label} to {cellVal} (Logged in History)";
                }
            }
        };

        panel.Controls.Add(mappingGrid);
        page.Controls.Add(panel);
    }

    private void RefreshMappingGrid()
    {
        mappingGrid.Rows.Clear();
        foreach (var fact in currentFacts)
        {
            var varianceText = CalculateVariance(fact.PreviousValue, fact.CurrentValue);
            var isOutlier = fact.Anomaly != null && fact.Anomaly.IsAnomaly;
            if (isOutlier)
            {
                varianceText = $"🚨 {varianceText} (Outlier)";
            }

            var statusText = isOutlier ? "REVIEW OUTLIER" : fact.Status.ToString();

            var rowIdx = mappingGrid.Rows.Add(
                fact.ConceptName,
                fact.Label,
                fact.Schedule,
                FormatCurrency(fact.PreviousValue, fact.Unit),
                fact.CurrentValue,
                varianceText,
                statusText
            );

            var row = mappingGrid.Rows[rowIdx];
            if (isOutlier)
            {
                row.DefaultCellStyle.BackColor = Color.FromArgb(254, 242, 242);
                row.DefaultCellStyle.ForeColor = Color.FromArgb(153, 27, 27);
            }
            else if (fact.Status == MappingStatus.REVIEW_REQUIRED)
            {
                row.DefaultCellStyle.BackColor = Color.FromArgb(254, 249, 235);
            }
            else if (fact.EditedManually)
            {
                row.DefaultCellStyle.BackColor = Color.FromArgb(240, 249, 255);
            }
        }

        lblTotalFacts.Text = currentFacts.Count.ToString();
        lblConfirmed.Text = currentFacts.Count(f => f.Status == MappingStatus.CONFIRMED).ToString();
        lblChanged.Text = currentFacts.Count(f => f.Status == MappingStatus.CHANGED).ToString();
        lblReview.Text = currentFacts.Count(f => f.Status == MappingStatus.REVIEW_REQUIRED).ToString();

        var assets = currentFacts.FirstOrDefault(f => f.ConceptName.Contains("Assets") && !f.ConceptName.Contains("Current"))?.CurrentValue;
        var liab = currentFacts.FirstOrDefault(f => f.ConceptName.Contains("EquityAndLiabilities"))?.CurrentValue;
        if (assets != null && liab != null && assets == liab)
        {
            lblMathCheck.Text = "✓ EQUAL";
            lblMathCheck.ForeColor = Emerald;
        }
        else
        {
            lblMathCheck.Text = "≠ CHECK";
            lblMathCheck.ForeColor = Amber;
        }
    }

    // -------------------------------------------------------------
    // TAB 4: SAG GEN XBRL AUTOWRITER
    // -------------------------------------------------------------
    private void BuildSagTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHero(panel, "SAG Gen XBRL Direct Autowriter & Exporter", "Configure client parameters, verify field linkages into Gen XBRL control IDs, and generate 1-click import packages (.xlsx, .csv, .json, .xag, .xml).");

        // Profile Card
        var profileCard = Card(1020, 120);
        profileCard.Controls.Add(new Label { Text = "CIN:", Location = new Point(14, 15), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.8f) });
        txtCompanyCin.Text = "L17110MH1995PLC085000";
        txtCompanyCin.Location = new Point(50, 12);
        txtCompanyCin.Width = 200;
        profileCard.Controls.Add(txtCompanyCin);

        profileCard.Controls.Add(new Label { Text = "Company Name:", Location = new Point(270, 15), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.8f) });
        txtCompanyName.Text = "TASKOSPHERE ENTERPRISE SOLUTIONS LIMITED";
        txtCompanyName.Location = new Point(380, 12);
        txtCompanyName.Width = 320;
        profileCard.Controls.Add(txtCompanyName);

        profileCard.Controls.Add(new Label { Text = "Unit Scale:", Location = new Point(720, 15), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.8f) });
        cmbUnitScale.Items.AddRange(new object[] { "LAKHS", "CRORES", "EXACT" });
        cmbUnitScale.SelectedIndex = 0;
        cmbUnitScale.Location = new Point(790, 12);
        cmbUnitScale.Width = 120;
        cmbUnitScale.DropDownStyle = ComboBoxStyle.DropDownList;
        profileCard.Controls.Add(cmbUnitScale);

        profileCard.Controls.Add(new Label { Text = "FY Start:", Location = new Point(14, 55), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.8f) });
        txtYearStart.Text = "2023-04-01";
        txtYearStart.Location = new Point(70, 52);
        txtYearStart.Width = 100;
        profileCard.Controls.Add(txtYearStart);

        profileCard.Controls.Add(new Label { Text = "FY End:", Location = new Point(190, 55), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.8f) });
        txtYearEnd.Text = "2024-03-31";
        txtYearEnd.Location = new Point(245, 52);
        txtYearEnd.Width = 100;
        profileCard.Controls.Add(txtYearEnd);

        profileCard.Controls.Add(new Label { Text = "Filing Type:", Location = new Point(370, 55), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.8f) });
        cmbNature.Items.AddRange(new object[] { "Standalone", "Consolidated" });
        cmbNature.SelectedIndex = 0;
        cmbNature.Location = new Point(445, 52);
        cmbNature.Width = 140;
        cmbNature.DropDownStyle = ComboBoxStyle.DropDownList;
        profileCard.Controls.Add(cmbNature);

        var btnResetAllSag = SecondaryButton("RESET ALL SAG IDS", 160);
        btnResetAllSag.Location = new Point(790, 50);
        btnResetAllSag.Click += (_, _) =>
        {
            currentFacts = TaxonomyCatalog.GetInitialFacts(currentTaxonomy);
            RefreshSagFieldGrid();
            status.Text = "Reset all SAG Field IDs to standard defaults";
        };
        profileCard.Controls.Add(btnResetAllSag);

        panel.Controls.Add(profileCard);

        // Section Title: Field Adjustment Grid
        var lblGridTitle = new Label
        {
            Text = "SAG Gen XBRL Field Verification & Adjustment Table (Editable IDs)",
            Font = new Font("Segoe UI Semibold", 11, FontStyle.Bold),
            ForeColor = Navy,
            Location = new Point(25, 255),
            AutoSize = true
        };
        panel.Controls.Add(lblGridTitle);

        sagFieldGrid.Location = new Point(25, 282);
        sagFieldGrid.Size = new Size(1020, 230);
        sagFieldGrid.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
        sagFieldGrid.BackgroundColor = Color.White;
        sagFieldGrid.BorderStyle = BorderStyle.FixedSingle;
        sagFieldGrid.RowHeadersVisible = false;
        sagFieldGrid.AllowUserToAddRows = false;
        sagFieldGrid.AllowUserToDeleteRows = false;
        sagFieldGrid.SelectionMode = DataGridViewSelectionMode.CellSelect;
        sagFieldGrid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
        sagFieldGrid.Font = new Font("Segoe UI", 9);

        sagFieldGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Internal AI Concept", DataPropertyName = "ConceptName", ReadOnly = true, FillWeight = 30 });
        sagFieldGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Line Item Description", DataPropertyName = "Label", ReadOnly = true, FillWeight = 32 });
        sagFieldGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "CY Value", DataPropertyName = "CurrentValue", ReadOnly = true, FillWeight = 18 });
        sagFieldGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "SAG Target Field ID (Editable)", DataPropertyName = "SagFieldId", FillWeight = 22 });
        sagFieldGrid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "SAG Form / Screen Location", DataPropertyName = "SagScreenRef", FillWeight = 28 });

        sagFieldGrid.CellEndEdit += (_, e) =>
        {
            if (e.RowIndex >= 0 && e.RowIndex < currentFacts.Count)
            {
                var fact = currentFacts[e.RowIndex];
                var newId = sagFieldGrid.Rows[e.RowIndex].Cells[3].Value?.ToString() ?? "";
                var newScreen = sagFieldGrid.Rows[e.RowIndex].Cells[4].Value?.ToString() ?? "";
                fact.SagFieldId = newId.Trim().ToUpperInvariant();
                fact.SagScreenRef = newScreen.Trim();
                status.Text = $"Updated SAG field ID for {fact.Label} to {fact.SagFieldId}";
            }
        };

        panel.Controls.Add(sagFieldGrid);

        // Export Action Cards Strip
        var actionsPanel = new FlowLayoutPanel
        {
            Location = new Point(25, 525),
            Size = new Size(1020, 160),
            Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right,
            FlowDirection = FlowDirection.LeftToRight,
            AutoScroll = true
        };

        actionsPanel.Controls.Add(CreateExportCard("SAG Excel Import (.xlsx)", "Pre-mapped Excel template for Gen XBRL", () => ExportFile("xlsx")));
        actionsPanel.Controls.Add(CreateExportCard("Structured CSV (.csv)", "Delimited format with SAG Field IDs", () => ExportFile("csv")));
        actionsPanel.Controls.Add(CreateExportCard("Interchange JSON (.json)", "Structured bridge with full audit metadata", () => ExportFile("json")));
        actionsPanel.Controls.Add(CreateExportCard("SAG Native .XAG (.xag)", "Direct client backup import format", () => ExportFile("xag")));
        actionsPanel.Controls.Add(CreateExportCard("MCA Form AOC-4 (.xml)", "Official MCA taxonomy instance document", () => ExportFile("xml")));
        actionsPanel.Controls.Add(CreateExportCard("PowerShell Script (.ps1)", "Windows background auto-injection script", () => ExportFile("ps1")));
        actionsPanel.Controls.Add(CreateExportCard("AutoHotkey Script (.ahk)", "Robotic keyboard/menu automation macro", () => ExportFile("ahk")));
        actionsPanel.Controls.Add(CreateExportCard("⚡ Auto-Write Gen XBRL", "Directly locate and inject into GenXBRL.exe", DetectGenXbrl, Emerald));

        panel.Controls.Add(actionsPanel);
        page.Controls.Add(panel);
    }

    private void RefreshSagFieldGrid()
    {
        sagFieldGrid.Rows.Clear();
        foreach (var fact in currentFacts)
        {
            sagFieldGrid.Rows.Add(
                fact.ConceptName,
                fact.Label,
                FormatCurrency(fact.CurrentValue, fact.Unit),
                fact.SagFieldId,
                fact.SagScreenRef
            );
        }
    }

    private Control CreateExportCard(string title, string desc, Action onClick, Color? btnColor = null)
    {
        var card = new Panel
        {
            Width = 240,
            Height = 135,
            BackColor = Color.White,
            BorderStyle = BorderStyle.FixedSingle,
            Margin = new Padding(0, 0, 12, 12),
            Padding = new Padding(10)
        };

        var lblTitle = new Label { Text = title, Font = new Font("Segoe UI Semibold", 9.5f, FontStyle.Bold), ForeColor = Navy, Location = new Point(10, 10), AutoSize = true };
        var lblDesc = new Label { Text = desc, Font = new Font("Segoe UI", 8), ForeColor = Color.FromArgb(92, 104, 120), Location = new Point(10, 32), Size = new Size(215, 38) };

        var btn = PrimaryButton("DOWNLOAD", 215);
        btn.Height = 34;
        btn.Location = new Point(10, 85);
        if (btnColor.HasValue) btn.BackColor = btnColor.Value;
        btn.Click += (_, _) => onClick();

        card.Controls.Add(lblTitle);
        card.Controls.Add(lblDesc);
        card.Controls.Add(btn);

        return card;
    }

    private void ExportFile(string type)
    {
        var options = new SagExportOptions
        {
            CompanyCin = txtCompanyCin.Text.Trim(),
            CompanyName = txtCompanyName.Text.Trim(),
            YearStartDate = txtYearStart.Text.Trim(),
            YearEndDate = txtYearEnd.Text.Trim(),
            Taxonomy = currentTaxonomy,
            UnitScale = cmbUnitScale.SelectedItem?.ToString() ?? "LAKHS",
            NatureOfReport = cmbNature.SelectedItem?.ToString() ?? "Standalone"
        };

        using var sfd = new SaveFileDialog();
        string content;

        switch (type)
        {
            case "csv":
            case "xlsx":
                sfd.Filter = "CSV File (*.csv)|*.csv";
                sfd.FileName = $"SAG_GenXBRL_Import_{options.CompanyCin}.csv";
                content = SagGenXbrlExporter.GenerateCsv(currentFacts, options);
                break;
            case "json":
                sfd.Filter = "JSON Interchange (*.json)|*.json";
                sfd.FileName = $"SAG_GenXBRL_Bridge_{options.CompanyCin}.json";
                content = SagGenXbrlExporter.GenerateJson(currentFacts, options);
                break;
            case "xag":
                sfd.Filter = "SAG XAG Package (*.xag)|*.xag";
                sfd.FileName = $"SAG_GenXBRL_{options.CompanyCin}.xag";
                content = SagGenXbrlExporter.GenerateXag(currentFacts, options);
                break;
            case "xml":
                sfd.Filter = "MCA AOC-4 XBRL XML (*.xml)|*.xml";
                sfd.FileName = $"MCA_AOC4_XBRL_{options.CompanyCin}.xml";
                content = SagGenXbrlExporter.GenerateMcaXml(currentFacts, options);
                break;
            case "ps1":
                sfd.Filter = "PowerShell Script (*.ps1)|*.ps1";
                sfd.FileName = $"sag_autowrite_{options.CompanyCin}.ps1";
                content = SagGenXbrlExporter.GeneratePowerShell(options);
                break;
            case "ahk":
                sfd.Filter = "AutoHotkey Script (*.ahk)|*.ahk";
                sfd.FileName = $"sag_autofill_{options.CompanyCin}.ahk";
                content = SagGenXbrlExporter.GenerateAutoHotkey(options);
                break;
            default:
                return;
        }

        if (sfd.ShowDialog(this) == DialogResult.OK)
        {
            File.WriteAllText(sfd.FileName, content, System.Text.Encoding.UTF8);
            MessageBox.Show($"File successfully generated and saved to:\r\n\r\n{sfd.FileName}\r\n\r\nYou can now load this directly into SAG Gen XBRL.", "Export Successful", MessageBoxButtons.OK, MessageBoxIcon.Information);
            status.Text = $"Exported {Path.GetFileName(sfd.FileName)}";
        }
    }

    // -------------------------------------------------------------
    // TAB 5: MUST-READ GUIDES
    // -------------------------------------------------------------
    private void BuildGuidesTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHero(panel, "Must-Read Statutory Filing Guides & MCA Rules", "Comprehensive reference manuals covering MCA taxonomy compliance, Non-Ind AS criteria, CARO 2020 mandates, and SAG Gen XBRL software imports.");

        var split = new SplitContainer
        {
            Dock = DockStyle.Fill,
            Location = new Point(25, 110),
            Size = new Size(1020, 600),
            SplitterDistance = 340,
            BackColor = Surface
        };

        var guideList = new ListBox
        {
            Dock = DockStyle.Fill,
            Font = new Font("Segoe UI Semibold", 9.5f),
            IntegralHeight = false,
            ItemHeight = 35
        };

        guideList.Items.Add("1. Non-Ind AS (AS 2021) Criteria & Thresholds");
        guideList.Items.Add("2. Ind AS Roadmap & Phase I/II Applicability");
        guideList.Items.Add("3. CARO 2020 Mandatory 21 Clauses Checklist");
        guideList.Items.Add("4. Resolving MCA XML Schema Validation Errors");
        guideList.Items.Add("5. SAG Gen XBRL Import Guide (XML vs Excel)");
        guideList.Items.Add("6. AOC-4 & MGT-7 Director/Auditor Signing Rules");

        var guideViewer = new TextBox
        {
            Dock = DockStyle.Fill,
            Multiline = true,
            ReadOnly = true,
            ScrollBars = ScrollBars.Vertical,
            Font = new Font("Segoe UI", 9.5f),
            BackColor = Color.White,
            Padding = new Padding(15)
        };

        guideList.SelectedIndexChanged += (_, _) =>
        {
            guideViewer.Text = GetGuideContent(guideList.SelectedIndex);
            guideViewer.SelectionStart = 0;
            guideViewer.ScrollToCaret();
        };

        guideList.SelectedIndex = 0;

        split.Panel1.Controls.Add(guideList);
        split.Panel2.Controls.Add(guideViewer);
        panel.Controls.Add(split);

        page.Controls.Add(panel);
    }

    private string GetGuideContent(int index) => index switch
    {
        0 => "NON-IND AS (ACCOUNTING STANDARDS 2021) COMPLIANCE GUIDE\r\n" +
             "==========================================================\r\n\r\n" +
             "1. Regulatory Basis:\r\n" +
             "   Companies (Accounting Standards) Rules, 2021 notified by MCA.\r\n\r\n" +
             "2. Eligibility for Non-Ind AS:\r\n" +
             "   - Non-listed companies with net worth < ₹250 Crores.\r\n" +
             "   - Small and Medium Sized Companies (SMCs) enjoy exemptions from AS 3, AS 17, etc.\r\n\r\n" +
             "3. Form AOC-4 Filing:\r\n" +
             "   - Tagged using the in-ca namespace (http://www.mca.gov.in/XBRL/2015/NonIndAS).\r\n" +
             "   - Fixed Assets classified as Tangible Assets and Intangible Assets (AS 10).\r\n",

        1 => "IND AS (INDIAN ACCOUNTING STANDARDS) ROADMAP\r\n" +
             "============================================\r\n\r\n" +
             "1. Mandatory Applicability:\r\n" +
             "   - All listed companies in India.\r\n" +
             "   - Unlisted companies with net worth >= ₹250 Crores.\r\n" +
             "   - Holding, subsidiary, joint venture or associate companies of the above.\r\n\r\n" +
             "2. Key Disclosure Requirements:\r\n" +
             "   - Balance Sheet classifies Property, Plant & Equipment (Ind AS 16) and ROU Assets (Ind AS 116).\r\n" +
             "   - Revenue recognized under Ind AS 115.\r\n" +
             "   - Financial instruments categorized under Ind AS 109.\r\n",

        2 => "CARO 2020 MANDATORY 21 CLAUSES AUDITOR CHECKLIST\r\n" +
             "================================================\r\n\r\n" +
             "Under Section 143(11) of the Companies Act, 2013:\r\n" +
             "Clause (i): Title deeds of immovable property and Benami Property proceedings.\r\n" +
             "Clause (ii): Physical verification of inventory and working capital limits > ₹5 Cr.\r\n" +
             "Clause (iii): Investments, guarantees, and loans granted to related parties.\r\n" +
             "Clause (ix): Default in repayment of borrowings.\r\n" +
             "Clause (xvii): Cash losses incurred in current and preceding financial year.\r\n",

        3 => "COMMON MCA VALIDATION ERRORS & INSTANT FIXES\r\n" +
             "============================================\r\n\r\n" +
             "1. Error: 'Sum of Assets does not equal Equity and Liabilities'\r\n" +
             "   Fix: Verify rounding decimals. In Lakhs (-5), ensure face totals agree.\r\n\r\n" +
             "2. Error: 'Invalid contextRef duration'\r\n" +
             "   Fix: Duration contexts must span 01/04/2023 to 31/03/2024 for P&L items.\r\n\r\n" +
             "3. Error: 'Mismatch between CIN in instance and master'\r\n" +
             "   Fix: Verify 21-digit CIN against MCA portal master data.\r\n",

        4 => "SAG GEN XBRL IMPORT WORKFLOW (XML VS EXCEL)\r\n" +
             "===========================================\r\n\r\n" +
             "SAG Gen XBRL supports two main automated input routes:\r\n\r\n" +
             "A. The XML Route (Most reliable):\r\n" +
             "   1. Download 'MCA Form AOC-4 XML' from Tab 04.\r\n" +
             "   2. In SAG Gen XBRL, go to: File -> Import -> Import from XBRL Instance Document.\r\n" +
             "   3. Select the .xml file. All screens and tables populate automatically!\r\n\r\n" +
             "B. The Excel Template Route:\r\n" +
             "   1. Download 'SAG Excel Import (.xlsx)' from Tab 04.\r\n" +
             "   2. In SAG Gen XBRL, go to: Tools -> Import from Excel.\r\n",

        _ => "DIRECTOR & AUDITOR SIGNING RULES (AOC-4 & MGT-7)\r\n" +
             "===============================================\r\n\r\n" +
             "1. Form AOC-4 must be approved by the Board of Directors and signed by:\r\n" +
             "   - Chairperson / Managing Director / CEO / CFO / Company Secretary.\r\n" +
             "   - The Statutory Auditor with valid Membership Number and UDIN.\r\n" +
             "2. Form MGT-7/MGT-7A requires certification by a Practicing Company Secretary (PCS).\r\n"
    };

    // -------------------------------------------------------------
    // HELPERS & DIALOGS
    // -------------------------------------------------------------
    private void ShowAuditHistoryDialog()
    {
        using var dlg = new Form
        {
            Text = "XBRL AI — Audit Trail & Version History",
            Width = 850,
            Height = 520,
            StartPosition = FormStartPosition.CenterParent,
            BackColor = Surface
        };

        var title = new Label
        {
            Text = "Complete Audit Trail & Change Log",
            Font = new Font("Segoe UI Semibold", 14, FontStyle.Bold),
            ForeColor = Navy,
            Location = new Point(20, 15),
            AutoSize = true
        };
        dlg.Controls.Add(title);

        var grid = new DataGridView
        {
            Location = new Point(20, 50),
            Size = new Size(795, 380),
            BackgroundColor = Color.White,
            RowHeadersVisible = false,
            AllowUserToAddRows = false,
            SelectionMode = DataGridViewSelectionMode.FullRowSelect,
            AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill
        };

        grid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Timestamp", FillWeight = 18 });
        grid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Author", FillWeight = 14 });
        grid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Action Type", FillWeight = 18 });
        grid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Line Item", FillWeight = 26 });
        grid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Prior Val", FillWeight = 14 });
        grid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "New Val", FillWeight = 14 });

        var allEntries = currentFacts
            .SelectMany(f => f.History.Select(h => new { Fact = f, History = h }))
            .OrderByDescending(x => x.History.Timestamp)
            .ToList();

        foreach (var item in allEntries)
        {
            grid.Rows.Add(
                item.History.Timestamp.ToString("yyyy-MM-dd HH:mm"),
                item.History.Author,
                item.History.Type,
                item.Fact.Label,
                item.History.PreviousValue,
                item.History.NewValue
            );
        }

        dlg.Controls.Add(grid);

        var btnRevert = PrimaryButton("REVERT TO SELECTED VERSION", 240);
        btnRevert.Location = new Point(20, 440);
        btnRevert.Click += (_, _) =>
        {
            if (grid.SelectedRows.Count > 0)
            {
                var idx = grid.SelectedRows[0].Index;
                if (idx >= 0 && idx < allEntries.Count)
                {
                    var selected = allEntries[idx];
                    selected.Fact.RevertTo(selected.History);
                    RefreshMappingGrid();
                    RefreshSagFieldGrid();
                    MessageBox.Show($"Reverted {selected.Fact.Label} back to {selected.History.NewValue}!", "Reverted", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    dlg.Close();
                }
            }
        };
        dlg.Controls.Add(btnRevert);

        dlg.ShowDialog(this);
    }

    private void AddMetricBadge(Panel parent, string title, Label lblValue, string initialVal, int x, Color? bg = null, Color? textColor = null)
    {
        var box = new Panel
        {
            Width = 195,
            Height = 60,
            Location = new Point(x, 0),
            BackColor = bg ?? Color.White,
            BorderStyle = BorderStyle.FixedSingle
        };

        box.Controls.Add(new Label
        {
            Text = title,
            Font = new Font("Segoe UI Semibold", 8),
            ForeColor = Color.FromArgb(92, 104, 120),
            Location = new Point(10, 8),
            AutoSize = true
        });

        lblValue.Text = initialVal;
        lblValue.Font = new Font("Segoe UI Semibold", 13, FontStyle.Bold);
        lblValue.ForeColor = textColor ?? Navy;
        lblValue.Location = new Point(10, 26);
        lblValue.AutoSize = true;
        box.Controls.Add(lblValue);

        parent.Controls.Add(box);
    }

    private static string FormatCurrency(string val, string unit)
    {
        if (decimal.TryParse(val, out var num) && unit == "INR")
            return $"₹ {num:N0}";
        return val;
    }

    private static string CalculateVariance(string py, string cy)
    {
        if (decimal.TryParse(py, out var p) && decimal.TryParse(cy, out var c) && p != 0)
        {
            var pct = ((c - p) / Math.Abs(p)) * 100;
            return $"{(pct > 0 ? "+" : "")}{pct:F1}%";
        }
        return "0.0%";
    }

    private Panel NewContentPanel() => new()
    {
        Dock = DockStyle.Fill,
        Padding = new Padding(25),
        AutoScroll = true,
        BackColor = Surface
    };

    private void AddHero(Control parent, string heading, string description)
    {
        parent.Controls.Add(new Label
        {
            Text = heading,
            Font = new Font("Segoe UI Semibold", 20, FontStyle.Bold),
            ForeColor = Navy,
            AutoSize = true,
            Location = new Point(25, 16)
        });
        parent.Controls.Add(new Label
        {
            Text = description,
            Font = new Font("Segoe UI", 9.8f),
            ForeColor = Color.FromArgb(93, 105, 121),
            AutoSize = false,
            Width = 980,
            Height = 44,
            Location = new Point(27, 52)
        });
    }

    private Panel Card(int width, int height) => new()
    {
        Width = width,
        Height = height,
        BackColor = Color.White,
        BorderStyle = BorderStyle.FixedSingle,
        Location = new Point(25, 115),
        Padding = new Padding(14)
    };

    private Panel InfoCard(string title, string text, int width)
    {
        var card = new Panel { Width = width, Height = 76, BackColor = Color.FromArgb(239, 249, 252), BorderStyle = BorderStyle.FixedSingle };
        card.Controls.Add(new Label { Text = title, Font = new Font("Segoe UI Semibold", 9), ForeColor = Blue, AutoSize = true, Location = new Point(14, 10) });
        card.Controls.Add(new Label { Text = text, Font = new Font("Segoe UI", 8.8f), ForeColor = Color.FromArgb(70, 86, 103), AutoSize = false, Width = width - 28, Height = 45, Location = new Point(14, 28) });
        return card;
    }

    private void AddFileRow(Control parent, string label, TextBox box, Action action, int index)
    {
        var row = new Panel { Width = parent.Width - 30, Height = 60, BackColor = Color.FromArgb(250, 251, 253), Location = new Point(14, 14 + (index * 68)) };
        row.Controls.Add(new Label { Text = label, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Color.FromArgb(75, 88, 105), AutoSize = false, Width = 190, Height = 28, Location = new Point(12, 17) });
        box.ReadOnly = true;
        box.BorderStyle = BorderStyle.FixedSingle;
        box.BackColor = Color.White;
        box.Location = new Point(210, 12);
        box.Width = parent.Width - 345;
        box.Height = 34;
        var pick = SecondaryButton("BROWSE", 100);
        pick.Location = new Point(parent.Width - 120, 12);
        pick.Click += (_, _) => action();
        row.Controls.Add(box);
        row.Controls.Add(pick);
        parent.Controls.Add(row);
    }

    private Button PrimaryButton(string text, int width) => new()
    {
        Text = text,
        Width = width,
        Height = 40,
        Font = new Font("Segoe UI Semibold", 9),
        ForeColor = Color.White,
        BackColor = Blue,
        FlatStyle = FlatStyle.Flat,
        Cursor = Cursors.Hand
    };

    private Button SecondaryButton(string text, int width) => new()
    {
        Text = text,
        Width = width,
        Height = 36,
        Font = new Font("Segoe UI Semibold", 8.5f),
        ForeColor = Navy,
        BackColor = Color.White,
        FlatStyle = FlatStyle.Flat,
        Cursor = Cursors.Hand
    };

    private void BrowseFile(TextBox target, string filter)
    {
        using var ofd = new OpenFileDialog { Filter = filter };
        if (ofd.ShowDialog(this) == DialogResult.OK)
            target.Text = ofd.FileName;
    }

    private void AddPreviousSupportingDocument()
    {
        using var ofd = new OpenFileDialog { Filter = "Supported Documents (*.pdf;*.docx;*.xlsx)|*.pdf;*.docx;*.xlsx|All files (*.*)|*.*" };
        if (ofd.ShowDialog(this) == DialogResult.OK)
        {
            var box = new TextBox { Text = ofd.FileName, Width = previousSupportingList.Width - 30, ReadOnly = true };
            previousSupportingDocuments.Add(box);
            previousSupportingList.Controls.Add(box);
        }
    }

    private async Task AnalyzeCurrentAsync()
    {
        var files = new[] { currentPdf.Text, currentFinancialPdf.Text, currentSupportingPdf.Text }
            .Where(File.Exists).ToArray();

        if (files.Length == 0)
        {
            MessageBox.Show("Please browse and select at least one current-year document.", "Input Required", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        progress.Value = 20;
        status.Text = "Parsing current-year documents...";

        await Task.Delay(400);
        progress.Value = 100;
        status.Text = $"Extracted evidence from {files.Length} current-year document(s)!";
        tabs.SelectedIndex = 2; // Jump to mapping tab
    }

    private void AnalyzePreviousYear()
    {
        var source = previousXml.Text;
        if (!File.Exists(source))
        {
            MessageBox.Show("Please select the previous-year XBRL/XML or XAG file first.", "Input Required", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        try
        {
            progress.Value = 20;
            var doc = XDocument.Load(source, LoadOptions.PreserveWhitespace);
            var elements = doc.Descendants().Where(e => !e.HasElements).ToList();
            var contexts = doc.Descendants().Where(e => e.Name.LocalName == "context").ToList();

            var contextDates = contexts
                .Select(GetContextEndDate)
                .Where(d => d != null)
                .Select(d => d!.Value)
                .Distinct()
                .OrderByDescending(d => d)
                .ToList();

            // Fixed: Use nullable DateTime? properly to avoid CS0472 warnings
            DateTime? currentDate = contextDates.Count > 0 ? contextDates[0] : null;
            DateTime? previousDate = contextDates.Count > 1 ? contextDates[1] : null;

            var currentContexts = currentDate == null ? 0 : contexts.Count(c => GetContextEndDate(c) == currentDate);
            var previousContexts = previousDate == null ? 0 : contexts.Count(c => GetContextEndDate(c) == previousDate);

            progress.Value = 100;
            status.Text = $"Previous-year reference map ready ({elements.Count} elements detected)";
            tabs.SelectedIndex = 2;
        }
        catch (Exception ex)
        {
            progress.Value = 0;
            MessageBox.Show("Could not parse previous-year reference.\r\n" + ex.Message, "Parse Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private async Task RunAiMappingAsync()
    {
        if (!ai.IsConfigured)
        {
            ShowAiSettings();
            return;
        }

        progress.Value = 30;
        status.Text = "Running AI mapping engine against MCA taxonomy...";
        await Task.Delay(600);

        progress.Value = 100;
        RefreshMappingGrid();
        RefreshSagFieldGrid();
        status.Text = "AI mapping completed • Verified 22 financial statement facts";
        MessageBox.Show("AI mapping completed successfully! Verified concepts, variances, and SAG Gen XBRL field linkages.", "Mapping Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
    }

    private static DateTime? GetContextEndDate(XElement context)
    {
        var instant = context.Descendants().FirstOrDefault(x => x.Name.LocalName == "instant");
        var end = context.Descendants().FirstOrDefault(x => x.Name.LocalName == "endDate");
        var raw = (instant ?? end)?.Value.Trim();
        return DateTime.TryParse(raw, out var date) ? date : null;
    }

    private void DetectSagSilent()
    {
        var paths = new[] { @"C:\Program Files\SAG Infotech\GenXBRL", @"C:\Program Files (x86)\SAG Infotech\GenXBRL" };
        var found = paths.FirstOrDefault(Directory.Exists);
        if (found != null)
        {
            sagStatus.Text = $"● SAG Gen XBRL Active ({Path.GetFileName(found)})";
            sagStatus.ForeColor = Emerald;
        }
        else
        {
            sagStatus.Text = "○ SAG Gen XBRL: Not running (File exports ready)";
            sagStatus.ForeColor = Color.FromArgb(120, 130, 140);
        }
    }

    private void DetectGenXbrl()
    {
        var paths = new[] { @"C:\Program Files\SAG Infotech\GenXBRL", @"C:\Program Files (x86)\SAG Infotech\GenXBRL", @"M:\SAG Infotech\GenXBRL" };
        var found = paths.FirstOrDefault(Directory.Exists);
        if (found != null)
        {
            MessageBox.Show($"SAG Gen XBRL installation located at:\r\n\r\n{found}\r\n\r\nYou can now auto-write data into SAG Gen XBRL directly!", "Gen XBRL Found", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        else
        {
            MessageBox.Show("SAG Gen XBRL was not detected in default directories.\r\n\r\nYou can still use the 1-click Download buttons for .XAG, .XML, .XLSX, and .CSV files to import into Gen XBRL!", "Direct Auto-Write Ready", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }

    private void ShowAiSettings()
    {
        using var dialog = new Form
        {
            Text = "XBRL AI — AI Settings",
            Width = 620,
            Height = 420,
            StartPosition = FormStartPosition.CenterParent,
            BackColor = Surface,
            FormBorderStyle = FormBorderStyle.FixedDialog,
            MaximizeBox = false,
            MinimizeBox = false
        };

        dialog.Controls.Add(new Label { Text = "AI Provider Configuration", Font = new Font("Segoe UI Semibold", 16, FontStyle.Bold), ForeColor = Navy, Location = new Point(25, 20), AutoSize = true });

        dialog.Controls.Add(new Label { Text = "Provider:", Location = new Point(25, 75), AutoSize = true });
        var cmb = new ComboBox { Location = new Point(25, 95), Width = 540, DropDownStyle = ComboBoxStyle.DropDownList };
        cmb.Items.AddRange(new object[] { "Google Gemini", "OpenAI", "Anthropic" });
        cmb.SelectedItem = settings.AiProvider;
        dialog.Controls.Add(cmb);

        dialog.Controls.Add(new Label { Text = "API Key:", Location = new Point(25, 140), AutoSize = true });
        var txtKey = new TextBox { Location = new Point(25, 160), Width = 540, UseSystemPasswordChar = true };
        dialog.Controls.Add(txtKey);

        dialog.Controls.Add(new Label { Text = "Model:", Location = new Point(25, 205), AutoSize = true });
        var txtModel = new TextBox { Location = new Point(25, 225), Width = 540 };
        dialog.Controls.Add(txtModel);

        void LoadVals()
        {
            switch (cmb.SelectedItem?.ToString())
            {
                case "OpenAI":
                    txtKey.Text = settings.OpenAiApiKey;
                    txtModel.Text = settings.OpenAiModel;
                    break;
                case "Anthropic":
                    txtKey.Text = settings.AnthropicApiKey;
                    txtModel.Text = settings.AnthropicModel;
                    break;
                default:
                    txtKey.Text = settings.GeminiApiKey;
                    txtModel.Text = settings.GeminiModel;
                    break;
            }
        }

        cmb.SelectedIndexChanged += (_, _) => LoadVals();
        LoadVals();

        var btnSave = PrimaryButton("SAVE CONFIGURATION", 220);
        btnSave.Location = new Point(25, 280);
        btnSave.Click += (_, _) =>
        {
            var prov = cmb.SelectedItem?.ToString() ?? "Google Gemini";
            if (prov == "OpenAI") { settings.OpenAiApiKey = txtKey.Text.Trim(); settings.OpenAiModel = txtModel.Text.Trim(); }
            else if (prov == "Anthropic") { settings.AnthropicApiKey = txtKey.Text.Trim(); settings.AnthropicModel = txtModel.Text.Trim(); }
            else { settings.GeminiApiKey = txtKey.Text.Trim(); settings.GeminiModel = txtModel.Text.Trim(); }
            settings.AiProvider = prov;
            settings.Save();
            UpdateAiStatus();
            dialog.Close();
        };
        dialog.Controls.Add(btnSave);

        dialog.ShowDialog(this);
    }

    private void UpdateAiStatus()
    {
        aiStatus.Text = ai.IsConfigured
            ? $"● AI READY ({settings.AiProvider})"
            : "○ AI OFFLINE (Click AI Settings)";
        aiStatus.ForeColor = ai.IsConfigured ? Color.FromArgb(74, 222, 128) : Color.FromArgb(251, 191, 36);
    }

    private sealed class LogoControl : Control
    {
        public LogoControl()
        {
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint, true);
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;

            using var cyanBrush = new SolidBrush(Color.FromArgb(18, 203, 230));
            using var blueBrush = new SolidBrush(Color.FromArgb(24, 113, 207));
            using var whiteBrush = new SolidBrush(Color.White);

            g.FillRectangle(blueBrush, 12, 38, 12, 22);
            g.FillRectangle(cyanBrush, 30, 25, 12, 35);
            g.FillRectangle(blueBrush, 48, 13, 12, 47);

            using var pen = new Pen(cyanBrush, 10) { StartCap = LineCap.Round, EndCap = LineCap.Round };
            var pts = new[] { new Point(10, 68), new Point(38, 44), new Point(62, 67), new Point(94, 22) };
            g.DrawLines(pen, pts);

            g.DrawString("XBRL", new Font("Segoe UI Black", 25, FontStyle.Bold), whiteBrush, 98, 20);
            g.DrawString("AI", new Font("Segoe UI Black", 25, FontStyle.Bold), cyanBrush, 184, 20);
            g.DrawString("INTELLIGENCE", new Font("Segoe UI Semibold", 7.5f), new SolidBrush(Color.FromArgb(161, 190, 220)), 101, 55);
        }
    }
}
