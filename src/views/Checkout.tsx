import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getProductImage } from '../data/initialProducts';
import { 
  ShoppingBag, CreditCard, ChevronRight, CheckCircle, 
  Trash2, AlertCircle, Sparkles, Building2, HelpCircle 
} from 'lucide-react';

export default function Checkout() {
  const { cart, cartSubtotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load active payment configs from firestore
  const [config, setConfig] = useState<any>({
    mercadopagoActive: true,
    mercadopagoPublicKey: 'APP_USR-7de89ce0-f8fb-4fa3-b6d3-2fb5cf0bfd21',
    mercadopagoSandbox: true,
    stripeActive: false,
    stripePublicKey: '',
    transferenciaActive: true,
    transferenciaBank: 'Banco Galicia',
    transferenciaCbu: '0070012310009876543210',
    transferenciaAlias: 'nexts.online.galicia',
    transferenciaHolder: 'NEXTS.ONLINE S.R.L.',
    transferenciaCuit: '30-71785934-2',
    currency: 'ARS'
  });

  // Load config on mount
  useEffect(() => {
    async function loadPaymentConfig() {
      try {
        const docRef = doc(db, 'config', 'payment');
        // Prevent hanging on slow connections or misconfigured databases
        const fetchPromise = getDoc(docRef);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Config load timeout')), 2500)
        );
        const docSnap = await Promise.race([fetchPromise, timeoutPromise]);
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        }
      } catch (err) {
        console.warn('Could not read payment config from db, using standard defaults:', err);
      }
    }
    loadPaymentConfig();
  }, []);

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    dni: '',
    province: 'CABA',
    city: '',
    address: '',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'stripe' | 'transferencia' | 'whatsapp'>('whatsapp');
  const [shippingMethod, setShippingMethod] = useState<'digital' | 'sincrono'>('digital');

  // Simulated credit card state
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  // Transfer transfer-ID state
  const [transferId, setTransferId] = useState('');

  const [processing, setProcessing] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      toast.error('Tu lista de inscripciones está vacía, selecciona un curso antes de continuar.');
      navigate('/');
    }
  }, [cart, navigate]);

  // Shipping cost calculations
  const shippingCost = 0;
  const total = cartSubtotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.dni) {
      toast.error('Completa tu nombre, e-mail, DNI y teléfono para continuar.');
      return;
    }

    try {
      setProcessing(true);

      // Create Order payload
      const orderPayload = {
        userId: user ? user.uid : 'guest',
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        dni: formData.dni,
        address: shippingMethod === 'sincrono' ? 'Aula Digital + Clases de Apoyo Sincrónicas' : 'Aula Digital (100% Online Asincrónico)',
        city: 'CABA',
        province: 'CABA',
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        subtotal: cartSubtotal,
        shippingCost: 0,
        total,
        paymentMethod,
        shippingMethod,
        status: paymentMethod === 'transferencia' ? 'pending' : 'pending',
        createdAt: serverTimestamp(),
        paymentDetails: {
          last4: '',
          referenceCode: paymentMethod === 'transferencia' && transferId ? transferId : 'WhatsApp-Acuerdo',
          cardBrand: ''
        }
      };

      // Add to Firestore collection 'orders' with timeout
      let docRef;
      let orderId = '';
      try {
        const addPromise = addDoc(collection(db, 'orders'), orderPayload);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de Firestore')), 3500)
        );
        docRef = await Promise.race([addPromise, timeoutPromise]);
        orderId = docRef.id;
      } catch (addErr) {
        console.warn('Firestore order creation failed or timed out. Operating in fallback client-side mode:', addErr);
        const rand = Math.floor(100000 + Math.random() * 900000);
        orderId = `NXT-FALLBACK-${rand}`;
      }

      // Deduct stock for products (only if firestore was reachable and succeeded)
      if (docRef) {
        for (const item of cart) {
          try {
            const productRef = doc(db, 'products', item.product.id);
            const stockPromise = updateDoc(productRef, {
              stock: increment(-item.quantity)
            });
            const stockTimeout = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Stock update timeout')), 1500)
            );
            await Promise.race([stockPromise, stockTimeout]);
          } catch (stockErr: any) {
            console.warn(`Could not update stock for ${item.product.id}:`, stockErr);
          }
        }
      }

      // Save order info to sessionStorage to guarantee flawless transition to PaymentSuccess
      try {
        sessionStorage.setItem('last_order_payload', JSON.stringify({
          ...orderPayload,
          id: orderId,
          createdAt: new Date().toISOString() // Replace Firestore serverTimestamp() in client-side session copy
        }));
      } catch (sessErr) {
        console.warn('Failed to save last_order_payload to sessionStorage:', sessErr);
      }

      toast.success('¡Inscripción registrada con éxito!', {
        description: 'Redirigiendo a WhatsApp para solicitar tu cupo...'
      });

      // Clear Shopping Cart and redirect
      clearCart();
      
      // Navigate to success receipt with auto-redirect flag to bypass popup blockers
      navigate(`/payment-success?orderId=${orderId}&autoredirect=true`);

    } catch (err) {
      console.error('Error saving order receipt:', err);
      toast.error('Ocurrió un error guardando el pedido. Revisa tu conexión.');
    } finally {
      setProcessing(false);
    }
  };

  const provinces = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 
    'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 
    'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  return (
    <div className="bg-slate-950 min-h-screen py-8 px-4 sm:px-6 md:px-10 text-left text-slate-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="mb-8 select-none">
          <h1 className="text-2xl md:text-3xl font-black text-white">Completá tu Inscripción</h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Estás en el paso final de tu inscripción en los trayectos formativos de Nexts.Online.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Columns 1-3: Checkout details inputs form */}
          <form onSubmit={handleFormSubmit} className="lg:col-span-3 space-y-6">
            
            {/* Step 1: Datos Personales */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 md:p-8 rounded-[32px] border border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2 select-none">
                <span className="bg-[#009ee3] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Datos del Cursante
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#009ee3] outline-none rounded-xl px-4 py-3 text-xs md:text-sm font-medium text-white"
                    id="checkout-name-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">DNI (Identificación) *</label>
                  <input
                    type="text"
                    name="dni"
                    required
                    value={formData.dni}
                    onChange={handleInputChange}
                    placeholder="Ej. 34123456"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#009ee3] outline-none rounded-xl px-4 py-3 text-xs md:text-sm font-medium text-white"
                    id="checkout-dni-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#009ee3] outline-none rounded-xl px-4 py-3 text-xs md:text-sm font-medium text-white"
                    id="checkout-email-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ej. 1198765432"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#009ee3] outline-none rounded-xl px-4 py-3 text-xs md:text-sm font-medium text-white"
                    id="checkout-phone-input"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Forma de Cursada */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 md:p-8 rounded-[32px] border border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2 select-none">
                <span className="bg-[#009ee3] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Forma de Cursada
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setShippingMethod('digital')}
                  className={`p-4 rounded-2xl border cursor-pointer select-none transition-all text-left ${shippingMethod === 'digital' ? 'bg-[#009ee3]/10 border-[#009ee3] text-white' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Online Asincrónico</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase">Recomendado</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Estudia a tu propio ritmo con acceso permanente a las clases grabadas, materiales teóricos y entrega de trabajos prácticos.</p>
                </div>

                <div 
                  onClick={() => setShippingMethod('sincrono')}
                  className={`p-4 rounded-2xl border cursor-pointer select-none transition-all text-left ${shippingMethod === 'sincrono' ? 'bg-[#009ee3]/10 border-[#009ee3] text-white' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">Sincrónico con Apoyo</span>
                    <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-full font-bold uppercase">Clases</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Acceso completo al campus digital y encuentros periódicos de consulta/tutoría en vivo con el equipo docente.</p>
                </div>
              </div>
            </div>

            {/* Step 3: Medio de Pago */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 md:p-8 rounded-[32px] border border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2 select-none">
                <span className="bg-[#009ee3] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Medio de Pago
              </h3>

              <div className="space-y-3">
                <div 
                  onClick={() => setPaymentMethod('whatsapp')}
                  className={`p-4 rounded-2xl border cursor-pointer select-none transition-all text-left ${paymentMethod === 'whatsapp' ? 'bg-[#009ee3]/10 border-[#009ee3] text-white' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-4 h-4 rounded-full border border-[#009ee3] flex items-center justify-center">
                      {paymentMethod === 'whatsapp' && <span className="w-2.5 h-2.5 bg-[#009ee3] rounded-full" />}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider">Acuerdo por WhatsApp (Recomendado)</span>
                    <span className="text-[9px] bg-[#009ee3]/20 text-[#009ee3] px-2 py-0.5 rounded font-extrabold ml-auto">PROMO</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium pl-6">Reserva tu cupo hoy mismo y un asesor te guiará para abonar tu matrícula mediante Transferencia o Mercado Pago con descuentos vigentes.</p>
                </div>
              </div>
            </div>

            {/* Information notice */}
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 text-xs leading-relaxed select-none font-medium text-slate-300 space-y-2">
              <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>💬</span> Solicitud de Cupo directa por WhatsApp
              </p>
              <p>Al confirmar tu pre-inscripción, enviaremos tus datos académicos directamente a un asesor de Nexts.Online para verificar disponibilidad, promociones vigentes y asegurar tu matrícula en los trayectos elegidos.</p>
            </div>

            {/* Submission Action */}
            <button
              type="submit"
              disabled={processing}
              className={`w-full text-white py-4 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-md ${processing ? 'bg-gray-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/10'}`}
              id="submit-checkout-btn"
            >
              {processing ? 'Procesando el Registro...' : 'Confirmar Pre-Inscripción y Solicitar Cupo'}
            </button>
          </form>

          {/* Column 4-5: Cart Summary Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-[32px] border border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-base font-black text-white select-none">Resumen de Inscripción</h3>

              {/* Cart Items log */}
              <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 text-xs p-1">
                    <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex-shrink-0 select-none">
                      <img src={getProductImage({ id: item.product.id, image: item.product.image })} alt="Cart product" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col justify-center">
                      <h4 className="font-extrabold text-white truncate">{item.product.name}</h4>
                      <span className="text-[10px] font-medium text-slate-400 mt-0.5">{item.quantity} x ${item.product.price.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="text-right flex flex-col justify-center select-none shrink-0 font-black text-white">
                      ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Costs table */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs select-none">
                <div className="flex justify-between font-semibold text-slate-400">
                  <span>Trayectos formativos ({cartCount} u.):</span>
                  <span>${cartSubtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-500">
                  <span>Costo de Inscripción / Despacho:</span>
                  <span>¡Gratis! 🌟</span>
                </div>
                
                <div className="pt-3 border-t border-dashed border-slate-800 flex justify-between items-center text-white">
                  <span className="font-black text-sm uppercase">Total</span>
                  <span className="text-xl font-black text-[#009ee3]">${total.toLocaleString('es-AR')}</span>
                </div>

                <div className="mt-3 select-none text-[10px] leading-relaxed text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                  <span className="text-emerald-400 font-bold block mb-1">ℹ️ Información Importante sobre Diploma</span>
                  El valor de inscripción abonado hoy (${total.toLocaleString('es-AR')}) es un pago único de matrícula. Al finalizar tu cursada, se abonará exactamente el mismo valor para la entrega del diploma digital avalado.
                </div>
              </div>
            </div>

            {/* Refund and return trust badge policy */}
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 text-[10px] leading-relaxed select-none font-medium text-slate-400">
              <span className="text-lg block mb-1">🛡️</span>
              <p>Tu inscripción está garantizada bajo el programa de protección del estudiante de Nexts.Online. Posees hasta 10 días desde el inicio para solicitar el reintegro si el programa no cumple tus expectativas profesionales.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
