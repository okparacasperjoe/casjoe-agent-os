import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle, Package, CreditCard, User, Calculator, DollarSign, Percent, Receipt } from 'lucide-react';
import db from '../db/database';
import { useCustomers } from '../db/hooks';
import ReceiptPrintView from './ReceiptPrintView';

export default function POSView({ inventory = [] }) {
  const customers = useCustomers() || [];
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [printingReceipt, setPrintingReceipt] = useState(null);

  // Financial calculations
  const [applyVat, setApplyVat] = useState(false); // 7.5% Standard VAT
  const [discountPercent, setDiscountPercent] = useState(0);
  const [amountTendered, setAmountTendered] = useState('');

  // Auto-fill customer name when selecting from dropdown
  const handleSelectCustomer = (e) => {
    const val = e.target.value;
    setSelectedCustomerId(val);
    if (val === 'walk-in') {
      setCustomerName('Walk-in Customer');
    } else {
      const found = customers.find(c => String(c.id) === String(val));
      if (found) {
        setCustomerName(found.name + (found.company ? ` (${found.company})` : ''));
      }
    }
  };

  // Trigger print dialog when printingReceipt is set
  useEffect(() => {
    if (printingReceipt) {
      setTimeout(() => {
        window.print();
        setPrintingReceipt(null);
      }, 100);
    }
  }, [printingReceipt]);

  const filteredInventory = inventory.filter(item => 
    parseInt(item.quantity || 0, 10) > 0 && 
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (item) => {
    const existing = cart.find(cartItem => cartItem.id === item.id);
    const maxQty = parseInt(item.quantity || 0, 10);
    
    if (existing) {
      if (existing.cartQty < maxQty) {
        setCart(cart.map(c => c.id === item.id ? { ...c, cartQty: c.cartQty + 1 } : c));
      }
    } else {
      setCart([...cart, { ...item, cartQty: 1 }]);
    }
  };

  const updateCartQty = (id, delta) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = c.cartQty + delta;
        const maxQty = parseInt(c.quantity || 0, 10);
        if (newQty > 0 && newQty <= maxQty) {
          return { ...c, cartQty: newQty };
        }
      }
      return c;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.cartQty), 0);
  const discountAmount = (subtotal * (parseFloat(discountPercent || 0) / 100));
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const vatAmount = applyVat ? (afterDiscount * 0.075) : 0;
  const grandTotal = afterDiscount + vatAmount;

  const tenderedNum = parseFloat(amountTendered || 0);
  const changeDue = Math.max(0, tenderedNum - grandTotal);

  const handlePresetCash = (amount) => {
    if (amount === 'exact') {
      setAmountTendered(grandTotal.toString());
    } else {
      setAmountTendered(amount.toString());
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    try {
      // 1. Deduct Inventory
      for (const item of cart) {
        const remainingQty = Math.max(0, parseInt(item.quantity || 0, 10) - item.cartQty);
        await db.inventory.update(item.id, { quantity: remainingQty.toString() });
      }

      // 2. Generate Invoice
      const itemDescriptions = cart.map(c => `${c.cartQty}x ${c.name}`).join(', ');
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const generatedId = `INV-${new Date().getFullYear()}-${randomNum}`;
      const formattedTotal = `₦${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(grandTotal)}`;
      
      await db.invoices.add({
        invoiceId: generatedId,
        customer: customerName,
        amount: formattedTotal,
        currency: 'NGN',
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        items: `POS Sale: ${itemDescriptions} | Subtotal: ₦${subtotal.toLocaleString()}, VAT: ₦${Math.round(vatAmount).toLocaleString()}`,
        createdAt: new Date().toISOString()
      });

      // Update CRM Customer Total Purchases if customer matched
      if (selectedCustomerId && selectedCustomerId !== 'walk-in') {
        const matched = customers.find(c => String(c.id) === String(selectedCustomerId));
        if (matched) {
          const prevTotal = parseFloat((matched.totalSpent || '0').replace(/[^0-9.]/g, '')) || 0;
          const newSpent = prevTotal + grandTotal;
          await db.customers.update(matched.id, {
            totalSpent: `₦${newSpent.toLocaleString()}`
          });
        }
      }

      // Show Success and Trigger Receipt
      setSuccessMsg(`Sale successful! Invoice ${generatedId} generated.`);
      setPrintingReceipt({
        invoiceId: generatedId,
        customer: customerName,
        paymentMethod: paymentMethod,
        amount: formattedTotal,
        subtotal: `₦${subtotal.toLocaleString()}`,
        vat: applyVat ? `₦${Math.round(vatAmount).toLocaleString()} (7.5%)` : '₦0',
        discount: discountPercent > 0 ? `₦${Math.round(discountAmount).toLocaleString()} (${discountPercent}%)` : '₦0',
        tendered: tenderedNum > 0 ? `₦${tenderedNum.toLocaleString()}` : formattedTotal,
        change: changeDue > 0 ? `₦${changeDue.toLocaleString()}` : '₦0',
        date: new Date().toISOString().split('T')[0],
        itemsList: [...cart]
      });
      
      setCart([]);
      setAmountTendered('');
      setTimeout(() => setSuccessMsg(''), 5000);
      
    } catch (err) {
      console.error('Checkout failed', err);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="p-4 lg:p-6 h-full max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6">
      
      {/* Left Panel: Catalog */}
      <div className="flex-1 flex flex-col bg-[#070B15] border border-white/10 rounded-2xl overflow-hidden shadow-lg h-full min-h-[500px]">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-[#0E1629]">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">Product Catalog</h2>
            <p className="text-xs text-slate-400 mt-0.5">Click to add to cart</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by SKU or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
          </div>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 bg-[#090E1B]">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInventory.map(item => (
              <div 
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-[#111A30] border border-white/5 hover:border-amber-500/40 p-4 rounded-xl cursor-pointer transition-colors shadow-sm hover:shadow-amber-500/10 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-500">{item.sku}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    {item.quantity} left
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                  {item.name}
                </h3>
                <p className="mt-3 text-[#FF9F00] font-black font-mono">
                  ₦{new Intl.NumberFormat('en-US').format(parseFloat(item.price || 0))}
                </p>
              </div>
            ))}
            {filteredInventory.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
                <Package className="w-12 h-12 mb-3 opacity-30" />
                <p>No available items in inventory.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Panel: Cart & Checkout Hub */}
      <div className="w-full md:w-[420px] flex flex-col bg-[#070B15] border border-white/10 rounded-2xl overflow-hidden shadow-xl shrink-0 h-full min-h-[550px]">
        {/* Header: Customer & Payment Method */}
        <div className="p-4 border-b border-white/10 bg-[#0E1629] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-500" />
              <span>Current Sale</span>
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
              {cart.reduce((a, c) => a + c.cartQty, 0)} items
            </span>
          </div>

          {/* CRM Customer Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-cyan-400" />
              Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={handleSelectCustomer}
              className="w-full bg-[#111A30] border border-white/10 rounded-xl py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="walk-in">🚶 Walk-in Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''} - {c.location || 'Local'}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div className="flex gap-1.5 pt-1">
            {['Cash', 'Transfer', 'Card', 'POS'].map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors border ${
                  paymentMethod === method 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm' 
                    : 'bg-[#111A30] text-slate-400 border-white/5 hover:bg-white/5'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
        
        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#090E1B] max-h-[220px]">
          {cart.length === 0 ? (
            <div className="h-full py-8 flex flex-col items-center justify-center text-slate-500 space-y-1.5">
              <ShoppingCart className="w-8 h-8 opacity-30" />
              <p className="text-xs">Cart is empty. Click items from catalog.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-[#111A30] border border-white/5 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">
                    ₦{new Intl.NumberFormat('en-US').format(parseFloat(item.price || 0))}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 bg-[#0A0F1D] rounded-lg p-0.5 border border-white/10">
                  <button onClick={() => updateCartQty(item.id, -1)} className="p-1 hover:text-white text-slate-400 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center text-white">{item.cartQty}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} className="p-1 hover:text-white text-slate-400 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                
                <button onClick={() => removeFromCart(item.id)} className="ml-1.5 p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* VAT, Discount & Cash Tendered Controls */}
        <div className="p-3.5 bg-[#0A1020] border-t border-white/10 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={applyVat}
                onChange={(e) => setApplyVat(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
              />
              <span className="text-xs font-medium">Add VAT (7.5%)</span>
            </label>
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-slate-400" />
              <select
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value))}
                className="bg-[#111A30] border border-white/10 text-[11px] text-white rounded px-1.5 py-0.5"
              >
                <option value={0}>0% Disc</option>
                <option value={5}>5% Disc</option>
                <option value={10}>10% Disc</option>
                <option value={15}>15% Disc</option>
                <option value={20}>20% Disc</option>
              </select>
            </div>
          </div>

          {/* Quick Cash Presets & Tendered Input */}
          {paymentMethod === 'Cash' && (
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Cash Tendered:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {amountTendered ? `₦${parseFloat(amountTendered).toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1000, 5000, 10000, 20000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePresetCash(amt)}
                    className="py-1 px-1 bg-[#111A30] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 rounded border border-white/5 text-[10px] font-mono font-bold transition"
                  >
                    ₦{(amt/1000)}k
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Enter Cash Tendered..."
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  className="flex-1 bg-[#111A30] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handlePresetCash('exact')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-700 transition"
                >
                  Exact
                </button>
              </div>

              {tenderedNum > 0 && (
                <div className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs font-bold border ${
                  tenderedNum >= grandTotal 
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                }`}>
                  <span>{tenderedNum >= grandTotal ? 'Change Due:' : 'Short by:'}</span>
                  <span className="font-mono text-sm">
                    ₦{Math.abs(changeDue > 0 ? changeDue : grandTotal - tenderedNum).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Total & Complete Sale Button */}
        <div className="p-4 border-t border-white/10 bg-[#0E1629] space-y-3">
          <div className="space-y-1 text-xs">
            {discountAmount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Discount ({discountPercent}%):</span>
                <span className="text-emerald-400 font-mono">-₦{Math.round(discountAmount).toLocaleString()}</span>
              </div>
            )}
            {applyVat && (
              <div className="flex justify-between text-slate-400">
                <span>VAT (7.5%):</span>
                <span className="font-mono">₦{Math.round(vatAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300 font-bold text-sm">Grand Total</span>
              <span className="text-2xl font-black text-amber-400 font-['Outfit']">
                ₦{new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(grandTotal)}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg ${
              isProcessing 
                ? 'bg-emerald-600 text-white cursor-not-allowed opacity-80' 
                : cart.length === 0 
                  ? 'bg-emerald-900/40 text-emerald-700 cursor-not-allowed border border-emerald-900/50'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:brightness-110 text-[#060913] shadow-emerald-500/20 active:scale-[0.99]'
            }`}
          >
            {isProcessing ? (
              <span className="animate-pulse tracking-wide font-black">Processing Sale...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="tracking-wide font-black text-sm">Complete Sale &amp; Print Receipt</span>
              </>
            )}
          </button>
          
          {successMsg && (
            <p className="text-emerald-400 text-xs font-bold text-center animate-in fade-in">
              {successMsg}
            </p>
          )}
        </div>
      </div>
      
      {/* Hidden Receipt Format */}
      {printingReceipt && <ReceiptPrintView receipt={printingReceipt} />}
    </div>
  );
}
