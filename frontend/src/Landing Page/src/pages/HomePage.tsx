import { useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/home/HeroSection";
import { AppPreviewSection } from "../components/home/AppPreviewSection";
import { ReceiptSection } from "../components/home/ReceiptSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { AboutSection } from "../components/home/AboutSection";
import { CtaBanner } from "../components/home/CtaBanner";
import { SmartChatbot } from "../components/bot/SmartChatbot";
import { type ReceiptPrinterStage } from "../../receiptPrinter/receiptPrinter";

export function HomePage() {
  const [receiptStage, setReceiptStage] = useState<ReceiptPrinterStage>("complete");

  const [activeInvoice, setActiveInvoice] = useState<{
    items: { id: string; name: string; quantity: number; rate: number; unit?: string }[];
    subtotal: number;
    tax: number;
    total: number;
    customerName: string;
    paymentMode: string;
    orderNumber: string;
  }>({
    items: [
      { id: "1", name: "Fortune Refined Sunflower Oil", quantity: 1, rate: 25.0, unit: "TIN" },
      { id: "2", name: "Madhur Sulphur-Free Sugar", quantity: 1, rate: 22.7, unit: "BAG" },
    ],
    subtotal: 47.7,
    tax: 2.38,
    total: 50.08,
    customerName: "Counter Walk-in Retail",
    paymentMode: "Cash [F2]",
    orderNumber: "INV-2048",
  });

  const handleFinalizeFromDemo = (data: {
    items: { id: string; name: string; quantity: number; rate: number; unit?: string }[];
    subtotal: number;
    tax: number;
    total: number;
    customerName: string;
    paymentMode: string;
    orderNumber?: string;
  }) => {
    setActiveInvoice({
      ...data,
      orderNumber: data.orderNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setReceiptStage("printing");

    const printerEl = document.getElementById("receipt-printer-section");
    if (printerEl) {
      printerEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 w-full overflow-hidden">
        <HeroSection />
        <AppPreviewSection onFinalizePrint={handleFinalizeFromDemo}>
          <ReceiptSection
            currentStage={receiptStage}
            onStageChange={setReceiptStage}
            invoiceData={activeInvoice}
          />
        </AppPreviewSection>
        <FeaturesSection />
        <HowItWorksSection />
        <AboutSection />
        <CtaBanner />
      </main>

      <Footer />
      <SmartChatbot />
    </div>
  );
}
export default HomePage;
