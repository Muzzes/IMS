import Modal from './Modal';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', danger = true, secondaryAction, secondaryText, loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg flex-shrink-0" style={{ background: danger ? 'var(--danger-bg)' : 'var(--warning-bg)', border: `1px solid ${danger ? 'var(--danger-border)' : 'var(--warning-border)'}` }}>
             <HiOutlineExclamationTriangle className="w-6 h-6" style={{ color: danger ? 'var(--danger-text)' : 'var(--warning-text)' }} />
          </div>
          <p className="font-medium mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{message}</p>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)] mt-6">
          <button type="button" onClick={onClose} disabled={loading} className="btn-ghost">{cancelText}</button>
          {secondaryAction && (
             <button type="button" onClick={secondaryAction} disabled={loading} className="btn-ghost">{secondaryText || 'Archive'}</button>
          )}
          <button type="button" onClick={onConfirm} disabled={loading} className={danger ? 'btn-danger' : 'btn-primary'}>
             {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
