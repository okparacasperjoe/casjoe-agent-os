import React, { useState } from 'react';
import { Users, UserPlus, Search, MapPin, Phone, Building2, CheckCircle, Sparkles, Filter, Trash2 } from 'lucide-react';
import { deleteCustomer } from '../db/hooks';

export default function CRMView({ customers, onOpenAddCustomer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');

  const filtered = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLoc = filterLocation === 'All' || c.location.includes(filterLocation);
    return matchesSearch && matchesLoc;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0E1629] border border-white/10 p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-white">Customer Relationship Management</h2>
          <p className="text-sm text-slate-400">Offline Customer Database for African Merchants & Enterprises</p>
        </div>

        <button
          onClick={onOpenAddCustomer}
          className="btn-primary text-xs py-2.5 px-4"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
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
                <th className="py-3.5 px-5">Phone Contact</th>
                <th className="py-3.5 px-5">Total Purchases</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">AI Sentiment</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white text-sm">{c.name}</div>
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
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{c.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-extrabold text-white font-['Outfit'] text-sm">
                    {c.totalSpent}
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
                    <button onClick={() => deleteCustomer(c.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
    </div>
  );
}
