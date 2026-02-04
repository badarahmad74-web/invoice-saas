import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { NewInvoicePage } from './features/invoices/NewInvoicePage';
import { InvoiceDetailPage } from './features/invoices/InvoiceDetailPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <DashboardLayout />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<DashboardPage />} />
        {/* Placeholders for future routes */}
        <Route path="invoices/new" element={<NewInvoicePage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="invoices" element={<div>Invoices (Coming Soon)</div>} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="clients" element={<div>Clients (Coming Soon)</div>} />
        <Route path="products" element={<div>Products (Coming Soon)</div>} />
        <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
