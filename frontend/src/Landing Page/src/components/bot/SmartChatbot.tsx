import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,   
  Receipt,
  CreditCard,
  Package,
  Layers,
  ArrowRight,
  Bot,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createAvatar } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import avatarJson from "./avatar.avatar.json";

// Procedural Avatar instance
let StrobiAvatarComponent: any = null;
try {
  StrobiAvatarComponent = createAvatar(avatarJson as any);
} catch (e) {
  console.warn("Avatar procedural engine fallback:", e);
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  action?: {
    label: string;
    targetId?: string;
    route?: string;
  };
}

export function SmartChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [avatarExpression, setAvatarExpression] = useState<string>("neutral");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Welcome to MyBilling! I am your AI assistant for wholesale & FMCG billing operations. How can I assist your dispatch today?",
      timestamp: "Just now",
    },
  ]);

  const quickQuestions = [
    { label: "How does FMCG billing work?", query: "How does FMCG billing work in MyBilling?" },
    { label: "What is Udhar Credit?", query: "How does Udhar Credit and shop ledger tracking work?" },
    { label: "Connect Thermal POS?", query: "How do thermal printers and receipt dispatches work?" },
    { label: "Compare Pricing Plans", query: "What are the features of Starter vs Plus vs Max plans?" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);
    setAvatarExpression("happy");

    setTimeout(() => {
      let botResponse = "";
      let action: Message["action"] | undefined = undefined;
      const lower = query.toLowerCase();

      if (lower.includes("fmcg") || lower.includes("billing") || lower.includes("scan")) {
        botResponse =
          "MyBilling is engineered for high-frequency transactions. You can scan barcodes with [F1], toggle wholesale batch units (bags, tins, cartons), and generate split GST invoices in under 15 seconds.";
        action = { label: "Try Billing Demo", targetId: "app-preview" };
      } else if (lower.includes("udhar") || lower.includes("credit") || lower.includes("ledger")) {
        botResponse =
          "Udhar Credit lets you assign custom credit limits to approved shops. When an order is finalized on Udhar mode, the shop's ledger updates instantly and an automated WhatsApp reminder is prepared.";
        action = { label: "View Shop CRM", targetId: "app-preview" };
      } else if (lower.includes("thermal") || lower.includes("receipt") || lower.includes("print")) {
        botResponse =
          "Our cloud thermal socket connects seamlessly with 2-inch and 3-inch ESC/POS thermal printers. You can watch the real-time paper unroll animation directly on our hardware terminal emulator below!";
        action = { label: "Scroll to Terminal", targetId: "receipt-printer-section" };
      } else if (lower.includes("price") || lower.includes("plan") || lower.includes("cost") || lower.includes("free")) {
        botResponse =
          "We offer three tiers: Free ($0 forever for up to 50 invoices/mo), Plus ($10/mo for unlimited invoices & analytics), and Max ($50/mo with multi-warehouse & ERP sync). Annual billing saves 20%.";
        action = { label: "Explore Pricing", route: "/pricing" };
      } else {
        botResponse =
          "MyBilling simplifies catalog inventory, batch expiry alerts, and payment reconciliation across all your delivery routes. Check out our interactive product tour or explore premium tiers!";
        action = { label: "View Features", targetId: "features" };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          action,
        },
      ]);
      setIsTyping(false);
      setAvatarExpression("neutral");
    }, 900);
  };

  const handleActionClick = (act: Message["action"]) => {
    if (!act) return;
    if (act.targetId) {
      const el = document.getElementById(act.targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (act.route) {
      if (act.route === "/pricing") {
        window.open(act.route, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = act.route;
      }
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        sender: "bot",
        text: "Chat cleared. What can I help you explore regarding MyBilling today?",
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-[360px] sm:w-[410px] h-[540px] max-h-[85vh] rounded-2xl bg-surface-card border border-border-strong shadow-2xl flex flex-col overflow-hidden mb-3.5 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-0.5">
                  {StrobiAvatarComponent ? (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <StrobiAvatarComponent size={32} expression={avatarExpression} />
                    </div>
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success-emerald border-2 border-surface-card" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-sm font-bold leading-tight">MyBilling Assistant</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 font-label-mono-sm text-[9px] uppercase tracking-wider font-semibold">
                      AI OS
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-[11px] text-white/80 block">Active • FMCG Dispatch Engine</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface-container-low/40">
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                        isBot
                          ? "bg-surface-card text-on-surface border border-border-subtle rounded-tl-sm"
                          : "bg-primary text-on-primary rounded-tr-sm font-medium"
                      }`}
                    >
                      <p>{m.text}</p>
                      {m.action && (
                        <button
                          type="button"
                          onClick={() => handleActionClick(m.action)}
                          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs border border-primary/20 transition-all active:scale-95"
                        >
                          <span>{m.action.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="font-label-mono-sm text-[10px] text-text-muted mt-1 px-1">
                      {m.timestamp}
                    </span>
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-surface-card border border-border-subtle w-fit text-text-muted shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="font-label-mono-sm text-[11px] ml-1">Analyzing dispatch data...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Strip */}
            <div className="px-3.5 py-2 bg-surface-card border-t border-border-subtle flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q.query)}
                  className="px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-primary/10 hover:text-primary text-text-secondary border border-border-strong text-[11px] font-medium whitespace-nowrap transition-colors shrink-0"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-surface-card border-t border-border-subtle flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about invoicing, Udhar, GST, printers..."
                className="flex-1 bg-surface-container-low border border-border-strong rounded-xl px-3.5 py-2 text-xs text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-9 h-9 rounded-xl bg-primary hover:bg-secondary disabled:opacity-40 text-on-primary flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button with Mascot & Notification Ring */}
      <div className="relative flex flex-col items-center">
        {/* Unread teaser tooltip */}
        {!isOpen && hasUnread && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 px-3 py-1.5 rounded-xl bg-surface-card border border-border-strong shadow-lg flex items-center gap-2 cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="font-body-sm text-xs font-medium text-on-surface">Need help with billing?</span>
            <X
              className="w-3.5 h-3.5 text-text-muted hover:text-on-surface cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setHasUnread(false);
              }}
            />
          </motion.div>
        )}

        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-2 transition-all duration-300 ${
            isOpen
              ? "bg-inverse-surface border-inverse-surface text-white"
              : "bg-surface-card border-primary/40 hover:border-primary shadow-primary/20"
          }`}
          aria-label="Toggle AI Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative w-full h-full p-2 flex items-center justify-center overflow-hidden rounded-full">
              {StrobiAvatarComponent ? (
                <StrobiAvatarComponent size={36} defaultAnimation="idle" />
              ) : (
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvcW9A9Av2hbF0bLGp1aiFOiXoQpKERwpjVafUxrJSzUV1PkJDEi1yVTZ9AdI2_r2DZuIY4f4Odj-vJ1D9Wc9aS15iDJifwLBnx7_yyGX4-7iXrpjMlBvu0BrQYdnWNA7ao9fxPbbTUQI34GN366eQQATF0oypJIAWfTZfja8-29jpHwz14eU_-PRqsbsVTaj4pqPYukLEIDrXcEFKnCdCUPPrRKEGIMeIskLcFpx2W8OZpHyUtlI5oA"
                  alt="MyBilling Assistant"
                  className="w-full h-full object-contain"
                />
              )}
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-success-emerald border-2 border-surface-card shadow-sm" />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
export default SmartChatbot;
