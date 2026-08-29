<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Every role with its permissions - powers the admin "Roles & Permissions" screen.
     */
    public function index()
    {
        return Role::with('permissions')->withCount('users')->get()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'is_protected' => $role->name === 'Super Admin',
            'users_count' => $role->users_count,
            'permissions' => $role->permissions->pluck('name'),
        ]);
    }

    /**
     * The fixed catalog of permissions the app understands, grouped by module,
     * for rendering a checkbox matrix when creating/editing a role.
     */
    public function permissions()
    {
        $grouped = collect(Permission::pluck('name'))->groupBy(fn ($name) => explode('.', $name)[0]);

        return $grouped->map(fn ($perms, $group) => [
            'group' => $group,
            'permissions' => $perms->values(),
        ])->values();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:60', Rule::unique('roles', 'name')],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['exists:permissions,name'],
        ]);

        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);
        $role->syncPermissions($data['permissions']);

        return response()->json($role->load('permissions'));
    }

    public function update(Request $request, Role $role)
    {
        if ($role->name === 'Super Admin') {
            throw ValidationException::withMessages(['name' => 'The Super Admin role cannot be modified.']);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:60', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['exists:permissions,name'],
        ]);

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions']);

        return response()->json($role->load('permissions'));
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'Super Admin') {
            throw ValidationException::withMessages(['name' => 'The Super Admin role cannot be deleted.']);
        }

        if ($role->users()->exists()) {
            throw ValidationException::withMessages(['role' => 'Reassign staff away from this role before deleting it.']);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }
}
