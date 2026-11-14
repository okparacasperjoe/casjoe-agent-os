import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Cpu, Terminal, Shield, Zap, FileText, Compass, Users, Wallet, 
  Package, Sparkles, Building2, ChevronDown, ChevronUp, ArrowRight, Globe, 
  Bot, CheckCircle2, Clock, Layers, Search, BookOpen
} from 'lucide-react';
import AgentCanvas from './AgentCanvas';
import ActionApprovalModal from './ActionApprovalModal';
import TaskResultModal from './TaskResultModal';
import { AgentOSOrchestrator, AGENT_ROLES } from '../services/agentEngine';
import { getRecentAgentTasks } from '../services/agentMemory';
import { getSelectedModelConfig, saveSelectedModelConfig, getStoredApiKeys, saveApiKeys, PROVIDER_TYPES } from '../services/modelManager';
import { useStats, useMissions } from '../db/hooks';

export default function AgentOSView({ onNavigateTab }) {
  const [goal, setGoal] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showAdvancedConsole, setShowAdvancedConsole] = useState(false);
  
  const stats = useStats();
  const missions = useMissions() || [];

  const [activeAgents, setActiveAgents] = useState(Object.values(AGENT_ROLES).map(r => ({
    name: r.name,
    icon: r.icon,
    color: r.color,
    status: 'idle',
    currentTask: ''
  })));
  const [logs, setLogs] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [taskResult, setTaskResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [modelConfig, setModelConfig] = useState(getSelectedModelConfig());
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState(getStoredApiKeys());

  const orchestratorRef = useRef(null);
  const logEndRef = useRef(null);

  // Time-based personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    orchestratorRef.current = new AgentOSOrchestrator({
      onAgentStateChange: (agents) => setActiveAgents(agents),
      onLogUpdate: (newLogs) => {
        setLogs(newLogs);
        setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      },
      onRequestApproval: async (req) => {
        return new Promise((resolve) => {
          setApprovalRequest({
            ...req,
            resolve: (approved) => {
              setApprovalRequest(null);
              resolve(approved);
            }
          });
        });
      }
    });

    loadRecentTasks();
  }, []);

  const loadRecentTasks = async () => {
    const tasks = await getRecentAgentTasks(5);
    setRecentTasks(tasks);
  };

  const handleRunGoal = async (targetGoal) => {
    const goalToRun = targetGoal || goal;
    if (!goalToRun.trim() || isRunning) return;

    const lower = goalToRun.toLowerCase();
    // If the goal is a social/account task, switch to Live Missions
    if (onNavigateTab && (lower.includes('facebook') || lower.includes('whatsapp') || lower.includes('linkedin') || lower.includes('social') || lower.includes('instagram') || lower.includes('mission') || lower.includes('lead'))) {
      onNavigateTab('missions');
      return;
    }
    // If the goal is a direct web browsing task, switch to Agent Browser live view
    if (onNavigateTab && (lower.includes('browser') || lower.includes('cpanel') || lower.includes('http') || lower.includes('.com') || lower.includes('.org') || lower.includes('.net'))) {
      onNavigateTab('agent-browser');
      return;
    }

    setIsRunning(true);
    setShowAdvancedConsole(true); // Automatically expand live terminal when executing
    setGoal(goalToRun);

    try {
      const res = await orchestratorRef.current.executeGoal(goalToRun);
      if (res && res.success) {
        setTaskResult(res);
        setShowResultModal(true);
      }
    } catch (err) {
      console.error('Goal execution failed:', err);
    } finally {
      setIsRunning(false);
      loadRecentTasks();
    }
  };

  const handleModelChange = (e) => {
    const provider = e.target.value;
    const newConfig = { provider, modelName: provider === PROVIDER_TYPES.LOCAL_OLLAMA ? 'llama3.2' : 'cloud-default' };
    setModelConfig(newConfig);
    saveSelectedModelConfig(newConfig);
  };

  const handleSaveApiKeys = () => {
    saveApiKeys(apiKeys);
    setShowSettings(false);
  };

  // Quick Action Prompt Chips
  const quickActions = [
    {
      label: '🚀 Harvest Solar Leads on LinkedIn',
      prompt: 'Search LinkedIn for solar inverter directors in Lagos and extract lead records'
    },
    {
      label: '📄 Create Invoice for Sahara Logistics',
      prompt: 'Create an invoice for Sahara Logistics Ltd for ₦650,000 for Casjoe Agent OS Hub units'
    },
    {
      label: '🛒 Compare Battery Prices in Browser',
      prompt: 'Open Agent Browser and compare prices for 5kVA Lithium Solar Batteries across Lagos'
    },
    {
      label: '💬 Draft Customer Contract Proposal',
      prompt: 'Draft a standard business contract proposal for a new corporate client'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#070B15] text-slate-100 p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Action Security Modal */}
      {approvalRequest && (
        <ActionApprovalModal
          request={approvalRequest}
          onApprove={() => approvalRequest.resolve(true)}
          onDeny={() => approvalRequest.resolve(false)}
        />
      )}

      {/* Task Output Deliverables Modal */}
      <TaskResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        taskResult={taskResult}
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION: Clean Greeting & Omni-Command Bar            */}
      {/* ------------------------------------------------------------- */}
      <div className="text-center space-y-4 pt-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-mono font-bold animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Casjoe Agent OS • 100% Offline AI Operating System</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight font-['Outfit']">
          {getGreeting()}, Casper.
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
          What would you like your autonomous agents to execute today?
        </p>

        {/* Hero Omni-Action Bar */}
        <div className="relative pt-2">
          <div className="bg-[#0B1222] border-2 border-slate-700/80 hover:border-amber-500/50 focus-within:border-amber-500 rounded-2xl shadow-2xl p-2 flex items-center gap-3 transition-all duration-200">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 text-amber-400" />
            </div>

            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunGoal()}
              placeholder="Ask anything, run a mission, or execute an action (e.g. 'Create invoice for ₦500,000 for Amina')..."
              disabled={isRunning}
              className="flex-1 bg-transparent border-none text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium py-2"
            />

            <button
              onClick={() => handleRunGoal()}
              disabled={isRunning || !goal.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-lg shrink-0 cursor-pointer ${
                isRunning || !goal.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Executing...' : 'Run Goal'}</span>
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleRunGoal(action.prompt)}
                className="px-3 py-1.5 bg-[#0B1222]/80 hover:bg-[#111A30] border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-xl text-[11px] transition text-left cursor-pointer"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. THE 4 MODULAR FEATURE HUBS (Clean 2x2 Grid)               */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Workspaces &amp; Agent Engines
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Zero cloud cost • 100% Local privacy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Hub 1: Live Missions & Social Accounts */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('missions')}
            className="bg-[#0B1222] border border-slate-800/80 hover:border-cyan-500/50 p-5 rounded-2xl shadow-lg hover:shadow-cyan-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition">
                  <Zap className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                      Live Missions &amp; Accounts
                    </h3>
                    <span className="text-[10px] bg-cyan-400/15 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold">
                      MUSE AI
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automate LinkedIn lead sourcing, Meta customer replies, and web tasks.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span className="text-cyan-400 font-semibold">LinkedIn, Facebook, X, WhatsApp</span>
              <span className="font-mono text-slate-500">Sentinel Safety Gates</span>
            </div>
          </div>

          {/* Hub 2: Autonomous Agent Browser */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('agent-browser')}
            className="bg-[#0B1222] border border-slate-800/80 hover:border-amber-500/50 p-5 rounded-2xl shadow-lg hover:shadow-amber-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      Autonomous Agent Browser
                    </h3>
                    <span className="text-[10px] bg-amber-400/15 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                      MANUS
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Visual web navigation, AI cursor automation, and one-click cookie importing.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">Live Webview &amp; Cookie Sync</span>
              <span className="font-mono text-slate-500">Unobstructed UI</span>
            </div>
          </div>

          {/* Hub 3: Enterprise Business Suite */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('erp')}
            className="bg-[#0B1222] border border-slate-800/80 hover:border-purple-500/50 p-5 rounded-2xl shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 group-hover:scale-105 transition">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                      Enterprise Business Suite
                    </h3>
                    <span className="text-[10px] bg-purple-400/15 text-purple-300 px-2 py-0.5 rounded-full font-mono font-bold">
                      ERP &amp; CRM
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Invoices, customer CRM, stock inventory, point-of-sale, and staff payroll.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span className="text-purple-400 font-semibold">CRM • Finance • Stock • POS</span>
              <span className="font-mono text-slate-500">11 Integrated Tools</span>
            </div>
          </div>

          {/* Hub 4: Knowledge Vault & AI Chat */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('chat')}
            className="bg-[#0B1222] border border-slate-800/80 hover:border-emerald-500/50 p-5 rounded-2xl shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      AI Chat &amp; Knowledge Vault
                    </h3>
                    <span className="text-[10px] bg-emerald-400/15 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                      OFFLINE RAG
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chat with local AI, search offline documents, and use 120+ prompt templates.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">120+ Prompt Library • PDF Vault</span>
              <span className="font-mono text-slate-500">Llama 3.2 Offline</span>
            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. TODAY'S BUSINESS PULSE (Minimalist Summary Row)            */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0B1222] border border-slate-800/80 p-4 rounded-2xl shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/5 text-center">
          <div className="p-2">
            <span className="text-[11px] font-bold text-slate-400 block">Total Customers / Leads</span>
            <span className="text-xl font-black text-white mt-1 block">{stats?.customers || 0}</span>
          </div>
          <div className="p-2">
            <span className="text-[11px] font-bold text-slate-400 block">Active Invoices</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">{stats?.invoices || 0}</span>
          </div>
          <div className="p-2">
            <span className="text-[11px] font-bold text-slate-400 block">Inventory Stock Items</span>
            <span className="text-xl font-black text-cyan-400 mt-1 block">{stats?.inventory || 0}</span>
          </div>
          <div className="p-2">
            <span className="text-[11px] font-bold text-slate-400 block">Autonomous Missions</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">{missions.length || 0}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. ADVANCED DEVELOPER / MULTI-AGENT CONSOLE TOGGLE            */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2">
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={() => setShowAdvancedConsole(!showAdvancedConsole)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
          >
            {showAdvancedConsole ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>Multi-Agent Node Canvas &amp; Terminal Logs (Advanced View)</span>
          </button>

          {/* Model Selector Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#050811] border border-slate-800 px-3 py-1 rounded-xl text-xs">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={modelConfig.provider}
                onChange={handleModelChange}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
              >
                <option value={PROVIDER_TYPES.LOCAL_OLLAMA}>Local: Ollama (Offline Free)</option>
                <option value={PROVIDER_TYPES.GROQ}>Cloud: Groq Llama-3.3 70B</option>
                <option value={PROVIDER_TYPES.OPENAI}>Cloud: OpenAI GPT-4o</option>
                <option value={PROVIDER_TYPES.GEMINI}>Cloud: Google Gemini 1.5</option>
              </select>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 bg-[#050811] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs transition"
              title="Cloud Keys"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Cloud API Settings */}
        {showSettings && (
          <div className="mt-3 bg-[#0B1222] border border-slate-800 p-4 rounded-2xl space-y-3 animate-in fade-in">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cloud API Keys (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="password"
                placeholder="Groq API Key (gsk_...)"
                value={apiKeys.groq || ''}
                onChange={(e) => setApiKeys({ ...apiKeys, groq: e.target.value })}
                className="bg-[#050811] border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
              />
              <input
                type="password"
                placeholder="OpenAI API Key (sk-...)"
                value={apiKeys.openai || ''}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                className="bg-[#050811] border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
              />
              <input
                type="password"
                placeholder="Gemini API Key (AIzaSy...)"
                value={apiKeys.gemini || ''}
                onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                className="bg-[#050811] border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
            <button
              onClick={handleSaveApiKeys}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition"
            >
              Save API Keys
            </button>
          </div>
        )}

        {/* Collapsible Canvas & Logs */}
        {showAdvancedConsole && (
          <div className="space-y-4 mt-4 animate-in slide-in-from-top-3 duration-200">
            {/* Multi-Agent Live Team Canvas */}
            <AgentCanvas activeAgents={activeAgents} currentGoal={goal} qaScore={taskResult?.qaScore} />

            {/* Live Execution Feed */}
            <div className="bg-[#0B1222] border border-slate-800/80 rounded-2xl p-4 space-y-3 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <h3 className="text-xs font-bold text-white">Execution Feed &amp; Event Logs</h3>
                </div>
                <div className="flex items-center gap-3">
                  {taskResult && (
                    <button
                      onClick={() => setShowResultModal(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Deliverable Output
                    </button>
                  )}
                  <span className="text-[10px] font-mono text-slate-400">{logs.length} events</span>
                </div>
              </div>

              <div className="flex-1 bg-[#050811] rounded-xl p-3.5 font-mono text-xs overflow-y-auto max-h-56 space-y-2 border border-slate-800/80">
                {logs.length === 0 ? (
                  <div className="text-slate-500 text-center py-6 text-xs">
                    No task currently running in the multi-agent queue.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ${
                        log.agentName.includes('CEO') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        log.agentName.includes('Planner') ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        log.agentName.includes('Desktop') ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        log.agentName.includes('Casjoe Biz') ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.agentName}
                      </span>
                      <span className={`flex-1 break-words ${
                        log.type === 'error' ? 'text-red-400 font-semibold' :
                        log.type === 'success' ? 'text-emerald-300 font-semibold' :
                        log.type === 'goal' ? 'text-amber-300 font-bold' :
                        log.type === 'tool' ? 'text-cyan-300' : 'text-slate-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
