<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\CheckSuperAdmin;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard route
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Medicine routes
    Route::resource('medicines', MedicineController::class);

    // Stock routes
    Route::resource('stock', StockController::class);

    // Supplier routes
    Route::resource('suppliers', SupplierController::class);

    // Category routes
    Route::resource('categories', CategoryController::class);

    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead'); // Use PATCH for update
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead'); // Use POST or PATCH
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unreadCount'); // For AJAX calls
    Route::post('/notifications/destroy-all', [NotificationController::class, 'destroyAll'])->name('notifications.destroyAll'); // For AJAX calls
    Route::delete('/notifications/destroy/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy'); // For AJAX calls

    Route::resource('users', UserController::class)->middleware(CheckSuperAdmin::class);
    Route::post('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.updateRole');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
