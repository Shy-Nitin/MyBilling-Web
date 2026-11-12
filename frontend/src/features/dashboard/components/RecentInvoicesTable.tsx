import React, { useState, useEffect } from "react";
import { FileText, Printer, Edit2, Trash2, Calendar, Filter, AlertTriangle, Loader2 } from "lucide-react";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { formatCurrency } from "../../../lib/formatters";
import { PdfFormatSelectorModal } from "../../../components/common/PdfFormatSelectorModal";
import { Modal } from "../../../components/common/Modal";
import { billingService } from "../../billing/services/billingService";

interface InvoiceRow {
  id: number;
  invoice_number: string;
  shop_customer: string;
  time: string;
  date: string;
  amount: number;
  status: string;
  payment_mode: string;
}

interface RecentInvoicesTableProps {
  invoices: InvoiceRow[];
  onViewAll?: () => void;
  onNavigate?: (path: string) => void;
  onRefresh?: () => void;
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({
  invoices: initialInvoices,
  onViewAll,
  onNavigate,
  onRefresh,
}) => {
  const [invoices, setInvoices] = useState<InvoiceRow[]>(initialInvoices);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{ id: number; num: string } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [datePreset, setDatePreset] = useState<string>("today");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Delete invoice modal
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch filtered invoices from backend
  const fetchFilteredInvoices = async () => {
    try {
      setLoading(true);
      const data = await billingService.getInvoices({
        limit: 100,
        status: statusFilter,
        date_preset: datePreset,
        start_date: datePreset === "custom" ? startDate : undefined,
        end_date: datePreset === "custom" ? endDate : undefined,
      });

      const formatted: InvoiceRow[] = data.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        shop_customer: inv.customer_name,
        time: new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(inv.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
        amount: inv.total_amount,
        status: inv.payment_status,
        payment_mode: inv.payment_mode,
      }));
      setInvoices(formatted);
    } catch (err) {
      console.error("Failed to fetch filtered invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datePreset === "custom" && (!startDate || !endDate)) {
      return;
    }
    fetchFilteredInvoices();
  }, [statusFilter, datePreset, startDate, endDate]);

  const handleEdit = (invoiceId: number) => {
    if (onNavigate) {
      onNavigate(`/billing?edit=${invoiceId}`);
    } else {
      window.history.pushState({}, "", `/billing?edit=${invoiceId}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      setIsDeleting(true);
      await billingService.deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
      await fetchFilteredInvoices();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Failed to delete invoice", err);
      alert(err?.message || "Failed to delete invoice.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col justify-between">
        {/* Table Top Controls & Filters */}
        <div className="p-space-lg border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <span className="font-label-badge text-label-badge text-secondary uppercase tracking-wider block">
              Live Register Stream
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Recent Counter Invoices
            </h3>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              {[
                { label: "All", value: "ALL" },
                { label: "Active", value: "ACTIVE" },
                { label: "Delivered", value: "DELIVERED" },
              ].map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setStatusFilter(st.value)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    statusFilter === st.value
                      ? "bg-white text-primary font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Date Preset Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="bg-transparent font-medium text-slate-700 outline-none text-xs cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom Range</option>
                <option value="all">All Dates</option>
              </select>
            </div>

            {/* Custom Range Inputs */}
            {datePreset === "custom" && (
              <div className="flex items-center gap-1 text-xs font-mono">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700"
                />
              </div>
            )}

            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs font-semibold text-primary hover:text-indigo-800 transition-colors ml-2"
              >
                View Full Ledger →
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/80 text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-2.5 px-4 font-medium">Invoice #</th>
                <th className="py-2.5 px-4 font-medium">Shop / Customer</th>
                <th className="py-2.5 px-4 font-medium">Date & Time</th>
                <th className="py-2.5 px-4 font-medium text-right">Amount</th>
                <th className="py-2.5 px-4 font-medium text-center">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-body-md text-body-md">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-secondary text-sm">
                    <div className="flex items-center justify-center gap-2 font-mono text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-secondary text-sm">
                    No matching invoices found for the selected filter.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-surface-container-low/60 transition-colors group"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-primary">
                        <FileText className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        <span>{inv.invoice_number}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800 truncate max-w-[180px]">
                      {inv.shop_customer}
                    </td>
                    <td className="py-2.5 px-4 text-xs font-mono text-secondary">
                      {inv.date} {inv.time}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <StatusBadge status={inv.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleEdit(inv.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 text-xs font-mono transition-colors shadow-2xs font-semibold"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedInvoice({ id: inv.id, num: inv.invoice_number })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-mono transition-colors shadow-2xs font-semibold"
                          title="Print / Download PDF (50mm, 80mm, A4)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInvoiceToDelete(inv)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-mono transition-colors shadow-2xs font-semibold"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Format Selector Modal */}
      {selectedInvoice && (
        <PdfFormatSelectorModal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.num}
          type="invoice"
        />
      )}

      {/* Delete Invoice Confirmation Modal */}
      {invoiceToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setInvoiceToDelete(null)}
          title="Delete Invoice?"
          subtitle="This action cannot be undone."
          maxWidth="max-w-md"
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 flex flex-col gap-1">
                <p className="font-semibold">
                  Are you sure you want to delete invoice {invoiceToDelete.invoice_number}?
                </p>
                <p>
                  Deleting will restore product quantities back to stock, reverse any outstanding Udhar balance for the customer, and remove associated ledger entries.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-semibold text-slate-800">{invoiceToDelete.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-800">{invoiceToDelete.shop_customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(invoiceToDelete.amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteInvoice}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
