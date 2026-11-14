import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Receipt,
  Package,
  FileText,
  Store,
  BarChart3,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  QrCode,
  CreditCard,
  Layers,
  ArrowRight,
  Filter,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { type ReceiptPrinterStage } from "../../../receiptPrinter/receiptPrinter";

export interface DemoCartItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  mrp: number;
  rate: number;
  quantity: number;
  stockStatus: "safe" | "moderate" | "low";
}

interface AppPreviewSectionProps {
  onFinalizePrint?: (invoiceData: {
    items: { id: string; name: string; quantity: number; rate: number; unit?: string }[];
    subtotal: number;
    tax: number;
    total: number;
    customerName: string;
    paymentMode: string;
    orderNumber?: string;
  }) => void;
  children?: React.ReactNode;
}

export function AppPreviewSection({ onFinalizePrint, children }: AppPreviewSectionProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "billing" | "products" | "invoices" | "shops" | "reports">("billing");
  
  // Demo Catalog Products
  const catalogProducts: Omit<DemoCartItem, "quantity">[] = [
    {
      id: "prod-1",
      sku: "SKU-OIL-SUN-15L",
      name: "Fortune Refined Sunflower Oil Tin",
      category: "Edible Oils",
      brand: "Fortune",
      unit: "TIN",
      mrp: 30.0,
      rate: 25.0,
      stockStatus: "safe",
    },
    {
      id: "prod-2",
      sku: "SKU-SUGAR-PREM-50",
      name: "Madhur Pure & Sulphur-Free Sugar",
      category: "Staples & Grains",
      brand: "Madhur",
      unit: "BAG",
      mrp: 27.0,
      rate: 22.7,
      stockStatus: "moderate",
    },
    {
      id: "prod-3",
      sku: "SKU-ATTA-CHAK-30",
      name: "Aashirvaad Shudh Chakki Atta Pack",
      category: "Staples & Grains",
      brand: "Aashirvaad",
      unit: "SACK",
      mrp: 56.0,
      rate: 48.0,
      stockStatus: "safe",
    },
    {
      id: "prod-4",
      sku: "SKU-TEA-GOLD-1KG",
      name: "Tata Tea Gold Premium Assam Leaves",
      category: "Beverages & Dairy",
      brand: "Tata",
      unit: "CASE",
      mrp: 7.0,
      rate: 5.7,
      stockStatus: "safe",
    },
  ];

  // In-memory Interactive Cart State
  const [cart, setCart] = useState<DemoCartItem[]>([
    {
      ...catalogProducts[0],
      quantity: 1,
    },
    {
      ...catalogProducts[1],
      quantity: 1,
    },
  ]);

  const [selectedShop, setSelectedShop] = useState("Counter Walk-in (No Udhar)");
  const [customerName, setCustomerName] = useState("Counter Walk-in Retail");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("Cash [F2]");
  const [categoryFilter, setCategoryFilter] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [dashboardTimeframe, setDashboardTimeframe] = useState<"Today" | "Last 7 Days" | "30 Days">("Today");
  const [finalizedAlert, setFinalizedAlert] = useState<string | null>(null);

  // Products Tab Interactive State
  const [inventoryProducts, setInventoryProducts] = useState([
    { id: "inv-1", sku: "SKU-NEST-014", name: "Nestle KitKat 4-Finger (Box of 24)", batch: "BT-2024-X • 08/2026", stock: "420 Boxes", cost: "$14.20", rate: 18.5, margin: "23.2%" },
    { id: "inv-2", sku: "SKU-OIL-SUN-15L", name: "Fortune Refined Sunflower Oil Tin", batch: "BT-2025-A • 12/2026", stock: "140 Tins", cost: "$20.00", rate: 25.0, margin: "25.0%" },
    { id: "inv-3", sku: "SKU-SUGAR-50", name: "Madhur Sulphur-Free Sugar 50KG", batch: "BT-2025-S • 04/2027", stock: "85 Bags", cost: "$18.50", rate: 22.7, margin: "22.7%" },
    { id: "inv-4", sku: "SKU-TEA-GOLD-1KG", name: "Tata Tea Gold Assam Master Pack", batch: "BT-2025-T • 10/2026", stock: "310 Cases", cost: "$4.20", rate: 5.7, margin: "26.3%" },
  ]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    sku: "",
    name: "",
    batch: "BT-2025-N • 12/2027",
    stock: "100 Units",
    cost: "$12.00",
    rate: 16.0,
    margin: "25.0%",
  });

  // Shops Tab Interactive State
  const [registeredShops, setRegisteredShops] = useState([
    { id: "shop-1", name: "Metro Supermart #102", owner: "Ramesh Sharma", beat: "Beat #04", limit: "$5,000.00", udhar: "$420.00", score: "AAA (Safe)" },
    { id: "shop-2", name: "Green Valley Provisions", owner: "Vinod Patil", beat: "Beat #04", limit: "$2,500.00", udhar: "$1,890.00", score: "BBB (Moderate)" },
    { id: "shop-3", name: "Apex Cash & Carry", owner: "Harish Gupta", beat: "Beat #02", limit: "$10,000.00", udhar: "$0.00", score: "AAA (Pristine)" },
    { id: "shop-4", name: "Shree Ganesh Traders", owner: "Kishore Jain", beat: "Beat #01", limit: "$3,000.00", udhar: "$840.00", score: "AA (Good)" },
  ]);
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopForm, setNewShopForm] = useState({
    name: "",
    owner: "",
    beat: "Beat #04",
    limit: "$5,000.00",
    udhar: "$0.00",
    score: "AAA (Safe)",
  });

  // Invoices Tab Interactive State
  const [invoicesList, setInvoicesList] = useState([
    { id: "INV-2048", shop: "Metro Supermart #102", date: "Today 14:32 • Beat #04", items: "3 SKUs", amt: "$50.40", status: "PAID", type: "success" },
    { id: "INV-2047", shop: "Green Valley Provisions", date: "Today 13:15 • Beat #04", items: "12 SKUs", amt: "$348.00", status: "UDHAR (7D)", type: "warning" },
    { id: "INV-2046", shop: "Apex Cash & Carry", date: "Today 11:40 • Beat #02", items: "28 SKUs", amt: "$1,240.50", status: "PAID UPI", type: "success" },
    { id: "INV-2045", shop: "Shree Ganesh Traders", date: "Yesterday • Beat #01", items: "8 SKUs", amt: "$182.20", status: "PAID CASH", type: "success" },
  ]);

  // Cart operations
  const addToCart = (product: Omit<DemoCartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as DemoCartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Financial Calculations
  const grossSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.rate * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (grossSubtotal * discountPercent) / 100;
  }, [grossSubtotal, discountPercent]);

  const taxableAmount = grossSubtotal - discountAmount;
  const gstTax = taxableAmount * 0.05; // 5% GST
  const netPayable = taxableAmount + gstTax;

  const handleFinalize = () => {
    const generatedOrderNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceData = {
      items: cart.map((c) => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        rate: c.rate,
        unit: c.unit,
      })),
      subtotal: grossSubtotal,
      tax: gstTax,
      total: netPayable,
      customerName,
      paymentMode: selectedPaymentMode,
      orderNumber: generatedOrderNum,
    };

    // Prepend newly finalized invoice to interactive in-memory ledger
    setInvoicesList((prev) => [
      {
        id: generatedOrderNum,
        shop: customerName || "Counter Retail",
        date: "Just now • Beat #04",
        items: `${cart.length} SKUs (${cart.reduce((s, i) => s + i.quantity, 0)} units)`,
        amt: `$${netPayable.toFixed(2)}`,
        status: selectedPaymentMode.includes("Udhar") ? "UDHAR (7D)" : "PAID",
        type: selectedPaymentMode.includes("Udhar") ? "warning" : "success",
      },
      ...prev,
    ]);

    setFinalizedAlert(`Order ${generatedOrderNum} finalized for $${netPayable.toFixed(2)}! Dispatching thermal print...`);
    setCart([]);

    if (onFinalizePrint) {
      onFinalizePrint(invoiceData);
    } else {
      const target = document.getElementById("receipt-printer-section");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const filteredCatalog = catalogProducts.filter((p) => {
    const matchesCat = categoryFilter === "All Items" || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="app-preview" className="w-full py-20 lg:py-28 px-margin bg-canvas-bg">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary/10 via-secondary-container/15 to-tertiary-fixed-dim/20 text-primary border border-primary/30 font-label-mono-sm text-label-mono-sm font-bold shadow-sm mb-4">
            <span className="material-symbols-outlined text-[15px] text-primary">desktop_windows</span>
            <span className="tracking-wide">PRODUCT TOUR</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface tracking-tight">
            Take a Look Inside MyBilling.
          </h2>
          <p className="font-body-lg text-body-lg text-text-muted mt-4">
            Experience the interface trusted by over 1,200 distributors every single day. Click the modules below to test live screens.
          </p>
        </div>

        {/* Functional Tab Buttons Strip */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 no-scrollbar gap-2">
          <div className="inline-flex p-1.5 rounded-xl bg-surface-container-high/60 backdrop-blur-md">
            {[
              { id: "dashboard", label: "Dashboard", icon: "dashboard" },
              { id: "billing", label: "Billing", icon: "receipt_long" },
              { id: "products", label: "Products", icon: "inventory_2" },
              { id: "invoices", label: "Invoices", icon: "receipt" },
              { id: "shops", label: "Shops & CRM", icon: "store" },
              { id: "reports", label: "Reports & GST", icon: "bar_chart" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-lg font-headline-sm text-body-md transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "active text-primary bg-surface-card shadow-sm font-semibold"
                      : "text-text-muted hover:text-on-surface font-medium"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Dashboard Card Window */}
        <div className="w-full bg-surface-card rounded-2xl shadow-xl border border-border-strong overflow-hidden">
          {/* App Top Navigation Bar Simulation */}
          <div className="h-14 px-6 bg-surface-container-low border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-error/60" />
                <span className="w-3 h-3 rounded-full bg-warning-amber/60" />
                <span className="w-3 h-3 rounded-full bg-success-emerald/60" />
              </div>
              <span className="text-outline-variant font-light">|</span>
              <span className="font-headline-sm text-body-sm font-semibold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
                <span>MyBilling</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-primary/10 text-primary font-label-mono-sm text-[11px] font-semibold">
                Live Cloud Sync • 12ms
              </span>
              <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-text-secondary">
                <span className="material-symbols-outlined text-[16px]">notifications</span>
              </div>
            </div>
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-headline-md text-xl font-bold text-on-surface tracking-tight">
                      Welcome back, Boss. Let's see how business is looking.
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-success-emerald/10 border border-success-emerald/20 text-success-emerald font-label-mono-sm text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse" /> LIVE SYNC
                    </span>
                  </div>
                  <p className="font-body-md text-xs text-text-muted mt-1">
                    Real-time overview of wholesale sales, cash flow, and inventory health.
                  </p>
                </div>
                <div className="inline-flex p-1 rounded-lg bg-surface-container-low border border-border-strong text-xs font-medium">
                  {(["Today", "Last 7 Days", "30 Days"] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setDashboardTimeframe(period)}
                      className={`px-3 py-1 rounded-md transition-all ${
                        dashboardTimeframe === period
                          ? "bg-surface-card text-primary font-semibold shadow-sm"
                          : "text-text-muted hover:text-on-surface"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-surface-container-low border border-border-subtle">
                  <span className="font-body-sm text-xs text-text-muted">Total Sales ({dashboardTimeframe})</span>
                  <div className="font-headline-md text-2xl font-bold text-on-surface mt-1">
                    {dashboardTimeframe === "Today" ? "$14,890.00" : dashboardTimeframe === "Last 7 Days" ? "$84,320.00" : "$342,100.00"}
                  </div>
                  <span className="font-label-mono-sm text-xs text-success-emerald font-semibold mt-2 inline-block">
                    {dashboardTimeframe === "Today" ? "+18.4% vs yesterday" : dashboardTimeframe === "Last 7 Days" ? "+12.8% vs prior week" : "+22.1% vs prior month"}
                  </span>
                </div>
                <div className="p-5 rounded-xl bg-surface-container-low border border-border-subtle">
                  <span className="font-body-sm text-xs text-text-muted">Outstanding Udhar Credit</span>
                  <div className="font-headline-md text-2xl font-bold text-on-surface mt-1">
                    {dashboardTimeframe === "Today" ? "$4,320.00" : dashboardTimeframe === "Last 7 Days" ? "$11,450.00" : "$28,900.00"}
                  </div>
                  <span className="font-label-mono-sm text-xs text-warning-amber font-semibold mt-2 inline-block">
                    {dashboardTimeframe === "Today" ? "5 shops pending settlement" : dashboardTimeframe === "Last 7 Days" ? "14 shops pending settlement" : "22 shops active ledger"}
                  </span>
                </div>
                <div className="p-5 rounded-xl bg-surface-container-low border border-border-subtle">
                  <span className="font-body-sm text-xs text-text-muted">Net Distributor Margin</span>
                  <div className="font-headline-md text-2xl font-bold text-primary mt-1">
                    {dashboardTimeframe === "Today" ? "26.2% ($3,901)" : dashboardTimeframe === "Last 7 Days" ? "25.8% ($21,754)" : "26.5% ($90,656)"}
                  </div>
                  <span className="font-label-mono-sm text-xs text-primary font-semibold mt-2 inline-block">
                    {dashboardTimeframe === "Today" ? "Above target 24%" : "Exceeding quarterly target"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BILLING POS (MAIN INTERACTIVE DEMO) */}
          {activeTab === "billing" && (
            <div className="p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto">
              {/* Top Controls Bar */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-card border border-border-strong">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  {/* Shop Selector */}
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <label className="block font-label-mono-sm text-[10px] uppercase text-text-muted font-semibold tracking-wider">
                        Select Registered Shop (Udhar Allowed)
                      </label>
                      <select
                        value={selectedShop}
                        onChange={(e) => {
                          setSelectedShop(e.target.value);
                          if (e.target.value.includes("Metro")) {
                            setCustomerName("Metro Supermart #102");
                          } else if (e.target.value.includes("Green Valley")) {
                            setCustomerName("Green Valley Provisions");
                          } else {
                            setCustomerName("Counter Walk-in Retail");
                          }
                        }}
                        className="w-full bg-surface-container-low border border-border-strong rounded-lg px-3 py-1.5 font-body-md text-xs text-on-surface font-semibold focus:outline-none cursor-pointer mt-0.5"
                      >
                        <option value="Counter Walk-in (No Udhar)">Counter Walk-in (No Udhar)</option>
                        <option value="Metro Supermart (Udhar Approved)">Metro Supermart (Udhar Approved)</option>
                        <option value="Green Valley Provisions">Green Valley Provisions (Beat #04)</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="flex-1">
                    <label className="block font-label-mono-sm text-[10px] uppercase text-text-muted font-semibold tracking-wider">
                      Customer Name / Billing Identity
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-0.5 w-full bg-surface-container-low border border-border-strong rounded-lg px-3 py-1.5 font-body-md text-xs text-on-surface font-medium focus:outline-none"
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-border-subtle shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="font-label-mono-sm text-[10px] uppercase text-text-muted">Terminal #01</div>
                    <div className="font-headline-sm text-xs font-bold text-on-surface">Boss Register</div>
                  </div>
                  <div className="text-right">
                    <div className="font-label-mono-sm text-[10px] uppercase text-text-muted">Cart Items</div>
                    <div className="font-label-mono-sm text-xs font-bold text-primary">
                      {cart.reduce((s, i) => s + i.quantity, 0)} Units ({cart.length} SKUs)
                    </div>
                  </div>
                </div>
              </div>

              {/* Main POS Grid: 8 Cols Catalog Left & 4 Cols Active Bill Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left 8 Cols: Search, Filters & Product Cards Grid */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  {/* Search Bar */}
                  <div className="relative flex items-center w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-border-strong">
                    <Search className="w-4 h-4 text-text-muted mr-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Scan barcode [F1] or type SKU / item name..."
                      className="bg-transparent text-xs text-on-surface placeholder:text-text-muted focus:outline-none w-full font-body-md"
                    />
                    <span className="px-2 py-0.5 rounded border border-border-strong bg-surface-card text-text-muted font-label-mono-sm text-[11px] font-semibold shrink-0">
                      F1
                    </span>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {["All Items", "Edible Oils", "Staples & Grains", "Beverages & Dairy", "Snacks"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                          categoryFilter === cat
                            ? "bg-primary text-on-primary shadow-sm"
                            : "bg-surface-card hover:bg-surface-container-low text-text-secondary border border-border-strong"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Product Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredCatalog.map((product) => {
                      const inCart = cart.find((i) => i.id === product.id);

                      return (
                        <div
                          key={product.id}
                          className="p-4 rounded-xl bg-surface-card border border-border-strong shadow-sm hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-mono-sm text-[11px] font-semibold">
                                {product.sku}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-success-emerald/10 text-success-emerald font-label-mono-sm text-[10px] font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-success-emerald" /> SAFE STOCK
                              </span>
                            </div>
                            <h4 className="font-headline-sm text-sm font-bold text-on-surface line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="font-body-sm text-xs text-text-muted mt-0.5">
                              {product.brand} &bull; {product.unit}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border-subtle flex items-end justify-between">
                            <div>
                              <div className="font-label-mono-sm text-[11px] text-text-muted line-through">
                                MRP: ${product.mrp.toFixed(2)}
                              </div>
                              <div className="font-label-mono-lg text-base font-bold text-on-surface">
                                ${product.rate.toFixed(2)}{" "}
                                <span className="text-xs font-normal text-text-muted">/{product.unit}</span>
                              </div>
                            </div>

                            {inCart ? (
                              <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg p-0.5 border border-primary/20">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, -1)}
                                  className="w-7 h-7 rounded-md bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-label-mono-sm text-xs font-bold text-primary px-1.5">
                                  {inCart.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, 1)}
                                  className="w-7 h-7 rounded-md bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-secondary text-on-primary font-body-md text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right 4 Cols: Active Bill Ledger / Checkout Panel */}
                <div className="lg:col-span-4 p-5 rounded-2xl bg-surface-card border border-border-strong shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                      <div>
                        <h3 className="font-headline-sm text-sm font-bold text-on-surface">Active Bill Ledger</h3>
                        <p className="font-body-sm text-xs text-text-muted">
                          {customerName} &bull; {cart.length} item(s)
                        </p>
                      </div>
                      {cart.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCart([])}
                          className="text-[11px] font-label-mono-sm text-error hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>

                    {/* Finalized Order Alert Banner */}
                    {finalizedAlert && (
                      <div className="my-2.5 p-3 rounded-xl bg-success-emerald/10 border border-success-emerald/30 text-success-emerald text-xs flex items-center justify-between animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-success-emerald" />
                          <span className="font-semibold text-[11px] leading-tight text-on-surface">
                            {finalizedAlert}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFinalizedAlert(null)}
                          className="p-1 text-text-muted hover:text-on-surface"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Cart Items List or Dashed Empty State */}
                    {cart.length === 0 ? (
                      <div className="my-4 p-6 rounded-xl border-2 border-dashed border-border-strong flex flex-col items-center justify-center text-center bg-surface-container-low/50 min-h-[140px]">
                        <span className="font-headline-sm text-xs font-semibold text-on-surface mb-1">
                          Cart is currently empty
                        </span>
                        <p className="font-body-sm text-[11px] text-text-muted max-w-xs">
                          Click any product on the left or scan barcode [F1] to add line items.
                        </p>
                      </div>
                    ) : (
                      <div className="my-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                        <AnimatePresence>
                          {cart.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-2.5 rounded-lg bg-surface-container-low border border-border-subtle flex items-center justify-between gap-2"
                            >
                              <div className="flex-1 min-w-0">
                                <h5 className="font-headline-sm text-xs font-semibold text-on-surface truncate">
                                  {item.name}
                                </h5>
                                <span className="font-label-mono-sm text-[10px] text-text-muted">
                                  ${item.rate.toFixed(2)} &times; {item.quantity} {item.unit}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-5 h-5 rounded bg-surface-card hover:bg-surface-container text-text-secondary flex items-center justify-center text-xs"
                                  >
                                    -
                                  </button>
                                  <span className="font-label-mono-sm text-xs font-bold px-1">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-5 h-5 rounded bg-surface-card hover:bg-surface-container text-text-secondary flex items-center justify-center text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-label-mono-sm text-xs font-bold text-on-surface w-14 text-right">
                                  ${(item.rate * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Payment Mode Selector */}
                    <div className="mb-4">
                      <span className="block font-label-mono-sm text-[10px] uppercase text-text-muted font-semibold tracking-wider mb-2">
                        PAYMENT MODE
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Cash [F2]", icon: CreditCard },
                          { label: "UPI / QR", icon: QrCode },
                          { label: "Udhar Credit", icon: Store, badge: "Udhar" },
                          { label: "Split Pay [F4]", icon: Layers },
                        ].map((mode) => {
                          const Icon = mode.icon;
                          const isSelected = selectedPaymentMode === mode.label;

                          return (
                            <button
                              key={mode.label}
                              type="button"
                              onClick={() => setSelectedPaymentMode(mode.label)}
                              className={`p-2.5 rounded-xl flex flex-col items-start justify-between border text-left transition-all ${
                                isSelected
                                  ? "bg-primary text-on-primary border-primary shadow-sm"
                                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border-border-strong"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-text-muted"}`} />
                                {mode.badge && (
                                  <span className="px-1 py-0.2 rounded border border-warning-amber/40 text-warning-amber font-label-mono-sm text-[9px] font-semibold">
                                    {mode.badge}
                                  </span>
                                )}
                              </div>
                              <span className="font-label-mono-sm text-xs font-semibold">{mode.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-1.5 py-2 border-t border-border-subtle font-label-mono-sm text-xs text-text-secondary">
                      <div className="flex justify-between">
                        <span>Gross Subtotal:</span>
                        <span className="font-bold text-on-surface">${grossSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST / Split Tax (5%):</span>
                        <span className="text-on-surface">${gstTax.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Prominent Net Payable Banner */}
                    <div className="p-4 rounded-xl bg-primary text-on-primary mb-3 shadow-md">
                      <div className="font-label-mono-sm text-[10px] uppercase text-on-primary/80 font-semibold tracking-wider">
                        NET PAYABLE TOTAL
                      </div>
                      <div className="font-display-hero text-2xl font-bold tracking-tight mt-0.5">
                        ${netPayable.toFixed(2)}
                      </div>
                    </div>

                    {/* Finalize & Print CTA */}
                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={handleFinalize}
                      className="w-full py-3 px-4 rounded-xl bg-secondary-container text-on-primary font-headline-sm text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Finalize &amp; Print Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === "products" && (
            <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-80 px-3.5 py-2 rounded-xl bg-surface-container-low border border-border-strong">
                  <Search className="w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search 3,850 SKUs or scan barcode..."
                    className="bg-transparent text-xs text-on-surface placeholder:text-text-muted focus:outline-none w-full font-body-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-lg bg-surface-container-low text-xs font-medium border border-border-strong text-text-secondary">
                    Total: {inventoryProducts.length} SKUs
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-xs font-semibold text-on-primary hover:bg-secondary transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                </div>
              </div>

              {/* SKU Data Table */}
              <div className="overflow-x-auto rounded-xl border border-border-subtle">
                <table className="w-full text-left font-body-sm text-xs">
                  <thead className="bg-surface-container-low">
                    <tr className="text-text-muted font-label-mono-sm text-[11px] uppercase border-b border-border-subtle">
                      <th className="p-3.5">SKU Code</th>
                      <th className="p-3.5">Item Description</th>
                      <th className="p-3.5">Batch / Expiry</th>
                      <th className="p-3.5 text-right">In Stock</th>
                      <th className="p-3.5 text-right">Cost Price</th>
                      <th className="p-3.5 text-right">Selling Rate</th>
                      <th className="p-3.5 text-right">Margin %</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-surface-card">
                    {inventoryProducts
                      .filter(
                        (row) =>
                          row.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          row.sku.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((row) => (
                        <tr key={row.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="p-3.5 font-label-mono-sm text-primary font-semibold">{row.sku}</td>
                          <td className="p-3.5 font-semibold text-on-surface">{row.name}</td>
                          <td className="p-3.5 font-label-mono-sm text-text-muted">{row.batch}</td>
                          <td className="p-3.5 text-right font-label-mono-sm font-semibold text-on-surface">{row.stock}</td>
                          <td className="p-3.5 text-right font-label-mono-sm text-text-muted">{row.cost}</td>
                          <td className="p-3.5 text-right font-label-mono-sm font-bold text-on-surface">
                            ${typeof row.rate === "number" ? row.rate.toFixed(2) : row.rate}
                          </td>
                          <td className="p-3.5 text-right font-label-mono-sm text-success-emerald font-bold">{row.margin}</td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setInventoryProducts((prev) => prev.filter((p) => p.id !== row.id))}
                              className="p-1 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INVOICES */}
          {activeTab === "invoices" && (
            <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface">Invoice History &amp; Dispatches</h4>
                  <p className="font-body-sm text-xs text-text-muted">Real-time ledger of dispatched wholesale shipments.</p>
                </div>
                <span className="font-label-mono-sm text-xs text-primary font-semibold">
                  {invoicesList.length} Total Dispatched
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border-subtle">
                <table className="w-full text-left font-body-sm text-xs">
                  <thead className="bg-surface-container-low font-label-mono-sm text-[11px] uppercase text-text-muted">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Shop / Client</th>
                      <th className="p-3.5">Date &amp; Beat</th>
                      <th className="p-3.5 text-right">Items</th>
                      <th className="p-3.5 text-right">Total Amount</th>
                      <th className="p-3.5 text-right">Status</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-surface-card">
                    {invoicesList.map((inv) => (
                      <tr key={inv.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-3.5 font-label-mono-sm text-primary font-bold">{inv.id}</td>
                        <td className="p-3.5 font-semibold text-on-surface">{inv.shop}</td>
                        <td className="p-3.5 font-label-mono-sm text-text-muted">{inv.date}</td>
                        <td className="p-3.5 text-right font-label-mono-sm text-text-secondary">{inv.items}</td>
                        <td className="p-3.5 text-right font-label-mono-sm font-bold text-on-surface">{inv.amt}</td>
                        <td className="p-3.5 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full font-label-mono-sm text-[10px] font-bold ${
                              inv.type === "success"
                                ? "bg-success-emerald/10 text-success-emerald"
                                : "bg-warning-amber/15 text-warning-amber"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const parsedAmt = parseFloat(inv.amt.replace("$", "")) || 50.0;
                                if (onFinalizePrint) {
                                  onFinalizePrint({
                                    items: [
                                      {
                                        id: "item-reprint",
                                        name: `${inv.shop} Dispatched Order`,
                                        quantity: 1,
                                        rate: parsedAmt / 1.05,
                                        unit: "LOT",
                                      },
                                    ],
                                    subtotal: parsedAmt / 1.05,
                                    tax: parsedAmt - parsedAmt / 1.05,
                                    total: parsedAmt,
                                    customerName: inv.shop,
                                    paymentMode: inv.status,
                                    orderNumber: inv.id,
                                  });
                                }
                              }}
                              className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                              title="Reprint Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setInvoicesList((prev) => prev.filter((i) => i.id !== inv.id))}
                              className="p-1 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                              title="Delete Invoice"
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

          {/* TAB 5: SHOPS & CRM */}
          {activeTab === "shops" && (
            <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface">Registered Retailers &amp; Delivery Beats</h4>
                  <p className="font-body-sm text-xs text-text-muted">Digital credit limits and route dispatch lists.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-xs font-semibold text-text-secondary">
                    Route Beat #04 &bull; Active
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddShopModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-xs font-semibold text-on-primary hover:bg-secondary transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Retailer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registeredShops.map((shop) => (
                  <div key={shop.id} className="p-4 rounded-xl bg-surface-container-low border border-border-strong flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline-sm text-sm font-bold text-on-surface">{shop.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-mono-sm text-[10px] font-bold">
                            {shop.beat}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRegisteredShops((prev) => prev.filter((s) => s.id !== shop.id))}
                            className="p-1 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                            title="Delete Shop"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="font-body-sm text-xs text-text-muted">Proprietor: {shop.owner}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="font-label-mono-sm text-[10px] text-text-muted uppercase block">Credit Limit</span>
                        <span className="font-label-mono-sm font-semibold">{shop.limit}</span>
                      </div>
                      <div>
                        <span className="font-label-mono-sm text-[10px] text-text-muted uppercase block">Active Udhar</span>
                        <span className="font-label-mono-sm font-bold text-warning-amber">{shop.udhar}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-label-mono-sm text-[10px] text-text-muted uppercase block">Credit Score</span>
                        <span className="font-label-mono-sm font-bold text-success-emerald">{shop.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS & GST */}
          {activeTab === "reports" && (
            <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
                <div>
                  <span className="block font-label-mono-sm text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    EXECUTIVE FINANCIAL ANALYTICS
                  </span>
                  <h4 className="font-headline-md text-lg font-bold text-on-surface tracking-tight mt-0.5">
                    Revenue &amp; Net Margin Velocity
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-surface-container-low text-xs font-semibold text-primary border border-border-strong">
                    This Week (vs Prior Period)
                  </span>
                </div>
              </div>

              {/* Synthetic Revenue SVG Chart */}
              <div className="relative w-full pt-2 pb-2">
                <div className="w-full overflow-hidden">
                  <svg className="w-full h-64 sm:h-72" preserveAspectRatio="none" viewBox="0 0 1000 300">
                    <defs>
                      <linearGradient id="demoRevGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                      </linearGradient>
                      <linearGradient id="demoProfitGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>
                    <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="50" x2="980" y1="50" />
                    <text fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="11" textAnchor="end" x="42" y="54">$8k</text>
                    <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="50" x2="980" y1="140" />
                    <text fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="11" textAnchor="end" x="42" y="144">$4k</text>
                    <line stroke="#c7c4d8" strokeDasharray="4 4" strokeWidth="1" x1="50" x2="980" y1="240" />
                    <text fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="11" textAnchor="end" x="42" y="244">$0k</text>

                    {/* Gradient areas */}
                    <path
                      d="M 50 240 L 50 230 Q 150 220 250 210 Q 380 230 480 240 L 620 240 C 700 240 750 50 820 50 C 890 50 930 240 980 240 Z"
                      fill="url(#demoRevGrad)"
                    />
                    <path
                      d="M 50 240 L 50 235 Q 150 225 250 220 Q 380 235 480 240 L 620 240 C 700 240 750 170 820 170 C 890 170 930 240 980 240 Z"
                      fill="url(#demoProfitGrad)"
                    />

                    {/* Revenue Line */}
                    <path
                      d="M 50 230 Q 150 220 250 210 Q 380 230 480 240 L 620 240 C 700 240 750 50 820 50 C 890 50 930 240 980 240"
                      fill="none"
                      stroke="#3525cd"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                    />

                    {/* Profit Line */}
                    <path
                      d="M 50 235 Q 150 225 250 220 Q 380 235 480 240 L 620 240 C 700 240 750 170 820 170 C 890 170 930 240 980 240"
                      fill="none"
                      stroke="#10b981"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />

                    <circle cx="820" cy="50" fill="#ffffff" r="5" stroke="#3525cd" strokeWidth="2.5" />
                    <circle cx="820" cy="170" fill="#10b981" r="4.5" />
                  </svg>
                </div>

                <div className="flex justify-between pl-10 pr-2 pt-1 font-label-mono-sm text-xs text-text-muted">
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span className="font-bold text-primary">Wed (Peak $8.4k)</span>
                  <span>Thu</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Add Product */}
        <AnimatePresence>
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl bg-surface-card border border-border-strong p-6 shadow-2xl relative"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
                  <h4 className="font-headline-sm text-base font-bold text-on-surface">Add New Catalog SKU</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="p-1 rounded text-text-muted hover:text-on-surface"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newProductForm.name) return;
                    setInventoryProducts((prev) => [
                      {
                        id: `inv-${Date.now()}`,
                        sku: newProductForm.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
                        name: newProductForm.name,
                        batch: newProductForm.batch,
                        stock: newProductForm.stock,
                        cost: newProductForm.cost,
                        rate: Number(newProductForm.rate) || 20.0,
                        margin: newProductForm.margin,
                      },
                      ...prev,
                    ]);
                    setShowAddProductModal(false);
                    setNewProductForm({
                      sku: "",
                      name: "",
                      batch: "BT-2025-N • 12/2027",
                      stock: "100 Units",
                      cost: "$12.00",
                      rate: 16.0,
                      margin: "25.0%",
                    });
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-label-mono-sm text-text-secondary uppercase mb-1">Product Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Parle-G Glucose Biscuits 250g"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-low border border-border-strong rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-label-mono-sm text-text-secondary uppercase mb-1">SKU Code</label>
                      <input
                        type="text"
                        placeholder="SKU-PARLE-250G"
                        value={newProductForm.sku}
                        onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-container-low border border-border-strong rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label-mono-sm text-text-secondary uppercase mb-1">Stock Count</label>
                      <input
                        type="text"
                        value={newProductForm.stock}
                        onChange={(e) => setNewProductForm({ ...newProductForm, stock: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-container-low border border-border-strong rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-label-mono-sm text-text-secondary uppercase mb-1">Cost Price ($)</label>
                      <input
                        type="text"
                        value={newProductForm.cost}
                        onChange={(e) => setNewProductForm({ ...newProductForm, cost: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-container-low border border-border-strong rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label-mono-sm text-text-secondary uppercase mb-1">Selling Rate ($)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProductForm.rate}
                        onChange={(e) => setNewProductForm({ ...newProductForm, rate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-surface-container-low border border-border-strong rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="flex-1 py-2 rounded-lg bg-surface-container-low text-xs font-medium text-text-muted hover:bg-surface-container"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-secondary"
                    >
                      Save SKU
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Add Retailer */}
        <AnimatePresence>
          {showAddShopModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl bg-surface-card border border-border-strong p-6 shadow-2xl relative"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
                  <h4 className="font-headline-sm text-base font-bold text-on-surface">Register New Retail Shop</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddShopModal(false)}
                    className="p-1 rounded text-text-muted hover:text-on-surface"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newShopForm.name) return;
                    setRegisteredShops((prev) => [
                      {
                        id: `shop-${Date.now()}`,
                        name: newShopForm.name,
                        owner: newShopForm.owner || "Retail Owner",
                        beat: newShopForm.beat,
                        limit: newShopForm.limit,
                        udhar: newShopForm.udhar,
                        score: newShopForm.score,
                      },
                      ...prev,
                    ]);
                    setShowAddShopModal(false);
                    setNewShopForm({
                      name: "",
                      owner: "",
                      beat: "Beat #04",
                      limit: "$5,000.00",
                      udhar: "$0.00",
                      score: "AAA (Safe)",
                    });
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-label-mono-sm text-text-secondary uppercase mb-1">Shop / Firm Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Provision Store"
                      value={newShopForm.name}
                      onChange={(e) => setNewShopForm({ ...newShopForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-low border border-border-strong rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label-mono-sm text-text-secondary uppercase mb-1">Proprietor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      value={newShopForm.owner}
                      onChange={(e) => setNewShopForm({ ...newShopForm, owner: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-low border border-border-strong rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-label-mono-sm text-text-secondary uppercase mb-1">Delivery Beat</label>
                      <input
                        type="text"
                        value={newShopForm.beat}
                        onChange={(e) => setNewShopForm({ ...newShopForm, beat: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-container-low border border-border-strong rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label-mono-sm text-text-secondary uppercase mb-1">Credit Limit</label>
                      <input
                        type="text"
                        value={newShopForm.limit}
                        onChange={(e) => setNewShopForm({ ...newShopForm, limit: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-container-low border border-border-strong rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddShopModal(false)}
                      className="flex-1 py-2 rounded-lg bg-surface-container-low text-xs font-medium text-text-muted hover:bg-surface-container"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-secondary"
                    >
                      Register Shop
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Render nested sections like Receipt Terminal inside the product tour container */}
        {children}
      </div>
    </section>
  );
}
export default AppPreviewSection;


