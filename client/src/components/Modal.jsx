import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, Lock, Calendar, FileText } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, content = '', date }) => {
  const modalRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset copied state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate statistics
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  // Clipboard copy handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Formatted date
  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glass backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 dark:bg-slate-950/60"
        onClick={onClose}
      />

      {/* Premium Modal Box */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-lg transition-all duration-300 dark:border-slate-850 dark:bg-slate-900/95 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
      >
        {/* Top visual accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all focus:outline-none"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80 items-start">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 text-white shadow-lg shadow-primary-500/20">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-7 break-words pr-2">
              {title}
            </h3>
            {formattedDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Note Content Viewport */}
        <div className="flex-1 overflow-y-auto py-5">
          <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800 p-5 rounded-2xl max-h-[45vh] overflow-y-auto font-sans leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words text-sm tracking-wide">
            {content || <span className="italic text-slate-400">Empty note</span>}
          </div>
        </div>

        {/* Note Statistics Bar */}
        <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
          {/* Metrics labels */}
          <div className="flex gap-3 text-xs text-slate-400 dark:text-slate-500 font-mono font-medium">
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
              <FileText className="w-3.5 h-3.5" />
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
              {charCount} {charCount === 1 ? 'char' : 'chars'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 focus:outline-none shadow-md ${copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/10'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 shadow-slate-500/5'
                }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Content</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
