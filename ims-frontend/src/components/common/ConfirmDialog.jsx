import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmColor = 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="sm:flex sm:items-start mb-6">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left text-sm text-gray-500 dark:text-gray-400">
          <p>{message}</p>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
        <button
          type="button"
          className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none sm:w-auto sm:text-sm transition-colors ${confirmColor}`}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmText}
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
