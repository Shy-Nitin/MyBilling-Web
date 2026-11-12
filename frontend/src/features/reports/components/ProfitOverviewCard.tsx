import React, { useState } from "react";
import { TrendingUp, Printer, ShieldCheck } from "lucide-react";
import { InvoiceProfitSummary } from "../services/reportService";
import { formatCurrency } from "../../../lib/formatters";
import { PdfFormatSelectorModal } from "../../../components/common/PdfFormatSelectorModal";

interface ProfitOverviewCardProps {
  profitData: InvoiceProfitSummary[];
}

export const ProfitOverviewCard: React.FC<ProfitOverviewCardProps> = ({ profitData }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<{ id: number; num: string } | null>(null);

  const totalRevenue = profitData.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalCost = profitData.reduce((sum, inv) => sum + inv.total_cost, 0);
  const totalProfit = profitData.reduce((sum, inv) => sum + inv.total_profit, 0);
  const marginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0.0;

  const handleDownloadLatestProfitPdf = () => {
    if (profitData.length > 0) {
      setSelectedInvoice({ id: profitData[0].id, num: profitData[0].invoice_number });
    } else {
      alert("No invoices generated yet. Create an invoice to generate a Profit Report PDF.");
    }
  };

  return (
    <>
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200/70 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-900">
                Profit & Margin Overview
              </h3>
              <p className="text-[11px] text-teal-700 font-medium">Real-time Net Earnings</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadLatestProfitPdf}
            className="h-7 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold rounded flex items-center gap-1 transition-colors border border-teal-200"
            title="Download Latest Invoice Profit PDF"
          >
            <Printer className="w-3 h-3" />
            <span>Profit PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-xs">
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-slate-200/50">
            <span className="text-slate-400 text-[10px] block">Gross Revenue</span>
            <span className="font-bold text-slate-800">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-slate-200/50">
            <span className="text-slate-400 text-[10px] block">COGS Cost</span>
            <span className="font-semibold text-slate-700">{formatCurrency(totalCost)}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-slate-200/50">
            <span className="text-slate-400 text-[10px] block">Net Profit</span>
            <span className="font-bold text-teal-700">{formatCurrency(totalProfit)}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-slate-200/50">
            <span className="text-slate-400 text-[10px] block">Net Margin</span>
            <span className="font-bold text-slate-900">{marginPct.toFixed(1)}%</span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Zero-GST accounting mode active. Purchase rates kept confidential.</span>
        </div>
      </div>

      {selectedInvoice && (
        <PdfFormatSelectorModal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.num}
          type="profit"
        />
      )}
    </>
  );
};
