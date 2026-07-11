import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, Truck, Calendar, ShoppingBag, MapPin, Tag, Download } from 'lucide-react';
import { motion } from 'motion/react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const autoredirect = searchParams.get('autoredirect') === 'true';
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  useEffect(() => {
    async function fetchOrderReceipt() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // Try reading from sessionStorage first
        let localOrder: any = null;
        try {
          const cached = sessionStorage.getItem('last_order_payload');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.id === orderId) {
              localOrder = parsed;
              setOrder(parsed);
              setLoading(false); // Render immediately from cache!
            }
          }
        } catch (cacheErr) {
          console.warn('Failed to read from sessionStorage:', cacheErr);
        }

        // Fetch from Firestore
        const docRef = doc(db, 'orders', orderId);
        const getPromise = getDoc(docRef);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 3000)
        );

        let docSnap;
        try {
          docSnap = await Promise.race([getPromise, timeoutPromise]);
          if (docSnap.exists()) {
            setOrder(docSnap.data());
          } else if (!localOrder) {
            // Fallback default structure so page doesn't crash or stay empty
            setOrder({
              customerName: 'Cursante',
              dni: 'DNI',
              address: 'Aula Digital (100% Online Asincrónico)',
              items: [],
              subtotal: 0,
              shippingCost: 0,
              total: 0,
              paymentMethod: 'whatsapp'
            });
          }
        } catch (getErr) {
          console.warn('Firestore fetch failed or timed out:', getErr);
          if (!localOrder) {
            setOrder({
              customerName: 'Cursante',
              dni: 'DNI',
              address: 'Aula Digital (100% Online Asincrónico)',
              items: [],
              subtotal: 0,
              shippingCost: 0,
              total: 0,
              paymentMethod: 'whatsapp'
            });
          }
        }
      } catch (err) {
        console.error('Error fetching order receipt from Firestore:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrderReceipt();
  }, [orderId]);

  // Generate WhatsApp message for agreement
  const getWhatsappUrl = () => {
    if (!order) return '';
    const itemsText = order.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ') || 'Cursos';
    const totalText = order.total?.toLocaleString('es-AR') || '0';
    const message = `Hola! Registré mi pre-inscripción con el código #${orderId || 'NX-NUEVA'}. Mi nombre es ${order.customerName || ''}, DNI ${order.dni || ''}, email ${order.customerEmail || ''}. Deseo coordinar el pago de los siguientes trayectos: ${itemsText}. Total estimado: $${totalText}.`;
    return `https://wa.me/5491166134186?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    if (!loading && order && order.paymentMethod === 'whatsapp' && autoredirect) {
      setRedirectCountdown(3); // 3 seconds countdown
    }
  }, [loading, order, autoredirect]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown === 0) {
      const url = getWhatsappUrl();
      if (url) {
        window.location.href = url;
      }
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
        <p className="text-slate-500 font-bold">Consolidando ticket de compra...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] py-12 px-4 sm:px-6 md:px-10 text-left">
      <div className="max-w-2xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[36px] shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Confetti Colored Banner Header */}
          <div className="bg-[#eaf6fc] p-8 text-center border-b border-gray-100">
            <div className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-400/20">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">¡Inscripción Confirmada!</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1.5 font-medium leading-relaxed">
              Muchas gracias por elegir Nexts.Online. Prontamente recibirás un e-mail con las credenciales de acceso al Campus Virtual y tu comprobante oficial de alumno regular.
            </p>
          </div>

          <div className="p-6 md:p-10 space-y-6">
            
            {/* Ticket Info Details */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold mb-0.5 uppercase tracking-wider text-[9px]">Código de Matrícula</span>
                <span className="font-black text-slate-900 text-xs font-mono">{orderId || 'NX-8976543'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-semibold mb-0.5 uppercase tracking-wider text-[9px]">Método de Pago</span>
                <span className="font-black text-xs text-[#009ee3] uppercase">
                  {order?.paymentMethod || 'Acreditación Directa'}
                </span>
              </div>
            </div>

            {/* Recipient details */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-gray-100 text-xs text-slate-900">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5 select-none">
                <Truck size={16} className="text-[#009ee3]" /> Datos del Estudiante
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 font-medium">
                <div>
                  <span className="text-slate-400 text-[10px] block">Nombre Completo</span>
                  <span className="font-bold">{order?.customerName || 'Cliente'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">DNI / ID</span>
                  <span className="font-bold font-mono">{order?.dni || '---'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 text-[10px] block">Dirección de Envío (Material Opcional)</span>
                  <span className="font-bold flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400 inline" />
                    {order?.address || 'Solo Modalidad Aula Digital'}
                  </span>
                </div>
              </div>
            </div>

            {/* Items details table */}
            <div className="space-y-4">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5 select-none">
                <ShoppingBag size={16} className="text-[#009ee3]" /> Detalle del Pedido
              </h4>
              
              <div className="divide-y divide-gray-100 font-medium">
                {order?.items ? (
                  order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between py-3 text-xs">
                      <div className="text-slate-900">
                        <span className="font-black mr-2 text-slate-400">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-black text-slate-900">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-xs text-slate-400">Sin detalles del carrito.</div>
                )}
              </div>

              {/* Cost breakdown */}
              <div className="pt-4 border-t border-gray-100 space-y-2 select-none">
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Subtotal:</span>
                  <span>${(order?.subtotal || 0).toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Costo de Inscripción:</span>
                  <span>
                    {order?.shippingCost === 0 ? '¡Gratis! 🌟' : `$${(order?.shippingCost || 0).toLocaleString('es-AR')}`}
                  </span>
                </div>
                <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between text-slate-900">
                  <span className="font-black text-sm uppercase">Total Abonado</span>
                  <span className="text-xl font-black text-[#009ee3]">${(order?.total || 0).toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            {/* If transfer mode action requested, show instructions support */}
            {order?.paymentMethod === 'transferencia' && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2 text-xs">
                <span className="font-black text-amber-800 flex items-center gap-1 select-none">🚨 Acción Necesaria: Transferencia Pendiente</span>
                <p className="text-amber-800 leading-relaxed font-semibold">
                  Recuerda realizar la transferencia correspondiente desde tu Home Banking. Una vez recibida y confirmada por la administración de Next.ar, activaremos tu aula de inmediato.
                </p>
                <div className="text-[10px] text-amber-800/80 pt-1 font-mono">
                  COMPROBANTE ID CARGADO: {order?.paymentDetails?.referenceCode}
                </div>
              </div>
            )}

            {/* If WhatsApp agreement is chosen */}
            {order?.paymentMethod === 'whatsapp' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl space-y-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <span className="font-black text-emerald-800 uppercase tracking-wide">Acuerdo de Pago por WhatsApp</span>
                </div>
                
                {redirectCountdown !== null && (
                  <div className="bg-emerald-500 text-white p-3 rounded-xl font-bold text-center text-xs animate-pulse flex items-center justify-between gap-2 shadow-sm">
                    <span>📱 Redirigiendo automáticamente en {redirectCountdown} segundos...</span>
                    <button 
                      type="button" 
                      onClick={() => setRedirectCountdown(null)} 
                      className="bg-emerald-700 hover:bg-emerald-800 px-2 py-0.5 rounded text-[9px] uppercase font-bold transition-colors"
                      title="Cancelar redirección automática"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                <p className="text-emerald-800 leading-relaxed font-semibold">
                  Tu pre-inscripción ha sido registrada exitosamente. Para acordar el precio y método de pago con uno de nuestros asesores, por favor haz clic en el botón de abajo para iniciar la conversación en WhatsApp con todos tus datos precargados.
                </p>
                <a
                  href={getWhatsappUrl()}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 hover:scale-[1.02]"
                >
                  <span>Iniciar Chat de WhatsApp</span>
                  <span className="text-sm">👉</span>
                </a>
              </div>
            )}

            {/* Quick Actions navigation links */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 select-none">
              <Link
                to="/"
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider py-3.5 rounded-full text-center border border-gray-100 transition-all"
              >
                Seguir Explorando 🧭
              </Link>
              <Link
                to="/my-orders"
                className="bg-[#009ee3] hover:bg-[#008bd0] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full text-center transition-all shadow-md shadow-sky-500/10"
              >
                Ver Mis Inscripciones 📋
              </Link>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
