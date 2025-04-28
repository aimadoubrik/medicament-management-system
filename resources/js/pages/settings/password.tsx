import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { FormattedMessage, useIntl } from 'react-intl';

export default function Password() {
    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();

    const passwordTitle = intl.formatMessage({
        id: 'pages.settings.password.title',
        defaultMessage: 'Password settings',
    });
    const headTitle = intl.formatMessage({
        id: 'pages.settings.password.head_title',
        defaultMessage: 'Password settings',
    });
    const passwordDescription = intl.formatMessage({
        id: 'pages.settings.password.description',
        defaultMessage: 'Ensure your account is using a long, random password to stay secure',
    });
    const currentPasswordLabel = intl.formatMessage({
        id: 'pages.settings.password.current_password',
        defaultMessage: 'Current password',
    });
    const currentPasswordPlaceholder = intl.formatMessage({
        id: 'pages.settings.password.current_password_placeholder',
        defaultMessage: 'Current password',
    });
    const newPasswordLabel = intl.formatMessage({
        id: 'pages.settings.password.new_password',
        defaultMessage: 'New password',
    });
    const newPasswordPlaceholder = intl.formatMessage({
        id: 'pages.settings.password.new_password_placeholder',
        defaultMessage: 'New password',
    });
    const confirmPasswordLabel = intl.formatMessage({
        id: 'pages.settings.password.confirm_password',
        defaultMessage: 'Confirm password',
    });
    const confirmPasswordPlaceholder = intl.formatMessage({
        id: 'pages.settings.password.confirm_password_placeholder',
        defaultMessage: 'Confirm password',
    });
    const savePasswordButton = intl.formatMessage({
        id: 'pages.settings.password.save_password',
        defaultMessage: 'Save password',
    });
    // --- End of Internationalization (i18n) Setup ---

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: passwordTitle,
            href: '/settings/password',
        },
    ];

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={headTitle} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={passwordTitle} description={passwordDescription} />

                    <form onSubmit={updatePassword} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">{currentPasswordLabel}</Label>

                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                placeholder={currentPasswordPlaceholder}
                            />

                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">{newPasswordLabel}</Label>

                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder={newPasswordPlaceholder}
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">{confirmPasswordLabel}</Label>

                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder={confirmPasswordPlaceholder}
                            />

                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{savePasswordButton}</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">
                                    <FormattedMessage id="common.saved" defaultMessage="Saved." />
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
