import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Mail, MailOpen, Trash2 } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import PageSpinner from '../../components/ui/PageSpinner'
import Modal from '../../components/ui/Modal'
import { formatDateTime } from '../../lib/format'

export default function Messages() {
  const qc = useQueryClient()
  const [filters, setFilters] = useState({ status: '', page: 1 })
  const [active, setActive] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['admin-messages', filters], queryFn: () => admin.adminGetMessages(filters) })

  const openMessage = useMutation({
    mutationFn: admin.adminGetMessage,
    onSuccess: (msg) => {
      setActive(msg)
      qc.invalidateQueries({ queryKey: ['admin-messages'] })
    },
  })
  const remove = useMutation({
    mutationFn: admin.adminDeleteMessage,
    onSuccess: () => {
      toast.success('Message deleted')
      qc.invalidateQueries({ queryKey: ['admin-messages'] })
      setActive(null)
    },
  })

  if (isLoading && !data) return <PageSpinner />

  return (
    <div>
      <PageHeader title="Messages" description="Contact form submissions" />

      <div className="mb-4 flex gap-2">
        {[{ v: '', l: 'All' }, { v: 'unread', l: 'Unread' }, { v: 'read', l: 'Read' }].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setFilters({ status: opt.v, page: 1 })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filters.status === opt.v ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            {opt.l}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {data?.data.map((m) => (
          <button key={m.id} onClick={() => openMessage.mutate(m.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
            {m.is_read ? <MailOpen size={16} className="text-slate-300" /> : <Mail size={16} className="text-brand-600" />}
            <div className="flex-1">
              <p className={`text-sm ${m.is_read ? 'text-slate-600' : 'font-semibold text-slate-800'}`}>{m.name} — {m.subject || 'No subject'}</p>
              <p className="text-xs text-slate-400">{m.email}</p>
            </div>
            {!m.is_read && <Badge tone="brand">New</Badge>}
            <span className="text-xs text-slate-400">{formatDateTime(m.created_at)}</span>
          </button>
        ))}
        {!data?.data.length && <p className="py-10 text-center text-sm text-slate-400">No messages</p>}
      </div>

      <Pagination meta={data?.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.subject || 'Message'}>
        {active && (
          <div className="space-y-3 text-sm">
            <p><span className="font-semibold text-slate-700">From:</span> {active.name} ({active.email})</p>
            <p className="whitespace-pre-line text-slate-600">{active.message}</p>
            <p className="text-xs text-slate-400">{formatDateTime(active.created_at)}</p>
            <button onClick={() => remove.mutate(active.id)} className="flex items-center gap-1 text-sm font-semibold text-red-500">
              <Trash2 size={14} /> Delete Message
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
