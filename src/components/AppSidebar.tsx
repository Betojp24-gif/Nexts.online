import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSidebar } from '../contexts/SidebarContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { 
  X, 
  Home, 
  ShoppingBag, 
  LayoutDashboard, 
  User, 
  Settings,
  HelpCircle,
  LogOut,
  ExternalLink,
  LogIn,
  FileCheck,
  BookOpen
} from 'lucide-react';

export default function AppSidebar() {
  const { isOpen, closeSidebar } = useSidebar();
  const { user, userProfile, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const menuItems = [
    { title: 'Inicio / Cursos', path: '/', icon: Home },
    ...(user ? [
      { title: 'Tus Cursos / Inscripciones', path: '/my-orders', icon: BookOpen },
      { title: 'Mi Perfil', path: '/profile', icon: User }
    ] : [
      { title: 'Iniciar Sesión / Registrarse', action: 'login', icon: LogIn }
    ]),
  ];

  const secondaryItems = [
    { title: 'Políticas y Ayuda', path: '/terminos', icon: HelpCircle },
  ];

  const handleItemClick = (item: any) => {
    if (item.action === 'login') {
      setIsAuthModalOpen(true);
    } else {
      closeSidebar();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] pointer-events-auto"
            />

            {/* Sidebar drawer body */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-slate-950/95 backdrop-blur-md border-r border-slate-850 z-[70] shadow-2xl flex flex-col pointer-events-auto text-left"
            >
              <div className="p-6 border-b border-slate-850 flex items-center justify-between bg-slate-900/40">
                <div className="flex text-lg font-black tracking-tight font-sans">
                  <span className="text-white">Nexts</span>
                  <span className="text-[#009ee3]">.Online</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-[#009ee3]"
                    title="Abrir en ventana independiente"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button 
                    onClick={closeSidebar}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Menu Links */}
              <div className="flex-grow overflow-y-auto p-4 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2 block">Secciones</span>
                  {menuItems.map((item, idx) => {
                    const iconElement = <item.icon size={16} className="text-slate-400 group-hover:text-[#009ee3] transition-colors shrink-0" />;
                    if (item.path) {
                      return (
                        <Link
                          key={idx}
                          to={item.path}
                          onClick={() => handleItemClick(item)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black text-slate-300 hover:bg-slate-900/60 hover:text-[#009ee3] transition-all group"
                        >
                          {iconElement}
                          {item.title}
                        </Link>
                      );
                    } else {
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black text-slate-300 hover:bg-slate-900/60 hover:text-[#009ee3] transition-all group text-left"
                        >
                          {iconElement}
                          {item.title}
                        </button>
                      );
                    }
                  })}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2 block">Preferencias</span>
                  {secondaryItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={closeSidebar}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black text-slate-300 hover:bg-slate-900/60 hover:text-[#009ee3] transition-all group"
                    >
                      <item.icon size={16} className="text-slate-400 group-hover:text-[#009ee3] transition-colors shrink-0" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User segment below */}
              {user && (
                <div className="p-4 border-t border-slate-850 bg-slate-900/40">
                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <div className="w-8 h-8 rounded-full bg-[#009ee3] text-white flex items-center justify-center font-black text-xs shrink-0">
                      {user.displayName?.[0] || 'U'}
                    </div>
                    <div className="flex-grow overflow-hidden text-xs">
                      <p className="font-black text-white truncate">{user.displayName}</p>
                      <p className="text-[9px] text-[#009ee3] font-black uppercase tracking-wider">
                        {userProfile?.role === 'admin' ? 'Administrador' : 'Estudiante Registrado'}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                          logout();
                          closeSidebar();
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                      title="Cerrar sesión"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
