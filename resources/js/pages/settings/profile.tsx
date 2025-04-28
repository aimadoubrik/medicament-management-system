import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

import { FormattedMessage, useIntl } from 'react-intl';


type ProfileForm = {
    name: string;
    email: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {

    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();

    const headTitle = intl.formatMessage({
        id: 'pages.settings.profile.head_title',
        defaultMessage: 'Profile settings',
    })
    const profileTitle = intl.formatMessage({
        id: 'pages.settings.profile.title',
        defaultMessage: 'Profile settings',
    });
    const profileDescription = intl.formatMessage({
        id: 'pages.settings.profile.description',
        defaultMessage: 'Update your name and email address',
    });
    const nameLabel = intl.formatMessage({
        id: 'pages.settings.profile.name',
        defaultMessage: 'Name',
    });
    const namePlaceholder = intl.formatMessage({
        id: 'pages.settings.profile.name_placeholder',
        defaultMessage: 'Full name',
    });
    const emailLabel = intl.formatMessage({
        id: 'pages.settings.profile.email',
        defaultMessage: 'Email address',
    });
    const emailPlaceholder = intl.formatMessage({
        id: 'pages.settings.profile.email_placeholder',
        defaultMessage: 'Email address',
    })
    // --- End of Internationalization (i18n) Setup ---

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: profileTitle,
            href: '/settings/profile',
        },
    ];

    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={headTitle} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={profileTitle} description={profileDescription} />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{nameLabel}</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder={namePlaceholder}
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">{emailLabel}</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder={emailPlaceholder}
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    <FormattedMessage id="page.settings.profile.unverified_email" defaultMessage="Your email address is unverified." />{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        <FormattedMessage
                                            id="page.settings.profile.unverified_email_resend"
                                            defaultMessage="Click here to re-send the verification email."
                                        />
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        <FormattedMessage
                                            id="page.settings.profile.unverified_email_success"
                                            defaultMessage="A new verification link has been sent to your email address."
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                <FormattedMessage
                                    id="common.save"
                                    defaultMessage="Save"
                                />
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">
                                    <FormattedMessage
                                        id="common.saved"
                                        defaultMessage="Saved."
                                    />
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
