<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\User;
use App\Models\Medicine;
use App\Models\Supplier;
use App\Models\Batch;
use Illuminate\Support\Facades\Gate;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // 1. Determine Locale (Example: from session, fallback to config)
        $locale = $request->session()->get('locale', config('app.locale', 'en'));
        App::setLocale($locale); // Set Laravel's locale

        // 2. Load Translation Messages
        $messages = Cache::rememberForever("translations_{$locale}", function () use ($locale) {
            $phpTranslations = [];
            $jsonTranslations = [];

            // Load PHP language files (optional, if you use them)
            // Example: lang/en/validation.php -> validation.key = value
            $phpLangPath = lang_path($locale);
            if (File::isDirectory($phpLangPath)) {
                // Adjust based on how deep your PHP files go
                // This example loads top-level php files in the locale directory
                foreach (File::files($phpLangPath) as $file) {
                    if ($file->getExtension() === 'php') {
                        $key = $file->getFilenameWithoutExtension();
                        $phpTranslations[$key] = require $file->getPathname();
                    }
                }
            }

            // Load JSON language file (lang/en.json -> key = value)
            $jsonLangPath = lang_path("{$locale}.json");
            if (File::exists($jsonLangPath)) {
                $jsonTranslations = json_decode(File::get($jsonLangPath), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    // Handle potential JSON decoding error
                    report(new \Exception("Error decoding JSON language file: {$jsonLangPath}. Error: " . json_last_error_msg()));
                    $jsonTranslations = [];
                }
            }

            // Merge PHP and JSON translations (JSON takes precedence for duplicate keys)
            return array_merge($phpTranslations, $jsonTranslations);
        });

        $authenticatedUser = $request->user();
        $authData = null;
        if ($authenticatedUser) {
            $authData = [
                'id' => $authenticatedUser->id,
                'name' => $authenticatedUser->name,
                'email' => $authenticatedUser->email,
                'role_name' => $authenticatedUser->role?->name, // PHP 8 nullsafe operator
                'can' => [
                    // Dashboard permissions
                    'viewDashboard'   => true,
                    // UserPolicy based permissions
                    'viewAnyUsers'    => Gate::forUser($authenticatedUser)->allows('viewAny', User::class),
                    'createUsers'     => Gate::forUser($authenticatedUser)->allows('create', User::class),
                    'accessAdminArea' => Gate::forUser($authenticatedUser)->allows('accessAdminArea'),
                    'viewUser'        => Gate::forUser($authenticatedUser)->allows('view', $authenticatedUser),
                    'updateUser'      => Gate::forUser($authenticatedUser)->allows('update', $authenticatedUser),
                    'deleteUser'      => Gate::forUser($authenticatedUser)->allows('delete', $authenticatedUser),
                    'chngeRole'       => Gate::forUser($authenticatedUser)->allows('chngeRole', $authenticatedUser),
                    // MedicinePolicy based permissions
                    'viewAnyMedicines' => Gate::forUser($authenticatedUser)->allows('viewAny', Medicine::class),
                    'viewMedicine'     => Gate::forUser($authenticatedUser)->allows('view', Medicine::class),
                    'createMedicine'   => Gate::forUser($authenticatedUser)->allows('create', Medicine::class),
                    'updateMedicine'   => Gate::forUser($authenticatedUser)->allows('update', Medicine::class),
                    'deleteMedicine'   => Gate::forUser($authenticatedUser)->allows('delete', Medicine::class),
                    'restoreMedicine'  => Gate::forUser($authenticatedUser)->allows('restore', Medicine::class),
                    'forceDeleteMedicine' => Gate::forUser($authenticatedUser)->allows('forceDelete', Medicine::class),
                    // SupplierPolicy based permissions
                    'viewAnySuppliers' => Gate::forUser($authenticatedUser)->allows('viewAny', Supplier::class),
                    'viewSupplier'     => Gate::forUser($authenticatedUser)->allows('view', Supplier::class),
                    'createSupplier'   => Gate::forUser($authenticatedUser)->allows('create', Supplier::class),
                    'updateSupplier'   => Gate::forUser($authenticatedUser)->allows('update', Supplier::class),
                    'deleteSupplier'   => Gate::forUser($authenticatedUser)->allows('delete', Supplier::class),
                    'restoreSupplier'  => Gate::forUser($authenticatedUser)->allows('restore', Supplier::class),
                    'forceDeleteSupplier' => Gate::forUser($authenticatedUser)->allows('forceDelete', Supplier::class),
                    // BatchPolicy based permissions
                    'viewAnyBatches'   => Gate::forUser($authenticatedUser)->allows('viewAny', Batch::class),
                    'viewBatch'        => Gate::forUser($authenticatedUser)->allows('view', Batch::class),
                    'createBatch'      => Gate::forUser($authenticatedUser)->allows('create', Batch::class),
                    'updateBatch'      => Gate::forUser($authenticatedUser)->allows('update', Batch::class),
                    'deleteBatch'      => Gate::forUser($authenticatedUser)->allows('delete', Batch::class),
                    'restoreBatch'     => Gate::forUser($authenticatedUser)->allows('restore', Batch::class),
                    'forceDeleteBatch' => Gate::forUser($authenticatedUser)->allows('forceDelete', Batch::class),
                    // Report permissions
                    'viewReports'      => true,
                    'generateReport'   => true,
                ],
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $authData,
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => $request->cookie('sidebar_state') === 'true',
            'locale' => $locale,
            'messages' => $messages,
        ];
    }
}
