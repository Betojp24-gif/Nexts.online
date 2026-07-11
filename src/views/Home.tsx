import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { INITIAL_PRODUCTS, getProductImage } from '../data/initialProducts';
import { 
  Search, SlidersHorizontal, Sparkles, ShoppingBag, ArrowRight, 
  Baby, BookOpen, Palette, Star, ChevronRight, ChevronLeft, Gamepad2 
} from 'lucide-react';

export default function Home() {
  const { addToCart } = useCart();
  const { user, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const navigate = useNavigate();

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Products and loading states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Active filter states
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('popular');

  // Load products from firestore or seed them if empty
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const colRef = collection(db, 'products');
        // Use a timeout of 3.5 seconds to prevent hanging if Firestore is slow or unreachable
        const fetchPromise = getDocs(colRef);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 3500)
        );

        let snap;
        try {
          snap = await Promise.race([fetchPromise, timeoutPromise]);
        } catch (getErr) {
          console.warn('Firestore fetch failed or timed out, falling back to local products:', getErr);
          setProducts(INITIAL_PRODUCTS);
          setLoading(false);
          return;
        }
        
        let shouldSeed = snap.empty;
        const list: Product[] = [];
        
        if (!snap.empty) {
          let hasZonaKids = false;
          let hasOldPricing = false;
          snap.forEach((docSnap) => {
            const data = docSnap.data() as Product;
            if (
              docSnap.id.includes('qatar') || 
              docSnap.id.includes('copaamerica') || 
              data.name.includes('Qatar') || 
              data.name.includes('Álbum') || 
              data.brand?.includes('Panini') ||
              data.category === 'Álbumes' ||
              data.category === 'Sobres y Packs'
            ) {
              hasZonaKids = true;
            }
            if (data.price === 10000) {
              hasOldPricing = true;
            }
            list.push({ 
              id: docSnap.id, 
              ...data,
              image: getProductImage({ id: docSnap.id, image: data.image })
            } as Product);
          });
          
          if (hasZonaKids || hasOldPricing) {
            console.log('Detected ZonaKids products or old pricing, force-re-seeding with updated Next.ar Courses...');
            try {
              setSeeding(true);
              for (const docSnap of snap.docs) {
                await deleteDoc(doc(db, 'products', docSnap.id));
              }
              shouldSeed = true;
            } catch (writeErr) {
              console.warn('Could not delete old products from Firestore (non-admin user):', writeErr);
              // Non-admins cannot delete from Firestore, so we fall back to local INITIAL_PRODUCTS directly
              setProducts(INITIAL_PRODUCTS);
              setLoading(false);
              return;
            }
          }
        }
        
        if (shouldSeed) {
          try {
            setSeeding(true);
            // Seed INITIAL_PRODUCTS
            for (const item of INITIAL_PRODUCTS) {
              await setDoc(doc(db, 'products', item.id), item);
            }
            console.log('Seeding courses completed successfully.');
            setProducts(INITIAL_PRODUCTS);
          } catch (writeErr) {
            console.warn('Could not seed courses to Firestore (non-admin user):', writeErr);
            // Non-admins cannot write to Firestore, so we fall back to local INITIAL_PRODUCTS directly
            setProducts(INITIAL_PRODUCTS);
          } finally {
            setSeeding(false);
          }
        } else {
          setProducts(list);
        }
      } catch (err) {
        console.error('Error loading products from Firebase:', err);
        // Fallback to static initial products in case of offline/auth issues
        setProducts(INITIAL_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    // 1. Navbar Search Bar
    if (urlSearch && !p.name.toLowerCase().includes(urlSearch.toLowerCase()) && !p.description.toLowerCase().includes(urlSearch.toLowerCase()) && !p.brand.toLowerCase().includes(urlSearch.toLowerCase())) {
      return false;
    }
    // 2. Category pill
    if (selectedCategory !== 'Todas' && p.category !== selectedCategory) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    // popular / default
    if (sortBy === 'popular') return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
    return 0;
  });

  const categories = ['Todas', 'Administración', 'Salud', 'Social', 'Educación', 'Tecnología'];

  // User details for welcome
  const userName = userProfile?.firstName || user?.displayName?.split(' ')[0] || 'Roberto';

  return (
    <div className="bg-[#040814] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0c1833] via-[#050b18] to-[#02050c] min-h-screen pb-16 text-slate-100">
      
      {/* Premium Dark Hero Section (Screenshot 4) */}
      <section className="relative overflow-hidden pt-6 pb-10 px-2.5 sm:px-6 md:px-10">
        {/* Background visual blurred gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-[#0c1833]/40 backdrop-blur-md rounded-[28px] xs:rounded-[36px] border border-slate-800/60 overflow-hidden relative p-5 xs:p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            {/* Soft decorative background image representation */}
            <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-10 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000')` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#040814] via-[#050b18]/90 to-[#02050c]/80 pointer-events-none" />

            <div className="text-left space-y-5 max-w-2xl relative z-10">
              <span className="inline-block bg-[#009ee3]/10 text-[#009ee3] border border-[#009ee3]/35 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                Educación Terciaria de Vanguardia
              </span>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Tu futuro profesional <span className="text-[#009ee3]">comienza aquí.</span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                ¡Bienvenido de nuevo, <strong className="text-white">{userName}</strong>! Continúa tu formación con la mejor calidad académica y asegura tu salida laboral rápida en Administración, Salud, Educación y Tecnología.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3.5 select-none pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#009ee3] hover:bg-[#008bd0] text-white font-black text-xs uppercase tracking-wider px-7 py-3.5 rounded-full transition-all shadow-md shadow-sky-500/10 flex items-center justify-center gap-2"
                >
                  <span>Ver Cursos Disponibles</span>
                  <ArrowRight size={14} />
                </button>
                {user && (
                  <Link
                    to="/my-orders"
                    className="border border-slate-700/80 hover:border-[#009ee3] text-slate-300 hover:text-white font-black text-xs uppercase tracking-wider px-7 py-3.5 rounded-full transition-all flex items-center justify-center gap-1.5 bg-slate-950/60"
                  >
                    <span>Mis Cursos</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>

            {/* Right graphic visual accent */}
            <div className="relative shrink-0 hidden lg:block z-10 select-none">
              <div className="w-44 h-44 bg-[#009ee3] rounded-[44px] flex items-center justify-center shadow-2xl shadow-sky-500/20 animate-pulse relative">
                <BookOpen className="text-white w-20 h-20" />
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Estudia Hoy
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main E-commerce Catalog Section */}
      <section id="catalog-section" className="py-10 px-2.5 sm:px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          
          <div>
            
            {/* Category Filter and Sorting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-800/80">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4.5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all select-none ${selectedCategory === cat ? 'bg-[#009ee3] text-white shadow-md shadow-sky-500/10' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-850 hover:border-slate-800'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 bg-slate-900/40 px-3.5 py-1.5 rounded-full border border-slate-850 self-end md:self-auto">
                <SlidersHorizontal size={14} className="text-[#009ee3]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                >
                  <option value="popular" className="bg-slate-950">Destacados</option>
                  <option value="price-asc" className="bg-slate-950">Menor Precio</option>
                  <option value="price-desc" className="bg-slate-950">Mayor Precio</option>
                  <option value="name-asc" className="bg-slate-950">Nombre A-Z</option>
                </select>
              </div>
            </div>

            {/* List Products Grid */}
            <div className="w-full">
              
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ee3] mb-4" />
                  <p className="text-slate-400 font-bold">Cargando el Catálogo de Cursos...</p>
                </div>
              ) : seeding ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="animate-pulse flex space-x-2 justify-center items-center mb-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-4 h-4 bg-[#f08519] rounded-full animate-bounce delay-150"></div>
                  </div>
                  <p className="text-[#009ee3] font-black">Inicializando plataforma educativa y cargando temarios de cursos...</p>
                  <span className="text-xs text-slate-400">Preparando tus credenciales de estudio...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-slate-900/40 rounded-[32px] border border-dashed border-slate-800 p-8">
                  <span className="text-5xl">🕵️‍♀️</span>
                  <h4 className="text-lg font-black text-white mt-6">No encontramos resultados exactos</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-3 leading-relaxed">Prueba seleccionando "Todas" las categorías o limpiando el filtro de búsqueda del buscador superior de la página.</p>
                  <button
                    onClick={() => { setSelectedCategory('Todas'); }}
                    className="mt-6 bg-[#009ee3] hover:bg-[#008bd0] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((p, idx) => {
                    const lowStock = p.stock > 0 && p.stock <= 5;
                    const outOfStock = p.stock === 0;

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group bg-slate-900/50 border border-slate-800/80 rounded-[28px] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,158,227,0.15)] hover:border-[#009ee3]/50 transition-all duration-300 flex flex-col h-full relative text-slate-300"
                      >
                        {/* Tags on Card */}
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                          <span className="bg-[#009ee3]/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-black text-[#009ee3] border border-[#009ee3]/20 uppercase tracking-widest shadow-sm">
                            {p.category}
                          </span>
                          {p.popular && (
                            <span className="bg-amber-400 text-slate-900 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                              <Star size={10} fill="currentColor" /> Destacado
                            </span>
                          )}
                          {lowStock && (
                            <span className="bg-red-950/60 text-red-400 border border-red-900/50 px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider">
                              ¡Últimos {p.stock}! 🚨
                            </span>
                          )}
                          {outOfStock && (
                            <span className="bg-slate-950/60 text-slate-500 border border-slate-900 px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider">
                              No disponible 🎒
                            </span>
                          )}
                        </div>

                        {/* Product Image */}
                        <div className="relative h-48 w-full overflow-hidden border-b border-slate-850">
                          <img
                             src={p.image}
                             alt={p.name}
                             className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                             referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-3 right-4 bg-slate-950/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-black text-white flex items-center gap-1 shadow-sm">
                            ⏱️ {p.ageRange}
                          </div>
                        </div>

                        {/* Content text */}
                        <div className="p-5 flex flex-col flex-grow text-left">
                          <h3 className="text-xs sm:text-sm font-black leading-snug truncate transition-colors mb-1.5 text-white group-hover:text-[#009ee3]" title={p.name}>
                            {p.name}
                          </h3>
                          <p className="text-[11px] leading-relaxed font-medium line-clamp-2 flex-grow mb-4 text-slate-400">
                            {p.description}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t mb-2 select-none border-slate-800/80">
                            <span className="text-xl font-black text-white">
                              ${p.price.toLocaleString('es-AR')}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                              Cupos disponibles
                            </span>
                          </div>

                          <div className="text-[9px] text-slate-400 font-medium leading-normal mb-3 select-none bg-slate-950/40 p-2 rounded-lg border border-slate-900/60">
                            <span className="text-amber-400 font-bold">Matrícula:</span> ${p.price.toLocaleString('es-AR')}. Al finalizar se abona el mismo valor para la entrega del <span className="text-sky-400 font-bold">diploma digital</span>.
                          </div>

                          <div className="grid grid-cols-5 gap-2 select-none">
                            <Link
                              to={`/product/${p.id}`}
                              className="col-span-2 h-10 font-bold text-[10px] uppercase tracking-wider rounded-full transition-all flex items-center justify-center border hover:shadow-inner bg-slate-950/80 hover:bg-slate-800 text-slate-200 border-slate-800"
                            >
                              Temario
                            </Link>
                            <button
                              disabled={outOfStock}
                              onClick={() => addToCart(p, 1)}
                              className={`col-span-3 h-10 font-black text-[10px] uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm ${outOfStock ? 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed' : 'bg-[#009ee3] hover:bg-[#008bd0] hover:shadow-md hover:shadow-sky-500/10 text-white'}`}
                            >
                              <BookOpen size={12} />
                              Matricularse
                            </button>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* Testimonials Carousel & Compact Trust Widget */}
      <section className="py-10 border-t border-slate-900 bg-slate-950/40 select-none">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Left Box: Compact Testimonials Carousel */}
            <div className="bg-slate-900/45 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] bg-sky-950 text-[#009ee3] border border-sky-900/50 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  💬 Opiniones Reales
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setActiveTestimonial((prev) => (prev - 1 + 5) % 5)}
                    className="p-1 rounded-lg bg-slate-950/40 text-slate-400 hover:text-white transition-colors"
                    title="Anterior"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button 
                    onClick={() => setActiveTestimonial((prev) => (prev + 1) % 5)}
                    className="p-1 rounded-lg bg-slate-950/40 text-slate-400 hover:text-white transition-colors"
                    title="Siguiente"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* Active testimonial display with sliding/fade animation */}
              <div className="min-h-[96px] flex flex-col justify-between">
                <p className="text-[11px] leading-relaxed text-slate-300 font-medium italic">
                  "{[
                    "Excelente capacitación. El campus es intuitivo y la atención por WhatsApp fue rápida. Ya tengo mi certificado digital avalando mi logro laboral.",
                    "La flexibilidad horaria me permitió estudiar mientras trabajaba. Los trabajos prácticos son muy aplicables a la realidad.",
                    "Muy conforme con el material y el acompañamiento docente. Recibí mi diploma digital avalando mis logros profesionales perfectamente.",
                    "Contenidos actualizados y explicaciones muy didácticas. Recomiendo Nexts.Online al 100% para quienes buscan salida laboral rápida.",
                    "La relación precio-calidad es insuperable. Valoro muchísimo el sistema de entregas de TPs y el reconocimiento de mi logro académico."
                  ][activeTestimonial]}"
                </p>

                <div className="flex items-center gap-2.5 pt-3 mt-3 border-t border-slate-850/60">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-800 shrink-0">
                    <img 
                      src={[
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
                      ][activeTestimonial]} 
                      alt="Alumno" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-white text-[10px] truncate">
                      {[
                        "Sofía Altamirano",
                        "Santiago Méndez",
                        "Valeria Rossi",
                        "Mateo Benítez",
                        "Delfina Sola"
                      ][activeTestimonial]}
                    </h4>
                    <p className="text-[8px] text-[#009ee3] font-black uppercase tracking-wider truncate">
                      {[
                        "Graduada de Asistente Contable",
                        "Graduado de Técnico en Computación",
                        "Estudiante de Secretariado Médico",
                        "Graduado de Administración de PyMEs",
                        "Estudiante de Recursos Humanos"
                      ][activeTestimonial]}
                    </p>
                  </div>
                  <div className="ml-auto flex text-amber-400 gap-0.5 shrink-0">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={9} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tiny dots indicator */}
              <div className="flex justify-center gap-1 mt-3">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeTestimonial ? 'bg-[#009ee3] w-3' : 'bg-slate-800'}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Box: Small compact Global Accreditation box */}
            <div className="bg-slate-900/45 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full font-black uppercase tracking-wider block w-max mb-2">
                  🛡️ Acreditación Global
                </span>
                <h3 className="font-black text-white text-xs uppercase tracking-wider">Garantía Nexts.Online</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                  Contamos con un sistema de formación optimizado para la inserción laboral directa, certificación formal y tutoría personalizada.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-850/60 text-left">
                <div>
                  <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Estudiantes</span>
                  <span className="text-white font-extrabold text-[10px] block mt-0.5">12,000+ Activos</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Graduados</span>
                  <span className="text-white font-extrabold text-[10px] block mt-0.5">94.8% Éxito</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Soporte</span>
                  <span className="text-white font-extrabold text-[10px] block mt-0.5">WhatsApp Directo</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
