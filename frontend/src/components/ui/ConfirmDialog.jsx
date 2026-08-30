import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Delete', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      {description && <p className="mb-6 text-sm text-slate-500">{description}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
