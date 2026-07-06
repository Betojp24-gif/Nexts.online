import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, FileText, Lock, AlertCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8 text-[10px] font-black uppercase tracking-[0.2em]">
          <ArrowLeft size={12} /> Volver al Inicio
        </Link>
        
        <div className="border border-slate-100 p-8 md:p-12 bg-slate-50/30 rounded-sm">
          <h1 className="text-xl font-black text-primary mb-8 uppercase tracking-tighter">Términos y Condiciones de Uso</h1>
          
          <div className="space-y-6 text-[11px] md:text-sm text-slate-600 font-mono leading-relaxed text-justify">
            <p className="font-bold text-primary underline mb-2">1. ACEPTACIÓN DE LOS TÉRMINOS</p>
            <p>
              Al acceder y utilizar esta plataforma de aprendizaje, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios. El acceso a la web implica la aceptación plena de estas cláusulas.
            </p>

            <p className="font-bold text-primary underline mb-2">2. POLÍTICA DE NO REEMBOLSO</p>
            <p>
              Debido a la naturaleza digital de nuestros contenidos y al acceso inmediato otorgado al material de estudio tras la inscripción, <span className="uppercase font-black text-black">no se realizarán reembolsos de dinero bajo ninguna circunstancia</span> una vez procesado el pago. El usuario reconoce que al adquirir la cursada, consume el servicio de forma instantánea y renuncia a cualquier derecho de retracto posterior al acceso del panel de control.
            </p>

            <p className="font-bold text-primary underline mb-2">3. USO PERSONAL Y EXCLUSIVO</p>
            <p>
              El acceso a la academia es personal e intransferible. Las credenciales de acceso son de uso exclusivo del usuario registrado. Queda terminantemente prohibido compartir, vender o distribuir el acceso a terceros. Detectar el uso simultáneo o compartido de una cuenta resultará en la suspensión inmediata del servicio sin derecho a reclamo ni compensación económica alguna.
            </p>

            <p className="font-bold text-primary underline mb-2">4. PROPÓSITO DE LA APLICACIÓN</p>
            <p>
              Esta plataforma es una aplicación de aprendizaje didáctico. El objetivo principal es proporcionar herramientas teóricas y metodológicas para la formación personal del estudiante. El contenido es de carácter educativo y no garantiza resultados específicos ni el éxito profesional del usuario. La academia no se hace responsable por el uso que el alumno de a los conocimientos adquiridos.
            </p>

            <p className="font-bold text-primary underline mb-2">5. RECONOCIMIENTO ACADÉMICO Y AVAL DE LOGRO</p>
            <p>
              El certificado de finalización expedido por la plataforma constituye una credencial de carácter privado que refrenda formalmente la culminación exitosa del plan de estudios por parte del discente. Dicho instrumento tiene por objeto testimoniar y convalidar fehacientemente el logro formativo, el compromiso intelectual y la asimilación sustantiva de los saberes específicos impartidos durante la instrucción. Esta constancia académica opera como un aval formal que certifica las aptitudes adquiridas y la perseverancia demostrada por el alumno a lo largo de su trayecto educativo.
            </p>

            <p className="font-bold text-primary underline mb-2">6. ACTUALIZACIONES</p>
            <p>
              La academia se reserva el derecho de modificar estos términos en cualquier momento. El uso continuado de la plataforma tras dichas modificaciones constituirá su aceptación de los nuevos términos legales.
            </p>

            <div className="pt-10 mt-10 border-t border-slate-200">
               <p className="text-[9px] text-slate-400 font-bold">Última revisión: 30 de abril de 2026. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
