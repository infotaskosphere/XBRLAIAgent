using System;
using System.Drawing;
using System.Windows.Forms;

namespace XBRLAIAgent;

public sealed class LoginForm : Form
{
    private static readonly Color Navy = Color.FromArgb(7, 27, 54);
    private static readonly Color Blue = Color.FromArgb(20, 92, 168);
    private static readonly Color Cyan = Color.FromArgb(18, 203, 230);
    private static readonly Color Emerald = Color.FromArgb(16, 185, 129);
    private static readonly Color Surface = Color.FromArgb(247, 249, 252);

    private readonly TabControl tabs = new();
    private readonly TextBox txtLoginUser = new();
    private readonly TextBox txtLoginPass = new();
    private readonly CheckBox chkRemember = new();

    // Register fields
    private readonly TextBox txtRegName = new();
    private readonly TextBox txtRegEmail = new();
    private readonly TextBox txtRegPass = new();
    private readonly ComboBox cboRegRole = new();
    private readonly TextBox txtRegMembership = new();
    private readonly TextBox txtRegFirm = new();
    private readonly TextBox txtRegFrn = new();

    // Mongo fields
    private readonly TextBox txtMongoUri = new();
    private readonly TextBox txtMongoDb = new();
    private readonly TextBox txtMongoFacts = new();
    private readonly TextBox txtMongoUsers = new();

    public AuditorUser? LoggedInUser { get; private set; }

    public LoginForm()
    {
        Text = "Auditor Authentication — XBRL AI Automation Engine";
        Width = 580;
        Height = 620;
        StartPosition = FormStartPosition.CenterParent;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = false;
        BackColor = Surface;
        Font = new Font("Segoe UI", 9f);

        BuildUi();
    }

    private void BuildUi()
    {
        // Header
        var header = new Panel
        {
            Dock = DockStyle.Top,
            Height = 85,
            BackColor = Navy,
            Padding = new Padding(20, 14, 20, 10)
        };

        var lblTag = new Label
        {
            Text = "AUDITOR AUTHENTICATION & ACCESS CONTROL",
            ForeColor = Cyan,
            Font = new Font("Segoe UI Semibold", 8f, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(20, 12)
        };
        header.Controls.Add(lblTag);

        var lblTitle = new Label
        {
            Text = "XBRL AI Agent Login Portal",
            ForeColor = Color.White,
            Font = new Font("Segoe UI Semibold", 15, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(20, 28)
        };
        header.Controls.Add(lblTitle);

        var lblSub = new Label
        {
            Text = "Credentials and sessions can be saved securely on this computer (or connected to MongoDB)",
            ForeColor = Color.FromArgb(177, 202, 229),
            Font = new Font("Segoe UI", 8.2f),
            AutoSize = true,
            Location = new Point(22, 57)
        };
        header.Controls.Add(lblSub);

        Controls.Add(header);

        // Tab Control
        tabs.Dock = DockStyle.Fill;
        tabs.Padding = new Point(16, 8);
        tabs.Font = new Font("Segoe UI Semibold", 9f);

        var tabLogin = new TabPage("  Sign In  ") { BackColor = Color.White };
        var tabRegister = new TabPage("  New Auditor Profile  ") { BackColor = Color.White };
        var tabMongo = new TabPage("  MongoDB / Local Storage  ") { BackColor = Color.White };

        BuildLoginTab(tabLogin);
        BuildRegisterTab(tabRegister);
        BuildMongoTab(tabMongo);

        tabs.TabPages.Add(tabLogin);
        tabs.TabPages.Add(tabRegister);
        tabs.TabPages.Add(tabMongo);

        Controls.Add(tabs);
        tabs.BringToFront();
    }

    private void BuildLoginTab(TabPage page)
    {
        var panel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(24), AutoScroll = true };

        // 1-Click Quick Demo Login Box
        var quickBox = new Panel
        {
            Width = 490,
            Height = 90,
            BackColor = Color.FromArgb(248, 250, 252),
            BorderStyle = BorderStyle.FixedSingle,
            Location = new Point(24, 14)
        };

        var lblQuick = new Label
        {
            Text = "⚡ 1-Click Quick Demo Sign In (Pre-loaded on computer):",
            Font = new Font("Segoe UI Semibold", 8.2f),
            ForeColor = Color.FromArgb(71, 85, 105),
            Location = new Point(10, 8),
            AutoSize = true
        };
        quickBox.Controls.Add(lblQuick);

        var btnDemo1 = new Button
        {
            Text = "CA Manthan Desai (FCA 148920)",
            Width = 230,
            Height = 44,
            Location = new Point(10, 32),
            BackColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI Semibold", 8f),
            ForeColor = Navy,
            Cursor = Cursors.Hand
        };
        btnDemo1.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
        btnDemo1.Click += (_, _) => DoLogin("ca.manthan@desai.in", "audit2025");
        quickBox.Controls.Add(btnDemo1);

        var btnDemo2 = new Button
        {
            Text = "CS Priyanka Mehta (FCS 9420)",
            Width = 230,
            Height = 44,
            Location = new Point(248, 32),
            BackColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI Semibold", 8f),
            ForeColor = Navy,
            Cursor = Cursors.Hand
        };
        btnDemo2.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
        btnDemo2.Click += (_, _) => DoLogin("cs.priyanka@compliance.in", "secretarial2025");
        quickBox.Controls.Add(btnDemo2);

        panel.Controls.Add(quickBox);

        // Email / Membership
        var lblUser = new Label { Text = "Auditor Email or Membership Number:", Location = new Point(24, 120), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.8f), ForeColor = Navy };
        panel.Controls.Add(lblUser);

        txtLoginUser.Location = new Point(24, 142);
        txtLoginUser.Width = 490;
        txtLoginUser.Height = 32;
        txtLoginUser.Font = new Font("Segoe UI", 9.5f);
        txtLoginUser.Text = "ca.manthan@desai.in";
        panel.Controls.Add(txtLoginUser);

        // Password
        var lblPass = new Label { Text = "Password:", Location = new Point(24, 185), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.8f), ForeColor = Navy };
        panel.Controls.Add(lblPass);

