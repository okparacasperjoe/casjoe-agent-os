import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Bot, Zap, Compass, Building2, Search, 
  Terminal, ArrowRight, ChevronDown, ChevronUp, FileText, CheckCircle2,
  PhoneCall
} from 'lucide-react';
import AgentCanvas from './AgentCanvas';
import ActionApprovalModal from './ActionApprovalModal';
import TaskResultModal from './TaskResultModal';
import { AgentOSOrchestrator, AGENT_ROLES } from '../services/agentEngine';
import { getRecentAgentTasks } from '../services/agentMemory';
import { getSelectedModelConfig } from '../services/modelManager';

export default function AgentOSView({ onNavigateTab, onOpenLiveCall }) {
  const [goal, setGoal] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const orchestratorRef = useRef(null);
  const logEndRef = useRef(null);

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
    const tasks = await getRecentAgentTasks(3);
    setRecentTasks(tasks);
  };

  const handleRunGoal = async (targetGoal) => {
    const goalToRun = targetGoal || goal;
    if (!goalToRun.trim() || isRunning) return;

    const lower = goalToRun.toLowerCase();

    // Route to Live Call if user mentions call / voice / muse / avatar
    if (onOpenLiveCall && (lower.includes('call') || lower.includes('voice') || lower.includes('talk') || lower.includes('muse') || lower.includes('avatar') || lower.includes('phone'))) {
      onOpenLiveCall();
      return;
    }

    // Route to Missions if it's social/lead oriented
    if (onNavigateTab && (lower.includes('facebook') || lower.includes('whatsapp') || lower.includes('linkedin') || lower.includes('lead') || lower.includes('mission'))) {
      onNavigateTab('missions');
      return;
    }
    // Route to Browser if it's web browsing
    if (onNavigateTab && (lower.includes('browser') || lower.includes('website') || lower.includes('http') || lower.includes('.com'))) {
      onNavigateTab('agent-browser');
      return;
    }
    // Route to Invoicing/Business if it's invoice/crm
    if (onNavigateTab && (lower.includes('invoice') || lower.includes('customer') || lower.includes('stock') || lower.includes('inventory'))) {
      onNavigateTab('erp');
      return;
    }

    setIsRunning(true);
    setShowAdvanced(true);
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

  return (
    <div className="flex flex-col h-full bg-[#070B15] text-slate-100 p-6 md:p-12 overflow-y-auto max-w-4xl mx-auto w-full justify-center space-y-8">
      
      {/* Action Approval Modal */}
      {approvalRequest && (
        <ActionApprovalModal
          request={approvalRequest}
          onApprove={() => approvalRequest.resolve(true)}
          onDeny={() => approvalRequest.resolve(false)}
        />
      )}

      {/* Task Result Modal */}
      <TaskResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        taskResult={taskResult}
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. SIMPLE CENTERED GREETING & SINGLE INPUT                     */}
      {/* ------------------------------------------------------------- */}
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
          <Bot className="w-6 h-6" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-['Outfit']">
          What would you like to do?
        </h1>
        <p className="text-sm text-slate-400">
          Type an instruction, start a live call, or select an automated action below.
        </p>

        {/* The One Simple Input Box */}
        <div className="pt-2 max-w-2xl mx-auto">
          <div className="bg-[#0B1222] border-2 border-slate-700/80 hover:border-amber-500/60 focus-within:border-amber-500 rounded-2xl shadow-2xl p-2 flex items-center gap-3 transition-all">
            <Search className="w-5 h-5 text-amber-400 ml-3 shrink-0" />
            
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunGoal()}
              placeholder="e.g. Find solar leads on LinkedIn, start a live voice call, or browse the web..."
              disabled={isRunning}
              className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none py-2"
            />

            <button
              onClick={() => handleRunGoal()}
              disabled={isRunning || !goal.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-lg shrink-0 cursor-pointer ${
                isRunning || !goal.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
          </div>
        </div>

        {/* Live Call Quick Banner */}
        {onOpenLiveCall && (
          <div className="pt-1 flex items-center justify-center">
            <button
              onClick={onOpenLiveCall}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:via-emerald-500/20 hover:to-purple-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-bold text-xs shadow-md shadow-cyan-500/5 cursor-pointer transition-all active:scale-95 group"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                <PhoneCall className="w-3 h-3 animate-pulse" />
              </div>
              <span>Start Live Call with Muse AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 font-mono">
                Lip-Synced Avatar
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. THREE SIMPLE CHOICE CARDS (NO CONFUSION)                   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
        
        {/* Choice 1: Missions */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('missions')}
          className="bg-[#0B1222] border border-slate-800 hover:border-cyan-500/60 p-5 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-3 shadow-md hover:shadow-cyan-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition">
              <Zap className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
              Live Missions
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Harvest leads on LinkedIn, audit Meta inquiries, and run autonomous workflows.
            </p>
          </div>
        </div>

        {/* Choice 2: Browser */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('agent-browser')}
          className="bg-[#0B1222] border border-slate-800 hover:border-amber-500/60 p-5 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-3 shadow-md hover:shadow-amber-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition">
              <Compass className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
              Agent Browser
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Open the visual web browser to navigate websites and import browser cookies.
            </p>
          </div>
        </div>

        {/* Choice 3: Business Suite */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('erp')}
          className="bg-[#0B1222] border border-slate-800 hover:border-purple-500/60 p-5 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-3 shadow-md hover:shadow-purple-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 group-hover:scale-105 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
              Business Suite
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Create invoices, manage CRM clients, check inventory, and view reports.
            </p>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. OPTIONAL ADVANCED CONSOLE (COLLAPSED BY DEFAULT)           */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-3xl mx-auto w-full pt-2">
        <div className="text-center">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 transition cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer Multi-Agent Orchestrator</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            {/* Multi-Agent Roles Visualizer */}
            <div className="bg-[#0B1222] border border-slate-800 rounded-2xl p-4 shadow-inner">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Autonomous Agent Canvas
              </span>
              <AgentCanvas activeAgents={activeAgents} />
            </div>

            {/* Live Terminal Logs */}
            <div className="bg-[#040711] border border-slate-800/80 rounded-2xl p-4 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5 text-[11px] font-bold">
                  <Terminal className="w-3 h-3 text-amber-400" />
                  Agent Execution Feed
                </span>
                <span className="text-[10px] text-slate-500">{logs.length} events logged</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="text-slate-600 italic py-2">Orchestrator standby. Run an instruction above.</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-600 shrink-0 text-[10px]">[{log.timestamp}]</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                        log.level === 'error' ? 'bg-rose-500/20 text-rose-400' :
                        log.level === 'warn' ? 'bg-amber-500/20 text-amber-400' :
                        log.level === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {log.agent ? log.agent.toUpperCase() : 'CORE'}
                      </span>
                      <span className="text-slate-300 break-all">{log.message}</span>
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
