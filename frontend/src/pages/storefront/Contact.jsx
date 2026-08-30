import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Mail, MapPin, Phone } from 'lucide-react'
import * as misc from '../../api/misc'
import { usePublicSettings } from '../../hooks/useCatalog'
import FormField, { inputClass } from '../../components/ui/FormField'
import Button from '../../components/ui/Button'

const schema = z.object({
  name: z.string().min(2, 'Required'),
  email: z.string().email('Enter a valid email'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Please write a bit more detail'),
})

export default function Contact() {
  const { data: settings } = usePublicSettings()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: misc.submitContactMessage,
    onSuccess: (data) => {
      toast.success(data.message)
      reset()
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900">Get in Touch</h1>
        <p className="mt-2 text-slate-500">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <Phone className="mt-0.5 text-brand-600" size={18} />
            <div>
              <p className="text-sm font-semibold text-slate-800">Phone</p>
              <p className="text-sm text-slate-500">{settings?.general?.support_phone || '+977-1-4000000'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <Mail className="mt-0.5 text-brand-600" size={18} />
            <div>
              <p className="text-sm font-semibold text-slate-800">Email</p>
              <p className="text-sm text-slate-500">{settings?.general?.support_email || 'support@kinbech.test'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <MapPin className="mt-0.5 text-brand-600" size={18} />
            <div>
              <p className="text-sm font-semibold text-slate-800">Address</p>
              <p className="text-sm text-slate-500">Kathmandu, Nepal</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Your Name" error={errors.name?.message}>
              <input className={inputClass} {...register('name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input type="email" className={inputClass} {...register('email')} />
            </FormField>
          </div>
          <FormField label="Subject (optional)">
            <input className={inputClass} {...register('subject')} />
          </FormField>
          <FormField label="Message" error={errors.message?.message}>
            <textarea rows={5} className={inputClass} {...register('message')} />
          </FormField>
          <Button type="submit" loading={isSubmitting}>Send Message</Button>
        </form>
      </div>
    </div>
  )
}
