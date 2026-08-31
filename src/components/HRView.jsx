import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Phone, Mail, DollarSign, 
  Building2, Briefcase, Calendar, Trash2, CheckCircle2, 
  Printer, Download, Filter, FileText, ChevronRight 
} from 'lucide-react';
import { useEmployees, usePayroll, deleteEmployee, addPayrollRecord } from '../db/hooks';

export default function HRView({ onOpenAddEmployee }) {
  const employees = useEmployees() || [];
  const payrollHistory = usePayroll() || [];
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'payroll'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payrollMonth, setPayrollMonth] = useState('August 2026');

  const departments = ['All', 'Engineering', 'Operations', 'Procurement', 'Finance', 'Sales', 'Management'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'All' || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  // Metrics
  const totalStaff = employees.length;
  const activeStaff = employees.filter(e => e.status === 'Active').length;
  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + (parseFloat(e.salary) || 0), 0);
  const uniqueDepts = new Set(employees.map(e => e.department).filter(Boolean)).size;

  const handleRunMonthlyPayroll = async () => {
    if (employees.length === 0) return;
    const now = new Date().toISOString();
    for (const emp of employees) {
      const basic = parseFloat(emp.salary) || 0;
      const allowances = 0;
      const deductions = 0;
      const netSalary = basic + allowances - deductions;

      await addPayrollRecord({
        employeeId: emp.id,
        employeeName: emp.name,
        month: payrollMonth,
        basicSalary: basic,
        allowances,
        deductions,
        netSalary,
        status: 'Paid',
        paymentDate: now.split('T')[0]
      });
    }
    alert(`Monthly payroll for ${payrollMonth} successfully logged for ${employees.length} employees.`);
    setActiveTab('payroll');
  };

  const handlePrintPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
            <Users className="w-6 h-6 text-[#FF9F00]" />
            HR & Payroll Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Offline employee directory, organizational departments, salary structures, and payslips.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#0C1222] p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'directory'
                  ? 'bg-[#FF9F00] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Staff Directory
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'payroll'
                  ? 'bg-[#FF9F00] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Payroll Ledger
            </button>
          </div>
          <button
            onClick={onOpenAddEmployee}
            className="btn-primary text-xs flex items-center gap-2 py-2.5 px-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Headcount</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">{totalStaff}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Employees</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-['Outfit']">{activeStaff}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Monthly Payroll</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-[#FF9F00]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-[#FF9F00] font-['Outfit']">
            ₦{(totalMonthlyPayroll || 0).toLocaleString()}
          </span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Departments</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">{uniqueDepts}</span>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <div className="space-y-4">
          {/* Search & Dept Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, role, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="custom-input pl-10 w-full text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="custom-select text-xs py-2 px-3"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Cards Grid */}
          {filteredEmployees.length === 0 ? (
            <div className="bg-[#070B15] border border-white/10 rounded-2xl p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">No employees found matching the filters.</p>
              <button
                onClick={onOpenAddEmployee}
                className="btn-primary text-xs py-2 px-4 mx-auto"
              >
                Add First Employee
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-[#070B15] border border-white/10 hover:border-amber-500/40 transition rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-[#FF9F00] font-bold text-sm font-['Outfit']">
                        {(emp.name || 'U').charAt(0)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {emp.status || 'Active'}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`Remove employee record "${emp.name}"?`)) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="text-slate-500 hover:text-rose-400 transition p-1"
                          title="Delete employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base leading-tight font-['Outfit']">{emp.name}</h3>
                      <p className="text-xs text-amber-400 font-medium mt-0.5">{emp.role}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{emp.department || 'General'}</span>
                      </div>
                      {emp.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{emp.email}</span>
                        </div>
                      )}
                      {emp.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Monthly Salary</div>
                      <div className="text-sm font-bold text-white font-mono">
                        ₦{(parseFloat(emp.salary) || 0).toLocaleString()}
                      </div>
                    </div>
                    {emp.joinDate && (
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Joined</div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp.joinDate}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Payroll Tab */
        <div className="space-y-6">
          <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white font-['Outfit'] text-base">Generate Monthly Payroll</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Process salary disbursements for all active employees for the selected period.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                placeholder="e.g. August 2026"
                className="custom-input text-xs py-2 px-3 w-40"
              />
              <button
                onClick={handleRunMonthlyPayroll}
                className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
              >
                Execute Payroll
              </button>
            </div>
          </div>

          {/* Payroll History Table */}
          <div className="bg-[#070B15] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {payrollHistory.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">No payroll records have been executed yet.</p>
                <button
                  onClick={handleRunMonthlyPayroll}
                  className="btn-primary text-xs py-2 px-4 mx-auto"
                >
                  Run First Payroll
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0C1222] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Pay Period</th>
                      <th className="p-4">Staff Name</th>
                      <th className="p-4">Basic Salary</th>
                      <th className="p-4">Net Payout</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date Disbursed</th>
                      <th className="p-4 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {payrollHistory.map((pr) => (
                      <tr key={pr.id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-bold text-white">{pr.month}</td>
                        <td className="p-4 text-amber-400 font-semibold">{pr.employeeName}</td>
                        <td className="p-4 font-mono text-slate-300">
                          ₦{(parseFloat(pr.basicSalary) || 0).toLocaleString()}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          ₦{(parseFloat(pr.netSalary) || 0).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
                            {pr.status || 'Paid'}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{pr.paymentDate || '—'}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handlePrintPayslip(pr)}
                            className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1.5 ml-auto"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print</span>
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
      )}
    </div>
  );
}
