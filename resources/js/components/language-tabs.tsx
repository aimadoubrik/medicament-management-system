import { useLanguage } from '@/hooks/use-language'; // Adjust the import path as necessary
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';

export default function LanguageToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();

    const frenchLabel = intl.formatMessage({
        id: 'common.language.french',
        defaultMessage: 'Français',
    });

    const englishLabel = intl.formatMessage({
        id: 'common.language.english',
        defaultMessage: 'English',
    });

    const { language, updateLanguage } = useLanguage(); // You'll need to create this hook

    type Language = 'en' | 'fr'; // Add your supported languages

    const tabs: { value: Language; label: string }[] = [
        { value: 'en', label: englishLabel },
        { value: 'fr', label: frenchLabel },
    ];

    return (
        <div className={cn('inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800', className)} {...props}>
            {tabs.map(({ value, label }) => (
                <button
                    key={value}
                    onClick={() => updateLanguage(value)}
                    className={cn(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                        language === value
                            ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                    )}
                >
                    <span className="text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
