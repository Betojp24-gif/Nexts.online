import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#02050c] text-slate-300">
      
      {/* Upper footer with learning benefits */}
      <div className="bg-[#0c1833]/50 border-y border-slate-900 py-8 select-none">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex gap-3 items-center flex-col sm:flex-row p-2">
            <span className="text-3xl">💻</span>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Estudio Flexible</h4>
              <p className="text-[11px] text-slate-400 font-medium">Estudiá a tu propio ritmo desde cualquier dispositivo.</p>
            </div>
          </div>
          <div className="flex gap-3 items-center flex-col sm:flex-row p-2">
            <span className="text-3xl">🛡️</span>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Pago Seguro</h4>
              <p className="text-[11px] text-slate-400 font-medium">Líneas de pago encriptadas y protegidas.</p>
            </div>
          </div>
          <div className="flex gap-3 items-center flex-col sm:flex-row p-2">
            <span className="text-3xl">🎓</span>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Certificado Oficial</h4>
              <p className="text-[11px] text-slate-400 font-medium">Al completar el curso recibís tu certificación avalada.</p>
            </div>
          </div>
          <div className="flex gap-3 items-center flex-col sm:flex-row p-2">
            <span className="text-3xl">💬</span>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Tutoría Directa</h4>
              <p className="text-[11px] text-slate-400 font-medium">Acompañamiento docente continuo por chat y email.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-xl font-black tracking-tight select-none">
              <img 
                src="/logo.jpg" 
                alt="Nexts.Online Logo" 
                className="w-8 h-8 rounded-lg object-cover border border-slate-800"
                referrerPolicy="no-referrer"
              />
              <div className="flex text-xl font-black tracking-tight font-sans">
                <span className="text-white">Nexts</span>
                <span className="text-[#009ee3]">.Online</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed max-w-sm font-medium">
              Plataforma líder en e-learning y capacitación profesional rápida. Brindamos herramientas teóricas y prácticas para lograr una salida laboral directa en Administración, Salud, Educación y Tecnología.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="hover:text-[#009ee3] bg-white/5 p-2 rounded-full transition-colors"><Facebook size={16} /></a>
              <a href="#" className="hover:text-[#009ee3] bg-white/5 p-2 rounded-full transition-colors"><Instagram size={16} /></a>
              <a href="#" className="hover:text-[#009ee3] bg-white/5 p-2 rounded-full transition-colors"><Twitter size={16} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Contacto e Informes</h4>
            <ul className="space-y-3 text-xs font-medium text-slate-400">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#009ee3]" /> nexts.online@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#009ee3]" /> +54 9 11 6613-4186
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-[#009ee3]" /> Av. de Mayo 800, CABA, Argentina
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Políticas e Info</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li><Link to="/terminos" className="hover:text-white transition-colors">Términos y Condiciones del Servicio</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Botón de Arrepentimiento</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Defensa del Consumidor</a></li>
            </ul>
          </div>
        </div>
        
        {/* Payment options logo visual display to support the payment setup */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
          <div>
            © {new Date().getFullYear()} Nexts.Online. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
