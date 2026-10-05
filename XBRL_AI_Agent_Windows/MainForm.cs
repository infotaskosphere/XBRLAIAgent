using System;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using System.Xml.Linq;

namespace XBRLAIAgent;

public sealed class MainForm : Form
{
    private readonly TabControl tabs = new();
    private readonly TextBox previousXml = new();
    private readonly TextBox previousPdf = new();
    private readonly TextBox previousSagData = new();
    private readonly TextBox currentPdf = new();
    private readonly Label status = new();
    private readonly TextBox analysis = new();
    private readonly ProgressBar progress = new();

    public MainForm()
    {
        Text = "XBRL AI Agent"; Width = 1050; Height = 720; MinimumSize = new Size(900, 620);
        StartPosition = FormStartPosition.CenterScreen; BackColor = Color.FromArgb(245, 247, 251);
        BuildHeader(); BuildTabs();
    }

    private void BuildHeader()
    {
        var header = new Panel { Dock = DockStyle.Top, Height = 92, BackColor = Color.FromArgb(13, 59, 102) };
        header.Controls.Add(new Label { Text = "XBRL AI AGENT", ForeColor = Color.White, Font = new Font("Segoe UI", 22, FontStyle.Bold), AutoSize = true, Location = new Point(28, 15) });
        header.Controls.Add(new Label { Text = "AI-assisted preparation and automation for Gen XBRL", ForeColor = Color.FromArgb(220, 238, 255), Font = new Font("Segoe UI", 10), AutoSize = true, Location = new Point(30, 56) });
        Controls.Add(header);
    }

    private void BuildTabs()
    {
        tabs.Dock = DockStyle.Fill; tabs.Padding = new Point(16, 8);
        var current = new TabPage("Current Year") { BackColor = BackColor };
        var previous = new TabPage("Previous Year Reference") { BackColor = BackColor };
        var mapping = new TabPage("AI Comparison & Mapping") { BackColor = BackColor };
        BuildCurrentTab(current); BuildPreviousTab(previous); BuildMappingTab(mapping);
        tabs.TabPages.Add(current); tabs.TabPages.Add(previous); tabs.TabPages.Add(mapping);
        Controls.Add(tabs); tabs.BringToFront();
    }

    private void BuildCurrentTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHeading(panel, "Current Year Documents", "Upload the current-year audit report. This becomes the primary source for current-year values.");
        AddFileRow(panel, "Current Audit Report PDF", currentPdf, PickPdf);
        var analyze = Button("ANALYSE CURRENT YEAR", Color.FromArgb(31, 111, 178));
        analyze.Click += (_, _) => { if (!File.Exists(currentPdf.Text)) { MessageBox.Show("Select the current audit report PDF first.", "Input required", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; } status.Text = "Status: Current audit report ready for extraction"; status.ForeColor = Color.DarkGreen; tabs.SelectedIndex = 2; };
        panel.Controls.Add(analyze); page.Controls.Add(panel);
    }

