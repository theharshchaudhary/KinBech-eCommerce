import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { NavLink, Outlet } from 'react-router-dom'
import * as account from '../../api/account'
import useAuthStore from '../../store/authStore'
import FormField, { inputClass } from '../../components/ui/FormField'
import Button from '../../components/ui/Button'

function ProfileForm() {
  const { user } = useAuthStore()
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: user?.name, phone: user?.phone || '', current_password: '', new_password: '' } })

  const mutation = useMutation({
    mutationFn: account.updateProfile,
    onSuccess: (updated) => {
      useAuthStore.setState({ user: updated })
      toast.success('Profile updated')
      reset({ name: updated.name, phone: updated.phone || '', current_password: '', new_password: '' })
    },
    onError: (err) => toast.error(err?.response?.data?.errors?.current_password?.[0] || 'Could not update profile'),
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <FormField label="Full Name">
        <input className={inputClass} {...register('name')} />
      </FormField>
      <FormField label="Phone">
        <input className={inputClass} {...register('phone')} />
      </FormField>
      <FormField label="Email">
        <input className={`${inputClass} bg-slate-50 text-slate-400`} value={user?.email} disabled />
      </FormField>
      <hr className="border-slate-100" />
      <p className="text-sm font-semibold text-slate-700">Change Password (optional)</p>
      <FormField label="Current Password">
        <input type="password" className={inputClass} {...register('current_password')} />
      </FormField>
      <FormField label="New Password">
        <input type="password" className={inputClass} {...register('new_password')} />
      </FormField>
      <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
    </form>
  )
}

const tabs = [
  { to: '/account', label: 'Profile', end: true },
  { to: '/account/orders', label: 'Orders' },
  { to: '/account/addresses', label: 'Addresses' },
]

export default function AccountLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-slate-900">My Account</h1>
      <div className="flex gap-6">
        <aside className="w-44 shrink-0 space-y-1 text-sm font-medium">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => `block rounded-lg px-3 py-2 ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </aside>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export { ProfileForm }
