import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, ExternalLink, ShieldCheck, Database, Key, Check } from 'lucide-react';
import { getCasjoeBizUrl, checkCasjoeBizStatus, syncLocalDataToCasjoeBiz, getCasjoeBizApiKey, setCasjoeBizApiKey } from '../services/casjoeBizSync';

export default function CasjoeBizView() {
  const [bizUrl, setBizUrl] = useState(getCasjoeBizUrl());
  const [status, setStatus] = useState({ online: false, note: 'Checking portal connection...' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [apiKey, setApiKey] = useState(getCasjoeBizApiKey());
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const refreshStatus = async () => {
    const s = await checkCasjoeBizStatus();
    setStatus(s);
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleSaveApiKey = () => {
    setCasjoeBizApiKey(apiKey);
    setSavedSuccess(true);
    refreshStatus();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    const res = await syncLocalDataToCasjoeBiz();
    setSyncMessage(res.message || (res.success ? 'Sync completed' : 'Sync error'));
    setIsSyncing(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 space-y-4">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Casjoe Biz Cloud Portal
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${status.authenticated ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {status.authenticated ? 'ERP Key Configured' : 'Offline / Key Needed'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Integrated ERP Portal & Synchronizer: <a href="https://app.casjoe.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">app.casjoe.com</a></p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-700"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            {apiKey ? 'ERP API Key Saved' : 'Add ERP API Key'}
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-amber-500/10 disabled:opacity-50"
          >
            <Database className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Local DB to Cloud'}
          </button>
          <a
            href="https://app.casjoe.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open in Browser
          </a>
        </div>
      </div>

      {/* ERP API Key Config Section */}
      {(showKeyInput || !apiKey) && (
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Key className="w-3.5 h-3.5" /> Casjoe ERP Platform API Key (casjoe_live_...)
            </h3>
            {savedSuccess && <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved!</span>}
          </div>
          <p className="text-xs text-slate-400">Enter your personal Casjoe Biz ERP API Key to link local Agent OS automation with your app.casjoe.com account.</p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. casjoe_live_8e10f0b8775b0617eb7b270544e250cd4553..."
              className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl font-mono focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow"
            >
              Save API Key
            </button>
          </div>
        </div>
      )}

      {syncMessage && (
        <div className="bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs p-3 rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Embedded Web View Workspace */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 w-full max-w-xl">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">{bizUrl}</span>
          </div>
          <button
            onClick={refreshStatus}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Refresh Connection"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded Iframe / Webview */}
        <div className="flex-1 relative bg-slate-950">
          <iframe
            src={bizUrl}
            title="Casjoe Biz App Portal"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => setStatus({ online: false, note: 'Failed to load app.casjoe.com frame.' })}
          />
        </div>
      </div>
    </div>
  );
}
