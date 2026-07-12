import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Clock, MapPin, Truck, ChevronDown, 
  ChevronUp, CreditCard, AlertCircle, Calendar, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { getProductImage } from '../data/initialProducts';
import AssignmentUpload from '../components/AssignmentUpload';

function CourseTps({ courseId, courseName }: { courseId: string; courseName: string }) {
  const [tpsList, setTpsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTps() {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'tps'),
          where('courseId', '==', courseId)
        );
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        
        // If empty, let's put a default demo TP so the user can interact immediately!
        if (list.length === 0) {
          list.push({
            id: 'demo-tp-1',
            title: 'Trabajo Práctico Obligatorio N° 1 - Introducción al Trayecto',
            moduleId: 1,
            description: 'En este primer trabajo práctico obligatorio deberás redactar un ensayo analizando los objetivos de tu formación digital, tus expectativas de inserción laboral en el sector y los principales desafíos prácticos que esperas abordar.',
            isDemo: true
          });
        }
        
        // Sort by module number
        list.sort((a, b) => a.moduleId - b.moduleId);
        setTpsList(list);
      } catch (err) {
        console.warn('Error fetching TPs for student course view:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTps();
  }, [courseId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-400 text-[10px] font-semibold flex items-center justify-center gap-1.5 bg-slate-50 rounded-xl border border-gray-100">
        <Loader2 className="animate-spin" size={12} /> Cargando plataforma de Trabajos Prácticos...
      </div>
    );
  }

  return (
    <div className="p-4 mt-3 bg-slate-50/50 rounded-xl border border-gray-150 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
          <span>📝</span> TRABAJOS PRÁCTICOS Y EVALUACIÓN
        </h5>
        <span className="text-[9px] bg-sky-50 text-[#009ee3] px-2 py-0.5 rounded-full font-black uppercase">
          CAMPUS VIRTUAL
        </span>
      </div>

      <div className="space-y-4 text-left">
        {tpsList.map((tp) => (
          <div key={tp.id} className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] font-black text-[#009ee3] uppercase">Módulo {tp.moduleId}</span>
                <h6 className="font-extrabold text-slate-900 text-xs sm:text-sm">{tp.title}</h6>
              </div>
              {tp.isDemo && (
                <span className="text-[8px] bg-sky-50 text-[#009ee3] border border-sky-100 px-1.5 py-0.5 rounded font-black uppercase tracking-widest shrink-0">
                  Actividad de Ingreso
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-medium leading-relaxed bg-slate-50/40 p-2.5 rounded-lg border border-gray-50">
              {tp.description}
            </p>

            {tp.pdfUrl && (
              <div className="pt-1">
                <a 
                  href={tp.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all shadow-sm"
                >
                  <span className="text-xs">📥</span> Descargar Consigna / PDF de Estudio
                </a>
              </div>
            )}

            <AssignmentUpload 
              courseId={courseId} 
              moduleId={tp.moduleId} 
              assignmentTitle={tp.title} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyOrders() {
  const { user, login } = useAuth();
  
  // Use localStorage cache for instant loading of orders and products
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const cachedUser = localStorage.getItem('auth_user');
      if (cachedUser) {
        const uid = JSON.parse(cachedUser).uid;
        const cached = localStorage.getItem(`orders_${uid}`);
        return cached ? JSON.parse(cached) : [];
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const [productsMap, setProductsMap] = useState<Record<string, any>>(() => {
    try {
      const cached = localStorage.getItem('cached_products_map');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      // If we already have cached orders, don't show the full-screen loader spinner.
      const cachedUser = localStorage.getItem('auth_user');
      if (cachedUser) {
        const uid = JSON.parse(cachedUser).uid;
        return !localStorage.getItem(`orders_${uid}`);
      }
    } catch {
      // ignore
    }
    return true;
  });

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        let snap;
        try {
          snap = await getDocs(collection(db, 'products'));
        } catch (getErr) {
          handleFirestoreError(getErr, OperationType.LIST, 'products');
          return;
        }
        const pMap: Record<string, any> = {};
        snap.forEach(docSnap => {
          pMap[docSnap.id] = docSnap.data();
        });
        setProductsMap(pMap);
        localStorage.setItem('cached_products_map', JSON.stringify(pMap));
      } catch (err) {
        console.warn('Error loading products map for materials:', err);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const cacheKey = `orders_${user.uid}`;
        const colRef = collection(db, 'orders');
        const qRef = query(
          colRef, 
          where('userId', '==', user.uid)
        );
        let snap;
        try {
          snap = await getDocs(qRef);
        } catch (getErr) {
          handleFirestoreError(getErr, OperationType.LIST, 'orders');
          return;
        }
        const list: any[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Sort manually by date in case client lacks complex composite index
        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA; // descending order
        });

        setOrders(list);
        localStorage.setItem(cacheKey, JSON.stringify(list));
      } catch (err) {
        console.error('Error loading user orders history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          text: 'Completado (Pagado)',
          classes: 'bg-green-100 text-green-700 border-green-200'
        };
      case 'processing':
        return {
          text: 'En preparación',
          classes: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        };
      case 'delivered':
        return {
          text: 'Despachado / Enviado 🚚',
          classes: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
      case 'cancelled':
        return {
          text: 'Cancelado',
          classes: 'bg-rose-100 text-rose-700 border-rose-200'
        };
      case 'pending':
      default:
        return {
          text: 'Pendiente de Pago',
          classes: 'bg-amber-100 text-amber-700 border-amber-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
        <p className="text-slate-500 font-bold">Cargando tu historial de compras...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <span className="text-5xl">🎓</span>
        <h2 className="text-2xl font-black text-slate-900 mt-6">Inicia Sesión para ver tus Cursos</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">Debes ingresar para poder realizar el seguimiento de tus trayectos académicos y acceder a las aulas virtuales.</p>
        <button
          onClick={login}
          className="mt-6 inline-block bg-[#009ee3] hover:bg-[#008bd0] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-md"
        >
          Ingresar con Google
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 md:px-10 text-left">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 select-none">
          <span className="text-[10px] bg-sky-50 text-[#009ee3] px-3 py-1 rounded-full font-black uppercase tracking-wider">
            NEXTS.ONLINE ESTUDIANTE
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-4">Mis Inscripciones</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Sigue el estado de tus cursadas, detalles de matrícula y accesos al campus virtual.</p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-gray-100 p-10 md:p-12 text-center shadow-sm">
            <span className="text-5xl">📚</span>
            <h3 className="text-lg font-black text-slate-900 mt-6">Aún no registras ninguna inscripción</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">Te invitamos a navegar nuestro catálogo y descubrir las mejores carreras y cursos de formación digital.</p>
            <Link
              to="/"
              className="mt-6 inline-block bg-[#009ee3] hover:bg-[#008bd0] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Explorar Cursos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const badge = getStatusBadge(order.status);
              const isExpanded = expandedOrder === order.id;
              const dateObj = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date();

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                  className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm"
                >
                  {/* Order summary header widget */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#eaf6fc] rounded-full flex items-center justify-center text-[#009ee3] shrink-0">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900 truncate max-w-[120px] sm:max-w-none">{order.id}</span>
                          <span className={`text-[9px] font-black border px-2 py-0.5 rounded-full uppercase ${badge.classes}`}>
                            {badge.text}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                          <Calendar size={12} /> {dateObj.toLocaleDateString('es-AR')} a las {dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 self-stretch md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Monto Total</span>
                        <span className="text-base font-black text-[#009ee3]">${order.total?.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail box */}
                  {isExpanded && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-8 border-t border-gray-50 bg-slate-50/50 space-y-5">
                      
                      {/* Shipping information segment */}
                      <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1.5 p-4 rounded-xl border border-gray-100 bg-white">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Estudiante y Aula</span>
                          <span className="font-extrabold text-slate-900 block">{order.customerName} (DNI {order.dni})</span>
                          <span className="text-slate-500 font-medium flex items-center gap-1 mt-1">
                            <MapPin size={12} className="text-slate-400 inline" />
                            {order.address}
                          </span>
                          <span className="text-slate-400 block text-[10px] mt-1">Tel: {order.customerPhone} | Email: {order.customerEmail}</span>
                        </div>

                        <div className="space-y-1.5 p-4 rounded-xl border border-gray-100 bg-white">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Método de Pago Conectado</span>
                          <span className="font-extrabold text-slate-900 uppercase block flex items-center gap-1.5 mt-0.5">
                            <CreditCard size={14} className="text-[#009ee3]" />
                            {order.paymentMethod === 'whatsapp' ? 'WhatsApp (Acuerdo)' : order.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : order.paymentMethod}
                          </span>
                          {order.paymentDetails?.referenceCode && (
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                              Comprobante de Referencia: {order.paymentDetails.referenceCode}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 block font-medium">Estado transaccional: {order.status === 'completed' ? 'Acreditado' : 'Validando con el banco'}</span>
                        </div>
                      </div>

                      {/* Items loop */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold block mb-1">Cursos ({order.items?.length || 0})</span>
                        
                        <div className="space-y-4">
                          {order.items?.map((item: any, i: number) => {
                            const showTps = order.status === 'completed' || order.status === 'processing' || order.status === 'delivered';
                            const productData = productsMap[item.productId || item.id];
                            const currentMaterialUrl = productData?.materialUrl || item.materialUrl || '';
                            
                            return (
                              <div key={i} className="border border-gray-100 rounded-xl bg-white p-4 space-y-3 shadow-sm text-xs">
                                <div className="flex gap-3 items-center pb-2 border-b border-gray-50">
                                  <div className="w-10 h-10 bg-slate-50 border border-gray-100 rounded-md overflow-hidden select-none shrink-0">
                                    <img src={getProductImage({ id: item.productId || item.id, image: item.image })} alt="Purchased item" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                                    <span className="text-[10px] text-slate-400">{item.quantity} unidad(es) x ${item.price?.toLocaleString('es-AR')}</span>
                                  </div>
                                  <span className="font-black text-slate-900 pr-1 shrink-0">
                                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                                  </span>
                                </div>

                                {!showTps ? (
                                  <div className="bg-amber-50/75 border border-amber-200/40 rounded-xl p-4 mt-3 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Clock className="text-amber-600 shrink-0" size={16} />
                                      <span className="font-black text-amber-800 uppercase text-[10px] tracking-wider">
                                        INSCRIPCIÓN PENDIENTE DE APROBACIÓN ⌛
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                                      Tu solicitud para acceder a este trayecto de <strong>{item.name}</strong> está en proceso de validación. Una vez que la administración verifique tu pago o pre-inscripción, se habilitará tu Aula Virtual donde podrás descargar todos los materiales oficiales de estudio y entregar trabajos prácticos.
                                    </p>
                                    <div className="pt-1">
                                      <a
                                        href={`https://wa.me/5491166134186?text=${encodeURIComponent(`Hola! Registré mi pre-inscripción con el código #${order.id} para el trayecto de ${item.name}. Mi DNI es ${order.dni}. Quisiera coordinar el pago/acceso.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-3.5 py-2 rounded-lg uppercase tracking-wider transition-all shadow-sm"
                                      >
                                        Enviar Comprobante de Pago por WhatsApp 💬
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4 mt-3">
                                    {/* Materiales de estudio */}
                                    <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-100 space-y-3 text-left">
                                      <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                                        <h5 className="font-black text-sky-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                          <span>📚</span> MATERIAL DE ESTUDIO OFICIAL
                                        </h5>
                                        <span className="text-[8px] bg-sky-100 text-[#009ee3] px-2 py-0.5 rounded-full font-black uppercase">
                                          DESCARGA INMEDIATA
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                                        Tienes acceso completo al dossier educativo, diapositivas de clase y las lecturas complementarias de este trayecto formativo.
                                      </p>
                                      <div>
                                        <a
                                          href={currentMaterialUrl || `https://drive.google.com/drive/folders/1nexts-online-default-study-materials`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 bg-[#009ee3] hover:bg-[#008bd0] text-white text-[10px] font-black px-4 py-2.5 rounded-lg uppercase tracking-wider transition-all shadow-sm"
                                        >
                                          📥 Descargar Material de Estudio (PDF / Drive)
                                        </a>
                                      </div>
                                    </div>

                                    {/* Course TPs */}
                                    <CourseTps 
                                      courseId={item.productId || item.id} 
                                      courseName={item.name} 
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
