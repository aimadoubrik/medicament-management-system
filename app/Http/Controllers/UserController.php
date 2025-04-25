<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $request->validate([
            'page' => 'integer|min:1',
            'perPage' => 'integer|min:1|max:100', // Add max limit
            'sort' => 'nullable|string|max:50',
            'direction' => 'nullable|in:asc,desc',
            'filter' => 'nullable|string|max:100',
            'filterBy' => 'nullable|string|max:50',
        ]);

        $query = User::query()
            ->with('role');

        // --- Filtering ---
        $filterValue = $request->input('filter');
        $filterColumn = $request->input('filterBy', 'name'); // Default filter column

        // Basic global filter (adjust as needed for complexity)
        // Ensure the filter column exists to prevent errors
        if ($filterValue && $filterColumn && Schema::hasColumn('users', $filterColumn)) {
            // Use 'where' for exact match or 'like' for partial match
            $query->where($filterColumn, 'like', '%'.$filterValue.'%');
        }

        // --- Sorting ---
        $sortColumn = $request->input('sort', 'name'); // Default sort column
        $sortDirection = $request->input('direction', 'desc'); // Default direction

        // Ensure the sort column exists
        if ($sortColumn && Schema::hasColumn('users', $sortColumn)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            // Fallback sorting if provided column is invalid
            $query->orderBy('name', 'desc');
        }

        // --- Pagination ---
        $perPage = $request->input('perPage', 10); // Default page size

        // Use paginate() which includes total counts needed for React Table
        $users = $query->paginate($perPage)
            // Important: Append the query string parameters to pagination links
            ->withQueryString();

        $roles = Role::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'can' => [
                'createUser' => $request->user()->can('create', User::class),
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', User::class);

        $roles = Role::all();

        return Inertia::render('Users/Create', ['roles' => $roles]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
        ]);

        return redirect()->route('users.index');
    }

    public function edit(User $user)
    {
        $this->authorize('update', $user);

        $roles = Role::all();

        return Inertia::render('Users/Edit', ['user' => $user, 'roles' => $roles]);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'role_id' => 'required|exists:roles,id',
            'password' => 'nullable|string|min:8',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'password' => $request->password ? Hash::make($request->password) : $user->password,
        ]);

        return redirect()->route('users.index');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()->route('users.index');
    }

    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->update(['role_id' => $request->role_id]);

        return redirect()->route('users.index')->with('success', 'Role updated successfully');
    }
}
