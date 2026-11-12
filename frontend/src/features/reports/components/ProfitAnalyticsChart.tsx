import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { ProfitAnalyticsPoint } from "../services/reportService";
import { formatCurrency } from "../../../lib/formatters";

interface ProfitAnalyticsChartProps {
  data: ProfitAnalyticsPoint[];
}

export const ProfitAnalyticsChart: React.FC<ProfitAnalyticsChartProps> = ({ data }) => {
  const [timeHorizon, setTimeHorizon] = useState("This Week (vs Last Week)");
  const [metricView, setMetricView] = useState("Revenue & Profit Trends");

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-slate-200/70 flex flex-col justify-between">
      {/* Top Header with the two modern selector dropdowns from Stitch Spec */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="font-label-badge text-label-badge text-secondary uppercase tracking-wider block">
            Executive Financial Analytics
          </span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-slate-900 mt-0.5">
            Revenue & Net Margin Velocity
          </h3>
        </div>

        {/* Dropdown 1 & Dropdown 2 */}
        <div className="flex items-center gap-2 flex-wrap">
          <div>
            <label className="font-mono text-[10px] text-slate-400 block uppercase">
              Time Horizon / Comparison
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="text-xs font-semibold bg-surface-container-low text-slate-800 border border-slate-200 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Today (Hourly vs Yesterday)">Today (Hourly vs Yesterday)</option>
              <option value="This Week (vs Last Week)">This Week (vs Last Week)</option>
              <option value="This Month (vs Last Month)">This Month (vs Last Month)</option>
              <option value="Q3 FY24-25 (vs Q2)">Q3 FY24-25 (vs Q2)</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-[10px] text-slate-400 block uppercase">
              Metric View
            </label>
            <select
              value={metricView}
              onChange={(e) => setMetricView(e.target.value)}
              className="text-xs font-semibold bg-surface-container-low text-slate-800 border border-slate-200 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Revenue & Profit Trends">Revenue & Profit Trends</option>
              <option value="Gross Revenue Only">Gross Revenue Only</option>
              <option value="Net Profit Only">Net Profit Only</option>
              <option value="Margin % Trend">Margin % Trend</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono" }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as ProfitAnalyticsPoint;
                  return (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xl font-mono text-xs flex flex-col gap-1.5 min-w-[200px]">
                      <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">
                        {label} Performance Peak
                      </div>
                      <div className="flex justify-between items-center text-primary font-semibold">
                        <span>Gross Revenue:</span>
                        <span>{formatCurrency(pt.gross_revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-700 font-semibold">
                        <span>Net Profit:</span>
                        <span>{formatCurrency(pt.net_profit)} ({pt.margin_percent}%)</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-100">
                        <span>Prior Benchmark:</span>
                        <span>{formatCurrency(pt.prior_revenue)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {(metricView === "Revenue & Profit Trends" || metricView === "Gross Revenue Only") && (
              <Line
                type="monotone"
                dataKey="gross_revenue"
                name="Gross Revenue"
                stroke="#4338ca"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#4338ca", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#4338ca" }}
              />
            )}

            {(metricView === "Revenue & Profit Trends" || metricView === "Net Profit Only") && (
              <Line
                type="monotone"
                dataKey="net_profit"
                name="Net Profit"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#10b981" }}
              />
            )}

            <Line
              type="monotone"
              dataKey="prior_revenue"
              name="Prior Period"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic KPI Summary Chips calculated from real data */}
      {(() => {
        const totalRev = data.reduce((sum, pt) => sum + pt.gross_revenue, 0);
        const totalProf = data.reduce((sum, pt) => sum + pt.net_profit, 0);
        const peak = data.reduce(
          (max, pt) => (pt.gross_revenue > max.gross_revenue ? pt : max),
          { label: "None", gross_revenue: 0, net_profit: 0, margin_percent: 0, prior_revenue: 0 }
        );
        const avgMargin = totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(1) : "0.0";

        return (
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-surface-container-low p-2 rounded-lg border border-slate-200/50">
              <span className="text-slate-400 block text-[10px]">Peak Day</span>
              <span className="font-bold text-slate-800">
                {peak.gross_revenue > 0 ? `${peak.label} (${formatCurrency(peak.gross_revenue)})` : "No Sales Yet"}
              </span>
            </div>
            <div className="bg-surface-container-low p-2 rounded-lg border border-slate-200/50">
              <span className="text-slate-400 block text-[10px]">Net Margin Run-Rate</span>
              <span className="font-bold text-emerald-700">{avgMargin}% Net</span>
            </div>
            <div className="bg-surface-container-low p-2 rounded-lg border border-slate-200/50">
              <span className="text-slate-400 block text-[10px]">Period Total Sales</span>
              <span className="font-bold text-primary">{formatCurrency(totalRev)}</span>
            </div>
            <div className="bg-surface-container-low p-2 rounded-lg border border-slate-200/50">
              <span className="text-slate-400 block text-[10px]">Period Net Profit</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalProf)}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
