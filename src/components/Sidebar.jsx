import React from 'react';
import { LayoutDashboard, Users, Wallet, Sparkles, FileText, Cpu, Settings, Package, ShoppingCart, BookOpen, Bot, Globe, Compass } from 'lucide-react';
import casjoeLogo from '../assets/casjoelogo.png';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'agent-os', label: 'Agent OS', icon: Bot, badge: 'NEW' },
    { id: 'agent-browser', label: 'Agent Browser', icon: Compass, badge: 'MANUS' },
    { id: 'casjoe-biz', label: 'Casjoe Biz', icon: Globe },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Chat', icon: Sparkles },
    { id: 'prompts', label: 'Prompt Library', icon: BookOpen },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'documents', label: 'Docs', icon: FileText },
    { id: 'performance', label: 'Performance', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'erp', label: 'ERP', icon: Globe },
  ];

  return (
    <aside className="w-56 bg-[#070B15] border-r border-white/10 flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-61px)]">
      <nav className="space-y-2 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 relative ${
                isActive
                  ? 'bg-[#111A30] text-[#FF9F00] font-bold shadow-md shadow-orange-500/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Orange Left Border Bar for Active item matching Image 1 */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF9F00] rounded-r-md" />
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
      </nav>

      {/* Bottom Left Logo Badge matching Image 1 */}
      <div className="pt-4 border-t border-white/5 px-2 flex items-center justify-start">
        <div className="w-8 h-8 rounded-lg bg-[#090E1B] border border-[#FF9F00]/30 flex items-center justify-center p-1 opacity-80 hover:opacity-100 transition-opacity">
          <img src={casjoeLogo} alt="Casjoe Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>
    </aside>
  );
}
