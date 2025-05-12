<?php

use App\Http\Controllers\Api\MedicineBatchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard route
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Medicine routes
    Route::resource('medicines', MedicineController::class);

    // Stock routes
    Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
    Route::post('/stock/transaction', [StockController::class, 'handleTransaction'])
        ->name('stock.transaction');
    Route::put('/stock/{batch}', [StockController::class, 'update'])->name('stock.update');

    Route::get('/medicines/{medicine}/batches', [MedicineBatchController::class, 'index'])
        ->name('api.medicines.batches.index') // Optional name
        ->middleware('auth'); // Or appropriate middleware like 'web', 'auth'

    // Supplier routes
    Route::resource('suppliers', SupplierController::class);

    // Reports routes
    Route::get('/reports', [ReportsController::class, 'index'])->name('reports.index');
    Route::get('/reports/yearly-report', [ReportsController::class, 'getYearlyReport'])
        ->name('reports.yearly-report');

    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead'); // Use PATCH for update
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead'); // Use POST or PATCH
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unreadCount'); // For AJAX calls
    Route::post('/notifications/destroy-all', [NotificationController::class, 'destroyAll'])->name('notifications.destroyAll'); // For AJAX calls
    Route::delete('/notifications/destroy/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy'); // For AJAX calls

    Route::resource('users', UserController::class)->middleware(['auth', 'can:accessAdminArea,App\Models\User']);
    Route::post('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.updateRole');

    Route::get('/locale/{locale}', function (Request $request, string $locale) {
        // Validate the locale against your supported locales
        if (! in_array($locale, config('app.available_locales', ['en']))) { // Add available_locales to config/app.php
            abort(400);
        }
        Session::put('locale', $locale);

        // Clear cached translations for the new locale if necessary,
        // although the middleware cache key includes locale, so it might reload automatically.
        // Cache::forget("translations_{$locale}");
        return Redirect::back();
    })->name('locale.set');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
