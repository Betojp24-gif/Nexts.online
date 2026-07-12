import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  Users, ShoppingBag, Settings, CheckCircle, Clock, 
  Trash2, Plus, Edit2, Key, ToggleLeft, ToggleRight, 
  RefreshCw, DollarSign, Package, CreditCard, Sparkles,
  FileText, Check, XCircle, Award, BookOpen, AlertCircle
} from 'lucide-react';
import { INITIAL_PRODUCTS, getProductImage } from '../data/initialProducts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'tps' | 'students'>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    return (tabParam && ['orders', 'inventory', 'tps', 'students'].includes(tabParam) ? tabParam as any : 'orders');
  });
  
  // Data lists
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Students management state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedCourseForStudent, setSelectedCourseForStudent] = useState<string>('');
  const [assigningCourse, setAssigningCourse] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // TPs & submissions states
  const [tps, setTps] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingTps, setLoadingTps] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [newTp, setNewTp] = useState({
    courseId: '',
    title: '',
    description: '',
    moduleId: 1
  });
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [gradingStatus, setGradingStatus] = useState('Aprobado');

  // New Product Modal or form state
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    price: 0,
    stock: 10,
    category: 'Álbumes',
    ageRange: 'Qatar 2022',
    brand: '',
    image: '',
    description: '',
    materialUrl: '',
    popular: false
  });

  const [editingMaterialProductId, setEditingMaterialProductId] = useState<string | null>(null);
  const [tempMaterialUrl, setTempMaterialUrl] = useState('');

  // Global payment configurations loaded from firestore db
  const [paymentConfig, setPaymentConfig] = useState({
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

  const [savingConfig, setSavingConfig] = useState(false);
  const [syncingProducts, setSyncingProducts] = useState(false);

  // Fetch orders and inventory
  useEffect(() => {
    fetchOrdersList();
    fetchProductsList();
    fetchPaymentConfig();
    fetchTpsList();
    fetchSubmissionsList();
    fetchStudentsList();
  }, []);

  // Sync tab state from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['orders', 'inventory', 'tps', 'students'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [window.location.search]);

  const fetchTpsList = async () => {
    try {
      setLoadingTps(true);
      const snap = await getDocs(collection(db, 'tps'));
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setTps(list);
    } catch (err) {
      console.warn('Error loading TPs:', err);
    } finally {
      setLoadingTps(false);
    }
  };

  const fetchSubmissionsList = async () => {
    try {
      setLoadingSubmissions(true);
      const snap = await getDocs(collection(db, 'submissions'));
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
      setSubmissions(list);
    } catch (err) {
      console.warn('Error loading submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchStudentsList = async () => {
    try {
      setLoadingStudents(true);
      const snap = await getDocs(collection(db, 'users'));
      const list: any[] = [];
      snap.forEach(d => {
        list.push({ uid: d.id, ...d.data() });
      });
      list.sort((a, b) => {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setStudents(list);
    } catch (err) {
      console.warn('Error loading students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAssignCourseToStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCourseForStudent) {
      toast.error('Por favor selecciona un estudiante y un curso.');
      return;
    }
    const selectedCourse = products.find(p => p.id === selectedCourseForStudent);
    if (!selectedCourse) {
      toast.error('Curso no encontrado.');
      return;
    }

    try {
      setAssigningCourse(true);
      const orderRef = doc(collection(db, 'orders'));
      const payload = {
        userId: selectedStudent.uid,
        customerName: `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim() || 'Estudiante',
        customerEmail: selectedStudent.email || '',
        customerPhone: selectedStudent.phone || '',
        dni: selectedStudent.dni || '',
        address: 'Aula Virtual - Habilitado por Admin',
        city: '',
        province: '',
        items: [
          {
            productId: selectedCourse.id,
            name: selectedCourse.name,
            price: selectedCourse.price || 0,
            quantity: 1,
            image: selectedCourse.image || ''
          }
        ],
        subtotal: selectedCourse.price || 0,
        shippingCost: 0,
        total: selectedCourse.price || 0,
        paymentMethod: 'whatsapp',
        status: 'processing', // Activated immediately
        createdAt: serverTimestamp(),
        paymentDetails: {
          referenceCode: 'HABILITADO_POR_ADMIN',
          transferReceiptChecked: true
        }
      };

      await setDoc(orderRef, payload);
      toast.success(`¡Curso "${selectedCourse.name}" habilitado con éxito para ${selectedStudent.firstName || 'el estudiante'}!`);
      setSelectedCourseForStudent('');
      fetchOrdersList();
    } catch (err) {
      console.error('Error assigning course to student:', err);
      toast.error('No se pudo habilitar el curso.');
    } finally {
      setAssigningCourse(false);
    }
  };

  const handleRevokeCourseAccess = async (orderId: string, courseName: string) => {
    if (!confirm(`¿Estás seguro de quitar el acceso al curso "${courseName}" para este alumno?`)) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success('Acceso al curso revocado (Inscripción eliminada).');
      fetchOrdersList();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo remover el acceso.');
    }
  };

  const handleCreateTp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTp.courseId || !newTp.title.trim() || !newTp.description.trim()) {
      toast.error('Por favor completa todos los campos del TP.');
      return;
    }
    try {
      const selectedCourse = products.find(p => p.id === newTp.courseId);
      const courseName = selectedCourse ? selectedCourse.name : newTp.courseId;
      
      const payload = {
        ...newTp,
        courseName,
        moduleId: Number(newTp.moduleId),
        createdAt: serverTimestamp()
      };
      
      // We generate an id or let firebase handle addDoc
      const docRef = doc(collection(db, 'tps'));
      await setDoc(docRef, payload);
      toast.success('¡Trabajo Práctico publicado con éxito!');
      setNewTp({
        courseId: '',
        title: '',
        description: '',
        moduleId: 1
      });
      fetchTpsList();
    } catch (err) {
      console.error('Error creating TP:', err);
      toast.error('No se pudo publicar el TP.');
    }
  };

  const handleGradeSubmission = async (subId: string) => {
    if (!gradingFeedback.trim()) {
      toast.error('Por favor ingresa una devolución o comentario.');
      return;
    }
    try {
      const docRef = doc(db, 'submissions', subId);
      await updateDoc(docRef, {
        status: gradingStatus, // 'Aprobado', 'Rehacer'
        feedback: gradingFeedback,
        gradedAt: serverTimestamp()
      });
      toast.success('TP corregido y calificado con éxito.');
      setGradingSubmissionId(null);
      setGradingFeedback('');
      fetchSubmissionsList();
    } catch (err) {
      console.error('Error grading submission:', err);
      toast.error('No se pudo guardar la calificación.');
    }
  };

  const handleDeleteTp = async (tpId: string) => {
    if (!confirm('¿Estás totalmente seguro de eliminar este Trabajo Práctico del curso?')) return;
    try {
      await deleteDoc(doc(db, 'tps', tpId));
      toast.success('TP eliminado.');
      fetchTpsList();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar el TP.');
    }
  };

  const fetchOrdersList = async () => {
    try {
      setLoadingOrders(true);
      const snap = await getDocs(collection(db, 'orders'));
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(list);
    } catch (err) {
      console.warn('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      setLoadingProducts(true);
      const snap = await getDocs(collection(db, 'products'));
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setProducts(list);
    } catch (err) {
      console.warn('Error loading products list:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchPaymentConfig = async () => {
    try {
      const docSnap = await getDocs(collection(db, 'config'));
      const found = docSnap.docs.find(d => d.id === 'payment');
      if (found) {
        setPaymentConfig(found.data() as any);
      }
    } catch (err) {
      console.warn('Error fetching payment config:', err);
    }
  };

  // Status mapping updates
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Estado de la orden actualizado a: ${newStatus}`);
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('No se pudo actualizar el estado de la compra.');
    }
  };

  // Product addition handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.id.trim() || !newProduct.name.trim()) {
      toast.error('El ID y el nombre de producto son requeridos.');
      return;
    }

    try {
      const prodId = newProduct.id.trim().toLowerCase().replace(/\s+/g, '-');
      const payload = {
        ...newProduct,
        id: prodId,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'products', prodId), payload);
      toast.success('¡Curso añadido con éxito al catálogo de Nexts.Online!');
      
      // Clear form
      setNewProduct({
        id: '',
        name: '',
        price: 0,
        stock: 10,
        category: 'Álbumes',
        ageRange: 'Qatar 2022',
        brand: '',
        image: '',
        description: '',
        materialUrl: '',
        popular: false
      });

      fetchProductsList();
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error('Ocurrió un error al añadir el artículo.');
    }
  };

  // Quick inline update for stock
  const updateProductStock = async (prodId: string, deltaQty: number, currentStock: number) => {
    try {
      const newStock = Math.max(0, currentStock + deltaQty);
      await updateDoc(doc(db, 'products', prodId), { stock: newStock });
      setProducts(products.map(p => p.id === prodId ? { ...p, stock: newStock } : p));
      toast.success('Stock actualizado.');
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product action
  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('¿Estás totalmente seguro de retirar este producto del catálogo?')) return;
    try {
      await deleteDoc(doc(db, 'products', prodId));
      setProducts(products.filter(p => p.id !== prodId));
      toast.success('Producto removido del catálogo.');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar el producto.');
    }
  };

  // Save material url action
  const handleSaveMaterialUrl = async (prodId: string) => {
    try {
      await updateDoc(doc(db, 'products', prodId), { materialUrl: tempMaterialUrl });
      setProducts(products.map(p => p.id === prodId ? { ...p, materialUrl: tempMaterialUrl } : p));
      setEditingMaterialProductId(null);
      setTempMaterialUrl('');
      toast.success('Enlace de material de estudio actualizado con éxito.');
    } catch (err) {
      console.error('Error saving material URL:', err);
      toast.error('No se pudo guardar el enlace de material.');
    }
  };

  // Seeding Catalog
  const handleResetProducts = async () => {
    if (!confirm('Esto reinicializará el catálogo a la lista por defecto. ¿Continuar?')) return;
    try {
      setSyncingProducts(true);
      for (const item of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', item.id), item);
      }
      toast.success('Catálogo restablecido con éxito.');
      fetchProductsList();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingProducts(false);
    }
  };

  // Save payment config settings doc
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      await setDoc(doc(db, 'config', 'payment'), paymentConfig);
      toast.success('¡Claves y configuraciones de pago guardadas con éxito!');
    } catch (err) {
      console.error('Error saving config:', err);
      toast.error('No se pudo guardar la configuración de medio de pago.');
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen py-8 px-4 sm:px-6 md:px-10 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          <div>
            <span className="text-[10px] bg-[#fdf3eb] text-[#f08519] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
              Módulo Administrativo
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">Panel de Control del Instituto</h1>
            <p className="text-xs text-slate-500 font-medium">Gestioná tus cursos, vacantes, inscripciones de alumnos y configurá tus pasarelas de pago.</p>
          </div>

          {/* Navigation Tab controllers */}
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 uppercase text-[11px] font-black tracking-wider flex-wrap gap-1">
            <button
              onClick={() => {
                setActiveTab('orders');
                const url = new URL(window.location.href);
                url.searchParams.set('tab', 'orders');
                window.history.pushState({}, '', url);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#009ee3] text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Inscripciones y Matrículas
            </button>
            <button
              onClick={() => {
                setActiveTab('inventory');
                const url = new URL(window.location.href);
                url.searchParams.set('tab', 'inventory');
                window.history.pushState({}, '', url);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-[#009ee3] text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Oferta Académica
            </button>
            <button
              onClick={() => {
                setActiveTab('tps');
                const url = new URL(window.location.href);
                url.searchParams.set('tab', 'tps');
                window.history.pushState({}, '', url);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'tps' ? 'bg-[#009ee3] text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Cargar / Gestionar TPs
            </button>
            <button
              onClick={() => {
                setActiveTab('students');
                const url = new URL(window.location.href);
                url.searchParams.set('tab', 'students');
                window.history.pushState({}, '', url);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'students' ? 'bg-[#009ee3] text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Estudiantes y Cursadas
            </button>
          </div>
        </header>

        {/* Dynamic Panels */}

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* SOLICITUDES PENDIENTES DE ACCESO */}
            <div className="bg-white rounded-[28px] border border-amber-200/60 shadow-sm overflow-hidden bg-gradient-to-b from-amber-50/20 to-white">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-600 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm">⌛</span>
                    Solicitudes de Acceso por Autorizar
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Alumnos que se pre-matricularon y esperan que les habilites el Aula Virtual para descargar materiales de estudio y entregar TPs.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {orders.filter(o => !o.status || o.status === 'pending').length} Pendientes
                  </span>
                  <button
                    onClick={fetchOrdersList}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors animate-none"
                    title="Recargar solicitudes"
                  >
                    <RefreshCw size={14} className={loadingOrders ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {loadingOrders ? (
                <div className="p-8 text-center text-slate-400 font-bold text-xs animate-pulse">Cargando solicitudes...</div>
              ) : orders.filter(o => !o.status || o.status === 'pending').length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">✓</div>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">¡Al día! Todo ordenado</h4>
                  <p className="text-[11px] text-slate-400 font-semibold max-w-md mx-auto">No hay solicitudes de alumnos pendientes de aprobación en este momento. Todos los que solicitaron cursar ya tienen su estado definido.</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orders.filter(o => !o.status || o.status === 'pending').map((o) => {
                      const dateObj = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date();
                      return (
                        <div key={o.id} className="bg-slate-50/75 hover:bg-slate-50 rounded-2xl p-5 border border-gray-100 space-y-4 flex flex-col justify-between transition-all hover:shadow-sm">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono block">Matrícula #{o.id}</span>
                                <h4 className="font-black text-slate-900 text-sm mt-0.5">{o.customerName}</h4>
                              </div>
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Pendiente
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-gray-100">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <span className="text-slate-400">📧</span> <span className="truncate">{o.customerEmail}</span>
                              </div>
                              {o.customerPhone && (
                                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                  <span className="text-slate-400">📞</span> <span>{o.customerPhone}</span>
                                </div>
                              )}
                              {o.dni && (
                                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                  <span className="text-slate-400">🪪</span> <span>DNI: {o.dni}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <span className="text-slate-400">📅</span> <span>Sol. el {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Cursos solicitados:</span>
                              <div className="flex flex-wrap gap-1">
                                {o.items?.map((it: any, idx: number) => (
                                  <span key={idx} className="bg-sky-50 text-[#009ee3] border border-sky-100 rounded-lg text-[10px] px-2 py-0.5 font-black uppercase tracking-wide">
                                    {it.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-dashed border-gray-100">
                              <span className="text-slate-400 font-semibold">Medio de pago:</span>
                              <span className="font-extrabold text-slate-700 uppercase tracking-wide">{o.paymentMethod || 'No especificado'}</span>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center gap-2">
                            <button
                              onClick={() => updateOrderStatus(o.id, 'processing')}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <Check size={12} strokeWidth={3} /> Autorizar Aula Virtual
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Estás seguro de denegar el acceso a ${o.customerName}?`)) {
                                  updateOrderStatus(o.id, 'cancelled');
                                }
                              }}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-black uppercase text-[10px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                              title="Denegar acceso"
                            >
                              Denegar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <span className="bg-[#eaf6fc] text-[#009ee3] w-7 h-7 rounded-lg flex items-center justify-center">🎓</span>
                  Historial de Matrículas e Inscripciones
                </h3>
                <button
                  onClick={fetchOrdersList}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Recargar órdenes"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {loadingOrders ? (
                <div className="p-12 text-center text-slate-400 font-bold">Cargando transacciones bancarias...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium">No se registran transacciones de pago en el checkout.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[750px]">
                    <thead className="bg-slate-50 border-b border-gray-100">
                      <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="py-4 px-6">Código / Fecha</th>
                        <th className="py-4 px-6">Alumno / Estudiante</th>
                        <th className="py-4 px-6">Modalidad / Aula</th>
                        <th className="py-4 px-6">Cursos</th>
                        <th className="py-4 px-6">Monto Total</th>
                        <th className="py-4 px-6">Medio / Comprobante</th>
                        <th className="py-4 px-6 text-center">Estado del Aula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-xs text-slate-700">
                      {orders.map((o) => {
                        const dateObj = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date();
                        return (
                          <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className="font-mono font-black text-slate-900 block mb-0.5">{o.id}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hs</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-slate-900 block">{o.customerName}</span>
                              <span className="text-[10px] text-slate-400 block">{o.customerEmail} | tel: {o.customerPhone}</span>
                            </td>
                            <td className="py-4 px-6 max-w-[150px] truncate" title={o.address}>
                              {o.address}
                            </td>
                            <td className="py-4 px-6">
                              <div className="max-w-[180px] break-all">
                                {o.items?.map((it: any, k: number) => (
                                  <span key={k} className="inline-block bg-sky-50 border border-[#009ee3]/20 rounded text-[9.5px] px-1.5 py-0.5 font-bold mr-1 mb-1 whitespace-nowrap text-[#009ee3]">
                                    {it.quantity}x {it.name?.slice(0, 18)}...
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className="font-black text-[#009ee3] text-sm">${o.total?.toLocaleString('es-AR')}</span>
                            </td>
                             <td className="py-4 px-6 whitespace-nowrap">
                               {o.paymentMethod === 'whatsapp' ? (
                                 <span className="font-black uppercase tracking-wider text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full block text-center max-w-[100px] mb-1">
                                   WhatsApp
                                 </span>
                               ) : o.paymentMethod === 'transferencia' ? (
                                 <span className="font-black uppercase tracking-wider text-[9px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full block text-center max-w-[100px] mb-1">
                                   Transferencia
                                 </span>
                               ) : (
                                 <span className="font-black uppercase tracking-wider text-[9px] bg-sky-100 text-[#009ee3] border border-sky-200 px-2 py-0.5 rounded-full block text-center max-w-[100px] mb-1">
                                   {o.paymentMethod}
                                 </span>
                               )}
                               {o.paymentDetails?.referenceCode && (
                                 <span className="font-mono text-[9px] text-slate-400 font-semibold block">{o.paymentDetails.referenceCode}</span>
                               )}
                             </td>
                            <td className="py-4 px-6 text-center whitespace-nowrap">
                              <div className="flex flex-col gap-1.5 items-center justify-center">
                                <select
                                  value={o.status || 'pending'}
                                  onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                  className="bg-slate-50 text-[10px] font-black uppercase text-slate-900 border border-gray-200 rounded-lg p-1.5 outline-none focus:border-[#009ee3]"
                                >
                                  <option value="pending">Aguardando Pago (Pendiente)</option>
                                  <option value="processing">Acreditado (Activo/Cursando)</option>
                                  <option value="delivered">Completado (Certificado) 🎓</option>
                                  <option value="cancelled">Inactivo / Cancelado</option>
                                </select>
                                
                                {(o.status === 'pending' || !o.status) && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => updateOrderStatus(o.id, 'processing')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] px-2.5 py-1 rounded transition-colors shadow-sm flex items-center gap-1"
                                      title="Aprobar inscripción y dar acceso al aula virtual"
                                    >
                                      ✓ Aceptar
                                    </button>
                                    <button
                                      onClick={() => updateOrderStatus(o.id, 'cancelled')}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-black uppercase text-[9px] px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                                      title="Denegar acceso al aula virtual"
                                    >
                                      X Denegar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & CATALOG MANAGER */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Column 1: Add product form */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900 text-base">Añadir Nuevo Curso o Carrera</h3>
                <span className="text-[9px] font-black tracking-widest text-[#009ee3] uppercase">Formulario</span>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-semibold">
                
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">ID de Cursada (ej. asistente-contable-plus)</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. asistente-contable-plus"
                    value={newProduct.id}
                    onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Nombre Oficial del Trayecto Académico</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Asistente Contable y Previsional"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Arancel Matrícula (ARS)</label>
                    <input
                      type="number"
                      required
                      placeholder="10000"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Cupos / Vacantes</label>
                    <input
                      type="number"
                      required
                      placeholder="999"
                      value={newProduct.stock || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Área / Categoría</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 font-bold font-sans text-slate-900"
                    >
                      <option value="Administración">Administración</option>
                      <option value="Salud">Salud</option>
                      <option value="Social">Social</option>
                      <option value="Educación">Educación</option>
                      <option value="Tecnología">Tecnología</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Carga Horaria / Modalidad</label>
                    <select
                      value={newProduct.ageRange}
                      onChange={(e) => setNewProduct({ ...newProduct, ageRange: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 font-black text-[10px] font-sans text-slate-900"
                    >
                      <option value="400 horas / Certificado">400 horas / Certificado</option>
                      <option value="675 horas / Certificado">675 horas / Certificado</option>
                      <option value="120 horas / Certificado">120 horas / Certificado</option>
                      <option value="Seminario de Especialización">Seminario de Especialización</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Entidad de Certificación</label>
                    <input
                      type="text"
                      placeholder="ej. Next.ar Instituto"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 text-slate-900"
                    />
                  </div>
                  <div className="flex items-end pb-1 select-none">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProduct.popular}
                        onChange={(e) => setNewProduct({ ...newProduct, popular: e.target.checked })}
                        className="rounded border-gray-300 text-[#009ee3] focus:ring-[#009ee3]"
                      />
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-700">¿Destacado? ⭐</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">URL de la Imagen del Curso</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">URL del Material de Estudio (Google Drive / Dropbox / PDF)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={newProduct.materialUrl || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, materialUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Programa y Objetivos Curriculares</label>
                  <textarea
                    rows={3}
                    placeholder="Objetivos, perfil del alumno, temario curricular y salida laboral del curso..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 resize-none font-medium text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#009ee3] hover:bg-[#008bd0] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/10"
                >
                  <Plus size={14} /> Añadir al Catálogo
                </button>

              </form>
            </div>

            {/* Columns 2-3: Product grid summary table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center select-none">
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <span className="bg-sky-50 text-[#009ee3] w-7 h-7 rounded-lg flex items-center justify-center">📚</span>
                    Administración de la Oferta Académica ({products.length})
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetProducts}
                      disabled={syncingProducts}
                      className="text-[9px] font-black bg-slate-50 hover:bg-slate-100 border border-gray-200 py-1.5 px-3 rounded-full text-slate-500 transition-colors uppercase flex items-center gap-1"
                    >
                      <RefreshCw size={10} className={syncingProducts ? 'animate-spin' : ''} /> Reiniciar Catálogo
                    </button>
                    <button
                      onClick={fetchProductsList}
                      className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>

                {loadingProducts ? (
                  <div className="p-12 text-center text-slate-400 font-bold">Cargando catálogo...</div>
                ) : products.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">Sin cursos cargados. Presiona "Reiniciar catálogo".</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {products.map((p) => (
                      <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden select-none shrink-0 bg-slate-50">
                            <img src={getProductImage({ id: p.id, image: p.image })} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-[220px]">{p.name}</h4>
                            <div className="flex flex-col gap-1 mt-0.5 text-[10px] text-slate-500">
                              <span className="font-semibold uppercase">{p.category} | ${p.price?.toLocaleString('es-AR')}</span>
                              
                              <div className="flex items-center gap-1 mt-1 text-[9px]">
                                <span className="bg-sky-50 text-[#009ee3] px-1 rounded font-black uppercase shrink-0">Material</span>
                                {editingMaterialProductId === p.id ? (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <input
                                      type="text"
                                      placeholder="Enlace de Drive / Dropbox"
                                      value={tempMaterialUrl}
                                      onChange={(e) => setTempMaterialUrl(e.target.value)}
                                      className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[9px] w-[140px] text-slate-900 focus:border-[#009ee3] outline-none"
                                    />
                                    <button
                                      onClick={() => handleSaveMaterialUrl(p.id)}
                                      className="bg-[#009ee3] hover:bg-[#008bd0] text-white px-1.5 py-0.5 rounded font-black uppercase text-[8px]"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => setEditingMaterialProductId(null)}
                                      className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase text-[8px]"
                                    >
                                      X
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 truncate max-w-[180px] sm:max-w-[240px]">
                                    <span className="italic truncate text-slate-400">
                                      {p.materialUrl ? p.materialUrl : 'Sin material'}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingMaterialProductId(p.id);
                                        setTempMaterialUrl(p.materialUrl || '');
                                      }}
                                      className="text-[#009ee3] hover:underline font-black uppercase text-[8px]"
                                    >
                                      [Editar]
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 select-none mr-2">
                          <div className="flex items-center bg-slate-100 rounded-lg px-2 py-1 gap-2 border border-gray-100">
                            <button
                              onClick={() => updateProductStock(p.id, -1, p.stock)}
                              className="font-bold text-slate-500 hover:text-slate-900 px-1"
                              title="Restar vacantes"
                            >
                              -
                            </button>
                            <span className="font-black text-slate-900 text-[11px] w-6 text-center">{p.stock}</span>
                            <button
                              onClick={() => updateProductStock(p.id, 1, p.stock)}
                              className="font-bold text-slate-500 hover:text-slate-900 px-1"
                              title="Sumar vacantes"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                            title="Descartar curso"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: TRABAJOS PRACTICOS (TPs) & EVALUATION */}
        {activeTab === 'tps' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Column 1: Publicar Nuevo TP */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900 text-base">Publicar Trabajo Práctico</h3>
                <span className="text-[9px] font-black tracking-widest text-[#009ee3] uppercase">Docentes</span>
              </div>

              <form onSubmit={handleCreateTp} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Curso o Trayecto Académico</label>
                  <select
                    required
                    value={newTp.courseId}
                    onChange={(e) => setNewTp({ ...newTp, courseId: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 font-bold text-slate-900"
                  >
                    <option value="">-- Seleccionar curso --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Módulo N°</label>
                    <select
                      required
                      value={newTp.moduleId}
                      onChange={(e) => setNewTp({ ...newTp, moduleId: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 font-bold text-slate-900"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(m => (
                        <option key={m} value={m}>Módulo {m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Título del TP</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Trabajo Práctico Obligatorio 1"
                      value={newTp.title}
                      onChange={(e) => setNewTp({ ...newTp, title: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Enunciado, Instrucciones o Consignas</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe las pautas del TP, preguntas a responder, o links de soporte para descargar material de estudio..."
                    value={newTp.description}
                    onChange={(e) => setNewTp({ ...newTp, description: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2.5 resize-none font-medium text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#009ee3] hover:bg-[#008bd0] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/10"
                >
                  <Plus size={14} /> Publicar Actividad TP
                </button>
              </form>

              {/* TPs published tracker list */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-black text-slate-900 text-xs mb-3 uppercase tracking-wider">Actividades Activas ({tps.length})</h4>
                {loadingTps ? (
                  <p className="text-[10px] text-slate-400">Cargando actividades...</p>
                ) : tps.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-medium">Aún no hay trabajos prácticos cargados.</p>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {tps.map(tp => (
                      <div key={tp.id} className="p-3 bg-slate-50 rounded-xl border border-gray-100 flex justify-between items-center text-[11px]">
                        <div className="min-w-0 pr-2">
                          <p className="font-extrabold text-slate-900 truncate">{tp.title}</p>
                          <p className="text-[9px] text-[#009ee3] font-bold uppercase truncate">{tp.courseName} | Mód. {tp.moduleId}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteTp(tp.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          title="Eliminar TP"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2-3: Review Student Submissions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <span className="bg-sky-50 text-[#009ee3] w-7 h-7 rounded-lg flex items-center justify-center">📥</span>
                    Entregas y Trabajos Recibidos de Alumnos ({submissions.length})
                  </h3>
                  <button
                    onClick={fetchSubmissionsList}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    title="Recargar entregas"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                {loadingSubmissions ? (
                  <div className="p-12 text-center text-slate-400 font-bold">Cargando entregas de alumnos...</div>
                ) : submissions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-medium">No se registran trabajos prácticos entregados por el momento.</div>
                ) : (
                  <div className="divide-y divide-gray-50 text-xs font-semibold">
                    {submissions.map((sub) => {
                      const dateObj = sub.submittedAt?.seconds ? new Date(sub.submittedAt.seconds * 1000) : new Date();
                      const isGrading = gradingSubmissionId === sub.id;

                      return (
                        <div key={sub.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-slate-900">{sub.fileName}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                  sub.status === 'Aprobado' ? 'bg-green-50 text-green-700 border-green-200' :
                                  sub.status === 'Rehacer' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {sub.status === 'pending' ? 'Pendiente' : sub.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                Alumno ID: <span className="font-mono font-bold text-slate-600">{sub.userId}</span> | Fecha: {dateObj.toLocaleDateString()} a las {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hs
                              </p>
                            </div>

                            <span className="text-[10px] bg-sky-50 text-[#009ee3] px-2.5 py-1 rounded-full font-black uppercase self-start sm:self-auto">
                              Curso ID: {sub.courseId} | Módulo {sub.moduleId}
                            </span>
                          </div>

                          {sub.comment && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-gray-150">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-black block mb-1">Comentario del Estudiante:</span>
                              <p className="text-[11px] text-slate-700 font-medium italic">"{sub.comment}"</p>
                            </div>
                          )}

                          {sub.feedback && (
                            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/15">
                              <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-black block mb-1">Devolución del Tutor:</span>
                              <p className="text-[11px] text-slate-700 font-medium italic">"{sub.feedback}"</p>
                            </div>
                          )}

                          {isGrading ? (
                            <div className="p-4 bg-slate-100 rounded-xl space-y-3 border border-gray-200 animated fadeIn">
                              <div className="flex items-center gap-4 select-none">
                                <label className="block text-[10px] font-black uppercase text-slate-500">Resultado:</label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setGradingStatus('Aprobado')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${gradingStatus === 'Aprobado' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-slate-600'}`}
                                  >
                                    <Check size={12} /> Aprobado
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setGradingStatus('Rehacer')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${gradingStatus === 'Rehacer' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-slate-600'}`}
                                  >
                                    <XCircle size={12} /> Rehacer
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-black uppercase text-slate-500">Devolución Pedagógica / Comentario:</label>
                                <textarea
                                  required
                                  value={gradingFeedback}
                                  onChange={(e) => setGradingFeedback(e.target.value)}
                                  placeholder="Escribe aquí las observaciones, felicitaciones o aspectos a mejorar para el alumno..."
                                  className="w-full h-20 p-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#009ee3]"
                                />
                              </div>

                              <div className="flex justify-end gap-2 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setGradingSubmissionId(null)}
                                  className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-black uppercase text-slate-500"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGradeSubmission(sub.id)}
                                  className="bg-[#009ee3] hover:bg-[#008bd0] text-white px-4 py-1.5 rounded-lg font-black uppercase"
                                >
                                  Enviar Corrección
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 select-none justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setGradingSubmissionId(sub.id);
                                  setGradingStatus(sub.status === 'pending' ? 'Aprobado' : sub.status);
                                  setGradingFeedback(sub.feedback || '');
                                }}
                                className="bg-white border border-gray-200 text-slate-700 hover:text-[#009ee3] px-3 py-1.5 rounded-lg hover:border-[#009ee3] transition-colors text-[10px] font-black uppercase flex items-center gap-1.5"
                              >
                                <Award size={13} /> {sub.status === 'pending' ? 'Corregir Entrega' : 'Modificar Calificación'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: ESTUDIANTES Y CURSADAS */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Column 1: Students list */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900 text-base">Alumnos Registrados</h3>
                <button
                  onClick={fetchStudentsList}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Recargar estudiantes"
                >
                  <RefreshCw size={12} className={loadingStudents ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o DNI..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                />
              </div>

              {loadingStudents ? (
                <div className="p-8 text-center text-slate-400 font-bold text-xs animate-pulse">Cargando alumnos...</div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium text-xs">No hay estudiantes registrados.</div>
              ) : (
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                  {students
                    .filter(s => {
                      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
                      const email = (s.email || '').toLowerCase();
                      const dni = (s.dni || '').toLowerCase();
                      const term = studentSearchTerm.toLowerCase();
                      return fullName.includes(term) || email.includes(term) || dni.includes(term);
                    })
                    .map(student => {
                      const isSelected = selectedStudent?.uid === student.uid;
                      return (
                        <div
                          key={student.uid}
                          onClick={() => setSelectedStudent(student)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                            isSelected 
                              ? 'bg-sky-50 border-[#009ee3] shadow-sm' 
                              : 'bg-slate-50 hover:bg-slate-100/70 border-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <p className="font-extrabold text-slate-950 text-xs sm:text-sm">
                              {student.firstName || ''} {student.lastName || ''}
                            </p>
                            {student.role === 'admin' && (
                              <span className="bg-rose-100 text-rose-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{student.email}</p>
                          {student.dni && (
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">DNI: {student.dni}</p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Column 2-3: Selected Student Details & Enrollment Controls */}
            <div className="lg:col-span-2 space-y-6">
              {selectedStudent ? (
                <div className="space-y-6">
                  {/* Student Details Card */}
                  <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-50 pb-4 gap-3">
                      <div>
                        <span className="text-[9px] bg-sky-50 text-[#009ee3] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                          Ficha del Alumno
                        </span>
                        <h3 className="font-black text-slate-900 text-lg mt-2">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{selectedStudent.email}</p>
                      </div>

                      {/* Enable course quick form */}
                      <form onSubmit={handleAssignCourseToStudent} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <select
                          required
                          value={selectedCourseForStudent}
                          onChange={(e) => setSelectedCourseForStudent(e.target.value)}
                          className="bg-slate-50 border border-gray-200 focus:border-[#009ee3] outline-none rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        >
                          <option value="">-- Seleccionar curso --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={assigningCourse}
                          className="bg-[#009ee3] hover:bg-[#008bd0] disabled:bg-slate-200 text-white font-black text-xs uppercase px-4 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 shrink-0"
                        >
                          {assigningCourse ? 'Habilitando...' : 'Habilitar Cursada'}
                        </button>
                      </form>
                    </div>

                    {/* Active courses / matriculas list */}
                    <div className="space-y-3">
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span>🎓</span> Cursos Habilitados y Aulas Virtuales
                      </h4>

                      {orders.filter(o => o.userId === selectedStudent.uid).length === 0 ? (
                        <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-xs text-slate-400 font-semibold">Este alumno no tiene ninguna cursada habilitada actualmente.</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">Usa el menú de arriba para habilitarle un curso de forma inmediata.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {orders
                            .filter(o => o.userId === selectedStudent.uid)
                            .map((order) => {
                              return (
                                <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-gray-150 space-y-3 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start gap-1">
                                      <span className="text-[8px] font-mono font-bold text-slate-400">ID: {order.id}</span>
                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                        order.status === 'processing' || order.status === 'completed' || order.status === 'delivered'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                          : 'bg-amber-50 text-amber-700 border-amber-100'
                                      }`}>
                                        {order.status === 'processing' ? 'Activo/Cursando' : order.status === 'completed' ? 'Completado' : order.status}
                                      </span>
                                    </div>

                                    <div className="mt-1 space-y-1">
                                      {order.items?.map((it: any, k: number) => (
                                        <p key={k} className="font-extrabold text-slate-900 text-xs text-left leading-snug">
                                          {it.name}
                                        </p>
                                      ))}
                                    </div>

                                    <div className="text-[10px] text-slate-400 font-medium mt-2 space-y-0.5">
                                      <p>Método: <span className="font-bold text-slate-600 uppercase">{order.paymentMethod}</span></p>
                                      {order.createdAt?.seconds && (
                                        <p>Fecha: {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-dashed border-gray-200 flex items-center justify-between gap-2">
                                    <select
                                      value={order.status || 'pending'}
                                      onChange={async (e) => {
                                        try {
                                          await updateDoc(doc(db, 'orders', order.id), { status: e.target.value });
                                          fetchOrdersList();
                                          toast.success('Estado de aula virtual actualizado.');
                                        } catch (err) {
                                          console.error(err);
                                          toast.error('No se pudo cambiar el estado.');
                                        }
                                      }}
                                      className="bg-white text-[9px] font-black uppercase text-slate-800 border border-gray-200 rounded p-1 outline-none focus:border-[#009ee3]"
                                    >
                                      <option value="pending">Pendiente de Pago</option>
                                      <option value="processing">Activo / Cursando</option>
                                      <option value="delivered">Completado / Certificado</option>
                                      <option value="cancelled">Inactivo / Cancelado</option>
                                    </select>

                                    <button
                                      type="button"
                                      onClick={() => handleRevokeCourseAccess(order.id, order.items?.[0]?.name || 'Curso')}
                                      className="text-rose-500 hover:text-rose-700 font-black uppercase text-[9px] px-1"
                                      title="Dar de baja cursada"
                                    >
                                      Dar de Baja
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[28px] border border-gray-100 shadow-sm text-center">
                  <span className="text-4xl">👥</span>
                  <h4 className="font-black text-slate-900 text-sm mt-4 uppercase tracking-wider">Gestor de Cursadas de Alumnos</h4>
                  <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-2 leading-relaxed">
                    Selecciona un estudiante de la columna de la izquierda para ver su ficha, habilitarle nuevos cursos o dar de baja accesos activos de inmediato.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
