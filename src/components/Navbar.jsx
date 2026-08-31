import React from 'react';
import { Menu, Sun, Moon, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import GlobalAIChat from './GlobalAIChat';
import casjoeLogo from '../assets/casjoelogo.png';

export default function Navbar({ 
  selectedModel, 
  ollamaConnected, 
  isDarkMode, 
  toggleTheme,
  isSidebarCollapsed,
  toggleSidebar
}) {
  return (
    <header className="w-full bg-[#070B15] border-b border-white/10 px-4 lg:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 transition-colors">
      {/* Left: Brand Logo & Title matching Image 1 */}
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={toggleSidebar}
          className="p-2 text-slate-400 hover:text-[#FF9F00] hover:bg-white/5 rounded-xl transition-colors shrink-0"
          title={isSidebarCollapsed ? "Expand Sidebar (Widescreen Mode)" : "Collapse Sidebar (Full Width Mode)"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3 cursor-pointer">
          {/* Logo image */}
          <div className="w-9 h-9 rounded-xl bg-[#090E1B] border border-[#FF9F00]/30 flex items-center justify-center p-1.5 shadow-md shadow-orange-500/10 transition-colors">
            <img src={casjoeLogo} alt="Casjoe Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-lg font-extrabold font-['Outfit'] text-white tracking-tight leading-none transition-colors">
              Casjoe Agent OS
            </h1>
            <span className="text-[10px] font-semibold text-[#FF9F00] tracking-wide block mt-0.5">
              Offline Business AI
            </span>
          </div>
        </div>
      </div>

      {/* Center: Global AI Command Bar */}
      <GlobalAIChat selectedModel={selectedModel} ollamaConnected={ollamaConnected} />

      {/* Right Controls matching Image 1 */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="offline-status-pill hidden sm:inline-flex">
          <span className={ollamaConnected ? "green-pulse-dot" : "w-2 h-2 rounded-full bg-amber-500"} />
          <span className="text-xs font-bold text-white tracking-wide">
            {ollamaConnected ? "🟢 AI Online" : "⚡ Offline Mode"}
          </span>
        </div>

        {/* Download App Button */}
        <a 
          href="https://github.com/okparacasperjoe/casjoe-agent-os/releases/latest" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-[#1F2937] hover:bg-[#374151] border border-gray-700 rounded-lg text-sm font-semibold text-white transition-colors"
          title="Download the latest Casjoe Agent OS offline desktop app"
        >
          <svg className="w-4 h-4 text-[#FF9F00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download App
        </a>

        {/* Theme sun/moon icon */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-300 hover:text-amber-400 transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile Avatar "CJ" matching Image 1 */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF9F00] to-[#FF6B00] text-black font-extrabold flex items-center justify-center text-xs shadow-md shadow-orange-500/20">
          CJ
        </div>
      </div>
    </header>
  );
}
