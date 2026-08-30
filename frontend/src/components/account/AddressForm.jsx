import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import * as account from '../../api/account'
import FormField, { inputClass } from '../ui/FormField'
import Button from '../ui/Button'

const schema = z.object({
  label: z.string().optional(),
  full_name: z.string().min(2, 'Required'),
  phone: z.string().min(6, 'Required'),
  line1: z.string().min(3, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  postal_code: z.string().optional(),
  is_default: z.boolean().optional(),
})

export default function AddressForm({ address, onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: address || { label: 'Home', country: 'Nepal', is_default: false },
  })

  const mutation = useMutation({
    mutationFn: (data) => (address ? account.updateAddress(address.id, data) : account.createAddress(data)),
    onSuccess: (result) => {
      toast.success(address ? 'Address updated' : 'Address added')
      onSuccess?.(result)
    },
    onError: () => toast.error('Please check the form and try again'),
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Label" className="col-span-2 sm:col-span-1">
          <select className={inputClass} {...register('label')}>
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
        </FormField>
        <FormField label="Full Name" error={errors.full_name?.message} className="col-span-2 sm:col-span-1">
          <input className={inputClass} {...register('full_name')} />
        </FormField>
      </div>
      <FormField label="Phone" error={errors.phone?.message}>
        <input className={inputClass} {...register('phone')} />
      </FormField>
      <FormField label="Address Line 1" error={errors.line1?.message}>
        <input className={inputClass} {...register('line1')} placeholder="Street, flat/house no." />
      </FormField>
      <FormField label="Address Line 2 (optional)">
        <input className={inputClass} {...register('line2')} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="City" error={errors.city?.message}>
          <input className={inputClass} {...register('city')} />
        </FormField>
        <FormField label="State / Province" error={errors.state?.message}>
          <input className={inputClass} {...register('state')} />
        </FormField>
        <FormField label="Country" error={errors.country?.message}>
          <input className={inputClass} {...register('country')} />
        </FormField>
        <FormField label="Postal Code">
          <input className={inputClass} {...register('postal_code')} />
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" {...register('is_default')} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
        Set as default address
      </label>
      <Button type="submit" className="w-full" loading={isSubmitting || mutation.isPending}>
        Save Address
      </Button>
    </form>
  )
}
