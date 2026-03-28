import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Invoices from './pages/invoices/Invoices';
import Clients from './pages/clients/Clients';
import Payments from './pages/payments/Payments';
import AIInsights from './pages/ai/AIInsights';
import Settings from './pages/settings/Settings';
import PublicInvoice from './pages/invoices/PublicInvoice';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invoice/:id" element={<PublicInvoice />} />

        {/* Protected dashboard routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="clients" element={<Clients />} />
          <Route path="payments" element={<Payments />} />
          <Route path="ai" element={<AIInsights />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}