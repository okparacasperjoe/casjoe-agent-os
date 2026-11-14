import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Bot, Zap, Compass, Building2, Search, 
  Terminal, ArrowRight, ChevronDown, ChevronUp, FileText, CheckCircle2 
} from 'lucide-react';
import AgentCanvas from './AgentCanvas';
import ActionApprovalModal from './ActionApprovalModal';
import TaskResultModal from './TaskResultModal';
import { AgentOSOrchestrator, AGENT_ROLES } from '../services/agentEngine';
import { getRecentAgentTasks } from '../services/agentMemory';
import { getSelectedModelConfig } from '../services/modelManager';

export default function AgentOSView({ onNavigateTab }) {
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
    <div className="flex flex-col h-full bg-[#070B15] text-slate-100 p-6 md:p-12 overflow-y-auto max-w-4xl mx-auto w-full justify-center space-y-10">
      
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
          Type an instruction, ask a question, or choose an action below.
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
              placeholder="e.g. Find solar leads on LinkedIn, create an invoice, or browse the web..."
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
      <div className="max-w-3xl mx-auto w-full pt-4">
        <div className="text-center">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition cursor-pointer py-1"
          >
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showAdvanced ? 'Hide Developer Console' : 'Show Advanced Multi-Agent Console & Logs'}</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            <AgentCanvas activeAgents={activeAgents} currentGoal={goal} qaScore={taskResult?.qaScore} />

            <div className="bg-[#0B1222] border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  Terminal Logs
                </span>
                {taskResult && (
                  <button
                    onClick={() => setShowResultModal(true)}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    View Result Output
                  </button>
                )}
              </div>

              <div className="bg-[#050811] rounded-xl p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1 border border-white/5">
                {logs.length === 0 ? (
                  <div className="text-slate-500 text-center py-4 text-xs">
                    No multi-agent events running.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="text-slate-300 text-[11px]">
                      <span className="text-amber-400 mr-2">[{log.agentName}]</span>
                      <span>{log.message}</span>
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
