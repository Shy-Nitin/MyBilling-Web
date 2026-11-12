import React from "react";
import { Printer, Save, Loader2 } from "lucide-react";
import { formatCurrency } from "../../../lib/formatters";
import { UpiQrCode } from "../../../components/common/UpiQrCode";

interface BillSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  onPaidAmountChange: (amount: number) => void;
  paymentMode: string;
  isSubmitting: boolean;
  onFinalize: () => void;
  editingInvoiceNumber?: string | null;
  upiId?: string;
  payeeName?: string;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  subtotal,
  discount,
  total,
  paidAmount,
  onPaidAmountChange,
  paymentMode,
  isSubmitting,
  onFinalize,
  editingInvoiceNumber,
  upiId,
  payeeName,
}) => {
  const balance = Math.max(0, total - paidAmount);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting || total <= 0) return;
    onFinalize();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Calculation rows (Clean Wholesale - NO GST) */}
      <div className="bg-surface-container-low/80 p-3 rounded-lg border border-slate-200/60 flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Gross Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>Special Discount:</span>
            <span>- {formatCurrency(discount)}</span>
          </div>
        )}
        {paymentMode === "SPLIT" && (
          <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-slate-900 font-semibold">
            <span>Amount Paid Now:</span>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
              className="w-24 text-right font-mono bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Net Payable Banner */}
      <div className="bg-primary-container text-white p-4 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <span className="font-mono text-[11px] text-indigo-200 uppercase tracking-wider block">
            Net Payable Total
          </span>
          <div className="font-mono text-2xl font-bold tracking-tight">
            {formatCurrency(total)}
          </div>
        </div>
        {balance > 0 && paymentMode === "UDHAR_CREDIT" && (
          <div className="text-right">
            <span className="font-mono text-[10px] text-amber-200 uppercase block">
              Udhar / Due
            </span>
            <span className="font-mono text-sm font-semibold text-amber-300">
              {formatCurrency(balance)}
            </span>
          </div>
        )}
      </div>

      {paymentMode === "UPI" && total > 0 && (
        <div className="bg-surface-container-lowest p-3 rounded-xl border border-primary/20 shadow-xs flex flex-col items-center">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2">
            Live UPI Payment QR
          </span>
          <UpiQrCode
            upiId={upiId}
            payeeName={payeeName}
            amount={total}
            invoiceNumber={editingInvoiceNumber || undefined}
            size={130}
          />
        </div>
      )}

      {/* Action Buttons with double-click guard */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={isSubmitting || total <= 0}
          className="flex-1 h-11 bg-primary-container hover:bg-primary text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{editingInvoiceNumber ? "Saving Changes..." : "Finalizing Bill..."}</span>
            </>
          ) : editingInvoiceNumber ? (
            <>
              <Save className="w-4 h-4" />
              <span>Update Invoice ({editingInvoiceNumber})</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              <span>Finalize & Print</span>
              <kbd className="font-mono text-[10px] bg-primary/40 text-white px-1.5 py-0.5 rounded">
                F9
              </kbd>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
