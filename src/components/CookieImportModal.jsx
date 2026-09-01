import React, { useState } from 'react';
import { Check, Globe } from 'lucide-react';

export default function CookieImportModal({ isOpen, onClose, onCookiesImported }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState({
    history: true,
    cookies: true,
    cards: true,
    passwords: true,
    extensions: true
  });
  
  const [fromBrowser, setFromBrowser] = useState('Chrome - Casper');

  if (!isOpen) return null;

  const toggleItem = (item) => {
    setSelectedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleImport = async () => {
    setIsProcessing(true);
    // Simulate import process since it's an automatic pull in this new design
    setTimeout(() => {
      setIsProcessing(false);
      if (onCookiesImported) onCookiesImported(150);
      onClose();
    }, 2000);
  };

  const CheckboxItem = ({ id, label }) => (
    <div 
      className="flex items-center gap-3 cursor-pointer py-1" 
      onClick={() => toggleItem(id)}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition ${selectedItems[id] ? 'bg-[#76e5c5]' : 'border border-slate-600 bg-transparent'}`}>
        {selectedItems[id] && <Check className="w-3.5 h-3.5 text-slate-900" strokeWidth={3} />}
      </div>
      <span className="text-[14px] text-slate-200 font-medium">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#242526] border border-slate-700/50 rounded-2xl max-w-[420px] w-full p-6 shadow-2xl">
        <h3 className="text-[17px] font-bold text-white mb-6 tracking-wide">Import from another browser</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <span className="text-slate-300 text-[14px] w-12">From</span>
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 pointer-events-none">
                 {/* Simplified Chrome Icon */}
                 <div className="w-4 h-4 rounded-full border-[3px] border-amber-400 bg-blue-500 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-500"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full border border-white z-10"></div>
                 </div>
              </div>
              <select 
                className="w-full bg-transparent border border-slate-600 rounded-xl pl-9 pr-8 py-2 text-[14px] text-white focus:outline-none focus:border-[#76e5c5] appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .8em top 50%', backgroundSize: '.65em auto' }}
                value={fromBrowser}
                onChange={(e) => setFromBrowser(e.target.value)}
              >
                <option value="Chrome - Casper" className="bg-[#242526]">Chrome - Casper</option>
                <option value="Edge - Casper" className="bg-[#242526]">Edge - Casper</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-slate-300 text-[14px] w-12">To</span>
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 pointer-events-none" />
              <select 
                className="w-full bg-transparent border border-slate-600 rounded-xl pl-9 pr-8 py-2 text-[14px] text-white focus:outline-none focus:border-[#76e5c5] appearance-none opacity-90"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .8em top 50%', backgroundSize: '.65em auto' }}
                disabled
              >
                <option className="bg-[#242526]">Casjoe biz (current)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 mb-8 ml-1">
          <p className="text-slate-300 text-[14px] mb-3">Select items to import:</p>
          <CheckboxItem id="history" label="Browsing history" />
          <CheckboxItem id="cookies" label="Cookies" />
          <CheckboxItem id="cards" label="Credit Cards" />
          <CheckboxItem id="passwords" label="Saved passwords" />
          <CheckboxItem id="extensions" label="Extensions" />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white text-[14px] font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isProcessing}
            className="px-6 py-2 bg-[#76e5c5] hover:bg-[#5cd4b3] text-slate-900 text-[14px] font-bold rounded-xl transition disabled:opacity-50"
          >
            {isProcessing ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
