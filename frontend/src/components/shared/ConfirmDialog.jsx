import { AlertTriangle } from 'lucide-react';

/**
 * Simple confirm dialog overlay.
 *
 * Usage:
 * <ConfirmDialog
 *   open={showConfirm}
 *   title="Delete Member?"
 *   description="This will permanently remove this member."
 *   confirmLabel="Delete Member"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 *   danger
 * />
 */
export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="flex gap-4">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${danger ? 'bg-accent-50' : 'bg-church-50'}`}>
            <AlertTriangle size={20} className={danger ? 'text-accent-700' : 'text-church-700'} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {description ? <p className="mt-1.5 text-sm text-slate-600">{description}</p> : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-outline">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
