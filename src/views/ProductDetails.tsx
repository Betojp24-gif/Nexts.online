import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Product } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useCart } from '../contexts/CartContext';
import { INITIAL_PRODUCTS, getProductImage } from '../data/initialProducts';
import { COURSES } from '../constants';
import { 
  ArrowLeft, ShoppingBag, BookOpen, Clock, Award, ShieldCheck, 
  ChevronRight, HelpCircle, ChevronDown, ChevronUp, Download, CheckCircle,
  Calculator, Heart, Users, GraduationCap, Cpu, Briefcase
} from 'lucide-react';

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');
  
  // Accordion state for syllabus modules
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      try {
        setLoading(true);

        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const item = { id: docSnap.id, ...docSnap.data() } as Product;
          const mappedItem = {
            ...item,
            image: getProductImage({ id: item.id, image: item.image })
          };
          setProduct(mappedItem);
          fetchRelated(mappedItem.category, mappedItem.id);
        } else {
          // Fallback to static lists
          const staticItem = INITIAL_PRODUCTS.find(p => p.id === productId);
          if (staticItem) {
            setProduct(staticItem);
            fetchRelated(staticItem.category, staticItem.id);
          } else {
            console.error('Course not found in static list.');
            setProduct(null);
          }
        }
      } catch (err) {
        console.error('Error fetching course detail:', err);
        // Fail-safe fallback to static data
        const staticItem = INITIAL_PRODUCTS.find(p => p.id === productId);
        if (staticItem) {
          setProduct(staticItem);
          setRelatedProducts(INITIAL_PRODUCTS.filter(x => x.category === staticItem.category && x.id !== staticItem.id).slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    }

    async function fetchRelated(category: string, currentId: string) {
      try {
        const colRef = collection(db, 'products');
        const qRef = query(colRef, where('category', '==', category), limit(4));
        const snap = await getDocs(qRef);
        const list: Product[] = [];
        snap.forEach((docSnap) => {
          if (docSnap.id !== currentId) {
            const data = docSnap.data() as Product;
            list.push({ 
              id: docSnap.id, 
              ...data,
              image: getProductImage({ id: docSnap.id, image: data.image })
            } as Product);
          }
        });
        setRelatedProducts(list.slice(0, 3));
      } catch (err) {
        console.warn('Error fetching related courses:', err);
        setRelatedProducts(INITIAL_PRODUCTS.filter(x => x.category === category && x.id !== currentId).slice(0, 3));
      }
    }

    fetchProduct();
  }, [productId]);

  const toggleModule = (idx: number) => {
    setExpandedModule(expandedModule === idx ? null : idx);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'administración':
      case 'administracion':
        return <Calculator className="text-white w-12 h-12" />;
      case 'salud':
        return <Heart className="text-white w-12 h-12" />;
      case 'social':
        return <Users className="text-white w-12 h-12" />;
      case 'educación':
      case 'educacion':
        return <GraduationCap className="text-white w-12 h-12" />;
      case 'tecnología':
      case 'tecnologia':
        return <Cpu className="text-white w-12 h-12" />;
      default:
        return <Briefcase className="text-white w-12 h-12" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center bg-[#0a1128]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ee3] mb-4" />
        <p className="text-slate-400 font-bold">Cargando el programa del curso...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center bg-[#0a1128] text-white">
        <span className="text-5xl">🎓</span>
        <h2 className="text-2xl font-black text-white mt-6">¡Oh, no! No pudimos encontrar este curso</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">Es posible que hayamos completado el cupo o pausado el inicio de este trayecto formativo.</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-[#009ee3] hover:bg-[#008bd0] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all"
        >
          Ver Todos los Cursos
        </Link>
      </div>
    );
  }

  const courseData = COURSES.find(c => c.id === product.id);

  return (
    <div className="bg-[#0a1128] min-h-screen py-10 px-4 sm:px-6 md:px-10 text-slate-100">
      <div className="max-w-3xl mx-auto">
        
        {/* Centered Breadcrumb */}
        <div className="text-center text-slate-400 text-[10px] font-black tracking-widest uppercase mb-6">
          CURSOS / {product.category.toUpperCase()}
        </div>

        {/* Centered Presentation Section (Screenshot 2) */}
        <div className="flex flex-col items-center text-center mt-4">
          {/* Custom Category Icon Square Box */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-[#009ee3] rounded-[24px] flex items-center justify-center shadow-lg shadow-sky-500/10 animate-pulse">
              {getCategoryIcon(product.category)}
            </div>
          </div>

          {/* Centered Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4 max-w-2xl">
            {product.name}
          </h1>

          {/* Centered Summary/Description */}
          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Centered Pill Badges */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-10 select-none">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-full text-xs font-bold text-slate-200 shadow-sm">
              <Clock size={14} className="text-[#009ee3]" />
              <span>{product.ageRange.toUpperCase()} HORAS CÁTEDRAS</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-full text-xs font-bold text-slate-200 shadow-sm">
              <Award size={14} className="text-emerald-400" />
              <span>CERTIFICADO NACIONAL</span>
            </div>
          </div>
        </div>

        {/* Integrated Pricing & Purchasing Card */}
        <div className="bg-slate-900/60 backdrop-blur-md text-white p-6 sm:p-8 rounded-[32px] shadow-lg border border-slate-800/80 mb-10 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-6 border-b border-slate-800/60">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider mb-1">
                {courseData?.hours === 675 ? 'Inscripción / Matrícula' : 'Matrícula Única / Inscripción'}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white">
                ${product.price.toLocaleString('es-AR')}
              </span>
              <div className="mt-2 text-[10px] text-slate-300 font-medium leading-relaxed bg-sky-950/30 border border-sky-900/50 p-2.5 rounded-xl max-w-sm">
                <span className="text-[#009ee3] font-bold">Matrícula/Inscripción:</span> ${product.price.toLocaleString('es-AR')} (pago único para iniciar).
                <br />
                <span className="text-amber-400 font-bold">Diploma Digital:</span> Al finalizar la cursada se abona exactamente el mismo valor (${product.price.toLocaleString('es-AR')}) para la entrega del diploma digital.
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5 w-full sm:w-auto min-w-[200px]">
              <button
                onClick={() => { addToCart(product, 1); navigate('/checkout'); }}
                className="w-full bg-[#009ee3] hover:bg-[#008bd0] text-white py-3.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider text-center flex items-center justify-center transition-all shadow-md shadow-sky-500/10"
              >
                Inscribirse Ahora
              </button>
              <button
                onClick={() => addToCart(product, 1)}
                className="w-full py-3 px-6 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all bg-slate-950/80 hover:bg-slate-800 text-slate-100 border border-slate-800"
              >
                <ShoppingBag size={14} />
                Reservar Vacante
              </button>
            </div>
          </div>

          {/* New Custom Academic details section requested by the user */}
          <div className="mt-6 bg-slate-950/50 border border-slate-850 rounded-2xl p-4 sm:p-5 space-y-4">
            <h4 className="text-[11px] text-slate-400 uppercase tracking-widest font-black border-b border-slate-800/80 pb-2">Información Académica y Legal</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-sky-500/10 text-[#009ee3] mt-0.5 shrink-0">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-200 block uppercase tracking-wider">Metodología de Cursada</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">Se cursa de forma 100% libre. Cursas libremente a tu ritmo desde la comodidad de tu hogar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-200 block uppercase tracking-wider">Certificación con Aval Nacional</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">El certificado final está plenamente avalado por la Ley de Educación Nacional N° 26.206.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
                    <Clock size={14} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-200 block uppercase tracking-wider">Duración del Trayecto</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">Flexibilidad absoluta: puedes completarlo en un lapso de 1 mes hasta 1 año, según tu disponibilidad.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5 shrink-0">
                    <GraduationCap size={14} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-200 block uppercase tracking-wider">Instancia de Examen y Diploma</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Se rinde libre de forma remota una vez completada la lectura de los módulos. La emisión y entrega del diploma digital tiene exactamente el mismo costo de la inscripción (${product.price.toLocaleString('es-AR')}), abonándose únicamente al finalizar la cursada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-6 mt-2 text-[11px] font-bold text-slate-300 border-t border-slate-800/60">
            <div className="flex items-center gap-2 justify-center">
              <Clock size={16} className="text-[#009ee3]" />
              <span>Acceso Inmediato 24hs</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Award size={16} className="text-[#25D366]" />
              <span>Garantía de Satisfacción</span>
            </div>
          </div>
        </div>

        {/* Detailed Description & policy tabs */}
        <div className="mt-8 bg-slate-900/60 backdrop-blur-md p-6 sm:p-10 rounded-[36px] shadow-sm border border-slate-800/80 text-left text-slate-300">
          
          <div className="flex border-b border-slate-800 gap-6 select-none pb-3 overflow-x-auto mb-6">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2.5 font-black text-xs uppercase tracking-widest border-b-2 transition-all block whitespace-nowrap ${activeTab === 'desc' ? 'border-[#009ee3] text-[#009ee3]' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
            >
              Programa y Objetivos
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2.5 font-black text-xs uppercase tracking-widest border-b-2 transition-all block whitespace-nowrap ${activeTab === 'specs' ? 'border-[#009ee3] text-[#009ee3]' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
            >
              Detalle del curso
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-2.5 font-black text-xs uppercase tracking-widest border-b-2 transition-all block whitespace-nowrap ${activeTab === 'shipping' ? 'border-[#009ee3] text-[#009ee3]' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
            >
              Metodología y Acceso
            </button>
          </div>

          <div>
            {activeTab === 'desc' && (
              <div className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-medium space-y-6">
                <div>
                  <h3 className="text-base font-black text-white mb-2">Objetivo del Trayecto Formativo</h3>
                  <p>{courseData?.objective || product.description}</p>
                </div>

                {courseData?.summary && (
                  <div>
                    <h3 className="text-base font-black text-white mb-2">Resumen Curricular</h3>
                    <p>{courseData.summary}</p>
                  </div>
                )}

                {courseData?.modules && courseData.modules.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                      📚 Contenidos del Plan de Estudios
                    </h3>
                    <div className="space-y-3">
                      {courseData.modules.map((mod: any, index: number) => {
                        const isExpanded = expandedModule === index;
                        return (
                          <div 
                            key={index} 
                            className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40"
                          >
                            <button
                              onClick={() => toggleModule(index)}
                              className="w-full flex items-center justify-between p-4 bg-slate-900/80 text-left font-black text-white text-xs sm:text-sm"
                            >
                              <span>{mod.title}</span>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {isExpanded && (
                              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 space-y-4">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Unidades Temáticas:</h4>
                                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {mod.topics.map((topic: string, tIdx: number) => (
                                      <li key={tIdx} className="flex items-start gap-2 text-xs text-slate-300 font-medium">
                                        <CheckCircle size={14} className="text-[#25D366] shrink-0 mt-0.5" />
                                        <span>{topic}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-400 font-medium">
                                  <span>📝 <strong>Evaluación:</strong> {mod.evaluation}</span>
                                  {mod.assignment && (
                                    <span className="bg-amber-950/40 text-amber-300 border border-amber-900/50 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                                      Incluye Trabajo Práctico Integrador
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {courseData?.programUrl && (
                  <div className="pt-4 text-center">
                    <a
                      href={courseData.programUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-850 text-slate-200 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all border border-slate-800"
                    >
                      <Download size={14} /> Descargar Programa Oficial en PDF
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Carga Horaria Total</span>
                  <span className="font-black text-white">{product.ageRange}</span>
                </div>
                <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Soporte Tutorial</span>
                  <span className="font-black text-white">Online (Lunes a Sábado)</span>
                </div>
                <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Certificación Obtenida</span>
                  <span className="font-black text-white">Certificado Profesional Nexts.Online</span>
                </div>
                <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Modalidad de Examen</span>
                  <span className="font-black text-white">TP + Multiple Choice Online</span>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-medium space-y-4">
                <p><strong>⏰ Cursada Flex:</strong> Estudias en los días y horarios de tu conveniencia. Una vez completado el pago de matrícula, recibes en tu email las credenciales de acceso al Campus Virtual con todas las clases grabadas, guías, foros de debate y carpetas de estudio precargadas.</p>
                <p><strong>💳 Medios de Pago Admitidos:</strong> Esta plataforma utiliza pasarelas encriptadas seguras:</p>
                <div className="flex gap-2 flex-wrap pt-2">
                  <span className="bg-[#eaf6fc]/10 text-sky-400 border border-[#009ee3]/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase">Mercado Pago</span>
                  <span className="bg-[#eaf6fc]/10 text-sky-400 border border-[#009ee3]/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase">Stripe (Tarjetas de crédito/débito)</span>
                  <span className="bg-[#eaf6fc]/10 text-sky-400 border border-[#009ee3]/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase">Transferencias de Home Banking</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 text-left">
            <h3 className="text-white text-lg font-black tracking-wider uppercase mb-6 flex items-center gap-2 select-none">
              🎓 Otros Cursos de Formación Profesional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-[28px] hover:shadow-md transition-all duration-300 flex items-center gap-3 text-left group"
                >
                  <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[9px] font-bold text-[#009ee3] block uppercase tracking-wider">{p.category}</span>
                    <h4 className="text-xs font-black text-white truncate">{p.name}</h4>
                    <span className="text-xs font-extrabold text-white block mt-1">${p.price.toLocaleString('es-AR')}</span>
                  </div>
                  <Link
                    to={`/product/${p.id}`}
                    className="bg-slate-950 hover:bg-[#009ee3] hover:text-white p-2 text-xs font-black uppercase text-slate-200 rounded-full transition-colors shrink-0 flex items-center justify-center border border-slate-800"
                    title="Ver Programa"
                  >
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
