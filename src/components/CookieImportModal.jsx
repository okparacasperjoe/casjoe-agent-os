import React, { useState } from 'react';
import { Key, Upload, Check, X, ShieldCheck, HelpCircle } from 'lucide-react';
import { parseCookies } from '../services/cookieImporter';

export default function CookieImportModal({ isOpen, onClose, onCookiesImported }) {
  const [cookieInput, setCookieInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const getIpcRenderer = () => {
    if (window.electron && window.electron.ipcRenderer) return window.electron.ipcRenderer;
    if (typeof window !== 'undefined' && typeof window.require === 'function') {
      try {
        const electron = window.require('electron');
        return electron.ipcRenderer || electron;
      } catch {}
    }
    return null;
  };

  const handleImport = async () => {
    if (!cookieInput.trim()) return;
    setIsProcessing(true);
    setStatusMsg('');

    try {
      const parsed = parseCookies(cookieInput);
      if (parsed.length === 0) {
        setStatusMsg('Error: Could not parse any valid cookies. Ensure format is JSON or Netscape cookies.txt.');
        setIsProcessing(false);
        return;
      }

      const ipc = getIpcRenderer();
      if (ipc && ipc.invoke) {
        const res = await ipc.invoke('agent:import-cookies', { cookies: parsed });
        if (res.success) {
          setStatusMsg(`🎉 Successfully installed ${res.count} of ${res.total} cookies into Agent Browser! Wiping raw cookies for privacy.`);
          setCookieInput(''); // Wipe raw cookie text immediately for security & privacy!
          if (onCookiesImported) onCookiesImported(res.count);
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setStatusMsg(`Import error: ${res.error}`);
        }
      } else {
        setStatusMsg(`[Web Mode Active] Validated ${parsed.length} cookies. Note: Launch the installed Windows Desktop App to apply cookies to native session.`);
      }
    } catch (err) {
      setStatusMsg(`Parsing error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCookieInput(evt.target?.result || '');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0B1222] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Chrome Browser Cookies</h3>
              <p className="text-xs text-slate-400">Bypass logins for LinkedIn, WhatsApp Web, Facebook & cPanel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Paste JSON or Netscape format cookies:</label>
            <label className="text-[11px] text-cyan-400 hover:underline cursor-pointer flex items-center gap-1">
              <Upload className="w-3 h-3" /> Upload .json / .txt
              <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={cookieInput}
            onChange={(e) => setCookieInput(e.target.value)}
            placeholder="Paste raw cookies copied from 'EditThisCookie' or 'Get cookies.txt' extension..."
            rows={7}
            className="w-full bg-[#050811] border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition"
          />

          {statusMsg && (
            <div className="p-3 bg-slate-900 border border-slate-800 text-xs text-cyan-300 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="bg-[#050811] border border-slate-800/80 p-3 rounded-xl text-[11px] text-slate-400 space-y-1">
            <p className="text-slate-200 font-semibold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> How to get Chrome cookies:
            </p>
            <p>1. Install standard extension <strong>EditThisCookie</strong> or <strong>Get cookies.txt</strong> in Chrome.</p>
            <p>2. Open LinkedIn/Facebook/WhatsApp Web in Chrome & click <strong>Export Cookies</strong>.</p>
            <p>3. Paste the text here and click <strong>Install Cookies</strong> to stay logged in instantly!</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isProcessing || !cookieInput.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            <Check className="w-4 h-4" />
            {isProcessing ? 'Installing...' : 'Install Cookies into Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}
