import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle, Package, CreditCard } from 'lucide-react';
import db from '../db/database';
import ReceiptPrintView from './ReceiptPrintView';

export default function POSView({ inventory }) {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [printingReceipt, setPrintingReceipt] = useState(null);

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

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.cartQty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    try {
      // 1. Deduct Inventory
      for (const item of cart) {
        const remainingQty = parseInt(item.quantity || 0, 10) - item.cartQty;
        await db.inventory.update(item.id, { quantity: remainingQty.toString() });
      }

      // 2. Generate Invoice
      const itemDescriptions = cart.map(c => `${c.cartQty}x ${c.name}`).join(', ');
      
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const generatedId = `INV-${new Date().getFullYear()}-${randomNum}`;
      
      await db.invoices.add({
        invoiceId: generatedId,
        customer: customerName,
        amount: `₦${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(cartTotal)}`,
        currency: 'NGN',
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        items: `POS Sale: ${itemDescriptions}`,
        createdAt: new Date().toISOString()
      });

      // Show Success and Trigger Receipt
      const amtStr = `₦${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(cartTotal)}`;
      setSuccessMsg(`Sale successful! Invoice ${generatedId} generated.`);
      setPrintingReceipt({
        invoiceId: generatedId,
        customer: customerName,
        paymentMethod: paymentMethod,
        amount: amtStr,
        date: new Date().toISOString().split('T')[0],
        itemsList: [...cart]
      });
      
      setCart([]);
      setTimeout(() => setSuccessMsg(''), 4000);
      
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
      
      {/* Right Panel: Cart */}
      <div className="w-full md:w-[400px] flex flex-col bg-[#070B15] border border-white/10 rounded-2xl overflow-hidden shadow-xl shrink-0 h-full min-h-[500px]">
        <div className="p-5 border-b border-white/10 bg-[#0E1629]">
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            Current Sale
          </h2>
          <div className="mt-3 space-y-2">
            <input 
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="w-full bg-[#111A30] border border-white/5 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
            />
            <div className="flex gap-2">
              {['Cash', 'Transfer', 'Card'].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                    paymentMethod === method 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                      : 'bg-[#111A30] text-slate-400 border-white/5 hover:bg-white/5'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#090E1B]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <ShoppingCart className="w-10 h-10 opacity-30" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-[#111A30] border border-white/5 p-3 rounded-xl flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-amber-500 font-mono mt-1">
                    ₦{new Intl.NumberFormat('en-US').format(parseFloat(item.price || 0))}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 bg-[#0A0F1D] rounded-lg p-1 border border-white/10">
                  <button onClick={() => updateCartQty(item.id, -1)} className="p-1 hover:text-white text-slate-400 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center text-white">{item.cartQty}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} className="p-1 hover:text-white text-slate-400 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                
                <button onClick={() => removeFromCart(item.id)} className="ml-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-5 border-t border-white/10 bg-[#0E1629]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Total</span>
            <span className="text-2xl font-black text-white font-['Outfit']">
              ₦{new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(cartTotal)}
            </span>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg ${
              isProcessing 
                ? 'bg-emerald-600 text-white cursor-not-allowed opacity-80' 
                : cart.length === 0 
                  ? 'bg-emerald-900/50 text-emerald-700 cursor-not-allowed border border-emerald-900'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:brightness-110 text-[#060913] shadow-emerald-500/20'
            }`}
          >
            {isProcessing ? (
              <span className="animate-pulse tracking-wide font-black">Processing...</span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="tracking-wide font-black text-base">Complete Sale</span>
              </>
            )}
          </button>
          
          {successMsg && (
            <p className="mt-3 text-emerald-400 text-xs font-bold text-center">
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
