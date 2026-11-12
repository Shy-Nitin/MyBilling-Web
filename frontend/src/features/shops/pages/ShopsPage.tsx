import React, { useState, useEffect } from "react";
import { Plus, Store, AlertTriangle, ShieldCheck, PhoneCall, Wallet, MapPin, Edit2, Trash2, Eye, Navigation } from "lucide-react";
import { MetricCard } from "../../../components/common/MetricCard";
import { UdharLimitGauge } from "../components/UdharLimitGauge";
import { AddShopModal } from "../components/AddShopModal";
import { CollectPaymentModal } from "../components/CollectPaymentModal";
import { ShopDetailsModal } from "../components/ShopDetailsModal";
import { ManageRoutesModal } from "../../routes/components/ManageRoutesModal";
import { shopService, CreateShopPayload } from "../services/shopService";
import { routeService } from "../../routes/services/routeService";
import { Shop, Route } from "../../../types";
import { formatCurrency } from "../../../lib/formatters";

export const ShopsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState<string>("ALL");
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoutesModalOpen, setIsRoutesModalOpen] = useState(false);
  const [editShop, setEditShop] = useState<Shop | null>(null);
  const [detailShop, setDetailShop] = useState<Shop | null>(null);
  const [paymentShop, setPaymentShop] = useState<Shop | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    loadShops();
  }, [selectedRouteId]);

  const loadRoutes = async () => {
    try {
      const data = await routeService.getRoutes();
      setRoutes(data);
    } catch (err) {
      console.error("Failed to load routes", err);
    }
  };

  const loadShops = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (selectedRouteId !== "ALL") params.route_id = parseInt(selectedRouteId, 10);
      const data = await shopService.getShops(params);
      setShops(data);
    } catch (err) {
      console.error("Failed to load shops", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShop = async (payload: CreateShopPayload) => {
    if (editShop) {
      await shopService.updateShop(editShop.id, payload);
    } else {
      await shopService.createShop(payload);
    }
    setEditShop(null);
    setIsAddModalOpen(false);
    loadShops();
    loadRoutes();
  };

  const handleDeleteShop = async (shop: Shop) => {
    if (!confirm(`Are you sure you want to remove shop '${shop.name}'?`)) {
      return;
    }
    try {
      const res = await shopService.deleteShop(shop.id);
      setStatusNotice(res.message);
      setTimeout(() => setStatusNotice(null), 6000);
      loadShops();
      loadRoutes();
    } catch (err: any) {
      alert(err?.message || "Failed to delete shop.");
    }
  };

  const handleCollectPayment = async (
    shopId: number,
    amount: number,
    paymentMode: string,
    notes?: string
  ) => {
    await shopService.collectPayment(shopId, amount, paymentMode, notes);
    loadShops();
  };

  // Metric sums
  const totalOutstanding = shops.reduce((sum, s) => sum + s.current_balance, 0);
  const highRiskCount = shops.filter(
    (s) => s.credit_limit > 0 && s.current_balance / s.credit_limit > 0.8
  ).length;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Notice Banner */}
      {statusNotice && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900 font-medium">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice(null)} className="text-amber-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <MetricCard
          title="Total Outstanding Udhar"
          value={formatCurrency(totalOutstanding)}
          icon={Wallet}
          subtitle="Unsettled customer receivables"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-800"
        />

        <MetricCard
          title="High-Risk Accounts"
          value={`${highRiskCount} Shops`}
          icon={AlertTriangle}
          badge={highRiskCount > 0 ? ">80% Limit Exhausted" : "All Healthy"}
          iconBgColor={highRiskCount > 0 ? "bg-rose-100" : "bg-emerald-100"}
          iconColor={highRiskCount > 0 ? "text-rose-700" : "text-emerald-700"}
        />

        <MetricCard
          title="Registered Udhar Shops"
          value={`${shops.length} Accounts`}
          icon={Store}
          subtitle="Verified trade partners"
          iconBgColor="bg-primary-container"
          iconColor="text-white"
        />

        <MetricCard
          title="Active Delivery Beats"
          value={`${routes.length} Routes`}
          icon={Navigation}
          subtitle="Territory coverage"
          iconBgColor="bg-tertiary-container"
          iconColor="text-white"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadShops()}
              placeholder="Search shop, proprietor, phone..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          {/* Route Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Delivery Routes</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.shop_count || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsRoutesModalOpen(true)}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span>Manage Routes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditShop(null);
              setIsAddModalOpen(true);
            }}
            className="h-9 px-4 bg-primary-container text-white hover:bg-primary font-semibold text-xs rounded flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Shop</span>
          </button>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
        {loading ? (
          <div className="col-span-full py-12 text-center text-secondary text-sm bg-white rounded-xl border border-slate-200">
            Loading shops...
          </div>
        ) : shops.length === 0 ? (
          <div className="col-span-full py-12 text-center text-secondary text-sm bg-white rounded-xl border border-slate-200">
            No registered shops found matching criteria. Click "Register New Shop" to add.
          </div>
        ) : (
          shops.map((shop) => (
            <div
              key={shop.id}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 leading-snug flex items-center gap-1.5">
                      <span>{shop.name}</span>
                      {shop.status === "Archived" && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono font-medium">
                          Archived
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prop: <span className="font-medium text-slate-700">{shop.owner_name || "N/A"}</span>
                    </p>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold border border-slate-200">
                    {shop.tier}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-500 flex flex-col gap-0.5 font-sans">
                  {shop.phone && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600">
                      <PhoneCall className="w-3 h-3 text-slate-400" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  {shop.route_name && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-primary">
                      <MapPin className="w-3 h-3 text-primary/70" />
                      <span>Route: {shop.route_name}</span>
                    </div>
                  )}
                  {shop.area && (
                    <div className="text-[11px] text-slate-500">
                      Territory: {shop.area}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <UdharLimitGauge
                    currentBalance={shop.current_balance}
                    creditLimit={shop.credit_limit}
                  />
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDetailShop(shop)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditShop(shop);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 rounded hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors"
                    title="Edit Shop"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteShop(shop)}
                    className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Shop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPaymentShop(shop)}
                  disabled={shop.current_balance <= 0}
                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 shadow-2xs transition-colors disabled:opacity-40 disabled:hover:bg-emerald-600"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Collect Payment</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Shop Modal */}
      <AddShopModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditShop(null);
        }}
        onSubmit={handleSaveShop}
        editShop={editShop}
        routes={routes}
      />

      {/* Shop Details Modal */}
      <ShopDetailsModal
        shop={detailShop}
        isOpen={!!detailShop}
        onClose={() => setDetailShop(null)}
        onEdit={(s) => {
          setDetailShop(null);
          setEditShop(s);
          setIsAddModalOpen(true);
        }}
      />

      {/* Collect Payment Modal */}
      <CollectPaymentModal
        shop={paymentShop}
        isOpen={!!paymentShop}
        onClose={() => setPaymentShop(null)}
        onSubmit={handleCollectPayment}
      />

      {/* Manage Routes Modal */}
      <ManageRoutesModal
        isOpen={isRoutesModalOpen}
        onClose={() => setIsRoutesModalOpen(false)}
        onRoutesChanged={() => {
          loadRoutes();
          loadShops();
        }}
      />
    </div>
  );
};
