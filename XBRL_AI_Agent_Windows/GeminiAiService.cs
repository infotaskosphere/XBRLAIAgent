using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace XBRLAIAgent;

public sealed class GeminiAiService
{
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromMinutes(5) };
    private readonly AppSettings settings;

    public GeminiAiService(AppSettings settings) => this.settings = settings;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(settings.ActiveApiKey);

    public async Task<string> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("Gemini API key is not configured. Open AI Settings and add your free Google AI Studio API key.");

        return await GenerateAsync(
            "Return exactly this text and nothing else: XBRL AI connection successful.",
            cancellationToken);
    }

    public async Task<string> GenerateMappingAsync(
        string previousReference,
        string previousFinancialPdf,
        string previousAuditPdf,
        IReadOnlyList<string> currentPdfPaths,
        CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("Gemini API key is not configured.");

        var uploaded = new List<(string Name, string Uri)>();

        try
        {
            uploaded.Add(await UploadPdfAsync(previousFinancialPdf, cancellationToken));
            uploaded.Add(await UploadPdfAsync(previousAuditPdf, cancellationToken));

            foreach (var currentPdf in currentPdfPaths.Where(File.Exists).Distinct(StringComparer.OrdinalIgnoreCase))
                uploaded.Add(await UploadPdfAsync(currentPdf, cancellationToken));

            var documentList = new List<string>
            {
                "1. PREVIOUS-YEAR FINANCIAL / XBRL PDF — reference evidence only.",
                "2. PREVIOUS-YEAR AUDIT REPORT — reference evidence only."
            };

            for (var i = 0; i < currentPdfPaths.Count; i++)
            {
                if (File.Exists(currentPdfPaths[i]))
                    documentList.Add($"{documentList.Count + 1}. CURRENT-YEAR DOCUMENT — primary current-year evidence: {Path.GetFileName(currentPdfPaths[i])}");
            }

            var prompt = """
You are the mapping assistant inside a professional Gen XBRL preparation application.

The attached PDFs are the source documents listed below.

DOCUMENT ROLES:
""" + string.Join(Environment.NewLine, documentList) + """

IMPORTANT RULES:
1. Do not invent financial values.
2. Treat the previous-year XBRL/XAG text below as the structural reference, not as a source for blindly copying current-year values.
3. Prefer exact concepts, roles, periods, dimensions and members already present in the previous-year structure.
4. Use previous-year documents to understand prior disclosures, terminology and exceptions.
5. Every CURRENT-YEAR document is evidence for the current year. If current-year documents disagree, report the conflict instead of guessing.
6. Use the attached PDF pages directly, including scanned/image-based tables.
7. When reporting a value, identify the document and page where it was found whenever possible.
8. If evidence is missing or ambiguous, mark the item REVIEW_REQUIRED.
9. Never resolve conflicting source values by guessing. Report the conflict and the source/page.
10. Do not claim that a value is confirmed merely because it appeared in the previous year.
11. Do not generate or alter XBRL XML in this step. Produce a reviewable mapping only.
12. Do not repeat the entire previous-year reference. Return only useful mappings, changes, new/missing items, conflicts and exceptions.

Return these sections:
A) CONFIRMED MAPPINGS
B) CHANGED VALUES
C) NEW / MISSING ITEMS
D) REVIEW_REQUIRED
E) SOURCE CONFLICTS
F) SAFETY NOTES

For each important mapping, use:
Concept | Role | Period | Dimension/Member | Previous Value | Current Value | Source Document | Page | Status

PREVIOUS-YEAR XBRL/XAG STRUCTURAL REFERENCE:
""" + previousReference;

            return await GenerateWithFilesAsync(prompt, uploaded, cancellationToken);
        }
        finally
        {
            foreach (var file in uploaded)
            {
                try { await DeleteFileAsync(file.Name, cancellationToken); } catch { }
            }
        }
    }

    private async Task<(string Name, string Uri)> UploadPdfAsync(string path, CancellationToken cancellationToken)
    {
        if (!File.Exists(path))
            throw new FileNotFoundException("PDF not found.", path);

        var fileInfo = new FileInfo(path);
        if (fileInfo.Length == 0)
            throw new InvalidOperationException($"The PDF is empty: {Path.GetFileName(path)}");

        const long maxPdfBytes = 50L * 1024L * 1024L;
        if (fileInfo.Length > maxPdfBytes)
            throw new InvalidOperationException($"PDF is larger than 50 MB and cannot be sent by this document workflow: {Path.GetFileName(path)}");

        var mimeType = "application/pdf";
        var startUrl = "https://generativelanguage.googleapis.com/upload/v1beta/files";

        using var start = new HttpRequestMessage(HttpMethod.Post, startUrl);
        start.Headers.TryAddWithoutValidation("x-goog-api-key", settings.GeminiApiKey);
        start.Headers.TryAddWithoutValidation("X-Goog-Upload-Protocol", "resumable");
        start.Headers.TryAddWithoutValidation("X-Goog-Upload-Command", "start");
        start.Headers.TryAddWithoutValidation("X-Goog-Upload-Header-Content-Length", fileInfo.Length.ToString());
        start.Headers.TryAddWithoutValidation("X-Goog-Upload-Header-Content-Type", mimeType);
        start.Content = new StringContent(
            JsonSerializer.Serialize(new { file = new { display_name = Path.GetFileName(path) } }),
            Encoding.UTF8,
            "application/json");

        using var startResponse = await Http.SendAsync(start, cancellationToken);
        var startBody = await startResponse.Content.ReadAsStringAsync(cancellationToken);

        if (!startResponse.IsSuccessStatusCode)
            throw new InvalidOperationException($"Gemini file upload initialization failed ({(int)startResponse.StatusCode}): {startBody}");

        if (!startResponse.Headers.TryGetValues("X-Goog-Upload-URL", out var uploadUrls))
            throw new InvalidOperationException("Gemini did not return an upload URL.");

        var uploadUrl = string.Join("", uploadUrls);

        using var upload = new HttpRequestMessage(HttpMethod.Post, uploadUrl);
        upload.Headers.TryAddWithoutValidation("X-Goog-Upload-Offset", "0");
        upload.Headers.TryAddWithoutValidation("X-Goog-Upload-Command", "upload, finalize");
        upload.Content = new StreamContent(File.OpenRead(path));
        upload.Content.Headers.ContentLength = fileInfo.Length;
        upload.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

        using var uploadResponse = await Http.SendAsync(upload, HttpCompletionOption.ResponseContentRead, cancellationToken);
        var uploadBody = await uploadResponse.Content.ReadAsStringAsync(cancellationToken);

        if (!uploadResponse.IsSuccessStatusCode)
            throw new InvalidOperationException($"Gemini PDF upload failed ({(int)uploadResponse.StatusCode}): {uploadBody}");

        using var json = JsonDocument.Parse(uploadBody);
        var file = json.RootElement.GetProperty("file");
        var name = file.GetProperty("name").GetString() ?? "";
        var uri = file.GetProperty("uri").GetString() ?? "";

        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(uri))
            throw new InvalidOperationException("Gemini returned an incomplete uploaded-file response.");

        await WaitForActiveAsync(name, cancellationToken);
        return (name, uri);
    }

    private async Task WaitForActiveAsync(string name, CancellationToken cancellationToken)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/{name}";

        for (var attempt = 0; attempt < 30; attempt++)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.TryAddWithoutValidation("x-goog-api-key", settings.GeminiApiKey);

            using var response = await Http.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"Gemini file status check failed ({(int)response.StatusCode}): {body}");

            using var json = JsonDocument.Parse(body);
            var root = json.RootElement;
            var state = root.TryGetProperty("state", out var stateElement)
                ? stateElement.GetString()
                : null;

            if (string.Equals(state, "ACTIVE", StringComparison.OrdinalIgnoreCase))
                return;

            if (string.Equals(state, "FAILED", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException($"Gemini could not process the PDF: {name}");

            await Task.Delay(TimeSpan.FromSeconds(2), cancellationToken);
        }

        throw new TimeoutException($"Gemini took too long to process the PDF: {name}");
    }

    private async Task<string> GenerateWithFilesAsync(
        string prompt,
        IReadOnlyList<(string Name, string Uri)> files,
        CancellationToken cancellationToken)
    {
        // Use Google's current Interactions API for multimodal document input.
        // This avoids the legacy generateContent file_data path that can return
        // 400 INVALID_ARGUMENT even when the uploaded Gemini File is ACTIVE.
        var input = new List<object>
        {
            new
            {
                type = "text",
                text = prompt
            }
        };

        foreach (var file in files)
        {
            input.Add(new
            {
                type = "document",
                uri = file.Uri,
                mime_type = "application/pdf"
            });
        }

        var url = "https://generativelanguage.googleapis.com/v1beta/interactions";

        var payload = new
        {
            model = settings.GeminiModel,
            input = input.ToArray(),
            generation_config = new
            {
                temperature = 0.1,
                max_output_tokens = 16000
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.TryAddWithoutValidation("x-goog-api-key", settings.GeminiApiKey);
        request.Content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json");

        using var response = await Http.SendAsync(
            request,
            HttpCompletionOption.ResponseContentRead,
            cancellationToken);

        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            if ((int)response.StatusCode == 429)
            {
                var retryHint = "";
                try
                {
                    using var quotaJson = JsonDocument.Parse(body);
                    if (quotaJson.RootElement.TryGetProperty("error", out var error) &&
                        error.TryGetProperty("details", out var details))
                    {
                        foreach (var detail in details.EnumerateArray())
                        {
                            if (detail.TryGetProperty("retryDelay", out var retryDelay))
                            {
                                retryHint = retryDelay.GetString() ?? "";
                                break;
                            }
                        }
                    }
                }
                catch { }

                var waitText = string.IsNullOrWhiteSpace(retryHint)
                    ? "a short period"
                    : retryHint;

                throw new InvalidOperationException(
                    "Gemini free-tier input quota was exceeded for this mapping request. " +
                    $"The application has compacted the XBRL reference to keep requests smaller. Please wait {waitText} and run the mapping again. " +
                    "If the error persists, use the AI Settings connection test first.");
            }

            throw new InvalidOperationException(
                $"Gemini Interactions API returned {(int)response.StatusCode}: {body}");
        }

        using var json = JsonDocument.Parse(body);
        return ExtractInteractionText(json.RootElement);
    }

    private static string ExtractInteractionText(JsonElement root)
    {
        if (root.TryGetProperty("output_text", out var outputText) &&
            outputText.ValueKind == JsonValueKind.String)
        {
            return outputText.GetString() ?? "";
        }

        var builder = new StringBuilder();

        if (root.TryGetProperty("steps", out var steps) &&
            steps.ValueKind == JsonValueKind.Array)
        {
            foreach (var step in steps.EnumerateArray())
            {
                if (!step.TryGetProperty("content", out var content) ||
                    content.ValueKind != JsonValueKind.Array)
                    continue;

                foreach (var item in content.EnumerateArray())
                {
                    if (item.TryGetProperty("type", out var type) &&
                        string.Equals(type.GetString(), "text", StringComparison.OrdinalIgnoreCase) &&
                        item.TryGetProperty("text", out var text) &&
                        text.ValueKind == JsonValueKind.String)
                    {
                        builder.Append(text.GetString());
                    }
                }
            }
        }

        var result = builder.ToString();
        if (string.IsNullOrWhiteSpace(result))
            throw new InvalidOperationException(
                "Gemini completed the interaction but returned no text mapping.");

        return result;
    }

    private async Task DeleteFileAsync(string name, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(name))
            return;

        var url = $"https://generativelanguage.googleapis.com/v1beta/{name}?key={Uri.EscapeDataString(settings.GeminiApiKey)}";
        using var request = new HttpRequestMessage(HttpMethod.Delete, url);
        request.Headers.TryAddWithoutValidation("x-goog-api-key", settings.GeminiApiKey);
        using var response = await Http.SendAsync(request, cancellationToken);
    }

    private async Task<string> GenerateAsync(string prompt, CancellationToken cancellationToken)
    {
        if (string.Equals(settings.AiProvider, "OpenAI", StringComparison.OrdinalIgnoreCase))
        {
            var url = "https://api.openai.com/v1/responses";
            var payload = new
            {
                model = settings.ActiveModel,
                input = new[]
                {
                    new
                    {
                        role = "user",
                        content = new[] { new { type = "input_text", text = prompt } }
                    }
                },
                temperature = 0.1
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.ActiveApiKey);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            using var response = await Http.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"OpenAI API returned {(int)response.StatusCode}: {body}");

            using var json = JsonDocument.Parse(body);
            if (json.RootElement.TryGetProperty("output_text", out var output))
                return output.GetString() ?? "";

            return ExtractResponseText(json.RootElement);
        }

        if (string.Equals(settings.AiProvider, "Anthropic", StringComparison.OrdinalIgnoreCase))
        {
            var url = "https://api.anthropic.com/v1/messages";
            var payload = new
            {
                model = settings.ActiveModel,
                max_tokens = 12000,
                temperature = 0.1,
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = new[] { new { type = "text", text = prompt } }
                    }
                }
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.TryAddWithoutValidation("x-api-key", settings.ActiveApiKey);
            request.Headers.TryAddWithoutValidation("anthropic-version", "2023-06-01");
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            using var response = await Http.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"Anthropic API returned {(int)response.StatusCode}: {body}");

            using var json = JsonDocument.Parse(body);
            return ExtractResponseText(json.RootElement);
        }

        return await GenerateGeminiTextAsync(prompt, cancellationToken);
    }

    private async Task<string> GenerateGeminiTextAsync(string prompt, CancellationToken cancellationToken)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(settings.ActiveModel)}:generateContent?key={Uri.EscapeDataString(settings.ActiveApiKey)}";

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
        return ExtractResponseText(json.RootElement);
    }

    private static string ExtractResponseText(JsonElement root)
    {
        var parts = root
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts");

        var builder = new StringBuilder();
        foreach (var part in parts.EnumerateArray())
        {
            if (part.TryGetProperty("text", out var text))
                builder.Append(text.GetString());
        }

        return builder.ToString();
    }
}
