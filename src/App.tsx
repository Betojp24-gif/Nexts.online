import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppSidebar from './components/AppSidebar';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { motion } from 'motion/react';
import { Toaster, toast } from 'sonner';

// Lazy load views for better performance
const Home = lazy(() => import('./views/Home'));
const ProductDetails = lazy(() => import('./views/ProductDetails'));
const Checkout = lazy(() => import('./views/Checkout'));
const MyOrders = lazy(() => import('./views/MyOrders'));
const AdminDashboard = lazy(() => import('./views/AdminDashboard'));
const Profile = lazy(() => import('./views/Profile'));
const TermsAndConditions = lazy(() => import('./views/TermsAndConditions'));
const PaymentSuccess = lazy(() => import('./views/PaymentSuccess'));

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/" />;
  
  if (roles && !roles.includes(userProfile?.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Sidebar Edge Handle Component
const SidebarEdgeHandle = () => {
  const { openSidebar } = useSidebar();
  return (
    <motion.div
      onPanEnd={(_, info) => {
        if (info.offset.x > 50) openSidebar();
      }}
      className="fixed top-0 left-0 w-[50px] h-full z-40 lg:hidden"
    />
  );
};

// Inside AppRoutes
function AppRoutes() {
  const { user } = useAuth();
  
  React.useEffect(() => {
    if (user) {
      toast.success(`¡Bienvenido de nuevo, ${user.displayName || 'Estudiante'}!`, {
        description: 'Estamos listos para guiar tu crecimiento académico y profesional.',
      });
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen relative bg-slate-950 text-slate-100">
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <SidebarEdgeHandle />
      <AppSidebar />
      <Navbar />
      <WhatsAppButton />
      <main className="flex-grow overflow-x-hidden">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="animate-pulse text-slate-400 font-bold">Cargando la plataforma Nexts.Online...</div>
          </div>
        }>
          <Routes>
            {/* Catalog list / homepage */}
            <Route path="/" element={<Home />} />
            
            {/* Product description / detailed look (both courses and products alias for robustness) */}
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/course/:productId" element={<ProductDetails />} />
            <Route path="/terminos" element={<TermsAndConditions />} />
            
            {/* Checkout & transactional gateways */}
            <Route path="/checkout" element={<Checkout />} />
            
            {/* My Orders / My Courses tracker list */}
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            } />
            <Route path="/my-courses" element={
              <Navigate to="/my-orders" replace />
            } />

            {/* User Profile */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Order Confirmation Receipts */}
            <Route path="/payment-success" element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            
            {/* Admin configurations and telemetry catalog controls */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SidebarProvider>
          <Router>
            <AppRoutes />
          </Router>
        </SidebarProvider>
      </CartProvider>
    </AuthProvider>
  );
}
