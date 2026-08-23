import React from 'react';
import { ShieldAlert, Terminal, FileCode, Check, X } from 'lucide-react';

export default function ActionApprovalModal({ request, onApprove, onDeny }) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Security Approval Required</h3>
            <p className="text-xs text-slate-400">An agent is requesting elevated desktop privileges</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-slate-300">
            <strong>Requested Action:</strong> {request.type === 'terminal' ? 'Terminal Command Execution' : 'File System Modification'}
          </div>

          <div className="bg-slate-950 font-mono text-xs text-amber-300 p-3.5 rounded-xl border border-slate-800 break-all overflow-x-auto">
            {request.command || request.filePath || 'System Action'}
          </div>

          <p className="text-xs text-slate-400 bg-amber-950/30 border border-amber-800/40 p-3 rounded-lg">
            ⚠️ <strong>Safeguard Note:</strong> Casjoe Agent OS executes all actions locally on your machine with zero cloud tracking. Please confirm you trust this operation.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onDeny}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            <X className="w-4 h-4" /> Deny & Block
          </button>
          <button
            onClick={onApprove}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4" /> Approve Execution
          </button>
        </div>
      </div>
    </div>
  );
}
