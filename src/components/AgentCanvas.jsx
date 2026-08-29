import React from 'react';
import { Crown, GitPullRequest, Monitor, Code, Globe, TrendingUp, ShieldCheck, Share2, CheckCircle2, Clock, AlertTriangle, Play, Sparkles, Cpu, Zap } from 'lucide-react';

const ICON_MAP = {
  Crown,
  GitPullRequest,
  Monitor,
  Code,
  Globe,
  TrendingUp,
  ShieldCheck,
  Share2
};

export default function AgentCanvas({ activeAgents = [], currentGoal = '', qaScore = null }) {
  const busyCount = activeAgents.filter(a => a.status === 'working' || a.status === 'thinking').length;
  const doneCount = activeAgents.filter(a => a.status === 'done').length;

  return (
    <div className="bg-[#0B1222]/95 backdrop-blur border border-slate-800/90 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Multi-Agent Autonomous Team Canvas</span>
          </h3>
          <p className="text-xs text-slate-400">8 Specialized Sub-Agents • 100% Offline Orchestration</p>
        </div>

        <div className="flex items-center gap-2">
          {qaScore && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>QA Certified: {qaScore}%</span>
            </div>
          )}

          {currentGoal && (
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                Active Goal
              </span>
              <p className="text-xs text-slate-200 truncate max-w-xs">{currentGoal}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {activeAgents.map((agent) => {
          const IconComponent = ICON_MAP[agent.icon] || Monitor;
          const isWorking = agent.status === 'working' || agent.status === 'thinking';
          const isDone = agent.status === 'done';
          const isFailed = agent.status === 'failed';

          return (
            <div
              key={agent.name}
              className={`relative rounded-xl p-3.5 transition-all duration-300 border ${
                isWorking
                  ? 'bg-slate-800/90 border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
                  : isDone
                  ? 'bg-[#0E1629] border-emerald-500/40 shadow-sm'
                  : isFailed
                  ? 'bg-red-950/30 border-red-500/60'
                  : 'bg-[#070B15] border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl text-white shadow ${agent.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                    <span className={`text-[9px] uppercase font-mono font-semibold ${
                      isWorking ? 'text-amber-400' : isDone ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
                {isWorking && <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isFailed && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              </div>

              <div className="mt-2 text-[11px] text-slate-300 font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800/60 min-h-[42px] break-words line-clamp-2">
                {agent.currentTask || 'Idle and waiting for CEO delegation...'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
