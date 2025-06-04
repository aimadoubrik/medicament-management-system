<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     *
     * Grants 'super_admin' all permissions.
     *
     * @param  \App\Models\User  $user
     * @param  string  $ability
     * @return bool|void
     */
    public function before(User $user, $ability)
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
    }

    /**
     * Determine whether the user can view any models.
     * (e.g., on a user listing page)
     *
     * Super admins can view all. Other roles might be restricted.
     * For this example, we'll assume only super_admin can see the full list.
     * You can adjust this to allow other roles like 'manager' if needed.
     */
    public function viewAny(User $currentUser): bool
    {
        // The 'before' method handles super_admin.
        // If you want other roles to also view any, add them here:
        // return $currentUser->hasRole('manager');
        return false; // Only super_admin (via 'before') can view all by default here
    }

    /**
     * Determine whether the user can view the model.
     * (e.g., a user's profile page)
     */
    public function view(User $currentUser, User $targetUser): bool
    {
        // The 'before' method handles super_admin.
        // Users can view their own profile.
        return $currentUser->id === $targetUser->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $currentUser): bool
    {
        // The 'before' method handles super_admin.
        // Example: Allow 'manager' role to also create users
        // return $currentUser->hasRole('manager');
        return false; // Only super_admin (via 'before') can create by default here
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $currentUser, User $targetUser): bool
    {
        // The 'before' method handles super_admin.
        // Users can update their own profile.
        if ($currentUser->id === $targetUser->id) {
            return true;
        }
        // Example: Allow 'manager' to update users in their department (more complex logic)
        // For now, only super_admin or self-update.
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $currentUser, User $targetUser): bool
    {
        // The 'before' method handles super_admin.
        // Prevent users from deleting themselves.
        if ($currentUser->id === $targetUser->id) {
            return false;
        }
        // Example: Allow 'manager' to delete users (but not super_admins)
        // if ($currentUser->hasRole('manager') && !$targetUser->hasRole('super_admin')) {
        //     return true;
        // }
        return false; // Only super_admin (via 'before') can delete by default here
    }

    /**
     * Determine whether the user can change another user's role.
     */
    public function changeRole(User $currentUser, User $targetUser): bool
    {
        // The 'before' method handles super_admin.
        // Prevent users from changing their own role via this method.
        if ($currentUser->id === $targetUser->id) {
            return false;
        }
        // Prevent changing role of a super_admin by non-super_admin
        if ($targetUser->hasRole('super_admin')) {
            return false; // Only super_admins can change other super_admins (handled by 'before')
        }
        // Example: Allow 'manager' to change roles of users they manage, to non-admin roles.
        // return $currentUser->hasRole('manager');
        return false; // Only super_admin (via 'before') can change roles by default
    }

    /**
     * Determine whether the user can access a general admin area.
     * This is not tied to a specific User model instance.
     */
    public function accessAdminArea(User $currentUser): bool
    {
        // The 'before' method handles super_admin.
        return $currentUser->hasRole('admin') || $currentUser->hasRole('manager'); // Example roles
    }
}
