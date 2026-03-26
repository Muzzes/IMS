import Modal from './Modal';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  secondaryAction,
  secondaryText,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl shrink-0" style={{ background: danger ? 'var(--danger-bg)' : 'var(--warning-bg)' }}>
            <HiOutlineExclamationTriangle className="w-5 h-5" style={{ color: danger ? 'var(--danger-text)' : 'var(--warning-text)' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{message}</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-ghost"
          >
            {cancelText}
          </button>
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction}
              disabled={loading}
              className="btn-ghost"
            >
              {secondaryText || 'Archive'}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
