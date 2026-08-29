import React, { useState, useEffect, useRef } from 'react';
import { Play, Cpu, Terminal, Shield, Zap, FileText } from 'lucide-react';
import AgentCanvas from './AgentCanvas';
import ActionApprovalModal from './ActionApprovalModal';
import TaskResultModal from './TaskResultModal';
import { AgentOSOrchestrator, AGENT_ROLES } from '../services/agentEngine';
import { getRecentAgentTasks } from '../services/agentMemory';
import { getSelectedModelConfig, saveSelectedModelConfig, getStoredApiKeys, saveApiKeys, PROVIDER_TYPES } from '../services/modelManager';

export default function AgentOSView({ onNavigateTab }) {
  const [goal, setGoal] = useState('');
  const [isRunning, setIsRunning] = useState(false);
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
    // If the goal is a web browsing task, switch to Agent Browser live view
    if (onNavigateTab && (lower.includes('browser') || lower.includes('facebook') || lower.includes('whatsapp') || lower.includes('linkedin') || lower.includes('cpanel') || lower.includes('http') || lower.includes('.com') || lower.includes('.org') || lower.includes('.net'))) {
      onNavigateTab('agent-browser');
      return;
    }

    setIsRunning(true);
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

  return (
    <div className="flex flex-col h-full bg-[#070B15] text-slate-100 p-6 space-y-5 overflow-y-auto">
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

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0B1222] border border-slate-800/80 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Casjoe Agent OS</h1>
            <p className="text-xs text-slate-400">Autonomous business multi-agent engine (100% free & local)</p>
          </div>
        </div>

        {/* Model Configuration Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#050811] border border-slate-800 px-3 py-1.5 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={modelConfig.provider}
              onChange={handleModelChange}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={PROVIDER_TYPES.LOCAL_OLLAMA}>Local Model: Ollama (Offline Free)</option>
              <option value={PROVIDER_TYPES.GROQ}>Cloud Model: Groq Llama-3.3 70B</option>
              <option value={PROVIDER_TYPES.OPENAI}>Cloud Model: OpenAI GPT-4o</option>
              <option value={PROVIDER_TYPES.GEMINI}>Cloud Model: Google Gemini 1.5</option>
            </select>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-[#050811] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs transition"
            title="Cloud Keys"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cloud API Key Settings Panel */}
      {showSettings && (
        <div className="bg-[#0B1222] border border-slate-800 p-4 rounded-2xl space-y-3">
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

      {/* Single Clean Command Bar */}
      <div className="bg-[#0B1222] border border-slate-800/80 p-3.5 rounded-2xl shadow-lg flex gap-2">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRunGoal()}
          placeholder="Enter natural language goal (e.g. 'Create invoice for Sahara Logistics Ltd for ₦450,000 and update CRM')..."
          disabled={isRunning}
          className="flex-1 bg-[#050811] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition font-medium"
        />
        <button
          onClick={() => handleRunGoal()}
          disabled={isRunning || !goal.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition disabled:opacity-50 shrink-0 shadow"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Executing...' : 'Run Goal'}
        </button>
      </div>

      {/* Multi-Agent Live Team Canvas */}
      <AgentCanvas activeAgents={activeAgents} currentGoal={goal} qaScore={taskResult?.qaScore} />

      {/* Live Execution Feed */}
      <div className="bg-[#0B1222] border border-slate-800/80 rounded-2xl p-4 space-y-3 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold text-white">Execution Feed & Event Logs</h3>
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
              No task running. Type a goal above to start your multi-agent execution team!
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
  );
}
