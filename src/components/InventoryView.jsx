import React, { useState } from 'react';
import { Package, Search, Plus, TrendingUp, AlertCircle, CheckCircle2, Box, Trash2 } from 'lucide-react';
import { deleteInventoryItem } from '../db/hooks';

export default function InventoryView({ inventory = [], onOpenAddModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculate metrics
  const totalItems = inventory.reduce((sum, item) => sum + parseInt(item.quantity || 0, 10), 0);
  const totalValue = inventory.reduce((sum, item) => sum + (parseInt(item.quantity || 0, 10) * parseFloat(item.price || 0)), 0);
  const lowStockCount = inventory.filter(item => parseInt(item.quantity || 0, 10) < 15 && parseInt(item.quantity || 0, 10) > 0).length;
  const outOfStockCount = inventory.filter(item => parseInt(item.quantity || 0, 10) === 0).length;

  const filteredInventory = inventory.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-[#FF9F00]" />
            Inventory Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">Track stock levels, valuations, and supply chain across offline branches.</p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="bg-gradient-to-r from-[#FF9F00] to-[#FF6B00] text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm font-medium">Total Stock Valuation</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">₦{(totalValue || 0).toLocaleString()}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm font-medium">Items in Stock</span>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Box className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">{totalItems}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm font-medium">Low Stock Alerts</span>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">{lowStockCount}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm font-medium">Out of Stock</span>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">{outOfStockCount}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#070B15] border border-white/10 rounded-2xl overflow-hidden">
        {/* Table Header/Controls */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by SKU, Name or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#111A30] text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">SKU / Item</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Unit Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInventory.map((item) => {
                const qty = parseInt(item.quantity || 0, 10);
                const isOutOfStock = qty === 0;
                const isLowStock = qty > 0 && qty < 15;
                
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">{item.location}</td>
                    <td className="px-6 py-4">
                      <span className={`font-mono font-bold ${isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-white'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      ₦{parseFloat(item.price || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        isOutOfStock 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : isLowStock 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {isOutOfStock ? <AlertCircle className="w-3.5 h-3.5" /> : isLowStock ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteInventoryItem(item.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No inventory items found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
