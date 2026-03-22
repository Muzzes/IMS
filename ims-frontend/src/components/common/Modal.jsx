import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 transition-opacity backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
        <div className={`relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 w-full ${sizeClasses[size]} animate-in zoom-in-95 duration-200`}>
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="px-6 py-4 max-h-[calc(100vh-150px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
