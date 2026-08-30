import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormField, { inputClass } from '../../components/ui/FormField'
import PageSpinner from '../../components/ui/PageSpinner'

function StaffForm({ staff, roles, onSuccess }) {
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: staff
      ? { name: staff.name, email: staff.email, roles: staff.roles || [], is_active: staff.is_active, password: '' }
      : { name: '', email: '', roles: [], is_active: true, password: '' },
  })
  const selectedRoles = watch('roles')

  const mutation = useMutation({
    mutationFn: (data) => (staff ? admin.adminUpdateStaff(staff.id, data) : admin.adminCreateStaff(data)),
    onSuccess: () => {
      toast.success(staff ? 'Staff account updated' : 'Staff account created')
      onSuccess()
    },
    onError: (err) => toast.error(err?.response?.data?.errors ? Object.values(err.response.data.errors)[0][0] : 'Could not save staff account'),
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3">
      <FormField label="Full Name">
        <input className={inputClass} {...register('name', { required: true })} />
      </FormField>
      <FormField label="Email">
        <input type="email" className={inputClass} {...register('email', { required: true })} />
      </FormField>
      <FormField label={staff ? 'New Password (leave blank to keep current)' : 'Password'}>
        <input type="password" className={inputClass} {...register('password', { required: !staff, minLength: 8 })} />
      </FormField>
      <FormField label="Roles">
        <Controller
          control={control}
          name="roles"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              {roles?.map((r) => (
                <label key={r.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value.includes(r.name)}
                    onChange={(e) => field.onChange(e.target.checked ? [...field.value, r.name] : field.value.filter((v) => v !== r.name))}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                  {r.name}
                </label>
              ))}
            </div>
          )}
        />
      </FormField>
      {staff && (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Active
        </label>
      )}
      <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!selectedRoles?.length}>
        Save Staff Account
      </Button>
    </form>
  )
}

function RoleForm({ role, permissionGroups, onSuccess }) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { name: role?.name || '', permissions: role?.permissions || [] },
  })
  const selected = watch('permissions')

  const toggle = (perm) => {
    setValue('permissions', selected.includes(perm) ? selected.filter((p) => p !== perm) : [...selected, perm])
  }

  const mutation = useMutation({
    mutationFn: (data) => (role ? admin.adminUpdateRole(role.id, data) : admin.adminCreateRole(data)),
    onSuccess: () => {
      toast.success(role ? 'Role updated' : 'Role created')
      onSuccess()
    },
    onError: (err) => toast.error(err?.response?.data?.message || Object.values(err?.response?.data?.errors || {})[0]?.[0] || 'Could not save role'),
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <FormField label="Role Name">
        <input className={inputClass} {...register('name', { required: true })} />
      </FormField>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Permissions</p>
        <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg border border-slate-200 p-3">
          {permissionGroups?.map((g) => (
            <div key={g.group}>
              <p className="mb-1 text-xs font-bold uppercase text-slate-400">{g.group}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {g.permissions.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={selected.includes(perm)} onChange={() => toggle(perm)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!selected.length}>
        Save Role
      </Button>
    </form>
  )
}

export default function Staff() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('staff')
  const [staffModal, setStaffModal] = useState(null)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [roleModal, setRoleModal] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: staffList, isLoading: loadingStaff } = useQuery({ queryKey: ['admin-staff'], queryFn: () => admin.adminGetStaff({}) })
  const { data: roles, isLoading: loadingRoles } = useQuery({ queryKey: ['admin-roles'], queryFn: admin.adminGetRoles })
  const { data: permissionGroups } = useQuery({ queryKey: ['admin-permissions'], queryFn: admin.adminGetPermissionMatrix })

  const deleteStaff = useMutation({
    mutationFn: admin.adminDeleteStaff,
    onSuccess: () => {
      toast.success('Staff account removed')
      qc.invalidateQueries({ queryKey: ['admin-staff'] })
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(err?.response?.data?.errors?.staff?.[0] || 'Could not remove staff account'),
  })
  const deleteRole = useMutation({
    mutationFn: admin.adminDeleteRole,
    onSuccess: () => {
      toast.success('Role removed')
      qc.invalidateQueries({ queryKey: ['admin-roles'] })
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message || err?.response?.data?.errors?.role?.[0] || 'Could not remove role'),
  })

  return (
    <div>
      <PageHeader
        title="Staff & Roles"
        description="Granular, fully configurable access control for your team"
        actions={
          tab === 'staff' ? (
            <Button size="sm" onClick={() => { setStaffModal(null); setShowStaffModal(true) }}><Plus size={15} /> Add Staff</Button>
          ) : (
            <Button size="sm" onClick={() => { setRoleModal(null); setShowRoleModal(true) }}><Plus size={15} /> New Role</Button>
          )
        }
      />

      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab('staff')} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === 'staff' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Staff Accounts</button>
        <button onClick={() => setTab('roles')} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === 'roles' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Roles & Permissions</button>
      </div>

      {tab === 'staff' && (loadingStaff ? <PageSpinner /> : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList?.data.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500">{s.email}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{s.roles.map((r) => <Badge key={r} tone="brand">{r}</Badge>)}</div></td>
                  <td className="px-4 py-3"><Badge tone={s.is_active ? 'green' : 'red'}>{s.is_active ? 'Active' : 'Disabled'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-slate-400">
                      <button onClick={() => { setStaffModal(s); setShowStaffModal(true) }} className="hover:text-brand-600"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget({ type: 'staff', id: s.id })} className="hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {tab === 'roles' && (loadingRoles ? <PageSpinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles?.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800"><ShieldCheck size={15} className="text-brand-600" /> {r.name}</span>
                {!r.is_protected && (
                  <div className="flex gap-2 text-slate-400">
                    <button onClick={() => { setRoleModal(r); setShowRoleModal(true) }} className="hover:text-brand-600"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteTarget({ type: 'role', id: r.id })} className="hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">{r.permissions.length} permissions • {r.users_count} staff</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.permissions.slice(0, 4).map((p) => <Badge key={p}>{p}</Badge>)}
                {r.permissions.length > 4 && <Badge>+{r.permissions.length - 4} more</Badge>}
              </div>
            </div>
          ))}
        </div>
      ))}

      <Modal open={showStaffModal} onClose={() => setShowStaffModal(false)} title={staffModal ? 'Edit Staff Account' : 'Add Staff Account'}>
        <StaffForm
          staff={staffModal}
          roles={roles}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-staff'] })
            setShowStaffModal(false)
          }}
        />
      </Modal>

      <Modal open={showRoleModal} onClose={() => setShowRoleModal(false)} title={roleModal ? 'Edit Role' : 'New Role'} maxWidth="max-w-2xl">
        <RoleForm
          role={roleModal}
          permissionGroups={permissionGroups}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-roles'] })
            setShowRoleModal(false)
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => (deleteTarget.type === 'staff' ? deleteStaff.mutate(deleteTarget.id) : deleteRole.mutate(deleteTarget.id))}
        loading={deleteStaff.isPending || deleteRole.isPending}
        title={`Remove this ${deleteTarget?.type}?`}
      />
    </div>
  )
}
