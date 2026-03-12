import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import SellerDashboard from './pages/SellerDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import OrderHistory from './pages/OrderHistory';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowGuest?: boolean }> = ({ children, allowGuest }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center font-serif italic text-stone-400">Loading Gojo...</div>;
  if (!user && !allowGuest) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      
      <Route path="/" element={<ProtectedRoute allowGuest><Home /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      
      {/* Role specific routes */}
      <Route 
        path="/seller" 
        element={
          <ProtectedRoute>
            {user?.role === 'seller' || user?.role === 'buyer' ? <SellerDashboard /> : <Navigate to="/" />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/delivery" 
        element={
          <ProtectedRoute>
            {user?.role === 'delivery' ? <DeliveryDashboard /> : <Navigate to="/" />}
          </ProtectedRoute>
        } 
      />
      
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
