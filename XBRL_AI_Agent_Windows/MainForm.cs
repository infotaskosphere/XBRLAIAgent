using System;
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
    private readonly TextBox previousXml = new();
    private readonly TextBox previousPdf = new();
    private readonly TextBox previousAuditReport = new();
    private readonly TextBox currentPdf = new();
    private readonly Label status = new();
    private readonly TextBox analysis = new();
    private readonly ProgressBar progress = new();
    private readonly Label aiStatus = new();
    private readonly AppSettings settings;
    private readonly GeminiAiService ai;

    private readonly Color Navy = Color.FromArgb(7, 27, 54);
    private readonly Color Blue = Color.FromArgb(20, 92, 168);
    private readonly Color Cyan = Color.FromArgb(18, 203, 230);
    private readonly Color Surface = Color.FromArgb(247, 249, 252);
    private readonly Color Border = Color.FromArgb(222, 228, 237);

    public MainForm()
    {
        settings = AppSettings.Load();
        ai = new GeminiAiService(settings);

        Text = "XBRL AI — Intelligent Gen XBRL Automation";
        Width = 1280;
        Height = 820;
        MinimumSize = new Size(1050, 700);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Surface;
        Font = new Font("Segoe UI", 9.5f);
        DoubleBuffered = true;

        BuildShell();
        BuildTabs();
        UpdateAiStatus();
    }

    private void BuildShell()
    {
        var header = new Panel { Dock = DockStyle.Top, Height = 92, BackColor = Navy, Padding = new Padding(28, 15, 28, 12) };

        var logo = new LogoControl { Dock = DockStyle.Left, Width = 270, BackColor = Navy };
        header.Controls.Add(logo);

        var title = new Label
        {
            Text = "Gen XBRL Intelligence",
            ForeColor = Color.White,
            Font = new Font("Segoe UI Semibold", 17, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(315, 18)
        };
        header.Controls.Add(title);

        var subtitle = new Label
        {
            Text = "Reference-aware preparation • validation • SAG automation",
            ForeColor = Color.FromArgb(177, 202, 229),
            Font = new Font("Segoe UI", 9.5f),
            AutoSize = true,
            Location = new Point(317, 49)
        };
        header.Controls.Add(subtitle);

        var settingsButton = new Button
        {
            Text = "⚙ AI SETTINGS",
            Width = 125,
            Height = 36,
            Location = new Point(1085, 27),
            Anchor = AnchorStyles.Top | AnchorStyles.Right,
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.FromArgb(18, 48, 82),
            ForeColor = Color.White,
            Font = new Font("Segoe UI Semibold", 9)
        };
        settingsButton.FlatAppearance.BorderColor = Color.FromArgb(46, 83, 121);
        settingsButton.Click += (_, _) => ShowAiSettings();
        header.Controls.Add(settingsButton);

        Controls.Add(header);
    }

    private void BuildTabs()
    {
        tabs.Dock = DockStyle.Fill;
        tabs.Padding = new Point(20, 10);
        tabs.DrawMode = TabDrawMode.OwnerDrawFixed;
        tabs.ItemSize = new Size(210, 42);
        tabs.SizeMode = TabSizeMode.Fixed;
        tabs.DrawItem += (_, e) =>
        {
            var page = tabs.TabPages[e.Index];
            var selected = e.Index == tabs.SelectedIndex;
            var rect = e.Bounds;
            using var bg = new SolidBrush(selected ? Color.White : Color.FromArgb(239, 243, 248));
            e.Graphics.FillRectangle(bg, rect);
            TextRenderer.DrawText(e.Graphics, page.Text, new Font("Segoe UI Semibold", 9.5f), rect, selected ? Navy : Color.FromArgb(92, 104, 120), TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
            if (selected) using (var pen = new Pen(Cyan, 3)) e.Graphics.DrawLine(pen, rect.Left + 14, rect.Bottom - 2, rect.Right - 14, rect.Bottom - 2);
        };

        var current = new TabPage("01  CURRENT YEAR") { BackColor = Surface };
        var previous = new TabPage("02  PREVIOUS REFERENCE") { BackColor = Surface };
        var mapping = new TabPage("03  AI MAPPING") { BackColor = Surface };

        BuildCurrentTab(current);
        BuildPreviousTab(previous);
        BuildMappingTab(mapping);

        tabs.TabPages.Add(current);
        tabs.TabPages.Add(previous);
        tabs.TabPages.Add(mapping);
        Controls.Add(tabs);
        tabs.BringToFront();
    }

    private void BuildCurrentTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHero(panel, "Current-year source", "Upload the current audit report. The AI uses this as the primary evidence for current-year values.");

        var card = Card(960, 130);
        AddFileRow(card, "CURRENT AUDIT REPORT", currentPdf, PickCurrentPdf, 0);
        panel.Controls.Add(card);

        var analyze = PrimaryButton("ANALYSE CURRENT REPORT", 240);
        analyze.Location = new Point(25, 285);
        analyze.Click += async (_, _) => await AnalyzeCurrentAsync();
        panel.Controls.Add(analyze);

        var note = InfoCard("Accuracy rule", "The application will never treat a prior-year number as a current-year number. Prior-year data is used for structure and mapping; current-year evidence drives values.", 680);
        note.Location = new Point(285, 275);
        panel.Controls.Add(note);

        page.Controls.Add(panel);
    }

    private void BuildPreviousTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHero(panel, "Previous-year reference", "Teach the agent the exact XBRL structure, concepts, roles, dimensions and populated areas used last year.");

        var card = Card(960, 250);
        AddFileRow(card, "PREVIOUS YEAR XBRL / XML", previousXml, PickXml, 0);
        AddFileRow(card, "PREVIOUS YEAR FINANCIAL / XBRL PDF", previousPdf, PickPreviousPdf, 1);
        AddFileRow(card, "PREVIOUS YEAR AUDIT REPORT", previousAuditReport, PickPreviousAuditReport, 2);
        panel.Controls.Add(card);

        var build = PrimaryButton("BUILD REFERENCE MAP", 220);
        build.Location = new Point(25, 395);
        build.Click += (_, _) => AnalyzePreviousYear();
        panel.Controls.Add(build);

        var hint = InfoCard("Simple workflow", "These are the only four primary documents you need. Supporting documents can be added later without changing this main workflow.", 680);
        hint.Location = new Point(265, 385);
        panel.Controls.Add(hint);

        page.Controls.Add(panel);
    }

    private void BuildMappingTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHero(panel, "AI comparison & mapping", "Compare the previous-year structure with current-year evidence, then produce a reviewable mapping before any Gen XBRL write operation.");

        var toolbar = new Panel { Width = 960, Height = 58, BackColor = Color.White, Location = new Point(25, 112), Padding = new Padding(14) };
        var prepare = PrimaryButton("RUN AI MAPPING", 180);
        prepare.Location = new Point(14, 9);
        prepare.Click += async (_, _) => await RunAiMappingAsync();
        toolbar.Controls.Add(prepare);

        var connect = SecondaryButton("DETECT GEN XBRL", 160);
        connect.Location = new Point(205, 9);
        connect.Click += (_, _) => DetectGenXbrl();
        toolbar.Controls.Add(connect);

        aiStatus.AutoSize = false;
        aiStatus.Width = 520;
        aiStatus.Height = 32;
        aiStatus.Location = new Point(390, 13);
        aiStatus.Font = new Font("Segoe UI Semibold", 9);
        toolbar.Controls.Add(aiStatus);
        panel.Controls.Add(toolbar);

        analysis.Multiline = true;
        analysis.ScrollBars = ScrollBars.Both;
        analysis.ReadOnly = true;
        analysis.Font = new Font("Consolas", 9.5f);
        analysis.BackColor = Color.White;
        analysis.BorderStyle = BorderStyle.None;
        analysis.Location = new Point(25, 185);
        analysis.Size = new Size(960, 445);
        analysis.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Bottom;
        analysis.Text = "READY\r\n\r\n1. Build the previous-year reference map.\r\n2. Select the current-year audit report.\r\n3. Run AI mapping.\r\n4. Review exceptions before Gen XBRL automation.\r\n\r\nAI SAFETY\r\n• Previous-year values are not copied blindly.\r\n• Ambiguous mappings are marked REVIEW_REQUIRED.\r\n• Final write/import is kept behind validation.\r\n";
        panel.Controls.Add(analysis);

        page.Controls.Add(panel);

        progress.Dock = DockStyle.Bottom;
        progress.Minimum = 0;
        progress.Maximum = 100;
        progress.Height = 7;
        progress.Style = ProgressBarStyle.Continuous;
        panel.Controls.Add(progress);

        status.Text = "Ready";
        status.AutoSize = true;
        status.ForeColor = Color.FromArgb(92, 104, 120);
        status.Location = new Point(25, 645);
        panel.Controls.Add(status);
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
            Font = new Font("Segoe UI Semibold", 23, FontStyle.Bold),
            ForeColor = Navy,
            AutoSize = true,
            Location = new Point(25, 18)
        });
        parent.Controls.Add(new Label
        {
            Text = description,
            Font = new Font("Segoe UI", 10.5f),
            ForeColor = Color.FromArgb(93, 105, 121),
            AutoSize = false,
            Width = 900,
            Height = 48,
            Location = new Point(27, 59)
        });
    }

    private Panel Card(int width, int height) => new()
    {
        Width = width,
        Height = height,
        BackColor = Color.White,
        BorderStyle = BorderStyle.FixedSingle,
        Location = new Point(25, 125),
        Padding = new Padding(14)
    };

    private Panel InfoCard(string title, string text, int width)
    {
        var card = new Panel { Width = width, Height = 78, BackColor = Color.FromArgb(239, 249, 252), BorderStyle = BorderStyle.FixedSingle };
        card.Controls.Add(new Label { Text = title, Font = new Font("Segoe UI Semibold", 9), ForeColor = Blue, AutoSize = true, Location = new Point(14, 10) });
        card.Controls.Add(new Label { Text = text, Font = new Font("Segoe UI", 8.8f), ForeColor = Color.FromArgb(70, 86, 103), AutoSize = false, Width = width - 28, Height = 45, Location = new Point(14, 28) });
        return card;
    }

    private void AddFileRow(Control parent, string label, TextBox box, Action action, int index)
    {
        var row = new Panel { Width = parent.Width - 30, Height = 62, BackColor = Color.FromArgb(250, 251, 253), Location = new Point(14, 14 + (index * 72)) };
        row.Controls.Add(new Label { Text = label, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Color.FromArgb(75, 88, 105), AutoSize = false, Width = 170, Height = 28, Location = new Point(12, 17) });
        box.ReadOnly = true;
        box.BorderStyle = BorderStyle.FixedSingle;
        box.BackColor = Color.White;
        box.Location = new Point(190, 12);
        box.Width = parent.Width - 330;
        box.Height = 36;
        var pick = SecondaryButton("BROWSE", 105);
        pick.Location = new Point(parent.Width - 125, 12);
        pick.Click += (_, _) => action();
        row.Controls.Add(box);
        row.Controls.Add(pick);
        parent.Controls.Add(row);
    }

    private Button PrimaryButton(string text, int width) => new()
    {
        Text = text,
        Width = width,
        Height = 42,
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
        Height = 38,
        Font = new Font("Segoe UI Semibold", 8.5f),
        ForeColor = Navy,
        BackColor = Color.White,
        FlatStyle = FlatStyle.Flat,
        Cursor = Cursors.Hand
    };

    private void PickXml()
    {
        using var d = new OpenFileDialog { Title = "Select Previous Year XBRL XML", Filter = "XML files (*.xml)|*.xml|All files (*.*)|*.*" };
        if (d.ShowDialog() == DialogResult.OK) previousXml.Text = d.FileName;
    }

    private void PickCurrentPdf()
    {
        using var d = new OpenFileDialog { Title = "Select Current Year Audit Report PDF", Filter = "PDF files (*.pdf)|*.pdf|All files (*.*)|*.*" };
        if (d.ShowDialog() == DialogResult.OK) currentPdf.Text = d.FileName;
    }

    private void PickPreviousPdf()
    {
        using var d = new OpenFileDialog { Title = "Select Previous Year Financial / XBRL PDF", Filter = "PDF files (*.pdf)|*.pdf|All files (*.*)|*.*" };
        if (d.ShowDialog() == DialogResult.OK) previousPdf.Text = d.FileName;
    }

    private void PickPreviousAuditReport()
    {
        using var d = new OpenFileDialog { Title = "Select Previous Year Audit Report", Filter = "PDF, Word and text files (*.pdf;*.docx;*.doc;*.txt)|*.pdf;*.docx;*.doc;*.txt|All files (*.*)|*.*" };
        if (d.ShowDialog() == DialogResult.OK) previousAuditReport.Text = d.FileName;
    }

    private void AnalyzePreviousYear()
    {
        var source = previousXml.Text;

        if (string.IsNullOrWhiteSpace(source) || !File.Exists(source))
        {
            MessageBox.Show("Select the previous-year XBRL/XML first.", "Input required", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        try
        {
            progress.Value = 15;
            var doc = XDocument.Load(source, LoadOptions.PreserveWhitespace);
            var elements = doc.Descendants().Where(e => !e.HasElements).ToList();
            var cur = elements.Count(e => (string?)e.Attribute("Year") is "Cur_I" or "Cur_D");
            var pre = elements.Count(e => (string?)e.Attribute("Year") is "Pre_I" or "Pre_D");
            var dimensions = elements.Count(e => e.Attribute("Axis") != null || e.Attribute("Member") != null);

            analysis.Text = $"PREVIOUS-YEAR REFERENCE MAP\r\n=============================\r\n\r\nFile: {Path.GetFileName(source)}\r\nLeaf data elements: {elements.Count:N0}\r\nCurrent-period elements: {cur:N0}\r\nPrevious-period elements: {pre:N0}\r\nDimensional elements: {dimensions:N0}\r\n\r\nREFERENCE ENGINE\r\n✓ Concepts detected\r\n✓ Period structure detected\r\n✓ Dimension/member structure detected\r\n✓ Populated-field structure ready\r\n\r\nNEXT\r\n→ Select the current-year audit report\r\n→ Run AI Mapping\r\n→ Review REVIEW_REQUIRED items\r\n";
            progress.Value = 100;
            status.Text = "Previous-year reference map ready";
            status.ForeColor = Color.DarkGreen;
            tabs.SelectedIndex = 2;
        }
        catch (Exception ex)
        {
            progress.Value = 0;
            MessageBox.Show("Could not analyze the selected XBRL/XAG file.\r\n\r\n" + ex.Message, "Analysis error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private async Task AnalyzeCurrentAsync()
    {
        if (!File.Exists(currentPdf.Text))
        {
            MessageBox.Show("Select the current-year audit report PDF first.", "Input required", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        try
        {
            progress.Value = 10;
            var text = await Task.Run(() => DocumentService.ExtractPdfText(currentPdf.Text, 60000));
            progress.Value = 70;
            analysis.Text = $"CURRENT-YEAR AUDIT EXTRACTION\r\n==============================\r\n\r\nFile: {Path.GetFileName(currentPdf.Text)}\r\nExtracted characters: {text.Length:N0}\r\n\r\nPDF TEXT PREVIEW\r\n-----------------\r\n{text[..Math.Min(text.Length, 12000)]}";
            progress.Value = 100;
            status.Text = "Current-year audit report extracted";
            status.ForeColor = Color.DarkGreen;
            tabs.SelectedIndex = 2;
        }
        catch (Exception ex)
        {
            progress.Value = 0;
            MessageBox.Show("Could not extract text from the PDF.\r\n\r\n" + ex.Message, "PDF extraction error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private async Task RunAiMappingAsync()
    {
        if (!ai.IsConfigured)
        {
            ShowAiSettings();
            return;
        }

        if (!File.Exists(currentPdf.Text))
        {
            MessageBox.Show("Select the current-year audit report PDF first.", "Input required", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        var source = previousXml.Text;

        if (!File.Exists(source))
        {
            MessageBox.Show("Select the previous-year XBRL/XML first.", "Input required", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }
        if (!File.Exists(previousPdf.Text) || !File.Exists(previousAuditReport.Text))
        {
            MessageBox.Show("Select the previous-year financial/XBRL PDF and previous-year audit report as well.", "Input required", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        try
        {
            progress.Value = 10;
            var reference = await Task.Run(() => BuildReferenceSummary(source));
            progress.Value = 35;
            status.Text = "Uploading previous financial PDF to Gemini...";
            status.ForeColor = Blue;

            progress.Value = 45;
            status.Text = "Uploading previous audit report to Gemini...";

            progress.Value = 55;
            status.Text = "Uploading current audit report and analysing scanned pages...";

            var result = await ai.GenerateMappingAsync(
                reference,
                previousPdf.Text,
                previousAuditReport.Text,
                currentPdf.Text);

            progress.Value = 100;
            analysis.Text = result;
            status.Text = "AI mapping completed — review before any write/import";
            status.ForeColor = Color.DarkGreen;
        }
        catch (Exception ex)
        {
            progress.Value = 0;
            MessageBox.Show(ex.Message, "AI mapping error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private string BuildReferenceSummary(string source)
    {
        var doc = XDocument.Load(source, LoadOptions.PreserveWhitespace);
        var elements = doc.Descendants().Where(e => !e.HasElements).Take(3500).ToList();
        var lines = elements.Select(e =>
            $"{e.Name.LocalName} | Year={(string?)e.Attribute("Year")} | Role={(string?)e.Attribute("Role")} | Axis={(string?)e.Attribute("Axis")} | Member={(string?)e.Attribute("Member")} | Value={e.Value}");
        return string.Join(Environment.NewLine, lines);
    }

    private void ShowAiSettings()
    {
        using var dialog = new Form
        {
            Text = "XBRL AI — AI Settings",
            Width = 620,
            Height = 360,
            StartPosition = FormStartPosition.CenterParent,
            BackColor = Surface,
            FormBorderStyle = FormBorderStyle.FixedDialog,
            MaximizeBox = false,
            MinimizeBox = false
        };

        var title = new Label { Text = "AI Provider", Font = new Font("Segoe UI Semibold", 18, FontStyle.Bold), ForeColor = Navy, AutoSize = true, Location = new Point(28, 24) };
        dialog.Controls.Add(title);

        dialog.Controls.Add(new Label { Text = "Google Gemini API key", AutoSize = true, Location = new Point(30, 78), Font = new Font("Segoe UI Semibold", 9) });
        var key = new TextBox { Width = 530, Location = new Point(30, 102), UseSystemPasswordChar = true, Text = settings.GeminiApiKey };
        dialog.Controls.Add(key);

        dialog.Controls.Add(new Label { Text = "Model", AutoSize = true, Location = new Point(30, 150), Font = new Font("Segoe UI Semibold", 9) });
        var model = new ComboBox { Width = 530, Location = new Point(30, 174), DropDownStyle = ComboBoxStyle.DropDownList };
        model.Items.AddRange(new object[] { "gemini-2.5-flash", "gemini-2.5-flash-lite" });
        model.SelectedItem = settings.GeminiModel;
        if (model.SelectedIndex < 0) model.SelectedIndex = 0;
        dialog.Controls.Add(model);

        var save = PrimaryButton("SAVE & TEST CONNECTION", 220);
        save.Location = new Point(30, 230);
        save.Click += async (_, _) =>
        {
            settings.GeminiApiKey = key.Text.Trim();
            settings.GeminiModel = model.SelectedItem?.ToString() ?? "gemini-2.5-flash";
            settings.Save();
            try
            {
                var result = await ai.TestConnectionAsync();
                MessageBox.Show(result, "AI connection successful", MessageBoxButtons.OK, MessageBoxIcon.Information);
                dialog.DialogResult = DialogResult.OK;
                dialog.Close();
                UpdateAiStatus();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "AI connection failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
                UpdateAiStatus();
            }
        };
        dialog.Controls.Add(save);

        var privacy = new Label
        {
            Text = "API keys are stored locally in your Windows user profile.\r\nFor professional use, never hard-code a shared API key into the EXE.",
            AutoSize = false,
            Width = 530,
            Height = 45,
            Location = new Point(30, 285),
            ForeColor = Color.FromArgb(95, 105, 120)
        };
        dialog.Controls.Add(privacy);

        dialog.ShowDialog(this);
    }

    private void UpdateAiStatus()
    {
        aiStatus.Text = ai.IsConfigured
            ? $"● AI READY   {settings.GeminiModel}"
            : "○ AI NOT CONFIGURED   Add a Gemini API key in AI Settings";
        aiStatus.ForeColor = ai.IsConfigured ? Color.FromArgb(23, 143, 88) : Color.FromArgb(196, 125, 20);
    }

    private void DetectGenXbrl()
    {
        var candidates = new[] { @"C:\Program Files\SAG Infotech", @"C:\Program Files (x86)\SAG Infotech", @"M:\SAG Infotech" };
        var found = candidates.Where(Directory.Exists).ToArray();

        if (found.Length > 0)
            MessageBox.Show("SAG Infotech installation detected:\r\n\r\n" + string.Join("\r\n", found), "Gen XBRL detected", MessageBoxButtons.OK, MessageBoxIcon.Information);
        else
            MessageBox.Show("No known SAG Infotech installation directory was detected.", "Gen XBRL not detected", MessageBoxButtons.OK, MessageBoxIcon.Warning);
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
