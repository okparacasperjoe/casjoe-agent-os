import React from 'react';
import { Crown, GitPullRequest, Monitor, Code, Globe, TrendingUp, ShieldCheck, Share2, CheckCircle2, Clock, AlertTriangle, Play } from 'lucide-react';

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

export default function AgentCanvas({ activeAgents = [], currentGoal = '' }) {
  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Multi-Agent Team Canvas
          </h3>
          <p className="text-xs text-slate-400">Live agent delegation hierarchy & execution status</p>
        </div>
        {currentGoal && (
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
              Active Goal
            </span>
            <p className="text-xs text-slate-200 truncate max-w-xs">{currentGoal}</p>
          </div>
        )}
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
              className={`relative rounded-xl p-4 transition-all duration-300 border ${
                isWorking
                  ? 'bg-slate-800/90 border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
                  : isDone
                  ? 'bg-slate-900/80 border-emerald-500/50'
                  : isFailed
                  ? 'bg-red-950/30 border-red-500/60'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg text-white shadow ${agent.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{agent.name}</h4>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{agent.status}</span>
                  </div>
                </div>
                {isWorking && <Clock className="w-4 h-4 text-amber-400 animate-spin" />}
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isFailed && <AlertTriangle className="w-4 h-4 text-red-400" />}
              </div>

              <div className="mt-2 text-[11px] text-slate-300 font-mono bg-slate-950/60 p-2 rounded border border-slate-800/60 min-h-[42px] break-words">
                {agent.currentTask || 'Idle and waiting for CEO delegation...'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
