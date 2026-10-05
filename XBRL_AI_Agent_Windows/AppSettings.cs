using System;
using System.IO;
using System.Text.Json;

namespace XBRLAIAgent;

public sealed class AppSettings
{
    public string AiProvider { get; set; } = "Google Gemini";

    public string GeminiApiKey { get; set; } = "";
    public string GeminiModel { get; set; } = "gemini-2.5-flash";

    public string OpenAiApiKey { get; set; } = "";
    public string OpenAiModel { get; set; } = "gpt-4.1-mini";

    public string AnthropicApiKey { get; set; } = "";
    public string AnthropicModel { get; set; } = "claude-sonnet-4-20250514";

    public bool UseLocalFallback { get; set; } = true;

    private static string FilePath =>
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "XBRLAIAgent", "settings.json");

    public string ActiveApiKey => AiProvider switch
    {
        "OpenAI" => OpenAiApiKey,
        "Anthropic" => AnthropicApiKey,
        _ => GeminiApiKey
    };

    public string ActiveModel => AiProvider switch
    {
        "OpenAI" => OpenAiModel,
        "Anthropic" => AnthropicModel,
        _ => GeminiModel
    };

    public static AppSettings Load()
    {
        try
        {
            if (!File.Exists(FilePath)) return new AppSettings();
            return JsonSerializer.Deserialize<AppSettings>(File.ReadAllText(FilePath)) ?? new AppSettings();
        }
        catch
        {
            return new AppSettings();
        }
    }

    public void Save()
    {
        var dir = Path.GetDirectoryName(FilePath)!;
        Directory.CreateDirectory(dir);
        File.WriteAllText(FilePath, JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true }));
    }
}
