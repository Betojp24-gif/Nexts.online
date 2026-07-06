import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { X, Trash2, GraduationCap, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductImage } from '../data/initialProducts';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, cartCount, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 pointer-events-auto"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-950/95 backdrop-blur-md shadow-2xl z-55 flex flex-col pointer-events-auto border-l border-slate-850 text-white"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-850 flex justify-between items-center bg-slate-900/40">
              <div className="flex items-center gap-2">
                <div className="bg-[#009ee3] p-2 rounded-full text-white">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Mi Inscripción</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cartCount} {cartCount === 1 ? 'curso seleccionado' : 'cursos seleccionados'}</span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                id="close-cart-btn"
              >
                <X size={22} />
              </button>
            </div>

            {/* List items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                  <span className="text-4xl">🎓</span>
                  <h4 className="text-base font-extrabold text-white mt-4">¡Tu lista de cursada está vacía!</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">Visita nuestro catálogo de cursos en Next.ar e inicia tu formación profesional hoy mismo.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 bg-[#009ee3] hover:bg-[#008bd0] text-white px-5 py-2.5 rounded-full font-extrabold text-xs tracking-wider uppercase transition-all shadow-md"
                  >
                    Explorar Carreras y Cursos
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    className="flex gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-850 relative group text-left"
                  >
                    <div className="w-16 h-16 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex-shrink-0">
                      <img
                        src={getProductImage({ id: item.product.id, image: item.product.image })}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-[9px] font-black text-[#009ee3] block uppercase tracking-wider">{item.product.category}</span>
                      <h4 className="text-xs font-bold text-white truncate pr-4">{item.product.name}</h4>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{item.product.brand || 'Next.ar Instituto'}</span>
                      <div className="flex items-center justify-between mt-2">
                        {/* Selector de cantidad */}
                        <div className="flex items-center border border-slate-800 rounded-lg bg-slate-950/80 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-slate-900 text-slate-400 transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-slate-900 text-slate-400 transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        {/* Precio */}
                        <span className="text-xs font-black text-white">${(item.product.price * item.quantity).toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                    {/* Eliminar */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Subtotal & Action */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-850 bg-slate-900/40 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Monto Total de Inscripción</span>
                  <span className="text-lg font-black text-[#009ee3]">${cartSubtotal.toLocaleString('es-AR')}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">La matrícula incluye acceso de por vida al aula virtual y tutorías en vivo.</p>
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="bg-[#009ee3] hover:bg-[#008bd0] text-white py-3.5 rounded-full font-black text-xs tracking-wider uppercase text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/10"
                    id="checkout-cart-btn"
                  >
                    Proceder a la Inscripción <ArrowRight size={14} />
                  </Link>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-center font-bold text-xs text-slate-400 hover:text-[#009ee3] hover:underline pt-1"
                  >
                    Seguir Explorando Cursos
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
