using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Xml.Linq;

namespace XBRLAIAgent;

public sealed class PreviousYearTag
{
    public string ConceptName { get; set; } = "";
    public string Label { get; set; } = "";
    public string Value { get; set; } = "";
    public string SourceDoc { get; set; } = "";
    public string SourceLocation { get; set; } = "";
    public string Method { get; set; } = "";
    public int Confidence { get; set; }
    public string ContextRef { get; set; } = "";
}

public sealed class PreviousYearReference
{
    public List<PreviousYearTag> Tags { get; set; } = new();
    public int XbrlFactCount { get; set; }
    public int TextFactCount { get; set; }
    public int ContextCount { get; set; }
    public int ConflictCount { get; set; }
    public double Coverage { get; set; }
    public List<string> Conflicts { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<string> SourceDocumentsRead { get; set; } = new();
}

public static class PreviousYearTaggingEngine
{
    private sealed class XmlCandidate
    {
        public string LocalName { get; init; } = "";
        public string QualifiedName { get; init; } = "";
        public string Value { get; init; } = "";
        public string ContextRef { get; init; } = "";
        public DateTime? PeriodEnd { get; init; }
        public string Dimension { get; init; } = "";
        public string Member { get; init; } = "";
    }

    public static PreviousYearReference Build(IReadOnlyCollection<MappedFact> facts, IReadOnlyCollection<string> paths)
    {
        var result = new PreviousYearReference
        {
            SourceDocumentsRead = paths.Where(File.Exists).Distinct(StringComparer.OrdinalIgnoreCase).ToList()
        };

        var xmlPools = new List<(string Path, List<XmlCandidate> Candidates)>();

        foreach (var path in result.SourceDocumentsRead)
        {
            if (!IsPotentialXbrl(path))
                continue;

            try
            {
                var xmlText = ReadXmlPayload(path);
                if (string.IsNullOrWhiteSpace(xmlText))
                {
                    result.Warnings.Add($"No XML payload found in {Path.GetFileName(path)}.");
                    continue;
                }

                var parsed = ParseXml(xmlText, out var contextCount, out var warnings);
                result.ContextCount += contextCount;
                result.Warnings.AddRange(warnings);

                if (parsed.Count > 0)
                    xmlPools.Add((path, parsed));
            }
            catch (Exception ex)
            {
                result.Warnings.Add($"{Path.GetFileName(path)}: {ex.Message}");
            }
        }

        var textDocs = new List<(string Path, string Text)>();
        foreach (var path in result.SourceDocumentsRead.Where(p => !IsPotentialXbrl(p)))
        {
            try
            {
                var text = DocumentService.ExtractDocumentText(path);
                if (!string.IsNullOrWhiteSpace(text))
                    textDocs.Add((path, text));
            }
            catch (Exception ex)
            {
                result.Warnings.Add($"{Path.GetFileName(path)}: {ex.Message}");
            }
        }

        foreach (var fact in facts)
        {
            var local = LocalName(fact.ConceptName);

            var matches = xmlPools
                .SelectMany(pool => pool.Candidates
                    .Where(c => string.Equals(c.QualifiedName, fact.ConceptName, StringComparison.OrdinalIgnoreCase)
                             || string.Equals(c.LocalName, local, StringComparison.OrdinalIgnoreCase))
                    .Select(c => (pool.Path, Candidate: c)))
                .ToList();

            var chosen = Choose(matches.Select(x => x.Candidate).ToList());
            if (chosen != null)
            {
                var source = matches.FirstOrDefault(x => ReferenceEquals(x.Candidate, chosen));
                var parsed = NormalizeValue(chosen.Value);

                if (!string.IsNullOrWhiteSpace(parsed))
                {
                    if (matches.Select(x => NormalizeValue(x.Candidate.Value))
                               .Where(v => !string.IsNullOrWhiteSpace(v))
                               .Distinct(StringComparer.OrdinalIgnoreCase)
                               .Count() > 1)
                    {
                        result.Conflicts.Add(
                            $"{fact.Label}: multiple previous-year XBRL values were found and require verification.");
                    }

                    result.Tags.Add(new PreviousYearTag
                    {
                        ConceptName = fact.ConceptName,
                        Label = fact.Label,
                        Value = parsed,
                        SourceDoc = Path.GetFileName(source.Path),
                        SourceLocation = string.IsNullOrWhiteSpace(chosen.ContextRef)
                            ? "XBRL fact"
                            : $"Context {chosen.ContextRef}",
                        Method = string.Equals(chosen.QualifiedName, fact.ConceptName, StringComparison.OrdinalIgnoreCase)
                            ? "XBRL_EXACT"
                            : "XBRL_LOCAL_NAME",
                        Confidence = string.Equals(chosen.QualifiedName, fact.ConceptName, StringComparison.OrdinalIgnoreCase)
                            ? 100
                            : 96,
                        ContextRef = chosen.ContextRef
                    });
                    result.XbrlFactCount++;
                    continue;
                }
            }

            var textMatch = FindTextMatch(fact, textDocs);
            if (textMatch != null)
            {
                var matched = textMatch.Value;
                result.Tags.Add(new PreviousYearTag
                {
                    ConceptName = fact.ConceptName,
                    Label = fact.Label,
                    Value = matched.Value,
                    SourceDoc = Path.GetFileName(matched.Path),
                    SourceLocation = matched.Location,
                    Method = "TEXT_MATCH",
                    Confidence = 88
                });
                result.TextFactCount++;
            }
        }

        var taggedIds = result.Tags
            .Select(t => t.ConceptName)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        result.Coverage = facts.Count == 0
            ? 0
            : Math.Round(taggedIds.Count * 100d / facts.Count, 1);

        result.ConflictCount = result.Conflicts.Count;
        return result;
    }

