import React, { useState } from 'react';
import { X, UserPlus, FileText, CheckSquare, Sparkles, Upload, CheckCircle2, Building2, MapPin, Phone, DollarSign, Package } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addCustomer, addInvoice, addDocument, addInventoryItem } from '../db/hooks';
import * as pdfjsLib from 'pdfjs-dist';

// Robust worker configuration for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function Modals({ activeModal, onCloseModal, customers = [] }) {
  if (!activeModal) return null;

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
  const [taskTitle, setTaskTitle] = useState('');

  // AI Report State
  const [reportType, setReportType] = useState('Sales & Revenue');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReportText, setGeneratedReportText] = useState(null);

  // Upload Doc State
  const [uploadFileName, setUploadFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

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
      <div className="bg-[#0C1222] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#F59E0B] flex items-center justify-center">
              {activeModal === 'addCustomer' && <UserPlus className="w-4 h-4" />}
              {activeModal === 'createInvoice' && <FileText className="w-4 h-4" />}
              {activeModal === 'addTask' && <CheckSquare className="w-4 h-4" />}
              {activeModal === 'aiReport' && <Sparkles className="w-4 h-4" />}
              {activeModal === 'uploadDoc' && <Upload className="w-4 h-4" />}
              {activeModal === 'addInventory' && <Package className="w-4 h-4" />}
            </div>
            <h3 className="font-bold text-white font-['Outfit'] text-lg">
              {activeModal === 'addCustomer' && 'Add New Customer'}
              {activeModal === 'createInvoice' && 'Generate Invoice'}
              {activeModal === 'addTask' && 'Add Action Task'}
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
                <option value="" disabled>Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.name}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
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

        {/* Modal 3: Add Task */}
        {activeModal === 'addTask' && (
          <form onSubmit={(e) => { e.preventDefault(); onCloseModal(); }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Task Description</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Audit offline database backup before weekly sync"
                className="custom-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={onCloseModal} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Add Action Item</button>
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
