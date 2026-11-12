import React, { useState } from "react";
import { FileText, Printer, ChevronDown, ChevronRight, TrendingUp } from "lucide-react";
import { InvoiceProfitSummary } from "../services/reportService";
import { formatCurrency } from "../../../lib/formatters";
import { PdfFormatSelectorModal } from "../../../components/common/PdfFormatSelectorModal";

interface InvoiceProfitTableProps {
  invoices: InvoiceProfitSummary[];
  onRefresh?: () => void;
}

export const InvoiceProfitTable: React.FC<InvoiceProfitTableProps> = ({ invoices }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<{ id: number; num: string } | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExpand = (id: number) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.shop_name && inv.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-200/70 overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="p-space-md border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="font-label-badge text-label-badge text-teal-700 uppercase tracking-wider block font-semibold">
                Confidential Margin Intelligence
              </span>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-slate-900">
                Invoice-Wise Profitability Audit
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/80 text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Customer / Shop</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
                <th className="py-2.5 px-3 text-right">Cost (COGS)</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
                <th className="py-2.5 px-3 text-right">Profit PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-body-sm text-body-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-secondary text-sm">
                    No transactions recorded yet. New invoices will automatically appear here with exact profit margins.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const isExpanded = expandedInvoiceId === inv.id;
                  return (
                    <React.Fragment key={inv.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggleExpand(inv.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title={isExpanded ? "Collapse Items" : "Expand Items"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span>{inv.invoice_number}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                            {inv.date}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-xs text-slate-800 block">
                            {inv.customer_name}
                          </span>
                          {inv.shop_name && (
                            <span className="text-[11px] text-slate-500 block">
                              Shop: {inv.shop_name}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-semibold text-slate-900">
                          {formatCurrency(inv.total_amount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-500">
                          {formatCurrency(inv.total_cost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-teal-700">
                          {formatCurrency(inv.total_profit)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-slate-900">
                          <span className="bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200">
                            {inv.profit_margin_percent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice({ id: inv.id, num: inv.invoice_number })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-mono font-semibold transition-colors border border-teal-200 shadow-2xs"
                            title="Download Confidential Profit PDF (50mm, 80mm, A4)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Profit PDF</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Item Breakdown */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={8} className="p-3 pl-10">
                            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
                              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                Line Item Profit Breakdown:
                              </span>
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase">
                                    <th className="py-1">Product & SKU</th>
                                    <th className="py-1 text-right">Qty</th>
                                    <th className="py-1 text-right">Landed Cost</th>
                                    <th className="py-1 text-right">Selling Rate</th>
                                    <th className="py-1 text-right">Profit / Unit</th>
                                    <th className="py-1 text-right">Discount</th>
                                    <th className="py-1 text-right font-bold text-teal-700">Total Profit</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                                  {inv.items.map((it, idx) => (
                                    <tr key={idx}>
                                      <td className="py-1.5 font-sans font-medium text-slate-800">
                                        {it.product_name} <span className="font-mono text-[10px] text-slate-400">({it.sku})</span>
                                      </td>
                                      <td className="py-1.5 text-right">{it.quantity} {it.unit}</td>
                                      <td className="py-1.5 text-right text-slate-500">{formatCurrency(it.unit_cost)}</td>
                                      <td className="py-1.5 text-right font-semibold text-slate-800">{formatCurrency(it.unit_rate)}</td>
                                      <td className="py-1.5 text-right text-teal-700 font-semibold">{formatCurrency(it.unit_profit)}</td>
                                      <td className="py-1.5 text-right text-slate-500">{formatCurrency(it.discount_amount)}</td>
                                      <td className="py-1.5 text-right font-bold text-teal-700">{formatCurrency(it.total_profit)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
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
