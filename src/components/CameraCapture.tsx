import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 400, height: 400 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('No se pudo acceder a la cámara. Por favor, asegúrese de dar los permisos necesarios.');
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-900 p-6 rounded-3xl text-white">
      <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-accent bg-black">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {isStarting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <RefreshCw className="animate-spin" size={32} />
              </div>
            )}
          </>
        ) : (
          <img 
            src={capturedImage} 
            alt="Selfie" 
            className="w-full h-full object-cover scale-x-[-1]" 
          />
        )}
      </div>

      <div className="flex gap-4">
        {!capturedImage ? (
          <>
            <button 
              onClick={onCancel}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <button 
              onClick={captureFrame}
              className="p-4 bg-accent hover:bg-accent-hover rounded-full transition-all shadow-lg scale-110"
            >
              <Camera size={28} />
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={retake}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-bold"
            >
              <RefreshCw size={20} /> Reintentar
            </button>
            <button 
              onClick={confirm}
              className="flex items-center gap-2 px-6 py-2 bg-success hover:bg-success-hover rounded-xl transition-all font-bold shadow-lg"
            >
              <Check size={20} /> Confirmar
            </button>
          </>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <p className="text-xs text-slate-400 text-center max-w-[200px]">
        Para tu perfil institucional, por favor toma una foto clara de tu rostro.
      </p>
    </div>
  );
}
