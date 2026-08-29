import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import CRMView from './CRMView';
import FinanceView from './FinanceView';
import InventoryView from './InventoryView';
import POSView from './POSView';
import ProjectView from './ProjectView';
import TaskView from './TaskView';
import { syncAll } from '../services/erpSync';
export default function ERPView({
  customers,
  invoices,
  inventory,
  onOpenAddCustomer,
  onOpenCreateInvoice,
  onOpenAddInventory,
}) {
  const sections = [
    { id: 'crm', label: 'CRM' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'project', label: 'Project' },
    { id: 'finance', label: 'Finance' },
    { id: 'pos', label: 'POS' },
    { id: 'task', label: 'Task' },
  ];

  const [selected, setSelected] = useState('crm');
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const renderSection = () => {
    switch (selected) {
      case 'crm':
        return <CRMView customers={customers} onOpenAddCustomer={onOpenAddCustomer} />;
      case 'inventory':
        return (
          <InventoryView
            inventory={inventory}
            onOpenAddModal={onOpenAddInventory}
          />
        );
      case 'project':
        return <ProjectView />;
      case 'finance':
        return <FinanceView invoices={invoices} onOpenCreateInvoice={onOpenCreateInvoice} />;
      case 'pos':
        return <POSView inventory={inventory} />;
      case 'task':
        return <TaskView />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
  <select
    value={selected}
    onChange={(e) => setSelected(e.target.value)}
    className="bg-gray-800 text-white p-2 rounded"
  >
    {sections.map((s) => (
      <option key={s.id} value={s.id}>
        {s.label}
      </option>
    ))}
  </select>
  <button
    onClick={async () => {
      setSyncing(true);
      try {
        const result = await syncAll();
        setToast({ message: `Sync completed: ${result.uploaded || 0} uploaded, ${result.downloaded || 0} downloaded`, type: 'success' });
      } catch (err) {
        setToast({ message: `Sync failed: ${err.message}`, type: 'error' });
      } finally {
        setSyncing(false);
      }
    }}
    className="btn-primary text-xs py-2.5 px-5"
    disabled={syncing}
  >
    {syncing ? 'Syncing...' : 'Sync Now'}
  </button>
</div>
      <ErrorBoundary>{renderSection()}</ErrorBoundary>
    </div>
  );
}
