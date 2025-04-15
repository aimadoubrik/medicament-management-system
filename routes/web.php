<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\DashboardController;

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
    Route::resource('suppliers', \App\Http\Controllers\SupplierController::class);

    // Category routes
    Route::resource('categories', \App\Http\Controllers\CategoryController::class);

    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead'); // Use PATCH for update
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead'); // Use POST or PATCH
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unreadCount'); // For AJAX calls

    // Optional: Add custom medicine routes if needed
    // Route::get('medicines/export', [MedicineController::class, 'export'])->name('medicines.export');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
