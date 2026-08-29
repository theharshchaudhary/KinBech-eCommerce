<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('account_type', 'staff')->with('roles');

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->q}%")->orWhere('email', 'like', "%{$request->q}%");
            });
        }

        return UserResource::collection($query->latest()->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['exists:roles,name'],
        ]);

        $staff = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'account_type' => 'staff',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $staff->syncRoles($data['roles']);

        return new UserResource($staff->load('roles'));
    }

    public function update(Request $request, User $staffMember)
    {
        abort_unless($staffMember->account_type === 'staff', 404);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($staffMember->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['exists:roles,name'],
            'is_active' => ['boolean'],
        ]);

        if ($staffMember->hasRole('Super Admin') && ! in_array('Super Admin', $data['roles']) && $this->isLastSuperAdmin($staffMember)) {
            throw ValidationException::withMessages(['roles' => 'At least one Super Admin must remain.']);
        }

        $staffMember->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'is_active' => $data['is_active'] ?? $staffMember->is_active,
            ...(! empty($data['password']) ? ['password' => Hash::make($data['password'])] : []),
        ]);

        $staffMember->syncRoles($data['roles']);

        return new UserResource($staffMember->load('roles'));
    }

    public function destroy(Request $request, User $staffMember)
    {
        abort_unless($staffMember->account_type === 'staff', 404);

        if ($staffMember->id === $request->user()->id) {
            throw ValidationException::withMessages(['staff' => 'You cannot delete your own account.']);
        }

        if ($staffMember->hasRole('Super Admin') && $this->isLastSuperAdmin($staffMember)) {
            throw ValidationException::withMessages(['staff' => 'At least one Super Admin must remain.']);
        }

        $staffMember->delete();

        return response()->json(['message' => 'Staff account removed.']);
    }

    protected function isLastSuperAdmin(User $user): bool
    {
        return User::role('Super Admin')->where('id', '!=', $user->id)->doesntExist();
    }
}
