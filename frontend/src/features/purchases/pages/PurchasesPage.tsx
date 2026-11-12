import React, { useState, useEffect } from "react";
import { Plus, Truck, Building2, Wallet, Calendar, FileText, Edit2, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { MetricCard } from "../../../components/common/MetricCard";
import { AddVendorModal } from "../components/AddVendorModal";
import { NewGrnModal } from "../components/NewGrnModal";
import { RecordSupplierPaymentModal } from "../components/RecordSupplierPaymentModal";
import { Modal } from "../../../components/common/Modal";
import {
  purchaseService,
  CreateGrnPayload,
  CreateSupplierPayload,
} from "../services/purchaseService";
import { productService } from "../../products/services/productService";
import { Supplier, Product, PurchaseOrder } from "../../../types";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import { StatusBadge } from "../../../components/common/StatusBadge";

export const PurchasesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"grn" | "suppliers">("grn");
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [editPurchase, setEditPurchase] = useState<PurchaseOrder | null>(null);
  const [paymentSupplier, setPaymentSupplier] = useState<Supplier | null>(null);

  // Deletion modals
  const [purchaseToDelete, setPurchaseToDelete] = useState<PurchaseOrder | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pos, supps, prods] = await Promise.all([
        purchaseService.getPurchases(),
        purchaseService.getSuppliers(),
        productService.getProducts(),
      ]);
      setPurchases(pos);
      setSuppliers(supps);
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load purchase data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVendor = async (payload: CreateSupplierPayload) => {
    if (editSupplier) {
      await purchaseService.updateSupplier(editSupplier.id, payload);
    } else {
      await purchaseService.createSupplier(payload);
    }
    setEditSupplier(null);
    setIsVendorModalOpen(false);
    loadData();
  };

  const handleDeleteVendor = async () => {
    if (!supplierToDelete) return;
    try {
      setIsDeleting(true);
      const res = await purchaseService.deleteSupplier(supplierToDelete.id);
      setNotice(res.message);
      setTimeout(() => setNotice(null), 6000);
      setSupplierToDelete(null);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete supplier.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveGrn = async (payload: CreateGrnPayload) => {
    if (editPurchase) {
      await purchaseService.updatePurchaseOrder(editPurchase.id, payload);
    } else {
      await purchaseService.createPurchaseOrder(payload);
    }
    setEditPurchase(null);
    setIsGrnModalOpen(false);
    loadData();
  };

  const handleDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    try {
      setIsDeleting(true);
      const res = await purchaseService.deletePurchaseOrder(purchaseToDelete.id);
      setNotice(res.message);
      setTimeout(() => setNotice(null), 6000);
      setPurchaseToDelete(null);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete purchase order.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePaySupplier = async (
    supplierId: number,
    amount: number,
    paymentMode: string,
    notes?: string
  ) => {
    await purchaseService.paySupplier(supplierId, amount, paymentMode, notes);
    loadData();
  };

  const totalPayable = suppliers.reduce((sum, s) => sum + s.outstanding_balance, 0);

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Notice Banner */}
      {notice && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900 font-medium">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-amber-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <MetricCard
          title="Total Accounts Payable"
          value={formatCurrency(totalPayable)}
          icon={Wallet}
          subtitle="Outstanding vendor payables"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-800"
        />

        <MetricCard
          title="Active Supplier Partners"
          value={`${suppliers.length} Vendors`}
          icon={Building2}
          subtitle="Contracted distributors"
          iconBgColor="bg-primary-container"
          iconColor="text-white"
        />

        <MetricCard
          title="Total Inward GRNs"
          value={`${purchases.length} Batches`}
          icon={Truck}
          subtitle="Stock receipts recorded"
          iconBgColor="bg-tertiary-container"
          iconColor="text-white"
        />

        <MetricCard
          title="Master Product SKUs"
          value={`${products.length} Items`}
          icon={Calendar}
          subtitle="Stocked in warehouse"
          iconBgColor="bg-secondary-container"
          iconColor="text-on-secondary-fixed"
        />
      </div>

      {/* Toolbar & Tabs */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("grn")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              activeTab === "grn"
                ? "bg-primary-container text-white border-primary"
                : "bg-surface-container-low text-slate-700 border-slate-200/60 hover:bg-surface-container"
            }`}
          >
            Goods Receipt Notes (GRN)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("suppliers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              activeTab === "suppliers"
                ? "bg-primary-container text-white border-primary"
                : "bg-surface-container-low text-slate-700 border-slate-200/60 hover:bg-surface-container"
            }`}
          >
            Supplier Directory
          </button>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setEditSupplier(null);
              setIsVendorModalOpen(true);
            }}
            className="h-9 px-3.5 bg-surface-container-low hover:bg-surface-container text-slate-800 border border-slate-200/80 font-semibold text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>Add Supplier</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditPurchase(null);
              setIsGrnModalOpen(true);
            }}
            className="h-9 px-4 bg-primary-container text-white hover:bg-primary font-semibold text-xs rounded flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Receive Stock (GRN)</span>
          </button>
        </div>
      </div>

      {/* Content depending on Active Tab */}
      {activeTab === "grn" ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-200/70 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/80 text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-medium">GRN / PO #</th>
                  <th className="py-3 px-4 font-medium">Supplier</th>
                  <th className="py-3 px-4 font-medium">Vendor Bill #</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium text-right">Total Amount</th>
                  <th className="py-3 px-4 font-medium text-right">Paid</th>
                  <th className="py-3 px-4 font-medium text-right">Balance Due</th>
                  <th className="py-3 px-4 font-medium text-center">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body-sm text-body-sm">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-secondary text-sm">
                      No Goods Receipt Notes posted yet. Click "Receive Stock (GRN)" to inward goods.
                    </td>
                  </tr>
                ) : (
                  purchases.map((po) => {
                    const sup = suppliers.find((s) => s.id === po.supplier_id);
                    return (
                      <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-primary">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{po.po_number}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {po.supplier_name || (sup ? sup.name : `Supplier #${po.supplier_id}`)}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">
                          {po.vendor_invoice_no || "N/A"}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-500">
                          {formatDate(po.order_date)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(po.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-700">
                          {formatCurrency(po.paid_amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-amber-800">
                          {formatCurrency(po.balance_amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={po.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setEditPurchase(po);
                                setIsGrnModalOpen(true);
                              }}
                              className="p-1 rounded hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors"
                              title="Edit GRN"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPurchaseToDelete(po)}
                              className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete GRN"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-200/70 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/80 text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-medium">Supplier Enterprise</th>
                  <th className="py-3 px-4 font-medium">Contact Person</th>
                  <th className="py-3 px-4 font-medium">GSTIN</th>
                  <th className="py-3 px-4 font-medium">City</th>
                  <th className="py-3 px-4 font-medium text-center">Terms</th>
                  <th className="py-3 px-4 font-medium text-right">Outstanding Payable</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body-sm text-body-sm">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {s.phone || s.email || "No direct phone"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{s.contact_person || "N/A"}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{s.gstin || "N/A"}</td>
                    <td className="py-3 px-4 text-slate-600">{s.city || "Mumbai"}</td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-600">
                      {s.payment_terms_days} Days
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(s.outstanding_balance)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setPaymentSupplier(s)}
                          disabled={s.outstanding_balance <= 0}
                          className="h-8 px-2.5 rounded-lg bg-indigo-50 hover:bg-primary-container text-primary hover:text-white font-semibold text-xs transition-colors border border-indigo-200 disabled:opacity-40"
                        >
                          Disburse
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditSupplier(s);
                            setIsVendorModalOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSupplierToDelete(s)}
                          className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <AddVendorModal
        isOpen={isVendorModalOpen}
        onClose={() => {
          setIsVendorModalOpen(false);
          setEditSupplier(null);
        }}
        onSubmit={handleSaveVendor}
        editSupplier={editSupplier}
      />

      {/* New / Edit GRN Modal */}
      <NewGrnModal
        isOpen={isGrnModalOpen}
        onClose={() => {
          setIsGrnModalOpen(false);
          setEditPurchase(null);
        }}
        suppliers={suppliers}
        products={products}
        onSubmit={handleSaveGrn}
        editPurchase={editPurchase}
      />

      {/* Record Supplier Payment Modal */}
      <RecordSupplierPaymentModal
        supplier={paymentSupplier}
        isOpen={!!paymentSupplier}
        onClose={() => setPaymentSupplier(null)}
        onSubmit={handlePaySupplier}
      />

      {/* Delete GRN Modal */}
      {purchaseToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setPurchaseToDelete(null)}
          title="Delete Goods Receipt Note (GRN)?"
          subtitle="Inventory and vendor balances will be reconciled."
          maxWidth="max-w-md"
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 flex flex-col gap-1">
                <p className="font-semibold">
                  Are you sure you want to delete GRN {purchaseToDelete.po_number}?
                </p>
                <p>
                  Deleting will decrement stock quantities added by this purchase, revert the supplier payable balance, and void the purchase ledger records.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPurchaseToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePurchase}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete GRN</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Supplier Modal */}
      {supplierToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setSupplierToDelete(null)}
          title="Delete Supplier Partner?"
          subtitle="Check for existing purchase transactions."
          maxWidth="max-w-md"
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 flex flex-col gap-1">
                <p className="font-semibold">
                  Remove supplier partner '{supplierToDelete.name}'?
                </p>
                <p>
                  If this supplier has historical purchase transactions or stock receipts, they will be safely marked as "Archived" to preserve your accounting ledger and historical reports.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSupplierToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVendor}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
