import { useEffect, useState } from 'react';

type Language = 'en' | 'fr';

interface LanguageOption {
    value: Language;
    label: string;
}

const languages: LanguageOption[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
];

export const useLanguage = () => {
    const [language, setLanguage] = useState<Language>('en');

    const updateLanguage = (newLanguage: Language) => {
        // Using Inertia's Link functionality under the hood
        window.location.href = route('locale.set', newLanguage);
    };

    // Initialize language based on current locale
    useEffect(() => {
        const htmlLang = document.documentElement.lang as Language;
        if (htmlLang && languages.some((lang) => lang.value === htmlLang)) {
            setLanguage(htmlLang);
        }
    }, []);

    return {
        language,
        updateLanguage,
        languages,
    };
};

export default useLanguage;
