using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace XBRLAIAgent;

public sealed class GeminiAiService
{
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromMinutes(3) };
    private readonly AppSettings settings;

    public GeminiAiService(AppSettings settings) => this.settings = settings;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(settings.GeminiApiKey);

    public async Task<string> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("Gemini API key is not configured. Open AI Settings and add your free Google AI Studio API key.");

        return await GenerateAsync(
            "Return exactly this text and nothing else: XBRL AI connection successful.",
            cancellationToken);
    }

    public async Task<string> GenerateMappingAsync(string previousReference, string previousFinancialText, string previousAuditText, string currentAuditText, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("Gemini API key is not configured.");

        var prompt = """
You are the mapping assistant inside a professional Gen XBRL preparation application.

IMPORTANT RULES:
1. Do not invent financial values.
2. Treat the previous-year XBRL/XAG as the structural reference, not as a source for blindly copying current-year values.
3. Prefer exact concepts, roles, periods, dimensions and members already present in the previous-year structure.
4. Use the previous-year financial/XBRL PDF and previous-year audit report to understand prior disclosures, terminology and exceptions.
5. Current-year audit text is the primary source for current-year financial values.
6. If evidence is missing or ambiguous, mark the item REVIEW_REQUIRED.
7. Never resolve conflicting source values by guessing. Report the conflict and source.
8. Return concise, structured results that a validation engine can inspect.

Return these sections:
A) CONFIRMED MAPPINGS
B) CHANGED VALUES
C) NEW / MISSING ITEMS
D) REVIEW_REQUIRED
E) SAFETY NOTES

PREVIOUS-YEAR REFERENCE:
""" + previousReference + """

PREVIOUS-YEAR FINANCIAL / XBRL PDF TEXT:
""" + previousFinancialText + """

PREVIOUS-YEAR AUDIT REPORT TEXT:
""" + previousAuditText + """

CURRENT-YEAR AUDIT REPORT TEXT:
""" + currentAuditText;

        return await GenerateAsync(prompt, cancellationToken);
    }

    private async Task<string> GenerateAsync(string prompt, CancellationToken cancellationToken)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(settings.GeminiModel)}:generateContent?key={Uri.EscapeDataString(settings.GeminiApiKey)}";

        var payload = new
        {
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[] { new { text = prompt } }
                }
            },
            generationConfig = new
            {
                temperature = 0.1,
                maxOutputTokens = 12000
            }
        };

        using var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var response = await Http.PostAsync(url, content, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Gemini API returned {(int)response.StatusCode}: {body}");

        using var json = JsonDocument.Parse(body);
        var root = json.RootElement;

        var text = root
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return text ?? "";
    }
}
