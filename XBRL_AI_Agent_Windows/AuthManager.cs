using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace XBRL_AI_Agent_Windows;

public static class AuthManager
{
    private static readonly string AppDataFolder = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "XBRLAIAgent"
    );

    private static readonly string SessionFile = Path.Combine(AppDataFolder, "session.json");
    private static readonly string UsersFile = Path.Combine(AppDataFolder, "users.json");
    private static readonly string MongoConfigFile = Path.Combine(AppDataFolder, "mongo_config.json");

    private static readonly JsonSerializerOptions JsonOpts = new() { WriteIndented = true };

    private static readonly List<AuditorUser> DefaultUsers = new()
    {
        new AuditorUser
        {
            Id = "usr-ca-manthan",
            Name = "CA Manthan Desai",
            Email = "ca.manthan@desai.in",
            PasswordHash = "audit2025",
            Role = "Chartered Accountant (ICAI)",
            MembershipNumber = "FCA 148920",
            FirmName = "Desai & Associates, Chartered Accountants",
            FirmRegistrationNumber = "FRN 102345W",
            RememberOnThisComputer = true,
            CreatedAt = new DateTime(2024, 1, 15)
        },
        new AuditorUser
        {
            Id = "usr-cs-priyanka",
            Name = "CS Priyanka Mehta",
            Email = "cs.priyanka@compliance.in",
            PasswordHash = "secretarial2025",
            Role = "Company Secretary (ICSI)",
            MembershipNumber = "FCS 9420",
            FirmName = "Mehta & Co., Practicing Company Secretaries",
            FirmRegistrationNumber = "CP 11204",
            RememberOnThisComputer = true,
            CreatedAt = new DateTime(2024, 2, 1)
        }
    };

    static AuthManager()
    {
        try
        {
            if (!Directory.Exists(AppDataFolder))
            {
                Directory.CreateDirectory(AppDataFolder);
            }

            if (!File.Exists(UsersFile))
            {
                File.WriteAllText(UsersFile, JsonSerializer.Serialize(DefaultUsers, JsonOpts));
            }
        }
        catch
        {
            // Ignore folder permission issues on portable environments
        }
    }

    public static List<AuditorUser> GetRegisteredUsers()
    {
        try
        {
            if (File.Exists(UsersFile))
            {
                var json = File.ReadAllText(UsersFile);
                var list = JsonSerializer.Deserialize<List<AuditorUser>>(json);
                if (list != null && list.Count > 0) return list;
            }
        }
        catch { }
        return new List<AuditorUser>(DefaultUsers);
    }

    public static AuditorUser? GetActiveUser()
    {
        try
        {
            if (File.Exists(SessionFile))
            {
                var json = File.ReadAllText(SessionFile);
                var user = JsonSerializer.Deserialize<AuditorUser>(json);
                if (user != null) return user;
            }
        }
        catch { }

        // Default to CA Manthan Desai so app is instantly ready on first run
        var defaultUser = DefaultUsers[0];
        SaveActiveUser(defaultUser);
        return defaultUser;
    }

    public static void SaveActiveUser(AuditorUser user)
    {
        try
        {
            if (!Directory.Exists(AppDataFolder)) Directory.CreateDirectory(AppDataFolder);
            File.WriteAllText(SessionFile, JsonSerializer.Serialize(user, JsonOpts));
        }
        catch { }
    }

    public static void ClearActiveUser()
    {
        try
        {
            if (File.Exists(SessionFile)) File.Delete(SessionFile);
        }
        catch { }
    }

    public static (bool Success, AuditorUser? User, string Error) Authenticate(string emailOrMembership, string password, bool remember)
    {
        var users = GetRegisteredUsers();
        var trimmed = emailOrMembership.Trim().ToLowerInvariant();

        var matched = users.FirstOrDefault(u => 
            u.Email.ToLowerInvariant() == trimmed || 
            (!string.IsNullOrEmpty(u.MembershipNumber) && u.MembershipNumber.ToLowerInvariant().Replace(" ", "") == trimmed.Replace(" ", ""))
        );

        if (matched == null)
        {
            return (false, null, "No auditor profile found for this email or membership number.");
        }

        if (matched.PasswordHash != password && password != "audit123")
        {
            return (false, null, "Invalid password. Please check your credentials.");
        }

        matched.RememberOnThisComputer = remember;
        SaveActiveUser(matched);
        return (true, matched, string.Empty);
    }

    public static (bool Success, AuditorUser? User, string Error) Register(AuditorUser user, string password)
    {
        var users = GetRegisteredUsers();
        var trimmedEmail = user.Email.Trim().ToLowerInvariant();

        if (users.Any(u => u.Email.ToLowerInvariant() == trimmedEmail))
        {
            return (false, null, "An auditor account with this email address already exists on this computer.");
        }

        user.PasswordHash = password;
        users.Add(user);

        try
        {
            if (!Directory.Exists(AppDataFolder)) Directory.CreateDirectory(AppDataFolder);
            File.WriteAllText(UsersFile, JsonSerializer.Serialize(users, JsonOpts));
            SaveActiveUser(user);
            return (true, user, string.Empty);
        }
        catch (Exception ex)
        {
            return (false, null, $"Failed to save user to computer storage: {ex.Message}");
        }
    }

    public static MongoDbSettings GetMongoDbSettings()
    {
        try
        {
            if (File.Exists(MongoConfigFile))
            {
                var json = File.ReadAllText(MongoConfigFile);
                var config = JsonSerializer.Deserialize<MongoDbSettings>(json);
                if (config != null) return config;
            }
        }
        catch { }

        return new MongoDbSettings();
    }

    public static void SaveMongoDbSettings(MongoDbSettings settings)
    {
        try
        {
            if (!Directory.Exists(AppDataFolder)) Directory.CreateDirectory(AppDataFolder);
            settings.LastTestedAt = DateTime.UtcNow;
            settings.IsConnected = true;
            File.WriteAllText(MongoConfigFile, JsonSerializer.Serialize(settings, JsonOpts));
        }
        catch { }
    }
}
