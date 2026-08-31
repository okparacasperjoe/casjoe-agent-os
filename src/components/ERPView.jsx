import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import CRMView from './CRMView';
import FinanceView from './FinanceView';
import ExpensesView from './ExpensesView';
import InventoryView from './InventoryView';
import POSView from './POSView';
import ProcurementView from './ProcurementView';
import ProjectView from './ProjectView';
import TaskView from './TaskView';
import HRView from './HRView';
import DocumentsView from './DocumentsView';
import { syncAll } from '../services/erpSync';
import { 
  Building2, Users, Wallet, Receipt, Package, ShoppingCart, 
  Truck, FolderKanban, CheckSquare, FileText, RefreshCw, Layers 
} from 'lucide-react';

export default function ERPView({
  customers = [],
  invoices = [],
  inventory = [],
  documents = [],
  onOpenAddCustomer,
  onOpenCreateInvoice,
  onOpenAddExpense,
  onOpenAddInventory,
  onOpenUploadDoc,
  onOpenAddProject,
  onOpenAddTask,
  onOpenAddVendor,
  onOpenAddPO,
  onOpenAddEmployee,
}) {
  const sections = [
    { id: 'crm', label: 'CRM & Clients', icon: Users },
    { id: 'finance', label: 'Invoices & Sales', icon: Wallet },
    { id: 'expenses', label: 'Expenses & P&L', icon: Receipt },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart },
    { id: 'procurement', label: 'Procurement & POs', icon: Truck },
    { id: 'project', label: 'Projects & Milestones', icon: FolderKanban },
    { id: 'task', label: 'Tasks (Kanban)', icon: CheckSquare },
    { id: 'hr', label: 'HR & Staff Payroll', icon: Users },
    { id: 'documents', label: 'Document Vault', icon: FileText },
  ];

  const [selected, setSelected] = useState('crm');
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const renderSection = () => {
    switch (selected) {
      case 'crm':
        return <CRMView customers={customers} onOpenAddCustomer={onOpenAddCustomer} />;
      case 'finance':
        return <FinanceView invoices={invoices} onOpenCreateInvoice={onOpenCreateInvoice} />;
      case 'expenses':
        return <ExpensesView onOpenAddExpense={onOpenAddExpense} />;
      case 'inventory':
        return (
          <InventoryView
            inventory={inventory}
            onOpenAddModal={onOpenAddInventory}
          />
        );
      case 'pos':
        return <POSView inventory={inventory} />;
      case 'procurement':
        return (
          <ProcurementView
            onOpenAddVendor={onOpenAddVendor}
            onOpenAddPO={onOpenAddPO}
          />
        );
      case 'project':
        return <ProjectView onOpenAddProject={onOpenAddProject} />;
      case 'task':
        return <TaskView onOpenAddTask={onOpenAddTask} />;
      case 'hr':
        return <HRView onOpenAddEmployee={onOpenAddEmployee} />;
      case 'documents':
        return <DocumentsView documents={documents} onOpenUploadModal={onOpenUploadDoc} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top ERP Suite Toolbar */}
      <div className="bg-[#070B15] border border-white/10 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Module Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-thin">
          {sections.map((s) => {
            const Icon = s.icon;
            const isSel = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isSel
                    ? 'bg-[#FF9F00] text-black font-bold shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-black' : 'text-slate-400'}`} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sync / Refresh Trigger */}
        <button
          onClick={async () => {
            setSyncing(true);
            try {
              const result = await syncAll();
              setToast({ message: `Sync completed: ${result.uploaded || 0} uploaded, ${result.downloaded || 0} downloaded`, type: 'success' });
            } catch (err) {
              setToast({ message: `Offline mode: ${err.message}`, type: 'error' });
            } finally {
              setSyncing(false);
              setTimeout(() => setToast(null), 4000);
            }
          }}
          className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-2"
          disabled={syncing}
          title="Sync local records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-amber-400' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Cloud'}</span>
        </button>
      </div>

      {toast && (
        <div className={`p-3 rounded-xl text-xs font-medium border flex items-center justify-between animate-in fade-in duration-200 ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Render Active ERP View */}
      <ErrorBoundary>{renderSection()}</ErrorBoundary>
    </div>
  );
}
