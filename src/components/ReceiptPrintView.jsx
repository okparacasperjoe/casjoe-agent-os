import React from 'react';
import { useSetting } from '../db/hooks';

export default function ReceiptPrintView({ receipt }) {
  // Use hook to get business profile
  const businessProfile = useSetting('businessProfile') || {};

  if (!receipt) return null;

  return (
    <div className="print-only fixed inset-0 bg-white z-[9999] text-black font-mono hidden flex-col items-center p-4">
      <div className="w-[80mm] max-w-full mx-auto text-sm">
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
          <h1 className="text-xl font-bold uppercase">{businessProfile.name || 'CASJOE AI HUB'}</h1>
          <p className="text-xs mt-1">{businessProfile.phone || 'Tel: +000 0000 000'}</p>
          <p className="text-xs">{businessProfile.email || 'hello@casjoe.com'}</p>
          <p className="text-xs mt-2 font-bold tracking-widest">OFFICIAL RECEIPT</p>
        </div>

        {/* Info */}
        <div className="mb-4 text-xs space-y-1">
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{receipt.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Invoice:</span>
            <span>{receipt.invoiceId}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="text-right truncate ml-2">{receipt.customer}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Payment:</span>
            <span className="uppercase">{receipt.paymentMethod}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-b border-gray-400 py-2 mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-dashed border-gray-300">
                <th className="text-left pb-1 font-semibold">Qty x Item</th>
                <th className="text-right pb-1 font-semibold">Amt</th>
              </tr>
            </thead>
            <tbody>
              {receipt.itemsList && receipt.itemsList.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1 pr-2 truncate">
                    {item.cartQty}x {item.name}
                  </td>
                  <td className="py-1 text-right">
                    {new Intl.NumberFormat('en-US').format(item.price * item.cartQty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="text-right mb-6">
          <div className="flex justify-between font-bold text-base">
            <span>TOTAL:</span>
            <span>{receipt.amount}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs space-y-1 border-t-2 border-dashed border-gray-400 pt-4">
          <p className="font-bold">THANK YOU FOR YOUR BUSINESS!</p>
          <p>Powered by Casjoe Offline AI</p>
          <p className="mt-2 text-[10px]">{new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
