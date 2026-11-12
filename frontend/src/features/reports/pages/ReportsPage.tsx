import React, { useState, useEffect } from "react";
import { ProfitAnalyticsChart } from "../components/ProfitAnalyticsChart";
import { MarginBreakdownTable } from "../components/MarginBreakdownTable";
import { ProfitOverviewCard } from "../components/ProfitOverviewCard";
import { InvoiceProfitTable } from "../components/InvoiceProfitTable";
import {
  reportService,
  ProfitAnalyticsPoint,
  CategoryMargin,
  InvoiceProfitSummary,
} from "../services/reportService";

export const ReportsPage: React.FC = () => {
  const [trends, setTrends] = useState<ProfitAnalyticsPoint[]>([]);
  const [margins, setMargins] = useState<CategoryMargin[]>([]);
  const [profitInvoices, setProfitInvoices] = useState<InvoiceProfitSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tr, mg, pi] = await Promise.all([
        reportService.getProfitTrends(),
        reportService.getCategoryMargins(),
        reportService.getProfitBreakdown(),
      ]);
      setTrends(tr);
      setMargins(mg);
      setProfitInvoices(pi);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-secondary">Loading profitability intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* High-Fidelity Multi-Line Analytics Chart */}
      <ProfitAnalyticsChart data={trends} />

      {/* Invoice-Wise Realtime Profitability Audit Table with PDF download */}
      <InvoiceProfitTable invoices={profitInvoices} onRefresh={loadData} />

      {/* 2-Column Split: Category Margins (8) & Profit Overview (4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-8">
          <MarginBreakdownTable margins={margins} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <ProfitOverviewCard profitData={profitInvoices} />

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200/70">
            <h4 className="font-semibold text-xs text-slate-900 mb-1">
              Confidential Audit Packages
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Wholesale trading statements and cost of goods reconciliation.
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => alert("Exported Confidential Cost vs Revenue Reconciliation (CSV)")}
                className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700 text-left transition-colors flex justify-between items-center"
              >
                <span>Cost & Margin Reconciliation</span>
                <span className="font-mono text-[10px] text-teal-700 font-bold">CSV</span>
              </button>
              <button
                type="button"
                onClick={() => alert("Annual Profit & Loss statement export prepared.")}
                className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700 text-left transition-colors flex justify-between items-center"
              >
                <span>Annual Trading P&L Summary</span>
                <span className="font-mono text-[10px] text-slate-400">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
