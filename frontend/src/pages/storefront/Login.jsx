import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import useAuthStore from '../../store/authStore'
import FormField, { inputClass } from '../../components/ui/FormField'
import Button from '../../components/ui/Button'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      await login(data)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-center text-xl font-bold text-slate-900">Welcome back</h1>
      <p className="mb-6 text-center text-sm text-slate-500">Sign in to continue to KinBech</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}>
          <input type="email" className={inputClass} {...register('email')} placeholder="you@example.com" />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} className={inputClass} {...register('password')} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FormField>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        New to KinBech?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-800">
          Create an account
        </Link>
      </p>

      <p className="mt-2 text-center text-xs text-slate-400">
        Demo: customer@kinbech.test / password
      </p>
    </div>
  )
}
