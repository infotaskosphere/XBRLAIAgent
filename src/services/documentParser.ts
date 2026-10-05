import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { UploadedDocument, FileRole } from '../types';

export async function parseUploadedFile(
  file: File,
  role: FileRole,
  year: 'CURRENT' | 'PREVIOUS'
): Promise<UploadedDocument> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  let fileType = 'other';
  if (['xlsx', 'xls', 'csv'].includes(extension)) fileType = 'excel';
  else if (['doc', 'docx'].includes(extension)) fileType = 'word';
  else if (extension === 'pdf') fileType = 'pdf';
  else if (['xml', 'xag'].includes(extension)) fileType = 'xml';
  else if (['txt', 'json', 'md'].includes(extension)) fileType = 'text';

  try {
    let extractedText = '';
    let extractedTables: UploadedDocument['extractedTables'] = [];

    if (fileType === 'excel') {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const textParts: string[] = [];

      extractedTables = workbook.SheetNames.map(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 });
        const headers = (rawJson[0] || []).map(h => String(h || ''));
        const rows = rawJson.slice(1).filter(r => r && r.length > 0);

        textParts.push(`--- SHEET: ${sheetName} ---`);
        rawJson.forEach(row => {
          if (row && row.length > 0) {
            textParts.push(row.join(' | '));
          }
        });

        return {
          sheetName,
          headers,
          rows: rows.slice(0, 100) // Keep preview rows
        };
      });

      extractedText = textParts.join('\n');
    } else if (fileType === 'word') {
      if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const docXml = await zip.file('word/document.xml')?.async('string');

        if (docXml) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(docXml, 'text/xml');
          const paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p'));
          const lines = paragraphs.map(p => {
            const texts = Array.from(p.getElementsByTagName('w:t'));
            return texts.map(t => t.textContent).join('');
          }).filter(line => line.trim().length > 0);

          extractedText = lines.join('\n');
        } else {
          extractedText = `[DOCX content could not be unzipped]`;
        }
      } else {
        extractedText = `[Legacy .DOC binary format. Text extracted in text-preview mode: ${file.name}]`;
      }
    } else if (fileType === 'xml') {
      const rawText = await file.text();
      extractedText = rawText;

      // Also parse XML structure
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(rawText, 'text/xml');
        const elements = xmlDoc.getElementsByTagName('*');
        const leafElements: (string | number)[][] = [];

        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (el.children.length === 0 && el.textContent?.trim()) {
            leafElements.push([
              el.tagName,
              el.getAttribute('contextRef') || '',
              el.getAttribute('unitRef') || '',
              el.textContent.trim()
            ]);
          }
        }

        extractedTables = [{
          sheetName: 'XBRL_Facts',
          headers: ['Concept Tag', 'Context Ref', 'Unit Ref', 'Value'],
          rows: leafElements.slice(0, 200)
        }];
      } catch {
        // Fallback to text
      }
    } else if (fileType === 'pdf') {
      // In-browser PDF extraction
      try {
        const text = await file.text();
        // Extract basic stream text if present or fallback
        const matches = text.match(/\(([^()]+)\)/g);
        if (matches && matches.length > 20) {
          extractedText = matches
            .map(m => m.slice(1, -1))
            .filter(t => t.trim().length > 1 && !/^[\x00-\x1F\x7F]+$/.test(t))
            .join(' ');
        } else {
          extractedText = `[PDF Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB) ready for AI multimodal extraction and mapping.]`;
        }
      } catch {
        extractedText = `[PDF Document: ${file.name} ready for AI multimodal extraction]`;
      }
    } else {
      extractedText = await file.text();
    }

    return {
      id,
      name: file.name,
      size: file.size,
      type: fileType,
      role,
      year,
      uploadedAt: new Date().toLocaleTimeString(),
      charCount: extractedText.length,
      extractedText: extractedText.slice(0, 250000), // Protect memory
      extractedTables,
      status: 'ready'
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      id,
      name: file.name,
      size: file.size,
      type: fileType,
      role,
      year,
      uploadedAt: new Date().toLocaleTimeString(),
      charCount: 0,
      extractedText: '',
      status: 'error',
      errorMessage: errorMsg
    };
  }
}
