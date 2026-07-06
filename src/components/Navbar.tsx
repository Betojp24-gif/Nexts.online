import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useSidebar } from '../contexts/SidebarContext';
import { LogIn, LogOut, LayoutDashboard, ShoppingBag, User, Menu, Search, Package, BookOpen } from 'lucide-react';
import AuthModal from './AuthModal';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { user, userProfile, loading, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { openSidebar } = useSidebar();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleLogoClick = () => {
    setSearchQuery('');
    navigate('/');
  };

  return (
    <>
      {/* Spacer to reserve height for fixed header so content doesn't get covered */}
      <div className="h-[108px] w-full shrink-0">
        <header className="fixed top-0 left-0 right-0 z-50 w-full shadow-sm">
          {/* Top Banner with promo */}
          <div className="bg-blue-600 text-white text-[11px] font-black tracking-widest text-center py-1.5 px-4 uppercase select-none">
            🎉 ¡Inscripciones abiertas! Comienza hoy a estudiar con tutores y certificación nacional 🚀
          </div>

          <nav className="bg-[#040814]/90 backdrop-blur-md border-b border-slate-900 h-[80px] text-white">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 md:px-10 h-full">
          <div className="flex justify-between h-full items-center gap-1.5 sm:gap-4">
            
            {/* Left Menu trigger + Logo */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={openSidebar}
                className="p-1.5 mr-0.5 hover:bg-slate-900 rounded-lg text-slate-300 hover:text-[#009ee3] lg:hidden"
                title="Abrir menú"
              >
                <Menu size={20} className="sm:w-[22px] sm:h-[22px]" />
              </button>
              <span 
                onClick={handleLogoClick}
                className="flex items-center gap-1.5 cursor-pointer select-none"
              >
                <div className="flex text-[17px] min-[360px]:text-xl sm:text-2xl font-black tracking-tight font-sans text-white">
                  <span>Nexts</span>
                  <span className="text-[#009ee3]">.Online</span>
                </div>
              </span>
            </div>
 
            {/* Custom Search Box */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Busca cursos, áreas temáticas, programas o certificaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c1833]/40 text-slate-100 placeholder-slate-500 pl-4 pr-10 py-2.5 rounded-full border border-slate-800/80 outline-none focus:border-[#009ee3] focus:ring-1 focus:ring-[#009ee3]/20 transition-all font-medium text-xs md:text-sm"
              />
              <button
                type="submit"
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#009ee3]"
              >
                <Search size={18} />
              </button>
            </form>
 
            {/* Actions & Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              
              {/* Active Admin Dashboard Link if admin */}
              {userProfile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="p-1.5 sm:p-2 text-slate-300 hover:text-[#009ee3] hover:bg-slate-900 rounded-full transition-colors relative"
                  title="Panel de Administración"
                >
                  <LayoutDashboard size={18} className="sm:w-5 sm:h-5" />
                </Link>
              )}
 
              {/* My Orders / Mis Pedidos if logged in */}
              {user && (
                <Link
                  to="/my-orders"
                  className="p-1.5 sm:p-2 text-slate-300 hover:text-[#009ee3] hover:bg-slate-900 rounded-full transition-colors"
                  title="Mis Inscripciones"
                >
                  <Package size={18} className="sm:w-5 sm:h-5" />
                </Link>
              )}
 
              {/* Shopping Cart button with counter badge */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-1.5 sm:p-2 bg-[#0c1833]/40 hover:bg-[#0c1833] rounded-full text-slate-300 hover:text-[#009ee3] transition-all flex items-center gap-1 sm:gap-2 relative border border-slate-800/80 shrink-0"
                id="cart-trigger-btn"
                title="Ver Inscripción"
              >
                <ShoppingBag size={18} className="sm:w-5 sm:h-5 text-slate-300 group-hover:text-[#009ee3]" />
                <span className="hidden sm:inline text-xs font-black text-slate-300">Inscripción</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
 
              {/* Login/Signup actions */}
              <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
 
              {loading ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                  <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 border-2 border-[#009ee3] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  {/* Decorative online/notification light blue dot next to Avatar */}
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse mr-0.5"></div>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-1.5 sm:gap-2 group hover:opacity-90 transition-opacity"
                    title="Ver Perfil"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 font-bold overflow-hidden shadow-sm">
                      {userProfile?.profileImage && userProfile.profileImage.trim() !== "" ? (
                        <img 
                          src={userProfile.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        user.displayName?.[0] || 'U'
                      )}
                    </div>
                    <span className="hidden lg:inline text-xs font-bold text-slate-300">
                      {userProfile?.firstName || user.displayName?.split(' ')[0] || 'Perfil'}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-[#009ee3] hover:bg-[#008bd0] text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-blue-500/10 flex items-center gap-1 sm:gap-1.5 shrink-0"
                >
                  <LogIn size={13} className="sm:w-3.5 sm:h-3.5" />
                  <span>Ingresar</span>
                </button>
              )}
 
            </div>
          </div>
        </div>
      </nav>
    </header>
  </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Cart Sliding Drawer */}
      <CartDrawer />
    </>
  );
}