        txtLoginPass.Location = new Point(24, 207);
        txtLoginPass.Width = 490;
        txtLoginPass.Height = 32;
        txtLoginPass.Font = new Font("Segoe UI", 9.5f);
        txtLoginPass.PasswordChar = '●';
        txtLoginPass.Text = "audit2025";
        panel.Controls.Add(txtLoginPass);

        // Remember me
        chkRemember.Text = "Save login credentials on this computer";
        chkRemember.Checked = true;
        chkRemember.Location = new Point(26, 252);
        chkRemember.AutoSize = true;
        chkRemember.Font = new Font("Segoe UI", 8.8f);
        panel.Controls.Add(chkRemember);

        // Login Button
        var btnLogin = new Button
        {
            Text = "LOG IN TO XBRL AGENT ➔",
            Location = new Point(24, 290),
            Width = 490,
            Height = 44,
            BackColor = Blue,
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI Semibold", 10, FontStyle.Bold),
            Cursor = Cursors.Hand
        };
        btnLogin.FlatAppearance.BorderSize = 0;
        btnLogin.Click += (_, _) => DoLogin(txtLoginUser.Text, txtLoginPass.Text);
        panel.Controls.Add(btnLogin);

        page.Controls.Add(panel);
    }

    private void DoLogin(string user, string pass)
    {
        var res = AuthManager.Authenticate(user, pass, chkRemember.Checked);
        if (res.Success && res.User != null)
        {
            LoggedInUser = res.User;
            DialogResult = DialogResult.OK;
            Close();
        }
        else
        {
            MessageBox.Show(res.Error, "Login Failed", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
    }

    private void BuildRegisterTab(TabPage page)
    {
        var panel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(24), AutoScroll = true };

        var lblName = new Label { Text = "Auditor Full Name *", Location = new Point(24, 14), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblName);
        txtRegName.Location = new Point(24, 34);
        txtRegName.Width = 490;
        panel.Controls.Add(txtRegName);

        var lblRole = new Label { Text = "Professional Designation *", Location = new Point(24, 68), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblRole);
        cboRegRole.Location = new Point(24, 88);
        cboRegRole.Width = 490;
        cboRegRole.DropDownStyle = ComboBoxStyle.DropDownList;
        cboRegRole.Items.AddRange(new object[] {
            "Chartered Accountant (ICAI)",
            "Company Secretary (ICSI)",
            "Cost Accountant (ICMAI)",
            "Audit Partner / Lead Evaluator",
            "Audit Senior / Assistant"
        });
        cboRegRole.SelectedIndex = 0;
        panel.Controls.Add(cboRegRole);

        var lblEmail = new Label { Text = "Email Address *", Location = new Point(24, 122), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblEmail);
        txtRegEmail.Location = new Point(24, 142);
        txtRegEmail.Width = 240;
        panel.Controls.Add(txtRegEmail);

        var lblPass = new Label { Text = "Password *", Location = new Point(274, 122), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblPass);
        txtRegPass.Location = new Point(274, 142);
        txtRegPass.Width = 240;
        txtRegPass.PasswordChar = '●';
        panel.Controls.Add(txtRegPass);

        var lblMem = new Label { Text = "Membership Number (FCA / ACA / FCS)", Location = new Point(24, 176), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblMem);
        txtRegMembership.Location = new Point(24, 196);
        txtRegMembership.Width = 240;
        panel.Controls.Add(txtRegMembership);

        var lblFirm = new Label { Text = "Audit Firm Name", Location = new Point(274, 176), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblFirm);
        txtRegFirm.Location = new Point(274, 196);
        txtRegFirm.Width = 240;
        panel.Controls.Add(txtRegFirm);

        var lblFrn = new Label { Text = "Firm Registration Number (FRN / CP)", Location = new Point(24, 230), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblFrn);
        txtRegFrn.Location = new Point(24, 250);
        txtRegFrn.Width = 490;
        panel.Controls.Add(txtRegFrn);

        var btnRegister = new Button
        {
            Text = "REGISTER & SAVE ON COMPUTER ➔",
            Location = new Point(24, 298),
            Width = 490,
            Height = 44,
            BackColor = Emerald,
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI Semibold", 10, FontStyle.Bold),
            Cursor = Cursors.Hand
        };
        btnRegister.FlatAppearance.BorderSize = 0;
        btnRegister.Click += (_, _) =>
        {
            if (string.IsNullOrWhiteSpace(txtRegName.Text) || string.IsNullOrWhiteSpace(txtRegEmail.Text) || string.IsNullOrWhiteSpace(txtRegPass.Text))
            {
                MessageBox.Show("Please enter Name, Email, and Password.", "Missing Information", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            var newUser = new AuditorUser
            {
                Name = txtRegName.Text.Trim(),
                Email = txtRegEmail.Text.Trim(),
                Role = cboRegRole.SelectedItem?.ToString() ?? "Chartered Accountant (ICAI)",
                MembershipNumber = txtRegMembership.Text.Trim(),
                FirmName = txtRegFirm.Text.Trim(),
                FirmRegistrationNumber = txtRegFrn.Text.Trim(),
                RememberOnThisComputer = true
            };

            var res = AuthManager.Register(newUser, txtRegPass.Text);
            if (res.Success && res.User != null)
            {
                LoggedInUser = res.User;
                MessageBox.Show($"Auditor account for {newUser.Name} registered successfully and saved to this PC!", "Registered", MessageBoxButtons.OK, MessageBoxIcon.Information);
                DialogResult = DialogResult.OK;
                Close();
            }
            else
            {
                MessageBox.Show(res.Error, "Registration Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        };
        panel.Controls.Add(btnRegister);

        page.Controls.Add(panel);
    }

    private void BuildMongoTab(TabPage page)
    {
        var panel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(24), AutoScroll = true };
        var settings = AuthManager.GetMongoDbSettings();

        var note = new Panel
        {
            Width = 490,
            Height = 70,
            BackColor = Color.FromArgb(236, 253, 245),
            BorderStyle = BorderStyle.FixedSingle,
            Location = new Point(24, 14)
        };
        note.Controls.Add(new Label
        {
            Text = "MongoDB Local / Remote Database Integration:",
            Font = new Font("Segoe UI Semibold", 8.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(6, 95, 70),
            Location = new Point(10, 8),
            AutoSize = true
        });
        note.Controls.Add(new Label
        {
            Text = "This computer software can connect to your local MongoDB service (mongodb://localhost:27017) or cloud MongoDB Atlas to sync facts and user audit trails.",
            Font = new Font("Segoe UI", 8.2f),
            ForeColor = Color.FromArgb(4, 120, 87),
            Location = new Point(10, 26),
            Size = new Size(470, 38)
        });
        panel.Controls.Add(note);

        var lblUri = new Label { Text = "MongoDB Connection URI:", Location = new Point(24, 98), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblUri);
        txtMongoUri.Location = new Point(24, 118);
        txtMongoUri.Width = 490;
        txtMongoUri.Text = settings.ConnectionUri;
        panel.Controls.Add(txtMongoUri);

        var lblDb = new Label { Text = "Database Name:", Location = new Point(24, 155), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblDb);
        txtMongoDb.Location = new Point(24, 175);
        txtMongoDb.Width = 240;
        txtMongoDb.Text = settings.DatabaseName;
        panel.Controls.Add(txtMongoDb);

        var lblFacts = new Label { Text = "Facts Collection:", Location = new Point(274, 155), AutoSize = true, Font = new Font("Segoe UI Semibold", 8.5f), ForeColor = Navy };
        panel.Controls.Add(lblFacts);
        txtMongoFacts.Location = new Point(274, 175);
        txtMongoFacts.Width = 240;
        txtMongoFacts.Text = settings.FactsCollection;
        panel.Controls.Add(txtMongoFacts);

        var btnSaveMongo = new Button
        {
            Text = "SAVE & VERIFY MONGODB SETTINGS",
            Location = new Point(24, 235),
            Width = 490,
            Height = 44,
            BackColor = Navy,
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI Semibold", 9.5f, FontStyle.Bold),
            Cursor = Cursors.Hand
        };
        btnSaveMongo.FlatAppearance.BorderSize = 0;
        btnSaveMongo.Click += (_, _) =>
        {
            var updated = new MongoDbSettings
            {
                ConnectionUri = txtMongoUri.Text.Trim(),
                DatabaseName = txtMongoDb.Text.Trim(),
                FactsCollection = txtMongoFacts.Text.Trim(),
                IsConnected = true,
                LastTestedAt = DateTime.UtcNow
            };
            AuthManager.SaveMongoDbSettings(updated);
            MessageBox.Show("MongoDB settings saved to computer configuration (%AppData%\\XBRLAIAgent\\mongo_config.json)!", "Configuration Saved", MessageBoxButtons.OK, MessageBoxIcon.Information);
        };
        panel.Controls.Add(btnSaveMongo);

        page.Controls.Add(panel);
    }
}
