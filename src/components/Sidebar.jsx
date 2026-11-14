import React from 'react';
import { 
  Bot, Zap, Compass, Building2, Sparkles, Settings, 
  PanelLeftClose, PanelLeftOpen, PhoneCall 
} from 'lucide-react';
import casjoeLogo from '../assets/casjoelogo.png';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed = false, 
  onToggleCollapse,
  onOpenLiveCall 
}) {
  const erpSubItemIds = [
    'crm', 'finance', 'expenses', 'inventory', 'pos', 
    'procurement', 'projects', 'tasks', 'hr', 'documents', 'erp'
  ];
  const isErpChildActive = erpSubItemIds.includes(activeTab);

  const navItems = [
    { id: 'agent-os', label: 'Home', icon: Bot },
    { id: 'missions', label: 'Live Missions', icon: Zap, badge: 'MUSE' },
    { id: 'agent-browser', label: 'Agent Browser', icon: Compass },
    { 
      id: 'erp', 
      label: 'Business Suite', 
      icon: Building2, 
      isActive: isErpChildActive || activeTab === 'erp' 
    },
    { id: 'chat', label: 'AI Chat', icon: Sparkles },
  ];

  // -------------------------------------------------------------
  // Compact Icon-Only Rail Mode (Collapsed)
  // -------------------------------------------------------------
  if (isCollapsed) {
    return (
      <aside className="w-16 bg-[#070B15] border-r border-white/10 flex flex-col justify-between p-2 shrink-0 hidden md:flex min-h-[calc(100vh-61px)] select-none transition-all duration-200">
        <div className="space-y-2 overflow-y-auto scrollbar-none flex flex-col items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive !== undefined ? item.isActive : activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-[#111A30] text-[#FF9F00] shadow-md shadow-orange-500/10 border border-[#FF9F00]/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF9F00] rounded-r-md" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF9F00]' : 'text-slate-400'}`} />
              </button>
            );
          })}

          <div className="w-8 h-px bg-white/10 my-1" />

          {/* Quick Live Call Action */}
          {onOpenLiveCall && (
            <button
              onClick={onOpenLiveCall}
              title="Start Live Call (Muse AI Avatar)"
              className="w-11 h-11 flex items-center justify-center rounded-xl transition-all text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 cursor-pointer"
            >
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={() => setActiveTab('settings')}
            title="Settings"
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all relative ${
              activeTab === 'settings'
                ? 'bg-[#111A30] text-[#FF9F00] shadow-md shadow-orange-500/10 border border-[#FF9F00]/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {activeTab === 'settings' && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF9F00] rounded-r-md" />
            )}
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-[#FF9F00]' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* Bottom Expand Toggle Button */}
        <div className="pt-2 border-t border-white/5 flex flex-col items-center gap-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#FF9F00] flex items-center justify-center transition"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // Full Expanded Sidebar Mode (Default)
  // -------------------------------------------------------------
  return (
    <aside className="w-56 bg-[#070B15] border-r border-white/10 flex flex-col justify-between p-3.5 shrink-0 hidden md:flex min-h-[calc(100vh-61px)] select-none transition-all duration-200">
      <div className="space-y-1.5 mt-1">
        {/* Simple 5-Item Navigation */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive !== undefined ? item.isActive : activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 relative group cursor-pointer ${
                isActive
                  ? 'bg-[#111A30] text-[#FF9F00] font-bold shadow-md shadow-orange-500/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FF9F00] rounded-r-md" />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FF9F00]' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className="tracking-tight flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-2">
          <div className="w-full h-px bg-white/5" />
        </div>

        {/* Live Call Button (Muse Voice & Video Call) */}
        {onOpenLiveCall && (
          <button
            onClick={onOpenLiveCall}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 border border-cyan-500/30 text-cyan-300 hover:from-cyan-500/25 hover:to-emerald-500/25 transition-all shadow-sm cursor-pointer group"
          >
            <PhoneCall className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse" />
            <span className="flex-1 text-left">Live Call</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 uppercase font-mono">
              Avatar
            </span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 relative ${
            activeTab === 'settings'
              ? 'bg-[#111A30] text-[#FF9F00] font-bold shadow-md shadow-orange-500/5'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {activeTab === 'settings' && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FF9F00] rounded-r-md" />
          )}
          <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#FF9F00]' : 'text-slate-400'}`} />
          <span className="tracking-tight flex-1 text-left">Settings</span>
        </button>
      </div>

      {/* Bottom Left Logo Badge & Collapse Button */}
      <div className="pt-3 border-t border-white/5 px-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#090E1B] border border-[#FF9F00]/30 flex items-center justify-center p-1 opacity-90">
            <img src={casjoeLogo} alt="Casjoe Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <div className="text-[10px] font-mono text-slate-500">v1.1.0</div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
              className="p-1 text-slate-400 hover:text-[#FF9F00] hover:bg-white/5 rounded-lg transition"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
        </div>
      </div>
    </aside>
  );
}
