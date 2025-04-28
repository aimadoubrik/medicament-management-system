<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

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
                    report(new \Exception("Error decoding JSON language file: {$jsonLangPath}. Error: ".json_last_error_msg()));
                    $jsonTranslations = [];
                }
            }

            // Merge PHP and JSON translations (JSON takes precedence for duplicate keys)
            return array_merge($phpTranslations, $jsonTranslations);
        });

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => $request->cookie('sidebar_state') === 'true',
            'locale' => $locale,
            'messages' => $messages,
        ];
    }
}
