import React, { useState } from 'react';
import { Users, UserPlus, Search, MapPin, Phone, Building2, CheckCircle, Sparkles, Filter, Trash2, MessageSquare, Download, Eye, FileText, X, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { deleteCustomer, useInvoices } from '../db/hooks';

export default function CRMView({ customers = [], onOpenAddCustomer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [inspectCustomer, setInspectCustomer] = useState(null);

  const allInvoices = useInvoices() || [];

  const filtered = customers.filter(c => {
    const nameStr = c.name || '';
    const compStr = c.company || '';
    const locStr = c.location || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || compStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLoc = filterLocation === 'All' || locStr.includes(filterLocation);
    return matchesSearch && matchesLoc;
  });

  const handleOpenWhatsApp = (e, phone, customerName) => {
    e.stopPropagation();
    let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = '234' + cleanPhone.slice(1);
    }
    const message = encodeURIComponent(`Hello ${customerName}, greeting from Casjoe Agent OS!`);
    const url = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['ID', 'Name', 'Company', 'Phone', 'Location', 'Total Spent', 'Status', 'Created At'];
    const rows = customers.map(c => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${(c.totalSpent || '').replace(/"/g, '""')}"`,
      `"${(c.status || '').replace(/"/g, '""')}"`,
      `"${c.createdAt || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `casjoe_crm_customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Find linked invoices for inspected customer
  const customerInvoices = inspectCustomer 
    ? allInvoices.filter(inv => 
        inv.customer && (
          inv.customer.toLowerCase().includes(inspectCustomer.name.toLowerCase()) || 
          (inspectCustomer.company && inv.customer.toLowerCase().includes(inspectCustomer.company.toLowerCase()))
        )
      )
    : [];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0E1629] border border-white/10 p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-white">Customer Relationship Management</h2>
          <p className="text-sm text-slate-400">Offline Customer Database for African Merchants & Enterprises ({customers.length} Contacts)</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={customers.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition disabled:opacity-50"
            title="Export customer list to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddCustomer}
            className="btn-primary text-xs py-2.5 px-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0E1629] border border-white/10 p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name or company..."
            className="custom-input pl-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="custom-select text-xs"
          >
            <option value="All">All Locations</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Ghana">Ghana</option>
            <option value="Kenya">Kenya</option>
            <option value="South Africa">South Africa</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Egypt">Egypt</option>
            <option value="Morocco">Morocco</option>
            <option value="Uganda">Uganda</option>
            <option value="Tanzania">Tanzania</option>
            <option value="Senegal">Senegal</option>
            <option value="Ivory Coast">Ivory Coast</option>
            <option value="Ethiopia">Ethiopia</option>
          </select>
        </div>
      </div>

      {/* Customer Database Table */}
      <div className="bg-[#0E1629] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#080C18] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-5">Customer / Company</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5">Phone & WhatsApp</th>
                <th className="py-3.5 px-5">Total Purchases</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">AI Sentiment</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => setInspectCustomer(c)}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-5">
                    <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      <span>{c.name}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-amber-400" />
                      <span>{c.company}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{c.location}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                      {c.phone && (
                        <button
                          onClick={(e) => handleOpenWhatsApp(e, c.phone, c.name)}
                          className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-400 transition"
                          title="Open direct WhatsApp chat"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 font-extrabold text-amber-400 font-['Outfit'] text-sm">
                    {c.totalSpent || '₦0'}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-[11px] font-medium bg-amber-500/10 text-[#F59E0B] px-2.5 py-1 rounded-lg border border-amber-500/20 inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>High Retention</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setInspectCustomer(c)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
                        title="View Customer Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteCustomer(c.id)} 
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">No customers found.</p>
              <button onClick={onOpenAddCustomer} className="mt-4 text-cyan-400 hover:underline text-xs font-bold">
                + Add your first customer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Dossier & Transaction History Modal */}
      {inspectCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0B1222] border border-white/15 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-[#0E1629] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                  {inspectCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">{inspectCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{inspectCustomer.company || 'Individual Client'}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectCustomer(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Grid */}
            <div className="p-5 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#070B15] border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Spent</span>
                  <span className="text-base font-extrabold text-amber-400 font-mono">{inspectCustomer.totalSpent || '₦0'}</span>
                </div>
                <div className="bg-[#070B15] border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
                  <span className="text-xs font-bold text-emerald-400">{inspectCustomer.status || 'Active'}</span>
                </div>
                <div className="bg-[#070B15] border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Location</span>
                  <span className="text-xs font-semibold text-slate-300 truncate block">{inspectCustomer.location || 'Local'}</span>
                </div>
                <div className="bg-[#070B15] border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Invoices</span>
                  <span className="text-base font-extrabold text-white font-mono">{customerInvoices.length}</span>
                </div>
              </div>

              {/* Quick Communication Bar */}
              <div className="bg-[#0E1629] border border-white/5 p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{inspectCustomer.phone}</span>
                </div>
                {inspectCustomer.phone && (
                  <button
                    onClick={(e) => handleOpenWhatsApp(e, inspectCustomer.phone, inspectCustomer.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message on WhatsApp</span>
                  </button>
                )}
              </div>

              {/* Linked Invoices & Transaction History */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Invoice &amp; Purchase History</span>
                </h4>

                {customerInvoices.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {customerInvoices.map((inv) => (
                      <div key={inv.id} className="bg-[#070B15] border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{inv.invoiceId}</span>
                            <span className={`text-[10px] px-2 py-0.2 rounded font-semibold ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {inv.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 line-clamp-1">{inv.items}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-amber-400 block">{inv.amount}</span>
                          <span className="text-[10px] text-slate-500">{inv.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#070B15] border border-white/5 p-6 rounded-xl text-center text-slate-500 text-xs">
                    No linked invoices recorded yet for this client.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0E1629] flex justify-end">
              <button
                onClick={() => setInspectCustomer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
