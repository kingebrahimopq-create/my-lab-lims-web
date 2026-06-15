import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import Tests from '@/pages/Tests';
import Results from '@/pages/Results';
import Invoices from '@/pages/Invoices';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import '@/locales/i18n';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="tests" element={<Tests />} />
          <Route path="results" element={<Results />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
