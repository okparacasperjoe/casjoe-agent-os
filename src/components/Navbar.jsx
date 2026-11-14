import React from 'react';
import { Sun, Moon, PanelLeftClose, PanelLeftOpen, PhoneCall } from 'lucide-react';
import casjoeLogo from '../assets/casjoelogo.png';

export default function Navbar({ 
  selectedModel, 
  ollamaConnected, 
  isDarkMode, 
  toggleTheme,
  isSidebarCollapsed,
  toggleSidebar,
  onOpenLiveCall
}) {
  return (
    <header className="w-full bg-[#070B15] border-b border-white/10 px-4 lg:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={toggleSidebar}
          className="p-2 text-slate-400 hover:text-[#FF9F00] hover:bg-white/5 rounded-xl transition-colors shrink-0"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-[#090E1B] border border-[#FF9F00]/30 flex items-center justify-center p-1.5 shadow-md shadow-orange-500/10">
            <img src={casjoeLogo} alt="Casjoe Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>

          <div>
            <h1 className="text-base font-extrabold font-['Outfit'] text-white tracking-tight leading-none">
              Casjoe Agent OS
            </h1>
            <span className="text-[10px] font-semibold text-[#FF9F00] tracking-wide block mt-0.5">
              Offline Business AI
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 md:gap-3 shrink-0">
        
        {/* Live Call Button (Muse AI Voice & Video Call) */}
        {onOpenLiveCall && (
          <button
            onClick={onOpenLiveCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 transition-all text-xs font-bold shadow-md shadow-cyan-500/10 cursor-pointer active:scale-95"
            title="Start Live Voice/Video Call with Muse AI"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="tracking-wide">Live Call</span>
          </button>
        )}

        {/* Offline / Online Status Pill */}
        <div className="offline-status-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className={ollamaConnected ? "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" : "w-2 h-2 rounded-full bg-amber-500"} />
          <span className="text-[11px] font-bold text-white tracking-wide">
            {ollamaConnected ? "AI Online" : "Offline"}
          </span>
        </div>

        {/* Theme sun/moon icon */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-300 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Avatar "CJ" */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9F00] to-[#FF6B00] text-black font-extrabold flex items-center justify-center text-xs shadow-md shadow-orange-500/20">
          CJ
        </div>
      </div>
    </header>
  );
}
