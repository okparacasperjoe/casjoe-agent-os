import React, { useState, useEffect, useRef } from 'react';
import { Settings, Cpu, HardDrive, Sliders, CheckCircle, ShieldCheck, Battery, AlertTriangle, Download, RefreshCw, Key, Star, Upload, Trash2, ArrowUpCircle } from 'lucide-react';
import { pullModel, RECOMMENDED_MODELS } from '../services/ollama';
import { setSetting } from '../db/hooks';
import db, { exportDatabaseToJson, importDatabaseFromJson, pruneOldAgentLogs } from '../db/database';

// ipcRenderer is available when running inside Electron (contextIsolation: false)
const ipc = window.require ? window.require('electron').ipcRenderer : null;

export default function SettingsView({ ollamaConnected, ollamaModels, selectedModel, setSelectedModel }) {
  const [quantization, setQuantization] = useState('Q4_K_M');
  const [contextLength, setContextLength] = useState(4096);
  const [threadCount, setThreadCount] = useState(8);
  const [powerSaver, setPowerSaver] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pullProgress, setPullProgress] = useState({});
  const [backupMsg, setBackupMsg] = useState('');
  const restoreFileInputRef = useRef(null);

  // License key state
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseStatus, setLicenseStatus] = useState(null); // null | 'valid' | 'invalid' | 'checking'
  const [licenseEmail, setLicenseEmail] = useState('');

  React.useEffect(() => {
    db.settings.get('licenseKey').then(record => {
      if (record && record.value) {
        setLicenseKey(record.value.key || '');
        setLicenseEmail(record.value.email || '');
        setLicenseStatus(record.value.status || null);
      }
    });
  }, []);

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) return alert('Please enter a license key.');
    setLicenseStatus('checking');
    try {
      // Validate key format locally first (XXXX-XXXX-XXXX-XXXX)
      const keyRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
      if (!keyRegex.test(licenseKey.trim().toUpperCase())) {
        setLicenseStatus('invalid');
        return;
      }
      // Validate against license server
      const res = await fetch('https://casjoe-license.casperjoe.workers.dev/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey.trim().toUpperCase(), email: licenseEmail.trim().toLowerCase() })
      });
      const data = await res.json();
      const valid = data.valid === true;
      setLicenseStatus(valid ? 'valid' : 'invalid');
      if (valid) {
        await setSetting('licenseKey', { key: licenseKey.trim().toUpperCase(), email: licenseEmail, status: 'valid' });
      }
    } catch {
      setLicenseStatus('invalid');
    }
  };

  // Auto-update state
  const [updateStatus, setUpdateStatus] = useState(null); // null | {status, version?, percent?, message?}

  useEffect(() => {
    if (!ipc) return;
    const handler = (_, data) => setUpdateStatus(data);
    ipc.on('updater:status', handler);
    return () => ipc.removeListener('updater:status', handler);
  }, []);

  const handleCheckForUpdates = async () => {
    if (!ipc) return setUpdateStatus({ status: 'error', message: 'Auto-update only works in the installed app.' });
    setUpdateStatus({ status: 'checking' });
    await ipc.invoke('check-for-updates');
  };

  // ERP API Token State
  const [erpApiToken, setErpApiToken] = useState('');

  // Load token on mount
  React.useEffect(() => {
    db.settings.get('erpApiToken').then(record => {
      if (record && record.value) setErpApiToken(record.value);
    });
  }, []);

  const handleSaveErpToken = () => {
    setSetting('erpApiToken', erpApiToken);
    alert('ERP API token saved');
  };

  // Business Profile State (for Invoices, Reports & Browser AutoFill)
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessBank, setBusinessBank] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessRcTin, setBusinessRcTin] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');

  // Load existing profile on mount
  React.useEffect(() => {
    db.settings.get('businessProfile').then(record => {
      if (record && record.value) {
        setBusinessName(record.value.name || '');
        setBusinessPhone(record.value.phone || '');
        setBusinessEmail(record.value.email || '');
        setBusinessBank(record.value.bank || '');
        setBusinessAddress(record.value.address || '');
        setBusinessRcTin(record.value.rcTin || '');
        setBusinessWebsite(record.value.website || '');
      }
    });
  }, []);

  const handleSaveSettings = () => {
    setSetting('businessProfile', {
      name: businessName,
      phone: businessPhone,
      email: businessEmail,
      bank: businessBank,
      address: businessAddress,
      rcTin: businessRcTin,
      website: businessWebsite
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportDatabase = async () => {
    try {
      await exportDatabaseToJson();
      setBackupMsg('Backup downloaded successfully!');
      setTimeout(() => setBackupMsg(''), 3500);
    } catch (error) {
      console.error('Failed to export database', error);
      alert('Backup failed.');
    }
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await importDatabaseFromJson(text);
      if (res.success) {
        setBackupMsg('Database restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        alert(`Restore failed: ${res.error}`);
      }
    } catch (err) {
      alert(`Invalid backup file: ${err.message}`);
    }
  };

  const handlePruneLogs = async () => {
    if (confirm('Prune task logs to retain only the latest 100 entries?')) {
      const res = await pruneOldAgentLogs(100);
      setBackupMsg(`Cleaned up ${res.deletedCount} old log entries.`);
      setTimeout(() => setBackupMsg(''), 3500);
    }
  };

  const handleSelectModel = (modelName) => {
    setSelectedModel(modelName);
    setSetting('selectedModel', modelName);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'Unknown Size';
    return (bytes / 1e9).toFixed(1) + ' GB';
  };

  const handlePullModel = async (modelName) => {
    setPullProgress(prev => ({ ...prev, [modelName]: { status: 'starting', percent: 0 } }));
    
    await pullModel(modelName, (progress) => {
      setPullProgress(prev => ({ 
        ...prev, 
        [modelName]: {
          ...progress,
          percent: progress.total ? Math.round((progress.completed / progress.total) * 100) : 0
        }
      }));
    });
    
    // Clear progress when done
    setPullProgress(prev => {
      const next = { ...prev };
      delete next[modelName];
      return next;
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="bg-[#0E1629] border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-white">Local LLM & Hardware Settings</h2>
          <p className="text-sm text-slate-400">Configure offline model weights, thread allocation, and memory quantization</p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="btn-primary text-xs py-2.5 px-5"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Local Engine Configuration updated successfully! Model weights allocated in RAM.</span>
        </div>
      )}

      {/* Connection Status Banner */}
      {ollamaConnected ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>✅ Ollama Connected — AI Engine Ready</span>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>⚠️ Ollama Not Detected — Install from ollama.com to enable AI</span>
        </div>
      )}

      {/* Business Profile Settings */}
      <div className="bg-[#0E1629] border border-white/10 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-white font-['Outfit'] text-base border-b border-white/10 pb-3">
          Business Profile (For Invoices & Reports)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Business / Company Name</label>
            <input 
              type="text" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Casjoe Retail Hub"
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Contact Email</label>
            <input 
              type="email" 
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="hello@casjoe.com"
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Phone Number</label>
            <input 
              type="text" 
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Bank Account Details (For Payments)</label>
            <input 
              type="text" 
              value={businessBank}
              onChange={(e) => setBusinessBank(e.target.value)}
              placeholder="GTBank - 0123456789"
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Physical Address (For AutoFill & Invoices)</label>
            <input 
              type="text" 
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">RC Number / TIN (Tax ID)</label>
            <input 
              type="text" 
              value={businessRcTin}
              onChange={(e) => setBusinessRcTin(e.target.value)}
              placeholder="RC-1928301 / TIN-0091823"
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Official Website URL</label>
            <input 
              type="url" 
              value={businessWebsite}
              onChange={(e) => setBusinessWebsite(e.target.value)}
              placeholder="https://casjoe.com"
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
          </div>
        </div>

        <button onClick={handleSaveSettings} className="btn-primary text-xs py-2.5 px-5 mt-3 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Save Business Profile</span>
        </button>
      </div>

      <div className="space-y-2 mt-4">
  <label className="text-xs font-semibold text-slate-300">ERP API Token</label>
  <input
    type="text"
    value={erpApiToken}
    onChange={(e) => setErpApiToken(e.target.value)}
    placeholder="Enter ERP API token"
    className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
  />
  <button onClick={handleSaveErpToken} className="btn-primary text-xs py-2.5 px-5 mt-2">
    Save ERP Token
  </button>
</div>
{/* Installed Models */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Installed Models</h3>

        {(!ollamaModels || ollamaModels.length === 0) && !ollamaConnected ? (
          <div className="p-5 rounded-2xl border bg-[#0E1629] border-white/10 text-slate-300">
            Ollama is not running. Install from ollama.com
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ollamaModels?.map((m) => {
              const isSelected = selectedModel === m.name;
              return (
                <div
                  key={m.name}
                  onClick={() => handleSelectModel(m.name)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'bg-[#0E1629] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-[#F59E0B] animate-ping' : 'bg-slate-600'}`} />
                      <h4 className="font-bold text-white text-base font-['Outfit']">{m.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-[#080C18] text-amber-400 px-2.5 py-1 rounded-md border border-white/10">
                      Installed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Size</span>
                      <strong className="text-white">{formatBytes(m.size)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Models */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recommended Models</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECOMMENDED_MODELS.map((m) => {
            const isInstalled = ollamaModels?.some(installed => installed.name === m.name);
            const isPulling = pullProgress[m.name];
            
            return (
              <div
                key={m.name}
                className="p-5 rounded-2xl border bg-[#0E1629] border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-white text-base font-['Outfit']">{m.displayName}</h4>
                  </div>
                  {isInstalled ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Installed ✓
                    </span>
                  ) : (
                    <button
                      disabled={!!isPulling || !ollamaConnected}
                      onClick={() => handlePullModel(m.name)}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <HardDrive className="w-3 h-3" />
                      {isPulling ? `${isPulling.percent}%` : 'Pull Model'}
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>

                {isPulling && (
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${isPulling.percent}%` }}></div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Size</span>
                    <strong className="text-white">{m.size}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Min RAM</span>
                    <strong className="text-sky-400">{m.minRam}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Speed</span>
                    <strong className="text-emerald-400">{m.speed}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Quantization & Hardware Allocation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quantization & Context Length */}
        <div className="bg-[#0E1629] border border-white/10 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-white font-['Outfit'] text-base border-b border-white/10 pb-3">
            Quantization & Context Window
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Model Quantization Format</label>
            <select
              value={quantization}
              onChange={(e) => setQuantization(e.target.value)}
              className="custom-select w-full"
            >
              <option value="Q4_K_M">Q4_K_M (Recommended - Balanced speed & accuracy)</option>
              <option value="Q4_0">Q4_0 (Legacy low RAM format)</option>
              <option value="Q5_K_M">Q5_K_M (Higher accuracy - Requires 6GB+ free RAM)</option>
              <option value="IQ3_XS">IQ3_XS (Ultra-compact 3-bit - For 4GB laptops)</option>
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-300">Context Window Size</label>
            <select
              value={contextLength}
              onChange={(e) => setContextLength(Number(e.target.value))}
              className="custom-select w-full"
            >
              <option value={2048}>2048 Tokens (Lowest Memory)</option>
              <option value={4096}>4096 Tokens (Standard Business Documents)</option>
              <option value={8192}>8192 Tokens (Extended RAG Search)</option>
            </select>
          </div>
        </div>

        {/* CPU Threads & Power Mode */}
        <div className="bg-[#0E1629] border border-white/10 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-white font-['Outfit'] text-base border-b border-white/10 pb-3">
            CPU Threads & Thermal Management
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <label className="font-semibold">Allocated CPU Threads</label>
              <span className="font-mono text-amber-400 font-bold">{threadCount} Threads</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="2"
              value={threadCount}
              onChange={(e) => setThreadCount(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-[#F59E0B]">
                <Battery className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Thermal & Battery Saver Mode</h4>
                <p className="text-[11px] text-slate-400">Prevents overheating on low-power laptop batteries</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={powerSaver}
              onChange={(e) => setPowerSaver(e.target.checked)}
              className="w-5 h-5 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Application Version & Software Updates */}
      <div className="bg-[#0E1629] border border-white/10 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-white font-['Outfit'] text-base border-b border-white/10 pb-3 flex items-center justify-between">
          <span>Application Version & Updates</span>
          <span className="text-xs font-mono font-bold bg-[#FF9F00]/10 text-[#FF9F00] px-2.5 py-1 rounded-md border border-[#FF9F00]/30">
            v1.0.0 Stable
          </span>
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
              Auto-Update
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl">
              Casjoe Agent OS checks for updates automatically on launch. Click below to check right now — if an update is available it will download and install silently.
            </p>
            {/* Update status feedback */}
            {updateStatus && (
              <div className={`mt-2 text-xs font-semibold flex items-center gap-2 px-3 py-2 rounded-lg border ${
                updateStatus.status === 'up-to-date'  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                updateStatus.status === 'available' || updateStatus.status === 'downloaded' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                updateStatus.status === 'error'       ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                'text-slate-300 bg-white/5 border-white/10'
              }`}>
                {updateStatus.status === 'checking'    && <><RefreshCw className="w-3 h-3 animate-spin" /> Checking for updates…</>}
                {updateStatus.status === 'up-to-date'  && <><CheckCircle className="w-3 h-3" /> You're on the latest version!</>}
                {updateStatus.status === 'available'   && <><Download className="w-3 h-3" /> Update v{updateStatus.version} found — downloading…</>}
                {updateStatus.status === 'downloading' && <><RefreshCw className="w-3 h-3 animate-spin" /> Downloading… {updateStatus.percent}%</>}
                {updateStatus.status === 'downloaded'  && <><CheckCircle className="w-3 h-3" /> v{updateStatus.version} ready — restart to install</>}
                {updateStatus.status === 'error'       && <><AlertTriangle className="w-3 h-3" /> {updateStatus.message}</>}
              </div>
            )}
          </div>

          <button
            onClick={handleCheckForUpdates}
            disabled={updateStatus?.status === 'checking' || updateStatus?.status === 'downloading'}
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${updateStatus?.status === 'checking' || updateStatus?.status === 'downloading' ? 'animate-spin' : ''}`} />
            <span>Check for Updates</span>
          </button>
        </div>
      </div>

      {/* Offline Data Management & Disaster Recovery */}
      <div className="bg-[#0E1629] border border-white/10 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-white font-['Outfit'] text-base flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-500" />
            <span>Offline Data Management &amp; Disaster Recovery</span>
          </h3>
          {backupMsg && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 animate-pulse">
              {backupMsg}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Card 1: Export */}
          <div className="bg-[#0A0F1D] border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export System Backup</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download a full JSON snapshot of your customers, invoices, inventory, documents, and memory.
              </p>
            </div>
            <button 
              onClick={handleExportDatabase}
              className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Export Backup File
            </button>
          </div>

          {/* Card 2: Restore */}
          <div className="bg-[#0A0F1D] border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Restore from Backup</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Restore database from a previous `.json` backup file on this machine or a new laptop.
              </p>
            </div>
            <input 
              type="file" 
              ref={restoreFileInputRef}
              onChange={handleRestoreFile}
              accept=".json"
              className="hidden" 
            />
            <button 
              onClick={() => restoreFileInputRef.current?.click()}
              className="w-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4" /> Select Backup JSON
            </button>
          </div>

          {/* Card 3: Storage Maintenance */}
          <div className="bg-[#0A0F1D] border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Prune Old Agent Logs</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Auto-prune old task logs while keeping the latest 100 entries to optimize local storage.
              </p>
            </div>
            <button 
              onClick={handlePruneLogs}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" /> Prune Storage Logs
            </button>
          </div>
        </div>
      </div>

      {/* License Activation */}
      <div className="bg-[#0E1629] border border-amber-500/30 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white font-['Outfit']">License Activation</h3>
          {licenseStatus === 'valid' && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full font-semibold">
              <Star className="w-3 h-3" /> Pro Activated
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Activate your Casjoe Agent OS Pro license to unlock premium features including advanced AI agents, unlimited prompt slots, and priority updates. Purchase a key at{' '}
          <a href="https://casperjoe.gumroad.com/l/casjoeagent" target="_blank" rel="noreferrer" className="text-amber-400 underline">casperjoe.gumroad.com/l/casjoeagent</a>.
        </p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email used at purchase"
            value={licenseEmail}
            onChange={e => setLicenseEmail(e.target.value)}
            className="w-full bg-[#1A2740] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={e => setLicenseKey(e.target.value.toUpperCase())}
              maxLength={19}
              className="flex-1 bg-[#1A2740] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 outline-none focus:border-amber-500"
            />
            <button
              onClick={handleActivateLicense}
              disabled={licenseStatus === 'checking'}
              className="btn-primary text-xs px-5 py-2.5"
            >
              {licenseStatus === 'checking' ? 'Checking…' : 'Activate'}
            </button>
          </div>
          {licenseStatus === 'valid' && (
            <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> License is valid – Pro features unlocked!</p>
          )}
          {licenseStatus === 'invalid' && (
            <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Invalid key. Please check and try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
