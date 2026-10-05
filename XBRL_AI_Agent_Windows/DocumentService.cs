using System;
using System.IO;
using System.Text;
using UglyToad.PdfPig;

namespace XBRLAIAgent;

public static class DocumentService
{
    public static string ExtractPdfText(string path, int maxCharacters = 180000)
    {
        if (!File.Exists(path)) throw new FileNotFoundException("PDF not found.", path);

        var sb = new StringBuilder();

        using var document = PdfDocument.Open(path);
        foreach (var page in document.GetPages())
        {
            sb.AppendLine($"--- PAGE {page.Number} ---");
            sb.AppendLine(page.Text);

            if (sb.Length >= maxCharacters)
                break;
        }

        return sb.ToString();
    }
}
