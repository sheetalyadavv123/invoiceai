import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="invoices" element={<div style={{padding:'32px',color:'white'}}>Invoices coming next</div>} />
          <Route path="clients" element={<div style={{padding:'32px',color:'white'}}>Clients coming next</div>} />
          <Route path="payments" element={<div style={{padding:'32px',color:'white'}}>Payments coming next</div>} />
          <Route path="ai" element={<div style={{padding:'32px',color:'white'}}>AI Insights coming next</div>} />
          <Route path="settings" element={<div style={{padding:'32px',color:'white'}}>Settings coming next</div>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}