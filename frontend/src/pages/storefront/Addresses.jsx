import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import * as account from '../../api/account'
import PageSpinner from '../../components/ui/PageSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import AddressForm from '../../components/account/AddressForm'
import Badge from '../../components/ui/Badge'

export default function Addresses() {
  const qc = useQueryClient()
  const { data: addresses, isLoading } = useQuery({ queryKey: ['addresses'], queryFn: account.getAddresses })
  const [modalAddress, setModalAddress] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const deleteMutation = useMutation({
    mutationFn: account.deleteAddress,
    onSuccess: () => {
      toast.success('Address removed')
      qc.invalidateQueries({ queryKey: ['addresses'] })
      setDeleteId(null)
    },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">My Addresses</h2>
        <Button
          onClick={() => {
            setModalAddress(null)
            setShowModal(true)
          }}
        >
          <Plus size={16} /> Add Address
        </Button>
      </div>

      {!addresses?.length ? (
        <EmptyState icon={MapPin} title="No addresses saved" description="Add an address to speed up checkout." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge>{addr.label}</Badge>
                  {addr.is_default && <Badge tone="brand">Default</Badge>}
                </div>
                <div className="flex gap-2 text-slate-400">
                  <button
                    onClick={() => {
                      setModalAddress(addr)
                      setShowModal(true)
                    }}
                    className="hover:text-brand-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteId(addr.id)} className="hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-800">{addr.full_name}</p>
              <p className="text-sm text-slate-500">{addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state}, {addr.country}</p>
              <p className="text-sm text-slate-500">{addr.phone}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={modalAddress ? 'Edit Address' : 'Add Address'}>
        <AddressForm
          address={modalAddress}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['addresses'] })
            setShowModal(false)
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Remove this address?"
        confirmLabel="Remove"
      />
    </div>
  )
}
