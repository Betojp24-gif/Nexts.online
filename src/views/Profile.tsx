import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth as firebaseAuth } from '../lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, Lock, Save, Shield, Camera, AlertCircle, X, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import CameraCapture from '../components/CameraCapture';

export default function Profile() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dni: '',
    profileImage: ''
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleCapture = (image: string) => {
    setFormData(prev => ({ ...prev, profileImage: image }));
    setShowCamera(false);
    toast.success('Nueva selfie capturada. No olvides guardar los cambios.');
  };

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        dni: userProfile.dni || '',
        profileImage: userProfile.profileImage || ''
      });
    }
  }, [userProfile]);

  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      await refreshProfile();
      toast.success('Perfil actualizado correctamente');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      // For password updates, Firebase usually requires recent login.
      // If they are Google users, they might not have a password set.
      const credential = EmailAuthProvider.credential(user.email!, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);
      
      toast.success('Contraseña actualizada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
    } catch (err: any) {
      console.error('Error updating password:', err);
      if (err.code === 'auth/wrong-password') {
        toast.error('La contraseña actual es incorrecta');
      } else if (err.code === 'auth/requires-recent-login') {
        toast.error('Por seguridad, cierra sesión e ingresa nuevamente para cambiar tu contraseña');
      } else {
        toast.error('Error al actualizar la contraseña. Los usuarios de Google deben gestionar su contraseña en su cuenta de Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-primary mb-2">Mi Perfil</h1>
        <p className="text-text-muted">Administra tu información personal y seguridad de la cuenta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Profile Pic & Info */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-card-bg rounded-[32px] p-8 border border-app-border items-center flex flex-col shadow-sm text-center">
             <div 
                className="relative group mb-6 cursor-pointer"
                onClick={() => setShowCamera(true)}
              >
                <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                   {formData.profileImage && formData.profileImage.trim() !== "" ? (
                     <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <User size={48} className="text-slate-300" />
                   )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Camera className="text-white" size={24} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                   <Camera size={16} />
                </div>
             </div>
             <h2 className="text-xl font-bold text-primary truncate w-full">{formData.firstName} {formData.lastName}</h2>
             <p className="text-xs font-bold text-accent uppercase tracking-widest mt-1">{userProfile?.role}</p>
             <p className="text-sm text-text-muted mt-2 truncate w-full">{user?.email}</p>
          </section>

          <AnimatePresence>
            {showCamera && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full relative"
                >
                  <button 
                    onClick={() => setShowCamera(false)}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                  <h3 className="text-2xl font-black text-primary mb-6 text-center tracking-tight">Cargar Selfie</h3>
                  <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {isGoogleUser && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
              <Shield className="text-blue-600 shrink-0" size={20} />
              <p className="text-xs text-blue-700 leading-relaxed">
                Estás utilizando <strong>Google</strong> para iniciar sesión. Tu contraseña se gestiona directamente en tu cuenta de Google.
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Data */}
          <section className="bg-card-bg rounded-[32px] p-8 border border-app-border shadow-sm">
            <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
              <User size={20} className="text-accent" />
              Datos Personales
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Nombre</label>
                  <input 
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 border border-app-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Apellido</label>
                  <input 
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 border border-app-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">DNI</label>
                  <input 
                    type="text"
                    value={formData.dni}
                    onChange={e => setFormData({...formData, dni: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 border border-app-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-900"
                    placeholder="Sin puntos"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-app-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-900"
                      placeholder="+54 9..."
                    />
                  </div>
                </div>
              </div>

              {/* Removed Profile Image URL input as it's handled by CameraCapture */}

              <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
              >
                <Save size={20} />
                Guardar Cambios
              </button>
            </form>
          </section>

          {/* Security / Password */}
          {!isGoogleUser && (
            <section className="bg-card-bg rounded-[32px] p-8 border border-app-border shadow-sm">
              <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
                <Lock size={20} className="text-accent" />
                Seguridad
              </h3>
              
              {!showPasswordFields ? (
                <button 
                  onClick={() => setShowPasswordFields(true)}
                  className="text-accent font-bold text-sm hover:underline"
                >
                  Cambiar contraseña
                </button>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Contraseña Actual</label>
                      <div className="relative">
                        <input 
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={passwordData.currentPassword}
                          onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full h-12 pl-4 pr-12 bg-slate-50 border border-app-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Nueva Contraseña</label>
                        <div className="relative">
                          <input 
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full h-12 pl-4 pr-12 bg-slate-50 border border-app-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Confirmar Nueva Contraseña</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full h-12 pl-4 pr-12 bg-slate-50 border border-app-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-4 bg-accent text-white font-black rounded-2xl hover:bg-accent-hover shadow-lg transition-all disabled:opacity-50"
                    >
                      Actualizar Contraseña
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowPasswordFields(false)}
                      className="text-text-muted font-bold text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {isGoogleUser && (
            <section className="bg-slate-50 rounded-[32px] p-8 border border-dashed border-slate-200">
               <div className="flex items-start gap-4">
                  <AlertCircle className="text-slate-400 shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">Gestión de Seguridad</h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      Al estar vinculado con Google, no necesitas gestionar una contraseña local. Tu cuenta está protegida por los protocolos de seguridad de Google. Si deseas cambiar tu contraseña, debes hacerlo desde la configuración de tu cuenta de Google.
                    </p>
                  </div>
               </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