    private void BuildPreviousTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHeading(panel, "Previous Year Reference", "The agent uses previous-year data to learn concepts, roles, dimensions, populated fields and mapping structure.");
        AddFileRow(panel, "Previous Year XBRL XML", previousXml, PickXml);
        AddFileRow(panel, "Previous Year Audit Report PDF", previousPdf, PickPdf);
        AddFileRow(panel, "Previous Year SAG Data / XAG / ZIP", previousSagData, PickSagData);
        var build = Button("BUILD PREVIOUS-YEAR REFERENCE", Color.FromArgb(13, 59, 102));
        build.Click += (_, _) => AnalyzePreviousYear(); panel.Controls.Add(build);
        status.Text = "Status: Previous-year reference not analyzed"; status.ForeColor = Color.DimGray; panel.Controls.Add(status);
        panel.Controls.Add(new Label { Text = "The agent will not blindly copy old values. It will use the old structure as a mapping/reference and determine what needs to change for the current year.", AutoSize = false, Width = 900, Height = 55, Font = new Font("Segoe UI", 9), ForeColor = Color.DimGray, Padding = new Padding(12), BackColor = Color.White });
        page.Controls.Add(panel);
    }

    private void BuildMappingTab(TabPage page)
    {
        var panel = NewContentPanel();
        AddHeading(panel, "AI Comparison & Mapping", "This stage compares the previous-year XBRL structure with current-year extracted information.");
        analysis.Multiline = true; analysis.ScrollBars = ScrollBars.Both; analysis.ReadOnly = true; analysis.Font = new Font("Consolas", 10); analysis.Dock = DockStyle.Fill; analysis.BackColor = Color.White;
        analysis.Text = "Waiting for analysis...\r\n\r\nPlanned engine:\r\n  Previous XBRL/XAG  -> concepts, periods, roles, dimensions, values\r\n  Current audit PDF  -> current financial data\r\n  Comparison          -> reusable mappings + changed/new items\r\n  Validation          -> exceptions requiring professional review\r\n  SAG connector       -> prepare/import verified data into Gen XBRL\r\n";
        panel.Controls.Add(analysis);
        var bottom = new FlowLayoutPanel { Dock = DockStyle.Bottom, Height = 64, FlowDirection = FlowDirection.LeftToRight, Padding = new Padding(0, 12, 0, 0) };
        var prepare = Button("PREPARE GEN XBRL AUTOMATION", Color.FromArgb(31, 175, 90)); prepare.Click += (_, _) => PrepareAutomation();
        var connect = Button("DETECT GEN XBRL", Color.FromArgb(31, 111, 178)); connect.Click += (_, _) => DetectGenXbrl();
        bottom.Controls.Add(prepare); bottom.Controls.Add(connect); panel.Controls.Add(bottom);
        progress.Dock = DockStyle.Bottom; progress.Minimum = 0; progress.Maximum = 100; progress.Value = 0; progress.Height = 18; panel.Controls.Add(progress);
        page.Controls.Add(panel);
    }

    private Panel NewContentPanel() => new() { Dock = DockStyle.Fill, Padding = new Padding(25), AutoScroll = true };

    private void AddHeading(Control parent, string heading, string description)
    {
        parent.Controls.Add(new Label { Text = heading, Font = new Font("Segoe UI", 17, FontStyle.Bold), ForeColor = Color.FromArgb(13, 59, 102), AutoSize = true, Location = new Point(25, 20) });
        parent.Controls.Add(new Label { Text = description, Font = new Font("Segoe UI", 9), ForeColor = Color.DimGray, AutoSize = false, Width = 850, Height = 42, Location = new Point(25, 55) });
    }

    private void AddFileRow(Control parent, string label, TextBox box, Action action)
    {
        var row = new Panel { Width = 900, Height = 58, BackColor = Color.White };
        var y = 110; foreach (Control c in parent.Controls) if (c is Panel) y += 68; row.Location = new Point(25, y);
        row.Controls.Add(new Label { Text = label, Font = new Font("Segoe UI", 10, FontStyle.Bold), AutoSize = false, Width = 245, Height = 30, Location = new Point(12, 15) });
        box.ReadOnly = true; box.Location = new Point(260, 10); box.Width = 520; box.Height = 34;
        var pick = new Button { Text = "SELECT", Width = 90, Height = 34, Location = new Point(790, 10), BackColor = Color.FromArgb(232, 238, 245), ForeColor = Color.FromArgb(13, 59, 102), FlatStyle = FlatStyle.Flat };
        pick.Click += (_, _) => action(); row.Controls.Add(box); row.Controls.Add(pick); parent.Controls.Add(row);
    }

    private Button Button(string text, Color color) => new() { Text = text, AutoSize = true, Height = 42, Padding = new Padding(18, 8, 18, 8), Font = new Font("Segoe UI", 10, FontStyle.Bold), ForeColor = Color.White, BackColor = color, FlatStyle = FlatStyle.Flat, Margin = new Padding(0, 18, 12, 10) };

    private void PickXml()
    {
        using var d = new OpenFileDialog { Title = "Select Previous Year XBRL XML", Filter = "XML files (*.xml)|*.xml|All files (*.*)|*.*" };
        if (d.ShowDialog() == DialogResult.OK) previousXml.Text = d.FileName;
    }

    private void PickPdf()
    {
        using var d = new OpenFileDialog { Title = "Select Audit Report PDF", Filter = "PDF files (*.pdf)|*.pdf|All files (*.*)|*.*" };
        if (d.ShowDialog() == DialogResult.OK) { if (tabs.SelectedIndex == 0) currentPdf.Text = d.FileName; else previousPdf.Text = d.FileName; }
    }

    private void PickSagData()
    {
        using var d = new OpenFileDialog { Title = "Select Previous Year SAG Data", Filter = "SAG packages (*.zip;*.xag;*.gbt)|*.zip;*.xag;*.gbt|All files (*.*)|*.*" };
        if (d.ShowDialog() == DialogResult.OK) previousSagData.Text = d.FileName;
    }

    private void AnalyzePreviousYear()
    {
        var source = File.Exists(previousSagData.Text) ? previousSagData.Text : previousXml.Text;
        if (string.IsNullOrWhiteSpace(source) || !File.Exists(source)) { MessageBox.Show("Select the previous XBRL XML or SAG/XAG data first.", "Input required", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
        try
        {
            progress.Value = 10; string text;
            if (Path.GetExtension(source).Equals(".xag", StringComparison.OrdinalIgnoreCase) || Path.GetExtension(source).Equals(".xml", StringComparison.OrdinalIgnoreCase))
            {
                var doc = XDocument.Load(source, LoadOptions.PreserveWhitespace);
                var elements = doc.Descendants().Where(e => !e.HasElements).ToList();
                var cur = elements.Count(e => (string?)e.Attribute("Year") is "Cur_I" or "Cur_D");
                var pre = elements.Count(e => (string?)e.Attribute("Year") is "Pre_I" or "Pre_D");
                var dimensions = elements.Count(e => e.Attribute("Axis") != null || e.Attribute("Member") != null);
                text = $"PREVIOUS-YEAR STRUCTURE ANALYSIS\r\n================================\r\n\r\nFile: {Path.GetFileName(source)}\r\nLeaf data elements: {elements.Count:N0}\r\nCurrent-period elements: {cur:N0}\r\nPrevious-period elements: {pre:N0}\r\nDimensional elements: {dimensions:N0}\r\n\r\nNext engine:\r\n  • Build concept map\r\n  • Build role map\r\n  • Build dimension/member map\r\n  • Link populated rows to source concepts\r\n  • Compare against current-year extracted values\r\n"; progress.Value = 65;
            }
            else { text = "The selected SAG package is not a directly readable XML/XAG file. It will be handled by the SAG package adapter in the next connector phase."; progress.Value = 40; }
            analysis.Text = text; progress.Value = 100; tabs.SelectedIndex = 2; status.Text = "Status: Previous-year reference analyzed"; status.ForeColor = Color.DarkGreen;
        }
        catch (Exception ex) { progress.Value = 0; MessageBox.Show("Could not analyze the selected XBRL/XAG file.\r\n\r\n" + ex.Message, "Analysis error", MessageBoxButtons.OK, MessageBoxIcon.Error); }
    }

    private void PrepareAutomation()
    {
        if (!File.Exists(previousXml.Text) && !File.Exists(previousSagData.Text)) { MessageBox.Show("Select previous-year XBRL XML or SAG data first.", "Input required", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
        analysis.AppendText("\r\n\r\nAUTOMATION STATUS\r\n=================\r\n✓ Previous-year reference loaded\r\n✓ Mapping stage initialized\r\n→ Current-year PDF extraction is the next engine\r\n→ XAG generation follows extraction and validation\r\n→ Gen XBRL import/verification follows XAG generation\r\n");
    }

    private void DetectGenXbrl()
    {
        var candidates = new[] { @"C:\Program Files\SAG Infotech", @"C:\Program Files (x86)\SAG Infotech", @"M:\SAG Infotech" };
        var found = candidates.Where(Directory.Exists).ToArray();
        if (found.Length > 0) MessageBox.Show("SAG Infotech installation detected:\r\n\r\n" + string.Join("\r\n", found), "Gen XBRL detected", MessageBoxButtons.OK, MessageBoxIcon.Information);
        else MessageBox.Show("No known SAG Infotech installation directory was detected.", "Gen XBRL not detected", MessageBoxButtons.OK, MessageBoxIcon.Warning);
    }
}