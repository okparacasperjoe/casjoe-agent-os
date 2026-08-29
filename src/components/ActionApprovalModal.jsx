import React from 'react';
import { ShieldAlert, Terminal, FileCode, CreditCard, Globe, Database, Check, X, AlertTriangle, Lock } from 'lucide-react';

export default function ActionApprovalModal({ request, onApprove, onDeny }) {
  if (!request) return null;

  const category = request.category || (request.type === 'terminal' ? 'TERMINAL_COMMAND' : 'SYSTEM_ACTION');
  const risk = request.risk || 'High';

  const getCategoryConfig = () => {
    switch (category) {
      case 'HIGH_VALUE_FINANCE':
        return {
          icon: CreditCard,
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          title: request.title || 'High-Value Financial Transaction',
          desc: 'An agent is requesting to record a high-value invoice / invoice transaction.',
          riskColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        };
      case 'TERMINAL_COMMAND':
        return {
          icon: Terminal,
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          title: request.title || 'Elevated Terminal Shell Execution',
          desc: 'An agent is requesting to execute a terminal command on the host OS.',
          riskColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        };
      case 'FILE_OVERWRITE':
        return {
          icon: FileCode,
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          title: request.title || 'Sensitive File System Modification',
          desc: 'An agent is modifying or overwriting project configuration files.',
          riskColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      case 'BROWSER_TAKEOVER':
        return {
          icon: Globe,
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
          title: request.title || 'Live Browser Takeover & Messaging',
          desc: 'An agent is requesting automated interaction with an external web portal.',
          riskColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        };
      case 'DATA_MUTATION':
        return {
          icon: Database,
          badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          title: request.title || 'Bulk Database Record Modification',
          desc: 'An agent is performing a bulk update or deletion across stored records.',
          riskColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        };
      default:
        return {
          icon: ShieldAlert,
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          title: request.title || 'Security Privilege Approval',
          desc: 'An agent is requesting elevated desktop privileges.',
          riskColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
    }
  };

  const config = getCategoryConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B1222] border border-amber-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${config.badgeColor}`}>
              <Icon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">{config.title}</h3>
              <p className="text-xs text-slate-400">{config.desc}</p>
            </div>
          </div>
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${config.riskColor}`}>
            Risk: {risk}
          </span>
        </div>

        {/* Action Details Card */}
        <div className="space-y-3">
          {category === 'HIGH_VALUE_FINANCE' && (
            <div className="bg-[#070B15] border border-white/10 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{request.customer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Invoice Amount:</span>
                <span className="font-mono font-extrabold text-amber-400 text-sm">{request.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Services / Items:</span>
                <span className="text-slate-300 truncate max-w-xs">{request.items}</span>
              </div>
            </div>
          )}

          {category === 'TERMINAL_COMMAND' && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Shell Command to Execute:</span>
              <div className="bg-slate-950 font-mono text-xs text-rose-300 p-3 rounded-xl border border-rose-950/60 break-all overflow-x-auto">
                {request.command}
              </div>
            </div>
          )}

          {category === 'FILE_OVERWRITE' && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Target File Path:</span>
              <div className="bg-slate-950 font-mono text-xs text-amber-300 p-3 rounded-xl border border-white/10 break-all">
                {request.filePath}
              </div>
            </div>
          )}

          {category === 'BROWSER_TAKEOVER' && (
            <div className="bg-[#070B15] border border-white/10 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target URL:</span>
                <span className="font-mono font-bold text-cyan-400">{request.url}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Action Plan:</span>
                <span className="text-slate-200">{request.task}</span>
              </div>
            </div>
          )}

          {request.details && (
            <p className="text-xs text-slate-300 bg-[#070B15] p-3 rounded-xl border border-white/5">
              {request.details}
            </p>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-amber-950/20 border border-amber-800/30 p-2.5 rounded-xl">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Casjoe Offline Security Gate:</strong> Action executes 100% on your local hardware with no external data transmission.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onDeny}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            <X className="w-4 h-4" /> Deny &amp; Abort
          </button>
          <button
            onClick={onApprove}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4" /> Approve &amp; Execute
          </button>
        </div>
      </div>
    </div>
  );
}
