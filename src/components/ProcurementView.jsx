import React, { useState } from 'react';
import { 
  Truck, Plus, Search, Phone, Mail, MapPin, Building2, 
  CheckCircle2, Clock, Trash2, PackageCheck, Download, Filter, 
  FileText, ArrowUpRight 
} from 'lucide-react';
import { 
  useVendors, usePurchaseOrders, useInventory, 
  deleteVendor, deletePurchaseOrder, updatePurchaseOrderStatus 
} from '../db/hooks';

export default function ProcurementView({ onOpenAddVendor, onOpenAddPO }) {
  const vendors = useVendors() || [];
  const purchaseOrders = usePurchaseOrders() || [];
  const inventory = useInventory() || [];
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'vendors'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Metrics
  const totalPOs = purchaseOrders.length;
  const pendingPOs = purchaseOrders.filter(p => p.status === 'Sent' || p.status === 'Draft').length;
  const receivedPOs = purchaseOrders.filter(p => p.status === 'Received').length;
  const activeVendors = vendors.filter(v => v.status === 'Active').length;

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = (po.poNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (po.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (po.items || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || po.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredVendors = vendors.filter(v => {
    return (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (v.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (v.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (v.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Sent':
        return 'bg-amber-500/10 text-[#FF9F00] border-amber-500/20';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleStatusChange = async (poId, newStatus) => {
    await updatePurchaseOrderStatus(poId, newStatus);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
            <Truck className="w-6 h-6 text-[#FF9F00]" />
            Procurement & Vendor Supply
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage vendor contacts, supplier orders, and offline inventory restocking workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#0C1222] p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'pos'
                  ? 'bg-[#FF9F00] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Purchase Orders
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'vendors'
                  ? 'bg-[#FF9F00] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vendor Directory
            </button>
          </div>
          {activeTab === 'pos' ? (
            <button
              onClick={onOpenAddPO}
              className="btn-primary text-xs flex items-center gap-2 py-2.5 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Create PO</span>
            </button>
          ) : (
            <button
              onClick={onOpenAddVendor}
              className="btn-primary text-xs flex items-center gap-2 py-2.5 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Orders (POs)</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">{totalPOs}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Delivery</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-[#FF9F00]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-[#FF9F00] font-['Outfit']">{pendingPOs}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Received & Restocked</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-['Outfit']">{receivedPOs}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Suppliers</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">{activeVendors}</span>
        </div>
      </div>

      {activeTab === 'pos' ? (
        /* Purchase Orders Tab */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search POs by PO number, supplier, or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="custom-input pl-10 w-full text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="custom-select text-xs py-2 px-3"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent to Supplier</option>
                <option value="Received">Received & Stocked</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-[#070B15] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {filteredPOs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Truck className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">No Purchase Orders found.</p>
                <button
                  onClick={onOpenAddPO}
                  className="btn-primary text-xs py-2 px-4 mx-auto"
                >
                  Create First Purchase Order
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0C1222] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">PO Number</th>
                      <th className="p-4">Supplier</th>
                      <th className="p-4">Items / Description</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Order Date</th>
                      <th className="p-4">Expected Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filteredPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-mono font-bold text-[#FF9F00]">{po.poNumber}</td>
                        <td className="p-4 font-bold text-white">{po.vendorName}</td>
                        <td className="p-4 text-slate-300 max-w-xs truncate">{po.items}</td>
                        <td className="p-4 font-mono font-bold text-white">{po.totalAmount}</td>
                        <td className="p-4 font-mono text-slate-400">{po.orderDate || '—'}</td>
                        <td className="p-4 font-mono text-slate-400">{po.expectedDate || '—'}</td>
                        <td className="p-4">
                          <select
                            value={po.status}
                            onChange={(e) => handleStatusChange(po.id, e.target.value)}
                            className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border bg-[#0E1528] ${getStatusBadge(po.status)}`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Received">Received</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Delete Purchase Order "${po.poNumber}"?`)) {
                                deletePurchaseOrder(po.id);
                              }
                            }}
                            className="text-slate-500 hover:text-rose-400 transition p-1"
                            title="Delete PO"
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
      ) : (
        /* Vendor Directory Tab */
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by company, contact person, category, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom-input pl-10 w-full text-xs"
            />
          </div>

          {filteredVendors.length === 0 ? (
            <div className="bg-[#070B15] border border-white/10 rounded-2xl p-12 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">No vendors found matching search.</p>
              <button
                onClick={onOpenAddVendor}
                className="btn-primary text-xs py-2 px-4 mx-auto"
              >
                Add First Vendor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-[#070B15] border border-white/10 hover:border-amber-500/40 transition rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        {vendor.category || 'Supplier'}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Delete vendor "${vendor.name}"?`)) {
                            deleteVendor(vendor.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Delete vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base leading-tight font-['Outfit']">{vendor.name}</h3>
                      {vendor.contactPerson && (
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">Rep: {vendor.contactPerson}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/5">
                      {vendor.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{vendor.email}</span>
                        </div>
                      )}
                      {vendor.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="line-clamp-1">{vendor.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Status: <strong className="text-emerald-400">{vendor.status || 'Active'}</strong></span>
                    <button
                      onClick={() => {
                        alert(`Opening PO composer for ${vendor.name}`);
                      }}
                      className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>New PO</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
