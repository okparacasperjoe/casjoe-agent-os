import React, { useState } from 'react';
import { 
  X, UserPlus, FileText, CheckSquare, Sparkles, Upload, 
  CheckCircle2, Building2, MapPin, Phone, DollarSign, Package, 
  Receipt, Truck, FolderKanban, Users, Mail, Calendar 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  addCustomer, addInvoice, addDocument, addInventoryItem,
  addProject, addTask, addExpense, addVendor, addPurchaseOrder, addEmployee,
  useProjects, useVendors
} from '../db/hooks';
import * as pdfjsLib from 'pdfjs-dist';

// Robust worker configuration for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function Modals({ activeModal, onCloseModal, customers = [] }) {
  const existingProjects = useProjects() || [];
  const existingVendors = useVendors() || [];

  // Add Customer State
  const [customerData, setCustomerData] = useState({
    name: '',
    company: '',
    location: 'Nigeria',
    phone: '',
    totalSpent: '₦0'
  });

  // Add Inventory State
  const [inventoryData, setInventoryData] = useState({
    sku: '',
    name: '',
    category: 'Hardware',
    quantity: '0',
    price: '0',
    location: 'Lagos Warehouse',
  });

  // Create Invoice State
  const [invoiceData, setInvoiceData] = useState({
    customer: '',
    amount: '450,000',
    currency: 'NGN',
    items: 'Casjoe Agent OS Enterprise Setup & Staff Training'
  });

  // Add Task State
  const [taskData, setTaskData] = useState({
    title: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    description: ''
  });

  // Add Project State
  const [projectData, setProjectData] = useState({
    name: '',
    client: '',
    budget: '',
    currency: 'NGN',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: ''
  });

  // Add Expense State
  const [expenseData, setExpenseData] = useState({
    title: '',
    category: 'Utilities',
    amount: '',
    currency: 'NGN',
    paymentMethod: 'Bank Transfer',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Add Vendor State
  const [vendorData, setVendorData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'Hardware & Components'
  });

  // Add Purchase Order State
  const [poData, setPoData] = useState({
    vendorName: '',
    items: '',
    totalAmount: '',
    currency: 'NGN',
    expectedDate: '',
    orderDate: new Date().toISOString().split('T')[0]
  });

  // Add Employee State
  const [employeeData, setEmployeeData] = useState({
    name: '',
    role: '',
    department: 'Engineering',
    salary: '',
    currency: 'NGN',
    email: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // AI Report State
  const [reportType, setReportType] = useState('Sales & Revenue');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReportText, setGeneratedReportText] = useState(null);

  // Upload Doc State
  const [uploadFileName, setUploadFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  if (!activeModal) return null;

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!customerData.name) return;
    await addCustomer({
      ...customerData,
      status: 'Active'
    });
    onCloseModal();
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    if (!inventoryData.name || !inventoryData.sku) return;
    const qty = parseInt(inventoryData.quantity, 10);
    const status = qty === 0 ? 'Out of Stock' : qty < 15 ? 'Low Stock' : 'In Stock';
    await addInventoryItem({
      ...inventoryData,
      status
    });
    onCloseModal();
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectData.name) return;
    await addProject({
      ...projectData,
      budget: parseFloat(projectData.budget) || 0
    });
    onCloseModal();
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskData.title) return;
    await addTask({
      ...taskData,
      projectId: taskData.projectId ? parseInt(taskData.projectId, 10) : undefined
    });
    onCloseModal();
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseData.title || !expenseData.amount) return;
    await addExpense({
      ...expenseData,
      amount: parseFloat(expenseData.amount) || 0
    });
    onCloseModal();
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (!vendorData.name) return;
    await addVendor(vendorData);
    onCloseModal();
  };

  const handlePOSubmit = async (e) => {
    e.preventDefault();
    if (!poData.vendorName || !poData.items) return;
    await addPurchaseOrder(poData);
    onCloseModal();
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!employeeData.name || !employeeData.salary) return;
    await addEmployee({
      ...employeeData,
      salary: parseFloat(employeeData.salary) || 0
    });
    onCloseModal();
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    
    let symbol = '$';
    switch(invoiceData.currency) {
      case 'NGN': symbol = '₦'; break;
      case 'GHS': symbol = 'GH₵ '; break;
      case 'KES': symbol = 'KSh '; break;
      case 'ZAR': symbol = 'R '; break;
      case 'RWF': symbol = 'FRw '; break;
      case 'EGP': symbol = 'E£ '; break;
      case 'MAD': symbol = 'DH '; break;
      case 'UGX': symbol = 'USh '; break;
      case 'TZS': symbol = 'TSh '; break;
      case 'XOF': symbol = 'CFA '; break;
      case 'ETB': symbol = 'Br '; break;
    }
    
    await addInvoice({
      id: 'INV-2026-00' + Math.floor(Math.random() * 90 + 10),
      customer: invoiceData.customer,
      amount: `${symbol}${invoiceData.amount}`,
      currency: invoiceData.currency,
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      items: invoiceData.items
    });
    onCloseModal();
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setGeneratedReportText(`Casjoe Agent OS OFFLINE REPORT (${reportType.toUpperCase()})\n\nKey Insights:\n1. July Revenue reached ₦9.8M with 79% gross profit margins across regional branches.\n2. Agent OS query volume increased 34% with zero cloud API expense.\n3. Customer retention rate improved to 98.4% across Lagos, Nairobi, Accra, and Johannesburg hubs.`);
      setIsGeneratingReport(false);
    }, 1200);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFileName || !selectedFile) {
      alert("Please select a file first.");
      return;
    }
    
    setIsParsing(true);
    try {
      let content = 'No text content extracted.';
      let numPages = 1;
      
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        numPages = pdf.numPages;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(s => s.str).join(' ') + '\n';
        }
        content = fullText || 'No text found in PDF.';
      } else {
        content = await selectedFile.text();
      }

      await addDocument({
        id: 'doc-' + Date.now(),
        name: uploadFileName,
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        type: selectedFile.name.split('.').pop() || 'pdf',
        pages: numPages,
        date: new Date().toISOString().split('T')[0],
        summary: 'Manually uploaded document.',
        content: content
      });
      onCloseModal();
    } catch (err) {
      console.error(err);
      alert('Error parsing document: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCloseModal}>
      <div className="bg-[#0C1222] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#F59E0B] flex items-center justify-center">
              {activeModal === 'addCustomer' && <UserPlus className="w-4 h-4" />}
              {activeModal === 'createInvoice' && <FileText className="w-4 h-4" />}
              {activeModal === 'addTask' && <CheckSquare className="w-4 h-4" />}
              {activeModal === 'addProject' && <FolderKanban className="w-4 h-4" />}
              {activeModal === 'addExpense' && <Receipt className="w-4 h-4" />}
              {activeModal === 'addVendor' && <Truck className="w-4 h-4" />}
              {activeModal === 'addPO' && <Truck className="w-4 h-4" />}
              {activeModal === 'addEmployee' && <Users className="w-4 h-4" />}
              {activeModal === 'aiReport' && <Sparkles className="w-4 h-4" />}
              {activeModal === 'uploadDoc' && <Upload className="w-4 h-4" />}
              {activeModal === 'addInventory' && <Package className="w-4 h-4" />}
            </div>
            <h3 className="font-bold text-white font-['Outfit'] text-lg">
              {activeModal === 'addCustomer' && 'Add New Customer'}
              {activeModal === 'createInvoice' && 'Generate Invoice'}
              {activeModal === 'addTask' && 'Add Action Task'}
              {activeModal === 'addProject' && 'Create New Project'}
              {activeModal === 'addExpense' && 'Log Business Expense'}
              {activeModal === 'addVendor' && 'Register New Vendor'}
              {activeModal === 'addPO' && 'Create Purchase Order (PO)'}
              {activeModal === 'addEmployee' && 'Add New Employee'}
              {activeModal === 'aiReport' && 'Generate AI Report'}
              {activeModal === 'uploadDoc' && 'Upload Local Document'}
              {activeModal === 'addInventory' && 'Add Inventory Item'}
            </h3>
          </div>
          <button onClick={onCloseModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal 1: Add Customer */}
        {activeModal === 'addCustomer' && (
          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Customer Full Name</label>
              <input
                type="text"
                required
                value={customerData.name}
                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                placeholder="e.g. Amina Bello"
                className="custom-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Company</label>
                <input
                  type="text"
                  required
                  value={customerData.company}
                  onChange={(e) => setCustomerData({ ...customerData, company: e.target.value })}
                  placeholder="e.g. Sahara Logistics"
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Location</label>
                <select
                  value={customerData.location}
                  onChange={(e) => setCustomerData({ ...customerData, location: e.target.value })}
                  className="custom-select w-full"
                >
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

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Phone Number</label>
              <input
                type="text"
                required
                value={customerData.phone}
                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                placeholder="+234 802 123 4567"
                className="custom-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Save Customer</button>
            </div>
          </form>
        )}

        {/* Modal 2: Create Invoice */}
        {activeModal === 'createInvoice' && (
          <form onSubmit={handleInvoiceSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Select Customer</label>
              <select
                value={invoiceData.customer}
                onChange={(e) => setInvoiceData({ ...invoiceData, customer: e.target.value })}
                className="custom-select w-full"
                required
              >
                {customers.length === 0 ? (
                  <option value="" disabled>No customers found. Add one in CRM first.</option>
                ) : (
                  <>
                    <option value="" disabled>Select a customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Currency</label>
                <select
                  value={invoiceData.currency}
                  onChange={(e) => setInvoiceData({ ...invoiceData, currency: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="NGN">NGN (Nigeria)</option>
                  <option value="GHS">GHS (Ghana)</option>
                  <option value="KES">KES (Kenya)</option>
                  <option value="ZAR">ZAR (South Africa)</option>
                  <option value="RWF">RWF (Rwanda)</option>
                  <option value="EGP">EGP (Egypt)</option>
                  <option value="MAD">MAD (Morocco)</option>
                  <option value="UGX">UGX (Uganda)</option>
                  <option value="TZS">TZS (Tanzania)</option>
                  <option value="XOF">XOF (Senegal/Ivory Coast)</option>
                  <option value="ETB">ETB (Ethiopia)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Amount</label>
                <input
                  type="text"
                  required
                  value={invoiceData.amount}
                  onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Line Items / Description</label>
              <input
                type="text"
                required
                value={invoiceData.items}
                onChange={(e) => setInvoiceData({ ...invoiceData, items: e.target.value })}
                className="custom-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Generate Tax Invoice</button>
            </div>
          </form>
        )}

        {/* Modal: Add Project */}
        {activeModal === 'addProject' && (
          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Project Title</label>
              <input
                type="text"
                required
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                placeholder="e.g. Solar AI Hub Deployment"
                className="custom-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Client / Organization</label>
                <input
                  type="text"
                  value={projectData.client}
                  onChange={(e) => setProjectData({ ...projectData, client: e.target.value })}
                  placeholder="e.g. Kano Community Clinic"
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Budget (₦)</label>
                <input
                  type="number"
                  min="0"
                  value={projectData.budget}
                  onChange={(e) => setProjectData({ ...projectData, budget: e.target.value })}
                  placeholder="e.g. 4500000"
                  className="custom-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Start Date</label>
                <input
                  type="date"
                  value={projectData.startDate}
                  onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Target Deadline</label>
                <input
                  type="date"
                  value={projectData.endDate}
                  onChange={(e) => setProjectData({ ...projectData, endDate: e.target.value })}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Project Scope / Details</label>
              <textarea
                rows={2}
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                placeholder="Deliverables, milestones, and hardware configs..."
                className="custom-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Create Project</button>
            </div>
          </form>
        )}

        {/* Modal: Add Task */}
        {activeModal === 'addTask' && (
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Task Title</label>
              <input
                type="text"
                required
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                placeholder="e.g. Configure ESC/POS thermal receipt printer"
                className="custom-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Link to Project</label>
                <select
                  value={taskData.projectId}
                  onChange={(e) => setTaskData({ ...taskData, projectId: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="">(No linked project)</option>
                  {existingProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Priority</label>
                <select
                  value={taskData.priority}
                  onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Assigned To</label>
                <input
                  type="text"
                  value={taskData.assignedTo}
                  onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
                  placeholder="e.g. Amina Bello"
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Due Date</label>
                <input
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Task Description (Optional)</label>
              <textarea
                rows={2}
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                placeholder="Additional instructions or acceptance criteria..."
                className="custom-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Save Task</button>
            </div>
          </form>
        )}

        {/* Modal: Add Expense */}
        {activeModal === 'addExpense' && (
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Expense Title / Description</label>
              <input
                type="text"
                required
                value={expenseData.title}
                onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
                placeholder="e.g. Lagos Warehouse Electricity & Solar Inverter Service"
                className="custom-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Category</label>
                <select
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="Utilities">Utilities</option>
                  <option value="Logistics">Logistics & Freight</option>
                  <option value="Salaries">Staff Allowances / Salaries</option>
                  <option value="Supplies">Supplies & Consumables</option>
                  <option value="Rent">Rent & Facilities</option>
                  <option value="Marketing">Marketing & Sales</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Legal & Tax">Legal & Compliance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Amount (₦)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                  placeholder="e.g. 350000"
                  className="custom-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Payment Method</label>
                <select
                  value={expenseData.paymentMethod}
                  onChange={(e) => setExpenseData({ ...expenseData, paymentMethod: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="POS Card">POS / Card</option>
                  <option value="Direct Debit">Direct Debit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Reference Code (Optional)</label>
                <input
                  type="text"
                  value={expenseData.reference}
                  onChange={(e) => setExpenseData({ ...expenseData, reference: e.target.value })}
                  placeholder="e.g. EXP-2026-05"
                  className="custom-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Notes (Optional)</label>
              <input
                type="text"
                value={expenseData.notes}
                onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
                placeholder="Additional details or receipt memo..."
                className="custom-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Log Expense</button>
            </div>
          </form>
        )}

        {/* Modal: Add Vendor */}
        {activeModal === 'addVendor' && (
          <form onSubmit={handleVendorSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Supplier / Vendor Business Name</label>
              <input
                type="text"
                required
                value={vendorData.name}
                onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
                placeholder="e.g. SunPower Africa Renewable Ltd"
                className="custom-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Contact Person</label>
                <input
                  type="text"
                  value={vendorData.contactPerson}
                  onChange={(e) => setVendorData({ ...vendorData, contactPerson: e.target.value })}
                  placeholder="e.g. Grace Adewale"
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Category</label>
                <input
                  type="text"
                  value={vendorData.category}
                  onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })}
                  placeholder="e.g. Energy & Solar"
                  className="custom-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={vendorData.phone}
                  onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
                  placeholder="+234 812 444 9900"
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={vendorData.email}
                  onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                  placeholder="orders@sunpowerafrica.com"
                  className="custom-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Physical Address</label>
              <input
                type="text"
                value={vendorData.address}
                onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
                placeholder="Victoria Island, Lagos"
                className="custom-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Save Vendor</button>
            </div>
          </form>
        )}

        {/* Modal: Add Purchase Order */}
        {activeModal === 'addPO' && (
          <form onSubmit={handlePOSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Select Vendor</label>
              <select
                value={poData.vendorName}
                onChange={(e) => setPoData({ ...poData, vendorName: e.target.value })}
                className="custom-select w-full"
                required
              >
                {existingVendors.length === 0 ? (
                  <option value="" disabled>No vendors found. Add a vendor first.</option>
                ) : (
                  <>
                    <option value="" disabled>Select a supplier...</option>
                    {existingVendors.map(v => (
                      <option key={v.id} value={v.name}>{v.name} ({v.category || 'Vendor'})</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Items / Goods Ordered</label>
              <input
                type="text"
                required
                value={poData.items}
                onChange={(e) => setPoData({ ...poData, items: e.target.value })}
                placeholder="e.g. 200W Monocrystalline Solar Panels x 10"
                className="custom-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Total PO Amount (₦)</label>
                <input
                  type="text"
                  required
                  value={poData.totalAmount}
                  onChange={(e) => setPoData({ ...poData, totalAmount: e.target.value })}
                  placeholder="₦950,000"
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Expected Delivery Date</label>
                <input
                  type="date"
                  value={poData.expectedDate}
                  onChange={(e) => setPoData({ ...poData, expectedDate: e.target.value })}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Issue Purchase Order</button>
            </div>
          </form>
        )}

        {/* Modal: Add Employee */}
        {activeModal === 'addEmployee' && (
          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Full Employee Name</label>
              <input
                type="text"
                required
                value={employeeData.name}
                onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                placeholder="e.g. Zainab Idris"
                className="custom-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Designation / Role</label>
                <input
                  type="text"
                  required
                  value={employeeData.role}
                  onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value })}
                  placeholder="e.g. Financial Accountant"
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Department</label>
                <select
                  value={employeeData.department}
                  onChange={(e) => setEmployeeData({ ...employeeData, department: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales & Marketing</option>
                  <option value="Management">Management</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Monthly Basic Salary (₦)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={employeeData.salary}
                  onChange={(e) => setEmployeeData({ ...employeeData, salary: e.target.value })}
                  placeholder="700000"
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Join Date</label>
                <input
                  type="date"
                  value={employeeData.joinDate}
                  onChange={(e) => setEmployeeData({ ...employeeData, joinDate: e.target.value })}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={employeeData.email}
                  onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                  placeholder="zainab.i@casjoe.com"
                  className="custom-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={employeeData.phone}
                  onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })}
                  placeholder="+234 808 333 4455"
                  className="custom-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Add Employee</button>
            </div>
          </form>
        )}

        {/* Modal 4: AI Report */}
        {activeModal === 'aiReport' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Report Focus Area</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="custom-select w-full"
              >
                <option value="Sales & Revenue">Sales & Revenue Audit</option>
                <option value="Customer Growth">Customer Growth & Retention</option>
                <option value="Hardware Telemetry">Hardware Telemetry & Model Speed</option>
              </select>
            </div>

            {generatedReportText ? (
              <div className="bg-[#080C18] border border-amber-500/30 p-4 rounded-xl font-mono text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {generatedReportText}
              </div>
            ) : (
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="btn-primary w-full text-xs justify-center py-3"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingReport ? 'Compiling Offline AI Insights...' : 'Run Agent OS Report Generator'}</span>
              </button>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onCloseModal} className="btn-secondary text-xs">Close</button>
            </div>
          </div>
        )}

        {/* Modal 5: Upload Document */}
        {activeModal === 'uploadDoc' && (
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Document Title / File Name</label>
              <input
                type="text"
                required
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="e.g. Q3_Financial_Audit.pdf"
                className="custom-input"
              />
            </div>

            <input 
              type="file" 
              accept=".pdf,.txt" 
              className="hidden" 
              id="file-upload" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                  setUploadFileName(file.name);
                }
              }} 
            />
            <label htmlFor="file-upload" className="border-2 border-dashed border-white/10 p-6 rounded-xl text-center space-y-2 bg-[#080C18] cursor-pointer hover:border-amber-500/50 transition-colors block">
              <Upload className={`w-8 h-8 mx-auto ${selectedFile ? 'text-emerald-500' : 'text-amber-500'}`} />
              <p className={`text-xs font-bold ${selectedFile ? 'text-emerald-400' : 'text-slate-300'}`}>
                {selectedFile ? selectedFile.name : 'Click to browse or drag & drop files here'}
              </p>
              <p className="text-[10px] text-slate-500">Supports PDF & TXT (100% Client-Side Extraction)</p>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs" disabled={isParsing}>Cancel</button>
              <button type="submit" className="btn-primary text-xs" disabled={isParsing}>
                {isParsing ? 'Vectorizing...' : 'Vectorize Document Offline'}
              </button>
            </div>
          </form>
        )}

        {/* Modal 6: Add Inventory */}
        {activeModal === 'addInventory' && (
          <form onSubmit={handleInventorySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">SKU</label>
                <input
                  type="text"
                  required
                  value={inventoryData.sku}
                  onChange={(e) => setInventoryData({ ...inventoryData, sku: e.target.value })}
                  placeholder="e.g. SKU-100"
                  className="custom-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Product Name</label>
                <input
                  type="text"
                  required
                  value={inventoryData.name}
                  onChange={(e) => setInventoryData({ ...inventoryData, name: e.target.value })}
                  placeholder="e.g. 16GB RAM Kit"
                  className="custom-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Category</label>
                <select
                  value={inventoryData.category}
                  onChange={(e) => setInventoryData({ ...inventoryData, category: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Components">Components</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Location</label>
                <select
                  value={inventoryData.location}
                  onChange={(e) => setInventoryData({ ...inventoryData, location: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="Lagos Warehouse">Lagos Warehouse</option>
                  <option value="Kano Branch">Kano Branch</option>
                  <option value="Accra Branch">Accra Branch</option>
                  <option value="Nairobi Branch">Nairobi Branch</option>
                  <option value="Digital">Digital / License</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={inventoryData.quantity}
                  onChange={(e) => setInventoryData({ ...inventoryData, quantity: e.target.value })}
                  className="custom-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Unit Price (₦)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={inventoryData.price}
                  onChange={(e) => setInventoryData({ ...inventoryData, price: e.target.value })}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Save Item</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
