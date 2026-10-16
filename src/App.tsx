import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminProvider } from '@/admin/AdminProvider';

// The admin is the public site with everything editable, so it mirrors the site's routes
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <AdminProvider>
                <Layout />
              </AdminProvider>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />
            {/* Old admin pages */}
            <Route path="/info" element={<Navigate to="/contact" replace />} />
            <Route path="/logo" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
