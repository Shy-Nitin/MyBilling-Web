import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { BillingPage } from "../features/billing/pages/BillingPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
import { ShopsPage } from "../features/shops/pages/ShopsPage";
import { PurchasesPage } from "../features/purchases/pages/PurchasesPage";
import { LedgerPage } from "../features/ledger/pages/LedgerPage";
import { ReportsPage } from "../features/reports/pages/ReportsPage";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { HomePage } from "../Landing Page/src/pages/HomePage";
import { PricingPage } from "../Landing Page/src/pages/PricingPage";
import { LoginPage } from "../Landing Page/src/pages/LoginPage";
import { SignupPage } from "../Landing Page/src/pages/SignupPage";
import { useAuth } from "../context/AuthContext";
import { MyBillingLoader } from "../components/common/MyBillingLoader";
import { NotFoundPage } from "../components/common/NotFoundPage";
import { AuthCallbackPage } from "../Landing Page/src/pages/AuthCallbackPage";
import { PrivacyPage } from "../Landing Page/src/pages/PrivacyPage";
import { TermsPage } from "../Landing Page/src/pages/TermsPage";

interface ProtectedRouteProps {
  children: (navigate: (path: string) => void) => React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // F9 hotkey to jump straight to billing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F9") {
        e.preventDefault();
        navigate("/billing");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  if (isLoading) {
    return <MyBillingLoader fullScreen message="Restoring secure session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AppLayout
      currentPath={location.pathname}
      onNavigate={(path) => navigate(path)}
      onQuickAction={() => navigate("/billing")}
    >
      {children(navigate)}
    </AppLayout>
  );
};

export const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/reset-password" element={<AuthCallbackPage />} />
      <Route
        path="/login"
        element={
          !isLoading && isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/signup"
        element={
          !isLoading && isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupPage />
          )
        }
      />

      {/* Protected ERP Workspace */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {(navigate) => <DashboardPage onNavigate={navigate} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            {(navigate) => <BillingPage onNavigate={navigate} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            {() => <ProductsPage />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            {() => <ProductsPage />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/shops"
        element={
          <ProtectedRoute>
            {() => <ShopsPage />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            {() => <PurchasesPage />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/ledger"
        element={
          <ProtectedRoute>
            {() => <LedgerPage />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            {() => <ReportsPage />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            {() => <SettingsPage />}
          </ProtectedRoute>
        }
      />

      {/* Custom Interactive 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
