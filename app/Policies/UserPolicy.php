<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can access the super admin area.
     *
     * This check depends only on the properties of the user performing the action ($currentUser),
     * not on any specific target user resource.
     *
     * @param \App\Models\User $currentUser The currently authenticated user.
     * @return bool
     */
    public function accessAdminArea(User $currentUser): bool
    {

        // Delegate to the User model method
        return $currentUser->isSuperAdmin();
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Check if the user is a super admin
        if ($user->isSuperAdmin()) {
            return true;
        }

        // If not, deny access
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $targetUser): bool
    {
        return $user->isSuperAdmin() || $user->id === $targetUser->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $targetUser): bool
    {
        return $user->isSuperAdmin();

        // Check if the user is trying to update their own profile
        return $user->id === $targetUser->id;

        // If not, deny access
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $targetUser): bool
    {
        // Prevent users from deleting themselves
        if ($user->id === $targetUser->id) {
            return false;
        }

        // Only allow super admins to delete other users
        return $user->isSuperAdmin();
    }

    // /**
    //  * Determine whether the user can restore the model.
    //  */
    // public function restore(User $user, User $model): bool
    // {
    //     return false;
    // }

    // /**
    //  * Determine whether the user can permanently delete the model.
    //  */
    // public function forceDelete(User $user, User $model): bool
    // {
    //     return false;
    // }
}
