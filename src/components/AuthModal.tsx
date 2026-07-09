import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Lock, User, Phone, IdCard, Camera, LogIn, UserPlus, Chrome, RefreshCw, Eye, EyeOff } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, signUpWithEmail, signInWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    profileImage: ''
  });

  const hasMinLength = formData.password.length >= 6;
  const hasNumber = /\d/.test(formData.password);
  const hasLetter = /[a-zA-Z]/.test(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCapture = (image: string) => {
    setFormData(prev => ({ ...prev, profileImage: image }));
    setShowCamera(false);
    toast.success('Selfie capturada con éxito');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(formData.email, formData.password);
        toast.success('¡Bienvenido de nuevo!');
      } else {
        // Validar requisitos de la contraseña antes de registrarse
        if (!hasMinLength) {
          toast.error('La contraseña debe tener al menos 6 caracteres.');
          setLoading(false);
          return;
        }
        if (!hasLetter || !hasNumber) {
          toast.error('La contraseña debe incluir al menos una letra y un número.');
          setLoading(false);
          return;
        }
        const { email, password, ...profileData } = formData;
        await signUpWithEmail(email, password, profileData);
        toast.success('Cuenta creada con éxito. ¡Bienvenido a Nexts.Online!');
      }
      onClose();
    } catch (err: any) {
      console.error('Auth Error:', err?.code, err?.message);
      
      let errorMessage = 'Ocurrió un error al procesar tu solicitud';
      
      switch (err?.code) {
        case 'auth/operation-not-allowed':
          errorMessage = 'El registro con Correo y Contraseña está desactivado en la consola de tu proyecto Firebase. Por favor actívalo en Firebase Console (Authentication > Sign-in method) o regístrate/ingresa al instante usando el botón de Google.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Por favor, verifica tu internet o intenta nuevamente en unos segundos.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está registrado. Prueba iniciando sesión o usa otro correo.';
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico no es válido.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Tu cuenta ha sido temporalmente bloqueada por seguridad.';
          break;
        default:
          errorMessage = err?.message || errorMessage;
      }
      
      toast.error(errorMessage, { duration: 8000 }); // Longer toast to read instructions if needed
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await login();
      toast.success('Acceso exitoso con Google');
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err?.code, err?.message);
      if (err?.code === 'auth/network-request-failed') {
        toast.error('Error de conexión con Google. Revisa tu internet e intenta de nuevo.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        toast.error('La ventana de inicio de sesión fue cerrada.');
      } else if (err?.code === 'auth/popup-blocked') {
        toast.error('El navegador bloqueó la ventana emergente de Google. Por favor, habilita las ventanas emergentes (popups) para este sitio.');
      } else {
        toast.error(err?.message || 'Error al conectar con Google');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0B0F19] text-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden relative border border-slate-800"
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors z-10"
        >
          <X size={18} />
        </button>

        {showCamera ? (
          <div className="p-6">
            <h2 className="text-xl font-black text-white mb-4 text-center tracking-tight uppercase">Cargar Selfie</h2>
            <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                {isLogin ? 'Ingresar a Nexts.Online' : 'Crear nueva cuenta'}
              </h2>
              <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
                {isLogin ? 'El futuro de tu educación te espera' : 'Únete a la red educativa más grande del país'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                {!isLogin && (
                  <>
                    <div className="space-y-1 col-span-1">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          required
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Nombre"
                          className="w-full h-11 pl-10 pr-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:bg-slate-950 focus:border-transparent transition-all text-xs font-semibold text-white placeholder-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 col-span-1">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          required
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Apellido"
                          className="w-full h-11 pl-10 pr-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:bg-slate-950 focus:border-transparent transition-all text-xs font-semibold text-white placeholder-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 col-span-1">
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          required
                          name="dni"
                          value={formData.dni}
                          onChange={handleChange}
                          placeholder="DNI"
                          className="w-full h-11 pl-10 pr-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:bg-slate-950 focus:border-transparent transition-all text-xs font-semibold text-white placeholder-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 col-span-1">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          required
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Teléfono"
                          className="w-full h-11 pl-10 pr-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:bg-slate-950 focus:border-transparent transition-all text-xs font-semibold text-white placeholder-slate-500"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className={`w-full h-11 border border-dashed ${formData.profileImage ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' : 'border-slate-800 text-slate-400 hover:bg-slate-950/60'} rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs`}
                      >
                        {formData.profileImage && formData.profileImage.trim() !== "" ? (
                          <>
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              <img src={formData.profileImage} className="w-full h-full object-cover" />
                            </div>
                            <span>Selfie cargada</span>
                          </>
                        ) : (
                          <>
                            <Camera size={16} />
                            <span>Tómate una selfie (Opcional)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email institucional / personal"
                    className="w-full h-11 pl-10 pr-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:bg-slate-950 focus:border-transparent transition-all text-xs font-semibold text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    className="w-full h-11 pl-10 pr-10 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:bg-slate-950 focus:border-transparent transition-all text-xs font-semibold text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password real-time requirements visualizer when registering */}
                {!isLogin && formData.password.length > 0 && (
                  <div className="mt-2 p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Requisitos de seguridad:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <div className={`flex items-center gap-1.5 text-[9px] font-bold transition-all ${hasMinLength ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${hasMinLength ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`}></span>
                        <span>Mín. 6 carac.</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[9px] font-bold transition-all ${hasNumber ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${hasNumber ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`}></span>
                        <span>Un número</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[9px] font-bold transition-all ${hasLetter ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${hasLetter ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`}></span>
                        <span>Una letra</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#009ee3] hover:bg-[#008bd0] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#009ee3]/10 disabled:opacity-50 flex items-center justify-center gap-2 pt-0.5"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <>
                    {isLogin ? <LogIn size={15} /> : <UserPlus size={15} />}
                    <span>{isLogin ? 'Ingresar' : 'Registrarme'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <span className="relative px-3 bg-[#0B0F19] text-slate-500 text-[9px] font-black uppercase tracking-widest">O continúa con</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-11 border border-slate-800 bg-slate-950/40 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-950 transition-all font-black text-xs uppercase tracking-wider text-slate-300 hover:text-white"
              >
                <Chrome size={15} className="text-[#009ee3]" />
                {isLogin ? 'Ingresar con Google' : 'Registrarse con Google'}
              </button>
            </div>

            <p className="mt-6 text-center text-xs font-semibold text-slate-400">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1.5 text-[#009ee3] hover:underline font-black"
              >
                {isLogin ? 'Regístrate ahora' : 'Ingresa aquí'}
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
