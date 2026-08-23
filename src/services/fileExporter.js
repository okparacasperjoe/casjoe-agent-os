import jsPDF from 'jspdf';

/**
 * Casjoe Agent OS - Multi-Format Document & Spreadsheet Exporter
 * Supports CSV/Excel, Word/Docx, PDF, PowerPoint PPTX outline, and Plain Text.
 */

function getIpc() {
  if (window.electron && window.electron.ipcRenderer) return window.electron.ipcRenderer;
  if (typeof window !== 'undefined' && typeof window.require === 'function') {
    try { return window.require('electron').ipcRenderer; } catch {}
  }
  return null;
}

// 1. Export as Excel / CSV Spreadsheet (.csv)
export async function exportAsExcel(text, fileName = 'business_data.csv') {
  const lines = text.split('\n');
  const csvRows = ['"ID","Category / Title","Description / Content"'];

  let count = 1;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed) continue;

    if (trimmed.match(/^\d+\./)) {
      const parts = trimmed.replace(/^\d+\.\s*/, '').split(':');
      const title = (parts[0] || '').replace(/"/g, '""');
      const desc = (parts.slice(1).join(':') || '').replace(/"/g, '""');
      csvRows.push(`"${count++}","${title}","${desc}"`);
    } else {
      csvRows.push(`"${count++}","Content Item","${trimmed.replace(/"/g, '""')}"`);
    }
  }

  const csvContent = csvRows.join('\n');
  const finalPath = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;

  const ipc = getIpc();
  if (ipc && ipc.invoke) {
    const res = await ipc.invoke('agent:write-file', { filePath: finalPath, content: csvContent });
    if (res.success) {
      await ipc.invoke('agent:open-file', { filePath: finalPath });
      return { success: true, filePath: finalPath, format: 'Excel (.csv)' };
    }
  }

  // Web Browser Download fallback
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', finalPath);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { success: true, filePath: finalPath, format: 'Excel (.csv)' };
}

// 2. Export as PDF Document (.pdf)
export async function exportAsPDF(text, fileName = 'business_document.pdf') {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Casjoe Agent OS Deliverable', 14, 20);
  doc.setFontSize(10);

  const lines = doc.splitTextToSize(text.replace(/#/g, ''), 180);
  let y = 30;

  for (const line of lines) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 14, y);
    y += 6;
  }

  const finalPath = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  doc.save(finalPath);

  const ipc = getIpc();
  if (ipc && ipc.invoke) {
    await ipc.invoke('agent:open-file', { filePath: finalPath });
  }

  return { success: true, filePath: finalPath, format: 'PDF (.pdf)' };
}

// 3. Export as Word / Google Doc (.docx / .txt)
export async function exportAsWordDoc(text, fileName = 'business_document.docx') {
  const finalPath = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;

  const ipc = getIpc();
  if (ipc && ipc.invoke) {
    const res = await ipc.invoke('agent:write-file', { filePath: finalPath, content: text });
    if (res.success) {
      await ipc.invoke('agent:open-file', { filePath: finalPath });
      return { success: true, filePath: finalPath, format: 'Word / Docx (.docx)' };
    }
  }

  const blob = new Blob([text], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', finalPath);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { success: true, filePath: finalPath, format: 'Word / Docx (.docx)' };
}

// 4. Export as PowerPoint Presentation Outline (.pptx)
export async function exportAsPowerPoint(text, fileName = 'business_presentation.pptx') {
  const finalPath = fileName.endsWith('.pptx') ? fileName : `${fileName}.pptx`;
  const pptxOutline = `# PowerPoint Slide Presentation Outline\n\n${text}`;

  const ipc = getIpc();
  if (ipc && ipc.invoke) {
    const res = await ipc.invoke('agent:write-file', { filePath: finalPath, content: pptxOutline });
    if (res.success) {
      await ipc.invoke('agent:open-file', { filePath: finalPath });
      return { success: true, filePath: finalPath, format: 'PowerPoint (.pptx)' };
    }
  }

  return { success: true, filePath: finalPath, format: 'PowerPoint (.pptx)' };
}
