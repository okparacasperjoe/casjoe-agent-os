import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Wallet, Sparkles, FileText, Cpu, Settings, 
  Package, ShoppingCart, BookOpen, Bot, Globe, Compass, ChevronDown, ChevronRight,
  Layers, Building2, Receipt, Truck, FolderKanban, CheckSquare,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import casjoeLogo from '../assets/casjoelogo.png';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed = false, onToggleCollapse }) {
  const erpSubItemIds = [
    'crm', 'finance', 'expenses', 'inventory', 'pos', 
    'procurement', 'projects', 'tasks', 'hr', 'documents', 'erp'
  ];
  const isErpChildActive = erpSubItemIds.includes(activeTab);
  
  const [isErpOpen, setIsErpOpen] = useState(isErpChildActive || true);

  // Auto-expand ERP dropdown if child tab is active
  useEffect(() => {
    if (isErpChildActive) {
      setIsErpOpen(true);
    }
  }, [activeTab, isErpChildActive]);

  const topNavItems = [
    { id: 'agent-os', label: 'Agent OS', icon: Bot, badge: 'CEO' },
    { id: 'agent-browser', label: 'Agent Browser', icon: Compass, badge: 'MANUS' },
    { id: 'code-studio', label: 'AI Code & UI Studio', icon: Code, badge: 'LIVE' },
    { id: 'casjoe-biz', label: 'Casjoe Biz', icon: Globe },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Chat', icon: Sparkles },
    { id: 'prompts', label: 'Prompt Library', icon: BookOpen },
  ];

  const erpSubItems = [
    { id: 'crm', label: 'CRM & Clients', icon: Users },
    { id: 'finance', label: 'Finance & Invoices', icon: Wallet },
    { id: 'expenses', label: 'Expenses & P&L', icon: Receipt },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart },
    { id: 'procurement', label: 'Procurement & POs', icon: Truck },
    { id: 'projects', label: 'Projects & Milestones', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks (Kanban)', icon: CheckSquare },
    { id: 'hr', label: 'HR & Staff Payroll', icon: Users },
    { id: 'documents', label: 'Document Vault', icon: FileText },
    { id: 'erp', label: 'ERP Hub & Sync', icon: Building2 },
  ];

  const bottomNavItems = [
    { id: 'performance', label: 'Performance', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // -------------------------------------------------------------
  // Compact Icon-Only Rail Mode (Collapsed)
  // -------------------------------------------------------------
  if (isCollapsed) {
    return (
      <aside className="w-16 bg-[#070B15] border-r border-white/10 flex flex-col justify-between p-2 shrink-0 hidden md:flex min-h-[calc(100vh-61px)] select-none transition-all duration-200">
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none flex flex-col items-center">
          {/* Top Main Navigation Items */}
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={`${item.label}${item.badge ? ` (${item.badge})` : ''}`}
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

          {/* ERP Hub Trigger / Icon */}
          <button
            onClick={() => setActiveTab('erp')}
            title="ERP Enterprise Suite (Click to open ERP Hub)"
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all relative ${
              isErpChildActive
                ? 'bg-[#111A30] text-[#FF9F00] shadow-md shadow-orange-500/10 border border-[#FF9F00]/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {isErpChildActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF9F00] rounded-r-md" />
            )}
            <Layers className={`w-5 h-5 ${isErpChildActive ? 'text-[#FF9F00]' : 'text-slate-400'}`} />
          </button>

          <div className="w-8 h-px bg-white/10 my-1" />

          {/* Bottom Settings & Performance */}
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
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
    <aside className="w-60 bg-[#070B15] border-r border-white/10 flex flex-col justify-between p-3.5 shrink-0 hidden md:flex min-h-[calc(100vh-61px)] select-none transition-all duration-200">
      <div className="space-y-1 mt-1 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-slate-800 pr-1">
        {/* Main Workspace Navigation */}
        <div className="space-y-1">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 relative ${
                  isActive
                    ? 'bg-[#111A30] text-[#FF9F00] font-bold shadow-md shadow-orange-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FF9F00] rounded-r-md" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF9F00]' : 'text-slate-400'}`} />
                <span className="tracking-tight flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-[#FF9F00]/20 text-[#FF9F00] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ERP Section Divider */}
        <div className="pt-2 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3.5">
            Enterprise Management
          </span>
        </div>

        {/* ERP Accordion Dropdown Parent Item */}
        <div className="space-y-1">
          <button
            onClick={() => setIsErpOpen(prev => !prev)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 relative group ${
              isErpChildActive
                ? 'bg-[#111A30]/80 text-[#FF9F00] font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {isErpChildActive && !isErpOpen && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FF9F00] rounded-r-md" />
            )}
            <Layers className={`w-4 h-4 ${isErpChildActive ? 'text-[#FF9F00]' : 'text-slate-400 group-hover:text-white'}`} />
            <span className="tracking-tight flex-1 text-left font-semibold">ERP Suite</span>
            
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">
                {erpSubItems.length}
              </span>
              {isErpOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
              )}
            </div>
          </button>

          {/* ERP Dropdown Children Menu */}
          {isErpOpen && (
            <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-800/80 ml-4 animate-in slide-in-from-top-2 duration-150">
              {erpSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                const isSubActive = activeTab === subItem.id;
                return (
                  <button
                    key={subItem.id}
                    onClick={() => setActiveTab(subItem.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                      isSubActive
                        ? 'bg-[#FF9F00]/15 text-[#FF9F00] font-bold border border-[#FF9F00]/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-[#FF9F00]' : 'text-slate-500'}`} />
                    <span className="tracking-tight flex-1 text-left truncate">{subItem.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* System & Settings Divider */}
        <div className="pt-2 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3.5">
            System & Tools
          </span>
        </div>

        {/* Bottom Nav Items (Performance & Settings) */}
        <div className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 relative ${
                  isActive
                    ? 'bg-[#111A30] text-[#FF9F00] font-bold shadow-md shadow-orange-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FF9F00] rounded-r-md" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF9F00]' : 'text-slate-400'}`} />
                <span className="tracking-tight flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Left Logo Badge & Collapse Button */}
      <div className="pt-3 border-t border-white/5 px-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#090E1B] border border-[#FF9F00]/30 flex items-center justify-center p-1 opacity-90">
            <img src={casjoeLogo} alt="Casjoe Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <div className="text-[10px] font-mono text-slate-500">v1.0.2</div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Collapse Sidebar (Widescreen Mode)"
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
