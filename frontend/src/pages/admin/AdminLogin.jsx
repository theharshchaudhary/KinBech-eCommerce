import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import FormField, { inputClass } from '../../components/ui/FormField'
import Button from '../../components/ui/Button'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function AdminLogin() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const user = await login(data)
      if (user.account_type !== 'staff') {
        toast.error('This portal is for staff accounts only.')
        return
      }
      navigate('/admin')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <ShieldCheck size={24} />
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900">KinBech Admin</h1>
          <p className="text-sm text-slate-500">Staff sign-in</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message}>
            <input type="email" className={inputClass} {...register('email')} placeholder="admin@kinbech.test" />
          </FormField>
          <FormField label="Password" error={errors.password?.message}>
            <input type="password" className={inputClass} {...register('password')} placeholder="••••••••" />
          </FormField>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign In
          </Button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-400">Demo: admin@kinbech.test / password</p>
      </div>
    </div>
  )
}
