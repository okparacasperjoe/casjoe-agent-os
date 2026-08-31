import React, { useState } from 'react';
import { FileText, Copy, ExternalLink, Check, X, Download, Sparkles, FileSpreadsheet, FileCode, Presentation } from 'lucide-react';
import { exportAsExcel, exportAsPDF, exportAsWordDoc, exportAsPowerPoint } from '../services/fileExporter';

export default function TaskResultModal({ isOpen, onClose, taskResult }) {
  const [copied, setCopied] = useState(false);
  const [openStatus, setOpenStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !taskResult) return null;

  const contentText = taskResult.deliverableText || (
    taskResult.results ? taskResult.results.map(r => `### Step ${r.step}: ${r.action}\nAgent: ${r.agent}\n\n${JSON.stringify(r.result, null, 2)}`).join('\n\n---\n\n') : 'Task completed successfully.'
  );

  const baseFileName = taskResult.deliverableFile || 'business_deliverable';

  const handleCopy = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFormat = async (formatType) => {
    setIsExporting(true);
    setOpenStatus('');
    try {
      let res;
      if (formatType === 'excel') {
        res = await exportAsExcel(contentText, 'business_data.csv');
      } else if (formatType === 'pdf') {
        res = await exportAsPDF(contentText, 'business_document.pdf');
      } else if (formatType === 'word') {
        res = await exportAsWordDoc(contentText, 'business_document.docx');
      } else if (formatType === 'pptx') {
        res = await exportAsPowerPoint(contentText, 'business_presentation.pptx');
      }

      if (res && res.success) {
        setOpenStatus(`🎉 Exported as ${res.format}! Opening in default system app...`);
      }
    } catch (err) {
      setOpenStatus(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenSystemEditor = async () => {
    setOpenStatus('');
    try {
      const getIpc = () => {
        if (window.electron && window.electron.ipcRenderer) return window.electron.ipcRenderer;
        if (typeof window !== 'undefined' && typeof window.require === 'function') {
          try { return window.require('electron').ipcRenderer; } catch {}
        }
        return null;
      };

      const ipc = getIpc();
      if (ipc && ipc.invoke) {
        const res = await ipc.invoke('agent:open-file', { filePath: baseFileName });
        if (res.success) {
          setOpenStatus(`Opened ${baseFileName} in system editor!`);
        } else {
          setOpenStatus(`Error opening file: ${res.error}`);
        }
      } else {
        setOpenStatus(`[Web Mode] Created content. Launch Desktop App to open in system application.`);
      }
    } catch (err) {
      setOpenStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0B1222] border border-amber-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Task Output & Deliverables</h3>
              <p className="text-xs text-slate-400">Generated for: "{taskResult.goal}"</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 bg-[#050811] border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
          {contentText}
        </div>

        {openStatus && (
          <div className="p-2.5 bg-slate-900 border border-slate-800 text-xs text-amber-300 rounded-xl flex items-center gap-2 shrink-0">
            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{openStatus}</span>
          </div>
        )}

        {/* Multi-Format Exporter Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 shrink-0 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Save As:</span>
            <button
              onClick={() => handleExportFormat('excel')}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 rounded-xl text-xs font-semibold transition"
              title="Save as Excel Sheet (.csv / .xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (.xlsx)
            </button>

            <button
              onClick={() => handleExportFormat('word')}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/40 hover:bg-blue-900/60 text-blue-400 border border-blue-800/60 rounded-xl text-xs font-semibold transition"
              title="Save as Word / Google Doc (.docx)"
            >
              <FileText className="w-3.5 h-3.5" /> Word (.docx)
            </button>

            <button
              onClick={() => handleExportFormat('pdf')}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 rounded-xl text-xs font-semibold transition"
              title="Save as PDF Document (.pdf)"
            >
              <Download className="w-3.5 h-3.5" /> PDF (.pdf)
            </button>

            <button
              onClick={() => handleExportFormat('pptx')}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-400 border border-purple-800/60 rounded-xl text-xs font-semibold transition"
              title="Save as PowerPoint Presentation (.pptx)"
            >
              <Presentation className="w-3.5 h-3.5" /> PPTX (.pptx)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={handleOpenSystemEditor}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              <ExternalLink className="w-4 h-4" />
              Open File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
