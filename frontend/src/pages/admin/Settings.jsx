import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import FormField, { inputClass } from '../../components/ui/FormField'
import Button from '../../components/ui/Button'
import PageSpinner from '../../components/ui/PageSpinner'

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'mail', label: 'Mail (SMTP)' },
  { key: 'payment', label: 'Payment' },
  { key: 'shipping', label: 'Shipping & Tax' },
  { key: 'social', label: 'Social Links' },
]

function GeneralTab({ settings, save, saving }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: settings })
  useEffect(() => reset(settings), [settings, reset])

  return (
    <form onSubmit={handleSubmit(save)} className="max-w-xl space-y-4">
      <FormField label="Store Name"><input className={inputClass} {...register('site_name')} /></FormField>
      <FormField label="Tagline"><input className={inputClass} {...register('tagline')} /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Support Email"><input className={inputClass} {...register('support_email')} /></FormField>
        <FormField label="Support Phone"><input className={inputClass} {...register('support_phone')} /></FormField>
        <FormField label="Currency Code"><input className={inputClass} {...register('currency_code')} /></FormField>
        <FormField label="Currency Symbol"><input className={inputClass} {...register('currency_symbol')} /></FormField>
      </div>
      <Button type="submit" loading={saving}>Save General Settings</Button>
    </form>
  )
}

function MailTab({ settings, save, saving }) {
  const { register, handleSubmit, watch, reset } = useForm({ defaultValues: settings })
  const [testEmail, setTestEmail] = useState('')
  const driver = watch('driver')
  useEffect(() => reset(settings), [settings, reset])

  const testMutation = useMutation({
    mutationFn: () => admin.adminSendTestMail(testEmail),
    onSuccess: (data) => toast.success(data.message),
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to send test email'),
  })

  return (
    <div className="max-w-xl space-y-6">
      <form onSubmit={handleSubmit(save)} className="space-y-4">
        <FormField label="Mail Driver">
          <select className={inputClass} {...register('driver')}>
            <option value="log">Log (dev only - view emails in storage/logs/laravel.log)</option>
            <option value="smtp">SMTP (real email delivery)</option>
          </select>
        </FormField>
        {driver === 'smtp' && (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
            <FormField label="SMTP Host" className="col-span-2"><input className={inputClass} {...register('host')} /></FormField>
            <FormField label="Port"><input className={inputClass} {...register('port')} /></FormField>
            <FormField label="Encryption">
              <select className={inputClass} {...register('encryption')}>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="">None</option>
              </select>
            </FormField>
            <FormField label="Username"><input className={inputClass} {...register('username')} /></FormField>
            <FormField label="Password" className="">
              <input type="password" className={inputClass} placeholder={settings.password_set ? '•••••••• (unchanged)' : ''} {...register('password')} />
            </FormField>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="From Address"><input className={inputClass} {...register('from_address')} /></FormField>
          <FormField label="From Name"><input className={inputClass} {...register('from_name')} /></FormField>
        </div>
        <Button type="submit" loading={saving}>Save Mail Settings</Button>
      </form>

      <div className="rounded-lg border border-slate-200 p-4">
        <p className="mb-2 text-sm font-semibold text-slate-700">Send a test email</p>
        <div className="flex gap-2">
          <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
          <Button type="button" variant="outline" onClick={() => testMutation.mutate()} loading={testMutation.isPending} disabled={!testEmail}>
            <Send size={14} /> Send Test
          </Button>
        </div>
      </div>
    </div>
  )
}

function PaymentTab({ settings, save, saving }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: settings })
  useEffect(() => reset(settings), [settings, reset])

  return (
    <form onSubmit={handleSubmit(save)} className="max-w-xl space-y-3">
      <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Cash on Delivery</p>
          <p className="text-xs text-slate-500">Allow customers to pay when the order arrives</p>
        </div>
        <input type="checkbox" {...register('cod_enabled')} className="h-5 w-5 rounded border-slate-300 text-brand-600" />
      </label>
      <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Card Payment (simulated)</p>
          <p className="text-xs text-slate-500">Demo card checkout flow - no real gateway required</p>
        </div>
        <input type="checkbox" {...register('mock_card_enabled')} className="h-5 w-5 rounded border-slate-300 text-brand-600" />
      </label>
      <Button type="submit" loading={saving}>Save Payment Settings</Button>
    </form>
  )
}

function ShippingTab({ settings, save, saving }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: settings })
  useEffect(() => reset(settings), [settings, reset])

  return (
    <form onSubmit={handleSubmit(save)} className="max-w-md space-y-4">
      <FormField label="Flat Shipping Fee"><input type="number" step="0.01" className={inputClass} {...register('flat_fee', { valueAsNumber: true })} /></FormField>
      <FormField label="Free Shipping Threshold"><input type="number" step="0.01" className={inputClass} {...register('free_shipping_threshold', { valueAsNumber: true })} /></FormField>
      <FormField label="Tax Rate (%)"><input type="number" step="0.01" className={inputClass} {...register('tax_rate_percent', { valueAsNumber: true })} /></FormField>
      <Button type="submit" loading={saving}>Save Shipping Settings</Button>
    </form>
  )
}

function SocialTab({ settings, save, saving }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: settings })
  useEffect(() => reset(settings), [settings, reset])

  return (
    <form onSubmit={handleSubmit(save)} className="max-w-xl space-y-4">
      <FormField label="Facebook URL"><input className={inputClass} {...register('facebook')} /></FormField>
      <FormField label="Instagram URL"><input className={inputClass} {...register('instagram')} /></FormField>
      <FormField label="Twitter / X URL"><input className={inputClass} {...register('twitter')} /></FormField>
      <Button type="submit" loading={saving}>Save Social Links</Button>
    </form>
  )
}

export default function Settings() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('general')
  const { data, isLoading } = useQuery({ queryKey: ['admin-settings'], queryFn: admin.adminGetSettings })

  const saveMutation = useMutation({
    mutationFn: ({ group, values }) => admin.adminUpdateSettings(group, values),
    onSuccess: () => {
      toast.success('Settings saved')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      qc.invalidateQueries({ queryKey: ['public-settings'] })
    },
    onError: () => toast.error('Could not save settings'),
  })

  if (isLoading) return <PageSpinner />

  const save = (group) => (values) => saveMutation.mutate({ group, values })

  return (
    <div>
      <PageHeader title="Store Settings" description="Everything here is dynamic - changes apply instantly, no redeploy needed" />

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {tab === 'general' && <GeneralTab settings={data.general} save={save('general')} saving={saveMutation.isPending} />}
        {tab === 'mail' && <MailTab settings={data.mail} save={save('mail')} saving={saveMutation.isPending} />}
        {tab === 'payment' && <PaymentTab settings={data.payment} save={save('payment')} saving={saveMutation.isPending} />}
        {tab === 'shipping' && <ShippingTab settings={data.shipping} save={save('shipping')} saving={saveMutation.isPending} />}
        {tab === 'social' && <SocialTab settings={data.social} save={save('social')} saving={saveMutation.isPending} />}
      </div>
    </div>
  )
}
