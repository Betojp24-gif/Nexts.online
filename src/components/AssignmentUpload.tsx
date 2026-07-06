import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileCheck, X, AlertCircle, Loader2, Award, RefreshCw } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface AssignmentUploadProps {
  courseId: string;
  moduleId: number;
  assignmentTitle: string;
  onSuccess?: () => void;
}

export default function AssignmentUpload({ courseId, moduleId, assignmentTitle, onSuccess }: AssignmentUploadProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [submission, setSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubmission = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', user.uid),
        where('courseId', '==', courseId),
        where('moduleId', '==', moduleId),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setSubmission({ id: docSnap.id, ...docSnap.data() });
      } else {
        setSubmission(null);
      }
    } catch (err) {
      console.warn('Error loading submission status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [user, courseId, moduleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para entregar trabajos.');
      return;
    }
    if (!fileName.trim()) {
      toast.error('Por favor especifica un nombre de archivo para simular tu entrega.');
      return;
    }

    setIsUploading(true);
    try {
      const submissionData = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Estudiante',
        courseId,
        moduleId,
        fileName: fileName.trim(),
        comment: comment.trim(),
        status: 'pending',
        submittedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'submissions'), submissionData);
      toast.success('¡Trabajo Práctico entregado con éxito!');
      setComment('');
      setFileName('');
      await fetchSubmission();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Hubo un error al entregar el trabajo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResubmit = async () => {
    if (!submission) return;
    if (!confirm('¿Seguro de volver a entregar? Esto borrará tu entrega anterior.')) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'submissions', submission.id));
      setSubmission(null);
      toast.info('Se habilitó el formulario para tu nueva entrega.');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo iniciar el reenvío.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6 text-slate-400 gap-2">
        <Loader2 className="animate-spin" size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Cargando estado de entrega...</span>
      </div>
    );
  }

  // Student has an active submission
  if (submission) {
    const isApproved = submission.status === 'Aprobado';
    const isRedo = submission.status === 'Rehacer';
    const dateStr = submission.submittedAt?.seconds 
      ? new Date(submission.submittedAt.seconds * 1000).toLocaleDateString() 
      : 'Recientemente';

    return (
      <div className={`p-5 rounded-2xl border text-left space-y-4 ${
        isApproved 
          ? 'bg-green-50/50 border-green-200' 
          : isRedo 
            ? 'bg-red-50/50 border-red-200' 
            : 'bg-amber-50/50 border-amber-200'
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isApproved 
                ? 'bg-green-100 text-green-700' 
                : isRedo 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-amber-100 text-amber-700'
            }`}>
              <FileCheck size={20} />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">Entrega: {submission.fileName}</h5>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Entregado el: {dateStr}</p>
            </div>
          </div>
          
          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
            isApproved 
              ? 'bg-green-100 text-green-700 border-green-200' 
              : isRedo 
                ? 'bg-red-100 text-red-700 border-red-200' 
                : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}>
            {submission.status === 'pending' ? 'Pendiente' : submission.status}
          </span>
        </div>

        {submission.comment && (
          <div className="p-3 bg-white rounded-xl border border-gray-100 text-[11px]">
            <span className="font-black text-slate-400 uppercase tracking-widest text-[9px] block mb-1">Tu comentario adjunto:</span>
            <p className="text-slate-600 font-medium italic">"{submission.comment}"</p>
          </div>
        )}

        {submission.feedback ? (
          <div className={`p-4 rounded-xl border space-y-1.5 ${isApproved ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
            <span className={`font-black uppercase tracking-wider text-[9px] block ${isApproved ? 'text-green-700' : 'text-red-700'}`}>Devolución del Docente / Tutor:</span>
            <p className="text-slate-800 text-[11px] font-semibold leading-relaxed">"{submission.feedback}"</p>
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 font-bold italic flex items-center gap-1.5">
            <AlertCircle size={12} /> Tu entrega está en cola para corrección pedagógica por el equipo docente.
          </p>
        )}

        {/* If redo is requested, allow student to re-submit */}
        {isRedo && (
          <button
            type="button"
            onClick={handleResubmit}
            className="w-full bg-[#009ee3] hover:bg-[#008bd0] text-white py-2 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <RefreshCw size={12} /> Re-entregar Trabajo Práctico
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-left">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-sky-50 text-[#009ee3] rounded-xl flex items-center justify-center shrink-0">
          <Upload size={18} />
        </div>
        <div>
          <h4 className="font-extrabold text-slate-950 text-xs sm:text-sm">Presentar {assignmentTitle}</h4>
          <p className="text-[10px] text-slate-400 font-semibold">Formatos permitidos en campus: PDF, DOCX, ZIP o Enlace</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Nombre del Archivo / Documento</label>
            <input
              type="text"
              required
              placeholder="Ej: tp1_contabilidad_apellido.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 outline-none rounded-xl px-3 py-2 text-slate-900 focus:border-[#009ee3]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Comentario al Tutor (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Envío módulo 1 terminado. Dudas en pág 4."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 outline-none rounded-xl px-3 py-2 text-slate-900 focus:border-[#009ee3]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-[#009ee3] hover:bg-[#008bd0] disabled:bg-slate-200 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/10"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" size={14} /> Enviando entrega...
            </>
          ) : (
            <>
              Entregar Trabajo Práctico
            </>
          )}
        </button>
      </form>
    </div>
  );
}