    public static void Apply(IReadOnlyCollection<MappedFact> facts, PreviousYearReference reference)
    {
        foreach (var fact in facts)
        {
            var tag = reference.Tags
                .FirstOrDefault(t => string.Equals(t.ConceptName, fact.ConceptName, StringComparison.OrdinalIgnoreCase));

            if (tag == null)
                continue;

            fact.PreviousValue = tag.Value;
            fact.PreviousSourceDoc = tag.SourceDoc;
            fact.PreviousSourcePageOrSheet = tag.SourceLocation;

            if (reference.Conflicts.Any(c => c.StartsWith(fact.Label + ":", StringComparison.OrdinalIgnoreCase)))
            {
                fact.Status = MappingStatus.REVIEW_REQUIRED;
            }
        }
    }

    private static bool IsPotentialXbrl(string path)
    {
        var extension = Path.GetExtension(path).ToLowerInvariant();
        return extension is ".xml" or ".xag" or ".zip";
    }

    private static string ReadXmlPayload(string path)
    {
        var extension = Path.GetExtension(path).ToLowerInvariant();

        if (extension == ".xml")
            return File.ReadAllText(path);

        try
        {
            using var archive = ZipFile.OpenRead(path);

            var candidates = archive.Entries
                .Where(e => e.FullName.EndsWith(".xml", StringComparison.OrdinalIgnoreCase)
                         || e.FullName.EndsWith(".xag", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(e => e.FullName.Contains("xbrl", StringComparison.OrdinalIgnoreCase))
                .ThenBy(e => e.FullName.Length)
                .ToList();

            foreach (var entry in candidates)
            {
                using var stream = entry.Open();
                using var reader = new StreamReader(stream);
                var text = reader.ReadToEnd();

                if (text.Contains("<xbrl", StringComparison.OrdinalIgnoreCase)
                    || text.Contains("<context", StringComparison.OrdinalIgnoreCase))
                    return text;
            }
        }
        catch
        {
            // Fall through and try the file as text below.
        }

        return File.ReadAllText(path);
    }

    private static List<XmlCandidate> ParseXml(string text, out int contextCount, out List<string> warnings)
    {
        warnings = new List<string>();
        contextCount = 0;

        XDocument document;
        try
        {
            document = XDocument.Parse(text, LoadOptions.PreserveWhitespace);
        }
        catch (Exception ex)
        {
            warnings.Add($"XML parse failed: {ex.Message}");
            return new List<XmlCandidate>();
        }

        var contexts = document.Descendants()
            .Where(e => e.Name.LocalName == "context")
            .ToList();

        contextCount = contexts.Count;

        var contextMap = contexts
            .Select(context => new
            {
                Id = (string?)context.Attribute("id") ?? "",
                End = GetContextEndDate(context),
                ExplicitMember = context.Descendants().FirstOrDefault(e => e.Name.LocalName == "explicitMember")
            })
            .Where(x => !string.IsNullOrWhiteSpace(x.Id))
            .ToDictionary(
                x => x.Id,
                x => (
                    End: x.End,
                    Dimension: (string?)x.ExplicitMember?.Attribute("dimension") ?? "",
                    Member: x.ExplicitMember?.Value?.Trim() ?? ""
                ),
                StringComparer.OrdinalIgnoreCase);

        return document
            .Descendants()
            .Where(e => !e.Elements().Any()
                     && !string.IsNullOrWhiteSpace(e.Value)
                     && e.Attribute("contextRef") != null)
            .Select(e =>
            {
                var contextRef = (string?)e.Attribute("contextRef") ?? "";
                contextMap.TryGetValue(contextRef, out var ctx);

                return new XmlCandidate
                {
                    LocalName = e.Name.LocalName,
                    QualifiedName = e.Name.ToString(),
                    Value = e.Value.Trim(),
                    ContextRef = contextRef,
                    PeriodEnd = ctx.End,
                    Dimension = ctx.Dimension,
                    Member = ctx.Member
                };
            })
            .ToList();
    }

    private static XmlCandidate? Choose(IReadOnlyCollection<XmlCandidate> candidates)
    {
        if (candidates.Count == 0)
            return null;

        return candidates
            .OrderBy(c => string.IsNullOrWhiteSpace(c.Dimension) && string.IsNullOrWhiteSpace(c.Member) ? 0 : 1)
            .ThenByDescending(c => c.PeriodEnd ?? DateTime.MinValue)
            .FirstOrDefault();
    }

    private static (string Path, string Value, string Location)? FindTextMatch(
        MappedFact fact,
        IReadOnlyCollection<(string Path, string Text)> documents)
    {
        var aliases = BuildAliases(fact).ToList();

        foreach (var document in documents)
        {
            var lines = document.Text
                .Split(new[] { "\\r\\n", "\\n", "\\r" }, StringSplitOptions.RemoveEmptyEntries);

            for (var index = 0; index < lines.Length; index++)
            {
                var line = lines[index];

                if (!aliases.Any(alias =>
                    line.Contains(alias, StringComparison.OrdinalIgnoreCase)))
                    continue;

                var value = ExtractFirstNumber(line);
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return (
                        document.Path,
                        value,
                        $"Extracted text • Line {index + 1}"
                    );
                }
            }
        }

        return null;
    }

    private static IEnumerable<string> BuildAliases(MappedFact fact)
    {
        yield return fact.Label;

        var local = LocalName(fact.ConceptName);
        var spaced = System.Text.RegularExpressions.Regex.Replace(local, "([a-z])([A-Z])", "$1 $2");

        if (!string.Equals(spaced, fact.Label, StringComparison.OrdinalIgnoreCase))
            yield return spaced;

        if (local.Contains("PropertyPlantAndEquipment", StringComparison.OrdinalIgnoreCase))
            yield return "Property, Plant and Equipment";

        if (local.Contains("TradeReceivables", StringComparison.OrdinalIgnoreCase))
            yield return "Trade Receivables";

        if (local.Contains("TradePayables", StringComparison.OrdinalIgnoreCase))
            yield return "Trade Payables";

        if (local.Contains("RevenueFromOperations", StringComparison.OrdinalIgnoreCase))
            yield return "Revenue from Operations";

        if (local.Contains("EquityAndLiabilities", StringComparison.OrdinalIgnoreCase))
            yield return "Equity and Liabilities";
    }

    private static string? ExtractFirstNumber(string line)
    {
        var chars = line.ToCharArray();
        var start = -1;

        for (var i = 0; i < chars.Length; i++)
        {
            if (char.IsDigit(chars[i]) || (chars[i] == '-' && i + 1 < chars.Length && char.IsDigit(chars[i + 1])))
            {
                start = i;
                break;
            }
        }

        if (start < 0)
            return null;

        var end = start;
        while (end < chars.Length
               && (char.IsDigit(chars[end]) || chars[end] == ',' || chars[end] == '.' || chars[end] == '-'))
        {
            end++;
        }

        var token = new string(chars[start..end]).Trim();
        return NormalizeValue(token);
    }

    private static string NormalizeValue(string value)
    {
        var clean = value.Trim();

        if (clean.StartsWith("(") && clean.EndsWith(")"))
            clean = "-" + clean[1..^1];

        clean = clean.Replace(",", "", StringComparison.Ordinal)
                     .Replace("₹", "", StringComparison.Ordinal)
                     .Replace("INR", "", StringComparison.OrdinalIgnoreCase)
                     .Replace("Rs.", "", StringComparison.OrdinalIgnoreCase)
                     .Trim();

        if (decimal.TryParse(clean, NumberStyles.Any, CultureInfo.InvariantCulture, out var number))
            return number.ToString(CultureInfo.InvariantCulture);

        return value.Trim();
    }

    private static string LocalName(string qualified)
    {
        var value = qualified ?? "";
        var index = value.LastIndexOf(':');
        return index >= 0 && index < value.Length - 1 ? value[(index + 1)..] : value;
    }

    private static DateTime? GetContextEndDate(XElement context)
    {
        var instant = context.Descendants().FirstOrDefault(x => x.Name.LocalName == "instant");
        var end = context.Descendants().FirstOrDefault(x => x.Name.LocalName == "endDate");
        var value = (instant ?? end)?.Value?.Trim();

        return DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)
            ? date
            : null;
    }
}
