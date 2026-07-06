import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: "Ana Martínez",
    role: "Estudiante de RRHH",
    text: "La flexibilidad de Next.ar me permitió estudiar mientras trabajaba. Los contenidos son de altísima calidad.",
    rating: 5,
    photo: ""
  },
  {
    id: 2,
    name: "Carlos Gómez",
    role: "Admin. de PyMEs",
    text: "Excelente plataforma. El curso de Administración me brindó las herramientas que necesitaba para mi emprendimiento.",
    rating: 5,
    photo: ""
  },
  {
    id: 3,
    name: "Lucía Fernández",
    role: "Acompañante Terapéutico",
    text: "Los docentes siempre están presentes para responder dudas. El certificado digital fue validado de inmediato.",
    rating: 4,
    photo: ""
  }
];

export default function ReviewCarousel() {
  const [current, setCurrent] = React.useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % reviews.length);
  const prev = () => setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);

  React.useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-app-bg py-12 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="review-carousel bg-card-bg border border-app-border rounded-[12px] p-8 shadow-sm">
          <div className="review-title flex justify-between items-center mb-6 text-[12px] font-bold text-text-muted tracking-widest uppercase">
            <span>RESEÑAS DE ESTUDIANTES</span>
            <div className="flex gap-4">
              <button onClick={prev} className="hover:text-accent transition-colors">&larr;</button>
              <button onClick={next} className="hover:text-accent transition-colors">&rarr;</button>
            </div>
          </div>

          <div className="review-track flex gap-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="review-item flex-1 border-l-2 border-accent/20 pl-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-accent font-black text-xs">
                    {reviews[current].name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="review-text text-[15px] italic text-text-main mb-4 leading-relaxed line-clamp-3">
                    "{reviews[current].text}"
                  </p>
                  <div className="review-author text-[11px] text-text-muted font-bold tracking-wide uppercase">
                    — {reviews[current].name} ({reviews[current].role})
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Show second review if exists for desktop layout feel */}
            <div className="hidden md:block review-item flex-1 border-l-2 border-accent/20 pl-6 opacity-40 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center shrink-0">
                <span className="text-accent font-black text-xs">
                  {reviews[(current + 1) % reviews.length].name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="review-text text-[15px] italic text-text-main mb-4 leading-relaxed line-clamp-3">
                  "{reviews[(current + 1) % reviews.length].text}"
                </p>
                <div className="review-author text-[11px] text-text-muted font-bold tracking-wide uppercase">
                  — {reviews[(current + 1) % reviews.length].name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

