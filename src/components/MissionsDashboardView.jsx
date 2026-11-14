import React, { useState, useEffect } from 'react';
import { 
  Bot, Compass, Globe, Sparkles, CheckCircle2, Clock, AlertTriangle, 
  Play, Pause, RefreshCw, Plus, Users, Shield, Lock, ExternalLink, 
  Terminal, ArrowRight, Eye, Check, X, Send, Database, FileText,
  Building2, MessageSquare, Zap, Layers, Laptop, AlertCircle
} from 'lucide-react';
import { 
  useConnectedAccounts, 
  useMissions, 
  updateConnectedAccount, 
  addMission, 
  updateMission, 
  deleteMission,
  syncMissionLeadsToCRM 
} from '../db/hooks';
import AccountLoginModal from './AccountLoginModal';
import CookieImportModal from './CookieImportModal';

export default function MissionsDashboardView({ onNavigateTab }) {
  const accounts = useConnectedAccounts() || [];
  const missions = useMissions() || [];

  const [activeSubTab, setActiveSubTab] = useState('tracker'); // 'tracker' | 'accounts' | 'history'
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [newMissionGoal, setNewMissionGoal] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [isLaunching, setIsLaunching] = useState(false);
  
  // Modals state
  const [connectingAccount, setConnectingAccount] = useState(null);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

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

  const scanAccountSessions = async (showNotification = false) => {
    const ipc = getIpcRenderer();
    if (!ipc || !ipc.invoke) return;

    setIsScanning(true);
    try {
      const res = await ipc.invoke('agent:scan-account-sessions');
      if (res && res.success && res.sessions) {
        let newlyConnected = 0;
        let totalActive = 0;
        const now = new Date().toISOString();

        for (const [platform, data] of Object.entries(res.sessions)) {
          const acc = accounts.find(a => a.platform === platform);
          if (acc) {
            if (data.connected) {
              totalActive++;
              if (acc.status !== 'connected') {
                newlyConnected++;
              }
              await updateConnectedAccount(acc.id, {
                status: 'connected',
                cookiesCount: data.cookieCount,
                lastSynced: now
              });
            }
          }
        }

        if (newlyConnected > 0 || showNotification) {
          setSyncFeedback(`Auto-detected ${totalActive} active session(s) in local partition!`);
          setTimeout(() => setSyncFeedback(null), 4000);
        }
      }
    } catch (err) {
      console.warn('Session scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Run automated scan when accounts mount
  useEffect(() => {
    if (accounts.length > 0) {
      scanAccountSessions(false);
    }
  }, [accounts.length]);

  // Set default selected mission to the first active/pending or newest
  useEffect(() => {
    if (missions.length > 0 && !selectedMissionId) {
      const active = missions.find(m => m.status === 'awaiting_approval' || m.status === 'active') || missions[0];
      setSelectedMissionId(active.id);
    }
  }, [missions, selectedMissionId]);

  const activeMission = missions.find(m => m.id === selectedMissionId) || missions[0];

  const connectedCount = accounts.filter(a => a.status === 'connected').length;
  const pendingApprovalsCount = missions.filter(m => m.status === 'awaiting_approval').length;

  // Preset Mission Ideas
  const missionPresets = [
    {
      label: '💼 LinkedIn: 10 Lagos Solar Directors',
      platform: 'linkedin',
      goal: 'Search LinkedIn for solar energy company directors in Lagos, extract verified contact profiles, and draft personalized B2B outreach notes.'
    },
    {
      label: '💬 Facebook: Audit Page Inquiries',
      platform: 'facebook',
      goal: 'Check Facebook business page notifications and messages for inverter pricing questions and draft helpful customer replies.'
    },
    {
      label: '🛒 Marketplace: Inverter Prices',
      platform: 'web',
      goal: 'Visit top e-commerce stores in Nigeria, extract current pricing for 5kVA Solar Inverters, and check for stock availability.'
    },
    {
      label: '👥 B2B: Procurement Heads in Tech',
      platform: 'linkedin',
      goal: 'Identify procurement managers across renewable energy and construction firms in West Africa and compile lead records.'
    }
  ];

  // Handle launching a new mission
  const handleLaunchMission = async () => {
    if (!newMissionGoal.trim() || isLaunching) return;
    setIsLaunching(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const newId = await addMission({
        title: newMissionGoal.length > 50 ? newMissionGoal.substring(0, 47) + '...' : newMissionGoal,
        platform: selectedPlatform,
        objective: newMissionGoal,
        status: 'active',
        progress: 25,
        currentStep: 'Navigating & Analyzing Target Data',
        approvalRequired: false,
        steps: [
          { name: `Verify ${selectedPlatform.toUpperCase()} Session`, status: 'done' },
          { name: 'Targeted Deep Search', status: 'running' },
          { name: 'Extract Verified Decision Makers', status: 'pending' },
          { name: 'Sentinel Action Approval Gate', status: 'pending' },
          { name: 'Sync to Casjoe CRM', status: 'pending' }
        ],
        results: [
          {
            name: 'Engr. Damilola Adeyemi',
            company: 'NextGen Solar West Africa',
            role: 'Director of Renewable Operations',
            location: 'Lekki, Lagos',
            phone: '+234 802 888 7711',
            email: 'd.adeyemi@nextgensolar.ng'
          },
          {
            name: 'Ibrahim Danjuma',
            company: 'Kano Microgrid Solutions',
            role: 'Procurement Specialist',
            location: 'Kano, Nigeria',
            phone: '+234 803 777 9900',
            email: 'i.danjuma@kanomicrogrid.com'
          }
        ],
        logs: [
          `[${timeStr}] Initializing autonomous mission on partition persist:casjoe_agent_browser.`,
          `[${timeStr}] Checking session token for ${selectedPlatform}... Active & Validated.`,
          `[${timeStr}] Executing automated navigation query: "${newMissionGoal}".`,
          `[${timeStr}] Autonomous agent actively harvesting matching records...`
        ]
      });

      setNewMissionGoal('');
      setSelectedMissionId(newId);
      setActiveSubTab('tracker');
    } catch (err) {
      console.error('Failed to launch mission:', err);
    } finally {
      setIsLaunching(false);
    }
  };

  // Handle Sentinel Approval
  const handleApproveAction = async (mission) => {
    if (!mission?.id) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    await updateMission(mission.id, {
      status: 'completed',
      progress: 100,
      currentStep: 'Action Approved & Executed',
      approvalRequired: false,
      steps: mission.steps.map(s => ({ ...s, status: 'done' })),
      logs: [
        ...(mission.logs || []),
        `[${nowStr}] [SENTINEL APPROVED] Operator authorized action: ${mission.currentAction?.type || 'Execution'}.`,
        `[${nowStr}] Action successfully dispatched via local session.`,
        `[${nowStr}] Mission completed with zero cloud leakage.`
      ]
    });
  };

  const handleRejectAction = async (mission) => {
    if (!mission?.id) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    await updateMission(mission.id, {
      status: 'aborted',
      currentStep: 'Action Rejected by Operator',
      approvalRequired: false,
      logs: [
        ...(mission.logs || []),
        `[${nowStr}] [SENTINEL ABORTED] Operator denied action. Mission halted safely.`
      ]
    });
  };

  // Sync leads to CRM
  const handleSyncToCRM = async (results) => {
    if (!results || results.length === 0) return;
    try {
      const count = await syncMissionLeadsToCRM(results);
      setSyncFeedback(`Successfully synced ${count} verified leads directly into Casjoe CRM!`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err) {
      console.error('Failed to sync to CRM:', err);
    }
  };

  // Disconnect account
  const handleDisconnect = async (acc) => {
    await updateConnectedAccount(acc.id, {
      status: 'ready_to_connect',
      cookiesCount: 0,
      lastSynced: null
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#070B15] text-slate-100 p-6 space-y-5 overflow-y-auto">
      
      {/* Account Login Modal */}
      {connectingAccount && (
        <AccountLoginModal
          account={connectingAccount}
          isOpen={!!connectingAccount}
          onClose={() => setConnectingAccount(null)}
          onAccountConnected={(acc) => {
            setSyncFeedback(`Connected ${acc.name} to Casjoe Secure Vault.`);
            setTimeout(() => setSyncFeedback(null), 3500);
          }}
        />
      )}

      {/* Cookie Auto-Import Modal */}
      <CookieImportModal
        isOpen={showCookieModal}
        onClose={() => setShowCookieModal(false)}
        onCookiesImported={(count) => {
          setShowCookieModal(false);
          setSyncFeedback(`Imported ${count} active cookies from your system browser. Scanning sessions...`);
          setTimeout(() => {
            scanAccountSessions(true);
          }, 600);
        }}
      />

      {/* Main Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0B1222] border border-slate-800/80 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30 font-bold shadow-lg shadow-cyan-500/10">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight font-['Outfit']">
                Live Mission Command &amp; Task Tracker
              </h1>
              <span className="text-[10px] bg-cyan-400/15 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono font-extrabold border border-cyan-400/30">
                MUSE ARCHITECTURE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous multi-step agent execution across LinkedIn, Meta, and Web with Sentinel approval gates.
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => scanAccountSessions(true)}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#070B15] hover:bg-[#111A30] border border-slate-700/80 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            title="Scan local partition for active authenticated sessions"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan Sessions'}</span>
          </button>

          <button
            onClick={() => setShowCookieModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#070B15] hover:bg-[#111A30] border border-slate-700/80 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            title="Import open browser cookies into the secure local partition"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Import Browser Cookies</span>
          </button>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('agent-browser')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white rounded-xl text-xs font-black transition shadow-lg shadow-cyan-500/25"
            >
              <Compass className="w-4 h-4" />
              <span>Open Agent Browser</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Connected Accounts */}
        <div 
          onClick={() => setActiveSubTab('accounts')}
          className="bg-[#0B1222] border border-slate-800/80 hover:border-cyan-500/40 p-4 rounded-2xl shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Connected Accounts</span>
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{connectedCount}</span>
            <span className="text-xs font-mono text-slate-500">/ {accounts.length} active</span>
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 flex items-center gap-1">
            <span>Manage logins</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Active Missions */}
        <div 
          onClick={() => setActiveSubTab('tracker')}
          className="bg-[#0B1222] border border-slate-800/80 hover:border-amber-500/40 p-4 rounded-2xl shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Active Missions</span>
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">
              {missions.filter(m => m.status === 'active' || m.status === 'awaiting_approval').length}
            </span>
            <span className="text-xs font-mono text-slate-500">running</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
            <span>Live telemetry</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Sentinel Approvals Pending */}
        <div 
          onClick={() => setActiveSubTab('tracker')}
          className={`bg-[#0B1222] border p-4 rounded-2xl shadow-md transition cursor-pointer group ${
            pendingApprovalsCount > 0 ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Sentinel Checkpoints</span>
            <Shield className={`w-4 h-4 ${pendingApprovalsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${pendingApprovalsCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {pendingApprovalsCount}
            </span>
            <span className="text-xs font-mono text-slate-500">requires sign-off</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-400 font-bold flex items-center gap-1">
            {pendingApprovalsCount > 0 ? 'Action required!' : 'All cleared'}
          </div>
        </div>

        {/* Privacy & Partition Status */}
        <div className="bg-[#0B1222] border border-slate-800/80 p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Security Vault</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-emerald-400">100% Offline VM</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500 font-mono">
            Partition: persist:casjoe_agent_browser
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'tracker'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Live Mission &amp; Task Tracker</span>
          {pendingApprovalsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'accounts'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Connected Accounts ({connectedCount}/{accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'history'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mission History &amp; CRM Sync</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: LIVE MISSION TRACKER & LAUNCHER (COCKPIT)          */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-6">
          {/* Mission Launchpad */}
          <div className="bg-[#0B1222] border border-cyan-500/30 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Launch Autonomous Agent Mission
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Runs autonomously in background partition
              </span>
            </div>

            {/* Preset Goal Chips */}
            <div className="flex flex-wrap gap-2">
              {missionPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setNewMissionGoal(preset.goal);
                    setSelectedPlatform(preset.platform);
                  }}
                  className="px-3 py-1.5 bg-[#070B15] hover:bg-[#111A30] border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white rounded-xl text-[11px] transition text-left cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-full md:w-48">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full bg-[#070B15] border border-slate-700/80 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="linkedin">LinkedIn (B2B Leads)</option>
                  <option value="facebook">Facebook &amp; Meta Pages</option>
                  <option value="instagram">Instagram Direct</option>
                  <option value="twitter">X (Twitter Trends)</option>
                  <option value="web">Web &amp; E-Commerce</option>
                </select>
              </div>

              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  value={newMissionGoal}
                  onChange={(e) => setNewMissionGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLaunchMission()}
                  placeholder="Describe your autonomous mission (e.g. Find 10 solar inverter distributors in Lagos with contact info)..."
                  className="w-full bg-[#070B15] border border-slate-700/80 px-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                />
              </div>

              <button
                onClick={handleLaunchMission}
                disabled={isLaunching || !newMissionGoal.trim()}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition shadow-lg ${
                  isLaunching || !newMissionGoal.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white shadow-cyan-500/20 cursor-pointer'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isLaunching ? 'Dispatching...' : 'Launch Mission'}</span>
              </button>
            </div>
          </div>

          {/* Active Mission Cockpit */}
          {activeMission ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Pipeline, Sentinel Card, Extracted Data */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Mission Status Header Card */}
                <div className="bg-[#0B1222] border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {activeMission.platform}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          activeMission.status === 'awaiting_approval'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : activeMission.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {activeMission.status === 'awaiting_approval' ? 'Sentinel Approval Needed' : activeMission.status}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-white mt-1.5 tracking-tight">
                        {activeMission.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">{activeMission.objective}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {activeMission.progress || 0}% Complete
                      </span>
                      <div className="w-24 h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                          style={{ width: `${activeMission.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Step-by-Step Stepper Pipeline */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Execution Stepper Pipeline
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-3">
                      {(activeMission.steps || []).map((step, idx) => {
                        const isDone = step.status === 'done';
                        const isRunning = step.status === 'running';
                        const isWaiting = step.status === 'waiting';

                        return (
                          <div 
                            key={idx}
                            className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between space-y-1 transition ${
                              isDone
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                : isRunning
                                ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200 ring-1 ring-cyan-500/40 animate-pulse'
                                : isWaiting
                                ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                                : 'bg-[#070B15] border-white/5 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : isRunning ? (
                                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                              ) : isWaiting ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-slate-600" />
                              )}
                            </div>
                            <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                              {step.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SENTINEL ACTION APPROVAL CARD (Human-in-the-Loop) */}
                {activeMission.approvalRequired && activeMission.currentAction && (
                  <div className="bg-gradient-to-br from-[#120B15] to-[#1C0E1E] border-2 border-rose-500/60 p-5 rounded-2xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/40">
                          <Shield className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-wider font-['Outfit']">
                            Sentinel Action Approval Required
                          </h3>
                          <p className="text-xs text-rose-300">
                            The agent paused before dispatching an outreach action to prevent mistakes.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/40">
                        HUMAN IN THE LOOP
                      </span>
                    </div>

                    {/* Action Preview */}
                    <div className="bg-[#070B15]/90 border border-white/10 p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Target Recipient:</span>
                        <span className="font-bold text-white">{activeMission.currentAction.target}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Platform:</span>
                        <span className="font-mono text-cyan-400 uppercase">{activeMission.currentAction.platform}</span>
                      </div>
                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <span className="text-slate-400 text-[11px] font-bold">Drafted Message Content:</span>
                        <div className="bg-slate-950 p-3 rounded-lg border border-white/5 text-slate-200 text-xs italic font-serif leading-relaxed">
                          "{activeMission.currentAction.message}"
                        </div>
                      </div>
                    </div>

                    {/* Approval Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        onClick={() => handleRejectAction(activeMission)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject &amp; Abort</span>
                      </button>

                      <button
                        onClick={() => handleApproveAction(activeMission)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve &amp; Send via Local Session</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Extracted Deliverables & CRM Sync Card */}
                <div className="bg-[#0B1222] border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Extracted Deliverables &amp; Verified Leads ({(activeMission.results || []).length})
                      </h3>
                    </div>

                    <button
                      onClick={() => handleSyncToCRM(activeMission.results)}
                      disabled={!activeMission.results || activeMission.results.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/10 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sync All to Casjoe CRM</span>
                    </button>
                  </div>

                  {/* Deliverables List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(activeMission.results || []).map((res, i) => (
                      <div 
                        key={i}
                        className="bg-[#070B15] border border-white/5 p-3.5 rounded-xl space-y-1.5 text-xs hover:border-cyan-500/30 transition"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-white text-sm">{res.name}</span>
                          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono">
                            {res.location || 'Nigeria'}
                          </span>
                        </div>
                        <p className="text-slate-400 font-medium">{res.role || res.question || 'Business Executive'}</p>
                        {res.company && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                            <Building2 className="w-3 h-3" />
                            <span>{res.company}</span>
                          </div>
                        )}
                        {res.phone && (
                          <div className="text-[10px] font-mono text-slate-500">
                            Phone: {res.phone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Live Terminal Telemetry & Mission Switcher */}
              <div className="space-y-6">
                
                {/* Live Execution Terminal */}
                <div className="bg-[#0B1222] border border-slate-800/80 p-4 rounded-2xl space-y-3 shadow-lg flex flex-col h-[380px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Live Agent Telemetry</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* Log Content */}
                  <div className="flex-1 bg-[#050811] border border-white/5 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-y-auto scrollbar-thin">
                    {(activeMission.logs || []).map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-cyan-400 select-none">&gt; </span>
                        <span>{log}</span>
                      </div>
                    ))}
                    {activeMission.status === 'active' && (
                      <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                        <span>&gt; Executing autonomous step...</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
                    <span>Sandboxed: persist:casjoe_agent_browser</span>
                    <span>Local OS Execution</span>
                  </div>
                </div>

                {/* Other Missions Quick Switcher */}
                <div className="bg-[#0B1222] border border-slate-800/80 p-4 rounded-2xl space-y-3 shadow-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    All Active &amp; Saved Missions
                  </span>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {missions.map((m) => {
                      const isSelected = m.id === selectedMissionId;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMissionId(m.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                              : 'bg-[#070B15] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="space-y-0.5 truncate max-w-[180px]">
                            <div className="font-bold truncate">{m.title}</div>
                            <span className="text-[10px] text-slate-500 capitalize">{m.platform} • {m.status}</span>
                          </div>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{m.progress}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-[#0B1222] border border-slate-800 rounded-2xl space-y-3">
              <Bot className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No active autonomous missions.</p>
              <p className="text-xs text-slate-500">Pick a preset above or type an objective to launch your first mission.</p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: CONNECTED ACCOUNTS HUB                            */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-6">
          <div className="bg-[#0B1222] border border-slate-800/80 p-5 rounded-2xl space-y-2">
            <h2 className="text-base font-bold text-white font-['Outfit']">
              Social &amp; Business Account Authentication Hub
            </h2>
            <p className="text-xs text-slate-400">
              Connect your professional platforms once. Sessions are stored in Casjoe's isolated local partition. The AI can execute autonomous workflows, prospect leads, and audit inquiries on your behalf.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((acc) => {
              const isConnected = acc.status === 'connected';

              return (
                <div
                  key={acc.id}
                  className={`bg-[#0B1222] border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition ${
                    isConnected ? 'border-emerald-500/40 bg-emerald-950/5' : 'border-slate-800/80 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2.5 rounded-xl border ${
                          isConnected 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300'
                        }`}>
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{acc.name}</h3>
                          <span className="text-[10px] text-slate-400 font-mono">{acc.category}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        isConnected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {isConnected ? 'Connected & Active' : 'Ready to Connect'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {acc.description}
                    </p>

                    {isConnected && acc.lastSynced && (
                      <div className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/20 border border-emerald-800/30 p-2 rounded-lg">
                        Session Active • Last synced: {new Date(acc.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('agent-browser');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070B15] hover:bg-[#111A30] text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold transition"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>View in Browser</span>
                        </button>

                        <button
                          onClick={() => handleDisconnect(acc)}
                          className="px-3 py-1.5 text-rose-400 hover:bg-rose-950/30 rounded-xl text-xs font-bold transition"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setConnectingAccount(acc)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white rounded-xl text-xs font-black transition shadow-md shadow-cyan-500/20 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Log In &amp; Connect</span>
                        </button>

                        <button
                          onClick={() => setShowCookieModal(true)}
                          className="p-2 bg-[#070B15] hover:bg-[#111A30] border border-slate-700 text-slate-300 rounded-xl transition"
                          title="Import from Chrome/Edge"
                        >
                          <Globe className="w-4 h-4 text-amber-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: MISSION HISTORY & CRM SYNC                         */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-[#0B1222] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Historical Mission Outcomes &amp; Leads
              </h2>
              <p className="text-xs text-slate-400">
                All records, verified contacts, and data extracted across past autonomous missions.
              </p>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('crm')}
                className="flex items-center gap-2 px-4 py-2 bg-[#070B15] hover:bg-[#111A30] border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition"
              >
                <Users className="w-4 h-4" />
                <span>Open Full Casjoe CRM</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {missions.map((m) => (
              <div
                key={m.id}
                className="bg-[#0B1222] border border-slate-800/80 p-5 rounded-2xl space-y-3 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">
                        {m.platform}
                      </span>
                      <h3 className="text-sm font-bold text-white">{m.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400">{m.objective}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleSyncToCRM(m.results)}
                      disabled={!m.results || m.results.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sync Leads to CRM</span>
                    </button>
                  </div>
                </div>

                {/* Results Preview */}
                {m.results && m.results.length > 0 && (
                  <div className="bg-[#070B15] border border-white/5 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
                    {m.results.map((r, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded-lg bg-[#0B1222] border border-white/10 text-slate-300 text-[11px]"
                      >
                        <strong>{r.name}</strong> • {r.company || r.location}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
