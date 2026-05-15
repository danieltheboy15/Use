/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import WaitlistLanding from "./pages/WaitlistLanding";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stockpiles from "./pages/Stockpiles";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import PublicCustomerView from "./pages/PublicCustomerView";
import Contact from "./pages/Contact";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStockpiles from "./pages/admin/AdminStockpiles";
import AdminWhatsApp from "./pages/admin/AdminWhatsApp";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ToastProvider } from "./contexts/ToastContext";
import BusinessNameModal from "./components/BusinessNameModal";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ThemeSync = () => {
  const { theme } = useTheme();
  const location = useLocation();
  
  useEffect(() => {
    // List of prefixes that should support dark mode
    const dashboardPrefixes = ["/dashboard", "/stockpile", "/customers", "/settings"];
    const isDashboardRoute = dashboardPrefixes.some(p => 
      location.pathname === p || location.pathname.startsWith(p + "/")
    );
    
    const root = window.document.documentElement;
    if (isDashboardRoute && theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, location.pathname]);

  return null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-cartlist-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <BusinessNameModal />
            <Router>
              <ScrollToTop />
              <ThemeSync />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/landingpage" element={<WaitlistLanding />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/view/:id" element={<PublicCustomerView />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/stockpile" 
                  element={
                    <ProtectedRoute>
                      <Stockpiles />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/customers" 
                  element={
                    <ProtectedRoute>
                      <Customers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/customers/:phone" 
                  element={
                    <ProtectedRoute>
                      <CustomerDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="stockpiles" element={<AdminStockpiles />} />
                  <Route path="whatsapp" element={<AdminWhatsApp />} />
                  <Route path="subscriptions" element={<AdminSubscriptions />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="audit" element={<AdminAuditLogs />} />
                </Route>
              </Routes>
            </Router>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
