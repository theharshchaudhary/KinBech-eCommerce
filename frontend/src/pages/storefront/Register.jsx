import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import useAuthStore from '../../store/authStore'
import FormField, { inputClass } from '../../components/ui/FormField'
import Button from '../../components/ui/Button'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export default function Register() {
  const registerUser = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Welcome to KinBech!')
      navigate('/')
    } catch (err) {
      const message = err?.response?.data?.errors ? Object.values(err.response.data.errors)[0][0] : 'Registration failed'
      toast.error(message)
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-center text-xl font-bold text-slate-900">Create your account</h1>
      <p className="mb-6 text-center text-sm text-slate-500">Join KinBech for a faster checkout</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full Name" error={errors.name?.message}>
          <input className={inputClass} {...register('name')} placeholder="Jane Doe" />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <input type="email" className={inputClass} {...register('email')} placeholder="you@example.com" />
        </FormField>
        <FormField label="Phone (optional)" error={errors.phone?.message}>
          <input className={inputClass} {...register('phone')} placeholder="98XXXXXXXX" />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <input type="password" className={inputClass} {...register('password')} placeholder="••••••••" />
        </FormField>
        <FormField label="Confirm Password" error={errors.password_confirmation?.message}>
          <input type="password" className={inputClass} {...register('password_confirmation')} placeholder="••••••••" />
        </FormField>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-800">
          Sign in
        </Link>
      </p>
    </div>
  )
}
