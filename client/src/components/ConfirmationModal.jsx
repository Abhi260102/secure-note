import React, { useEffect, useRef } from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
}) => {
  const cancelBtnRef = useRef(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Focus the cancel button on open for accessibility / safety
  useEffect(() => {
    if (isOpen && cancelBtnRef.current) {
      setTimeout(() => cancelBtnRef.current.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Type styling configuration
  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      bgIcon: 'bg-rose-100 dark:bg-rose-955/40',
      btnClass: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/10 focus:ring-rose-500',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      bgIcon: 'bg-amber-100 dark:bg-amber-955/40',
      btnClass: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/10 focus:ring-amber-500',
    },
    info: {
      icon: <HelpCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />,
      bgIcon: 'bg-primary-100 dark:bg-primary-955/40',
      btnClass: 'bg-primary-600 hover:bg-primary-500 shadow-primary-500/10 focus:ring-primary-500',
    },
  };

  const { icon, bgIcon, btnClass } = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 dark:bg-slate-950/60"
        onClick={onCancel}
      />

      {/* Modal Container */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 text-left align-middle shadow-xl transition-all duration-300 dark:border-slate-800/85 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="flex gap-4">
          {/* Icon Badge */}
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${bgIcon}`}>
            {icon}
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-6">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {message}
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            ref={cancelBtnRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-md transition-all active:scale-[0.98] ${btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
