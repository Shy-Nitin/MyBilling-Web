import React from "react";
import { X } from "lucide-react";
import { QuantityStepper } from "../../../components/common/QuantityStepper";
import { formatCurrency } from "../../../lib/formatters";

export interface CartItem {
  product_id: number;
  sku: string;
  name: string;
  pack_size: string;
  unit: string;
  quantity: number;
  unit_rate: number;
  discount_percent: number;
  tax_rate: number;
  mrp: number;
  cases?: number;
  pieces?: number;
}

export function getPiecesPerCase(packSize: string): number {
  if (!packSize) return 1;
  const match =
    packSize.match(/(\d+)\s*(?:pcs|pc|units?|case|box|pack|pk)/i) ||
    packSize.match(/(?:case|box|pack)\s*(?:of)?\s*(\d+)/i) ||
    packSize.match(/(\d+)/);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    return num > 0 ? num : 1;
  }
  return 1;
}

interface BillItemsTableProps {
  items: CartItem[];
  onUpdateQty: (productId: number, qty: number) => void;
  onUpdateRate: (productId: number, rate: number) => void;
  onUpdateDiscount: (productId: number, disc: number) => void;
  onUpdateMrp?: (productId: number, mrp: number) => void;
  onRemoveItem: (productId: number) => void;
}

export const BillItemsTable: React.FC<BillItemsTableProps> = ({
  items,
  onUpdateQty,
  onUpdateRate,
  onUpdateDiscount,
  onUpdateMrp,
  onRemoveItem,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-12 px-4 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-300">
        <p className="font-semibold text-slate-700 text-sm">Cart is currently empty</p>
        <p className="text-xs text-slate-500 mt-1">
          Click any product on the left or scan barcode [F1] to add line items.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[420px] overflow-y-auto border border-slate-200/80 rounded-xl shadow-2xs">
      <table className="w-full text-left border-collapse min-w-[540px]">
        <thead className="sticky top-0 bg-surface-container-low text-secondary font-mono text-[10px] uppercase tracking-wider border-b border-slate-200 z-10">
          <tr>
            <th className="py-2 px-2 text-center w-8">#</th>
            <th className="py-2 px-3">Description</th>
            <th className="py-2 px-2 text-center w-24">Total Qty</th>
            <th className="py-2 px-2 text-right w-20">MRP (₹)</th>
            <th className="py-2 px-2 text-right w-16">Disc %</th>
            <th className="py-2 px-3 text-right w-24">Amount (₹)</th>
            <th className="py-2 px-1 text-center w-7">×</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-body-sm text-body-sm bg-white">
          {items.map((item, idx) => {
            const effectiveMrp = item.mrp > 0 ? item.mrp : item.unit_rate;
            const total = item.quantity * item.unit_rate;

            const handleDiscChange = (disc: number) => {
              onUpdateDiscount(item.product_id, disc);
              if (effectiveMrp > 0) {
                const newRate = Math.round((effectiveMrp * (1 - disc / 100)) * 100) / 100;
                onUpdateRate(item.product_id, newRate);
              }
            };

            const handleMrpChange = (newMrp: number) => {
              if (onUpdateMrp) onUpdateMrp(item.product_id, newMrp);
              const disc = item.discount_percent || 0;
              const newRate = Math.round((newMrp * (1 - disc / 100)) * 100) / 100;
              onUpdateRate(item.product_id, newRate);
            };

            return (
              <tr key={item.product_id} className="hover:bg-slate-50 transition-colors">
                {/* 1. Sr. No. */}
                <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-400">
                  {idx + 1}
                </td>

                {/* 2. Description */}
                <td className="py-2 px-3">
                  <div className="font-semibold text-xs text-slate-900 leading-tight">
                    {item.name}
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                    {item.sku} • {item.pack_size} <span className="uppercase text-slate-600 font-semibold">({item.unit || "PCS"})</span>
                  </div>
                </td>

                {/* 3. Total Qty */}
                <td className="py-2 px-2 text-center">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(val) => onUpdateQty(item.product_id, val)}
                    size="sm"
                  />
                </td>

                {/* 4. MRP */}
                <td className="py-2 px-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={effectiveMrp}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) handleMrpChange(val);
                    }}
                    className="w-16 text-right font-mono text-xs bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:bg-white focus:outline-none text-slate-700"
                  />
                </td>

                {/* 5. Discount % */}
                <td className="py-2 px-2 text-right">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.discount_percent}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 100) handleDiscChange(val);
                    }}
                    className="w-12 text-right font-mono text-xs bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:bg-white focus:outline-none font-semibold text-primary"
                  />
                </td>

                {/* 6. Amount */}
                <td className="py-2 px-3 text-right font-mono font-semibold text-xs text-slate-900">
                  {formatCurrency(total)}
                  <div className="text-[9px] text-slate-400 font-normal">
                    @ ₹{item.unit_rate.toFixed(2)}
                  </div>
                </td>

                {/* Delete line item */}
                <td className="py-2 px-1 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.product_id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-error hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
