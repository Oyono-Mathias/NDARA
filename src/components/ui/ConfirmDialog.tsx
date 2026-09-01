import React from 'react';
import { Dialog } from './dialog';
import { Button } from './button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  danger = false,
  loading = false,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={loading ? () => {} : onCancel} title={title}>
      <div className="py-2">
        <p className="text-gray-600 text-base">{description}</p>
      </div>
      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          fullWidth
          className="sm:w-auto"
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
          fullWidth
          className="sm:w-auto"
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  );
};
