import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error' | 'warning';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-0 bottom-8 z-[500] flex items-center justify-center p-4 pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20, transition: { duration: 0.2 } }}
                layout
                className={`flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl pointer-events-auto min-w-[320px] backdrop-blur-xl ${
                  toast.type === 'error' 
                    ? "bg-red-500/90 text-white border border-red-400/30" 
                    : toast.type === 'warning'
                    ? "bg-amber-500/90 text-white border border-amber-400/30"
                    : "bg-[#1E1E2D]/90 text-white border border-white/10"
                }`}
              >
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${
                  toast.type === 'error' ? "bg-white/20" : toast.type === 'warning' ? "bg-white/20" : "bg-green-500/20"
                }`}>
                  {toast.type === 'error' ? (
                    <X className="w-5 h-5 text-white" />
                  ) : toast.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-white" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm leading-tight">{toast.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
