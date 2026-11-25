import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Product } from "../../../types";
import { CreateProductPayload } from "../services/productService";
import { categoryService } from "../../categories/services/categoryService";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductPayload) => Promise<void>;
  editProduct?: Product | null;
  categoryList?: string[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editProduct,
  categoryList,
}) => {
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("General");
  const [availableCategories, setAvailableCategories] = useState<string[]>(categoryList || []);
  const [packSize, setPackSize] = useState("1 unit");
  const [unit, setUnit] = useState("PCS");
  const [landedCost, setLandedCost] = useState(0);
  const [wholesaleRate, setWholesaleRate] = useState(0);
  const [mrp, setMrp] = useState(0);
  const [isPercentPricing, setIsPercentPricing] = useState(false);
  const [purchaseDiscPercent, setPurchaseDiscPercent] = useState<number>(0);
  const [wholesaleDiscPercent, setWholesaleDiscPercent] = useState<number>(0);
  const [stockQty, setStockQty] = useState(0);
  const [minThreshold, setMinThreshold] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categoryList && categoryList.length > 0) {
      setAvailableCategories(categoryList);
    } else {
      categoryService.getCategories(true).then((cats) => {
        if (cats && cats.length > 0) {
          setAvailableCategories(cats.map((c) => c.name));
        }
      }).catch(() => {});
    }

    if (editProduct) {
      setSku(editProduct.sku);
      setBarcode(editProduct.barcode || "");
      setName(editProduct.name);
      setBrand(editProduct.brand || "");
      setCategory(editProduct.category);
      setPackSize(editProduct.pack_size);
      setUnit(editProduct.unit || "PCS");
      setLandedCost(editProduct.landed_cost);
      setWholesaleRate(editProduct.wholesale_rate);
      setMrp(editProduct.mrp);
      if (editProduct.mrp > 0) {
        const pDisc = Math.max(0, Math.round(((editProduct.mrp - editProduct.landed_cost) / editProduct.mrp) * 100 * 100) / 100);
        const wDisc = Math.max(0, Math.round(((editProduct.mrp - editProduct.wholesale_rate) / editProduct.mrp) * 100 * 100) / 100);
        setPurchaseDiscPercent(pDisc);
        setWholesaleDiscPercent(wDisc);
      }
      setStockQty(editProduct.stock_qty);
      setMinThreshold(editProduct.min_stock_threshold);
    } else {
      // Auto generate random SKU
      const rand = Math.floor(1000 + Math.random() * 9000);
      setSku(`SKU-ITEM-${rand}`);
      setBarcode(`890${rand}123456`);
      setName("");
      setBrand("");
      setCategory(availableCategories[0] || "General");
      setPackSize("1 unit");
      setUnit("PCS");
      setLandedCost(0);
      setWholesaleRate(0);
      setMrp(0);
      setStockQty(50);
      setMinThreshold(15);
    }
  }, [editProduct, isOpen, categoryList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) {
      alert("Please provide both Product Name and SKU.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        sku,
        barcode: barcode || undefined,
        name,
        brand: brand || undefined,
        category,
        pack_size: packSize,
        unit,
        landed_cost: landedCost,
        wholesale_rate: wholesaleRate,
        mrp: mrp || wholesaleRate,
        stock_qty: stockQty,
        min_stock_threshold: minThreshold,
      });
      onClose();
    } catch (err: any) {
      alert(`Failed to save product: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editProduct ? "Edit Product Identity" : "Add Product to Master Catalog"}
      subtitle="Configure SKU identity, purchase landed cost, and wholesale pricing."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Row 1: SKU & Barcode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              SKU Identifier *
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="SKU-RICE-50KG"
              className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              EAN / Barcode
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="8901234567890"
              className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
        </div>

        {/* Row 2: Name */}
        <div>
          <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
            Product Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Royal Basmati Rice (Aged 2 Yrs)"
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium text-slate-900"
          />
        </div>

        {/* Row 3: Brand & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Fortune, Tata, Parle"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800"
            >
              {availableCategories.length > 0 ? (
                availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              ) : (
                <>
                  <option value="General">General</option>
                  <option value="Staples & Grains">Staples & Grains</option>
                  <option value="Edible Oils">Edible Oils</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Row 4: Pack Size & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Pack Size Identity
            </label>
            <input
              type="text"
              value={packSize}
              onChange={(e) => setPackSize(e.target.value)}
              placeholder="e.g. 50 KG Bag, 15 Ltr Tin, Case of 12"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Base Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800"
            >
              <option value="PCS">PCS (Pieces)</option>
              <option value="BAG">BAG (Sacks/Bags)</option>
              <option value="TIN">TIN (Drums/Tins)</option>
              <option value="BOX">BOX (Boxes)</option>
              <option value="CASE">CASE (Cartons)</option>
              <option value="KG">KG (Kilograms)</option>
              <option value="LTR">LTR (Litres)</option>
            </select>
          </div>
        </div>

        {/* Row 5: Pricing (Cost vs Wholesale vs MRP + Optional Percentage-Based Pricing) */}
        <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-indigo-900 font-semibold uppercase tracking-wider">
              Pricing Architecture
            </span>
            <button
              type="button"
              onClick={() => setIsPercentPricing(!isPercentPricing)}
              className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                isPercentPricing
                  ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                  : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              <span>% Based Pricing</span>
              <span className="text-[10px]">{isPercentPricing ? "ON" : "OFF"}</span>
            </button>
          </div>

          {isPercentPricing ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-[10px] text-slate-700 uppercase block mb-1 font-semibold">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={mrp}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setMrp(val);
                      if (val > 0) {
                        setLandedCost(Math.round(val * (1 - purchaseDiscPercent / 100) * 100) / 100);
                        setWholesaleRate(Math.round(val * (1 - wholesaleDiscPercent / 100) * 100) / 100);
                      }
                    }}
                    placeholder="e.g. 55"
                    className="w-full font-mono text-xs bg-white border border-indigo-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-900"
                  />
                  <span className="text-[9px] text-slate-500">Base pack MRP</span>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-slate-700 uppercase block mb-1 font-semibold">
                    Purchase Disc %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={purchaseDiscPercent}
                    onChange={(e) => {
                      const disc = parseFloat(e.target.value) || 0;
                      setPurchaseDiscPercent(disc);
                      if (mrp > 0) {
                        setLandedCost(Math.round(mrp * (1 - disc / 100) * 100) / 100);
                      }
                    }}
                    placeholder="e.g. 18%"
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  />
                  <span className="text-[9px] text-slate-500">
                    Landed: ₹{landedCost.toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-slate-700 uppercase block mb-1 font-semibold">
                    Wholesale Disc %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={wholesaleDiscPercent}
                    onChange={(e) => {
                      const disc = parseFloat(e.target.value) || 0;
                      setWholesaleDiscPercent(disc);
                      if (mrp > 0) {
                        setWholesaleRate(Math.round(mrp * (1 - disc / 100) * 100) / 100);
                      }
                    }}
                    placeholder="e.g. 11%"
                    className="w-full font-mono text-xs bg-white border border-indigo-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary font-bold text-primary"
                  />
                  <span className="text-[9px] text-slate-500">
                    Wholesale: ₹{wholesaleRate.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-indigo-700 italic">
                Auto-calculated: Landed Cost ₹{landedCost.toFixed(2)} ({purchaseDiscPercent}% off MRP), Wholesale Rate ₹{wholesaleRate.toFixed(2)} ({wholesaleDiscPercent}% off MRP).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-[10px] text-slate-600 uppercase block mb-1">
                  Landed Cost (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={landedCost}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setLandedCost(val);
                    if (mrp > 0) setPurchaseDiscPercent(Math.max(0, Math.round(((mrp - val) / mrp) * 100 * 100) / 100));
                  }}
                  className="w-full font-mono text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                />
                <span className="text-[9px] text-slate-400">Internal only</span>
              </div>

              <div>
                <label className="font-mono text-[10px] text-slate-600 uppercase block mb-1">
                  Wholesale Rate (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={wholesaleRate}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setWholesaleRate(val);
                    if (mrp > 0) setWholesaleDiscPercent(Math.max(0, Math.round(((mrp - val) / mrp) * 100 * 100) / 100));
                  }}
                  className="w-full font-mono text-xs bg-white border border-indigo-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary font-bold text-primary"
                />
                <span className="text-[9px] text-slate-500">Billing price</span>
              </div>

              <div>
                <label className="font-mono text-[10px] text-slate-600 uppercase block mb-1">
                  MRP (Informational)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={mrp}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setMrp(val);
                    if (val > 0) {
                      setPurchaseDiscPercent(Math.max(0, Math.round(((val - landedCost) / val) * 100 * 100) / 100));
                      setWholesaleDiscPercent(Math.max(0, Math.round(((val - wholesaleRate) / val) * 100 * 100) / 100));
                    }
                  }}
                  className="w-full font-mono text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-[9px] text-slate-400">Printed on pack</span>
              </div>
            </div>
          )}
        </div>

        {/* Row 6: Stock & Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Current Stock Quantity
            </label>
            <input
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(parseFloat(e.target.value) || 0)}
              className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Minimum Alert Threshold
            </label>
            <input
              type="number"
              value={minThreshold}
              onChange={(e) => setMinThreshold(parseFloat(e.target.value) || 0)}
              className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 px-5 bg-primary-container text-white hover:bg-primary font-semibold text-xs rounded shadow-xs transition-colors"
          >
            {isSubmitting ? "Saving..." : editProduct ? "Update Product" : "Save to Catalog"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
