import React, { useState } from 'react';
import { 
  Receipt, Plus, Search, DollarSign, TrendingDown, TrendingUp, 
  Trash2, Download, Filter, Calendar, Tag, CreditCard 
} from 'lucide-react';
import { useExpenses, useInvoices, deleteExpense } from '../db/hooks';

export default function ExpensesView({ onOpenAddExpense }) {
  const expenses = useExpenses() || [];
  const invoices = useInvoices() || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');

  const categories = [
    'All', 'Utilities', 'Logistics', 'Salaries', 'Supplies', 
    'Rent', 'Marketing', 'Maintenance', 'Legal & Tax', 'Other'
  ];

  // Helper to parse currency amount
  const parseAmount = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.-]/g, '');
    return parseFloat(clean) || 0;
  };

  // Calculate totals
  const totalExpenseVal = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  
  // Calculate total revenue from paid invoices
  const totalInvoiceVal = invoices.reduce((sum, inv) => {
    return sum + parseAmount(inv.amount);
  }, 0);

  const netOperatingProfit = totalInvoiceVal - totalExpenseVal;

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = (exp.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exp.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exp.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'All' || exp.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['ID', 'Title', 'Category', 'Amount', 'Currency', 'Date', 'Payment Method', 'Reference', 'Notes', 'Created At'];
    const rows = expenses.map(e => [
      e.id,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      e.amount,
      `"${e.currency || 'NGN'}"`,
      `"${e.date || ''}"`,
      `"${(e.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(e.reference || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      `"${e.createdAt || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `casjoe_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
            <Receipt className="w-6 h-6 text-[#FF9F00]" />
            Expenses & Accounting
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Offline operational expenditure tracking, Profit & Loss reconciliation, and cash disbursements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={expenses.length === 0}
            className="btn-secondary text-xs flex items-center gap-2 py-2.5 px-4 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="btn-primary text-xs flex items-center gap-2 py-2.5 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Financial P&L Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Gross Invoiced Revenue</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-['Outfit']">
            ₦{(totalInvoiceVal || 0).toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Reconciled from offline invoices</p>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Operating Expenses</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-rose-400 font-['Outfit']">
            ₦{(totalExpenseVal || 0).toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">{expenses.length} expense records logged</p>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Net Operating Profit</span>
            <div className={`p-2 rounded-lg ${netOperatingProfit >= 0 ? 'bg-amber-500/10 text-[#FF9F00]' : 'bg-rose-500/10 text-rose-400'}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className={`text-2xl font-bold font-['Outfit'] ${netOperatingProfit >= 0 ? 'text-[#FF9F00]' : 'text-rose-400'}`}>
            ₦{(netOperatingProfit || 0).toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            {netOperatingProfit >= 0 ? 'Positive operating margin' : 'Deficit / Needs review'}
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses by title, reference, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-input pl-10 w-full text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="custom-select text-xs py-2 px-3"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#070B15] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">No expense records found.</p>
            <button
              onClick={onOpenAddExpense}
              className="btn-primary text-xs py-2 px-4 mx-auto"
            >
              Log First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0C1222] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Expense Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Ref Code</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition">
                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                      {exp.date || '—'}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{exp.notes}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        {exp.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-rose-400 text-sm font-mono whitespace-nowrap">
                      -₦{(parseFloat(exp.amount) || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                      {exp.paymentMethod || 'Cash'}
                    </td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      {exp.reference || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${exp.title}"?`)) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
