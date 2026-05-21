import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 shadow-emerald-500/5',
    error: 'bg-white/95 dark:bg-slate-900/95 border-rose-200 dark:border-rose-800/60 text-slate-800 dark:text-slate-100 shadow-rose-500/5',
    info: 'bg-white/95 dark:bg-slate-900/95 border-blue-200 dark:border-blue-800/60 text-slate-800 dark:text-slate-100 shadow-blue-500/5',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 flex-shrink-0" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-scale-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${bgColors[type]} max-w-sm`}>
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-grow text-sm font-medium pr-2">{message}</div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-0.5 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
