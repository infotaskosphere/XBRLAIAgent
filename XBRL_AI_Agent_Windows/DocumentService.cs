using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using UglyToad.PdfPig;

namespace XBRLAIAgent;

public static class DocumentService
{
    public static string ExtractPdfText(string path, int maxCharacters = 180000)
    {
        if (!File.Exists(path))
            throw new FileNotFoundException("PDF not found.", path);

        var sb = new StringBuilder();

        try
        {
            // PdfPig's standard open path is retained for maximum compatibility
            // with the exact package version shipped in the EXE. Any parser
            // exception is contained below so one malformed PDF cannot stop
            // the complete document workflow.
            using var document = PdfDocument.Open(path);

            foreach (var page in document.GetPages())
            {
                sb.AppendLine($"--- PAGE {page.Number} ---");

                string pageText;
                try
                {
                    pageText = page.Text ?? "";
                }
                catch
                {
                    pageText = "";
                }

                if (!string.IsNullOrWhiteSpace(pageText))
                    sb.AppendLine(pageText);

                if (sb.Length >= maxCharacters)
                    break;
            }

            if (sb.Length > 0)
                return sb.ToString();
        }
        catch
        {
            // A malformed PDF header or damaged PDF structure must not make
            // the application unusable. Gemini can natively read valid PDFs,
            // including scanned/image PDFs, so the caller can continue with
            // the original file even when local text extraction fails.
        }

        return "[LOCAL PDF TEXT EXTRACTION UNAVAILABLE]
" +
               "The original PDF is still available to the document/AI reader. " +
               "Use the original PDF for visual and table extraction.";
    }

    public static string ExtractDocumentText(string path, int maxCharacters = 180000)
    {
        if (!File.Exists(path))
            throw new FileNotFoundException("Document not found.", path);

        var extension = Path.GetExtension(path).ToLowerInvariant();

        return extension switch
        {
            ".pdf" => ExtractPdfText(path, maxCharacters),
            ".txt" or ".csv" or ".xml" or ".xsd" or ".json" or ".md" =>
                ReadTextFile(path, maxCharacters),
            ".docx" => ExtractDocxText(path, maxCharacters),
            ".doc" => "[LEGACY .DOC FORMAT]
" +
                      "The original document is retained, but direct local text extraction " +
                      "requires a legacy Word parser. Convert it to PDF or DOCX for full extraction.",
            _ => ReadTextFile(path, maxCharacters)
        };
    }

    private static string ReadTextFile(string path, int maxCharacters)
    {
        var text = File.ReadAllText(path);
        return text.Length <= maxCharacters ? text : text[..maxCharacters];
    }

    private static string ExtractDocxText(string path, int maxCharacters)
    {
        using var archive = ZipFile.OpenRead(path);
        var entry = archive.GetEntry("word/document.xml");

        if (entry == null)
            return "[DOCX CONTENT NOT FOUND]";

        using var stream = entry.Open();
        var document = XDocument.Load(stream);

        var text = string.Join(
            Environment.NewLine,
            document
                .Descendants()
                .Where(x => x.Name.LocalName == "t")
                .Select(x => x.Value));

        return text.Length <= maxCharacters ? text : text[..maxCharacters];
    }
}
