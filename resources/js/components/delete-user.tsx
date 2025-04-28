import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import HeadingSmall from '@/components/heading-small';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { FormattedMessage, useIntl } from 'react-intl';

export default function DeleteUser() {
    // --- Internationalization (i18n) Setup ---
    const intl = useIntl();

    const passwordPlaceholder = intl.formatMessage({
        id: 'common.password_placeholder',
        defaultMessage: 'Password',
    });
    const deleteAccountTitle = intl.formatMessage({
        id: 'pages.settings.profile.delete_account',
        defaultMessage: 'Delete account',
    });
    const deleteAccountDescription = intl.formatMessage({
        id: 'pages.settings.profile.delete_description',
        defaultMessage: 'Delete your account and all of its resources',
    });

    // --- End of Internationalization (i18n) Setup ---

    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm<Required<{ password: string }>>({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title={deleteAccountTitle} description={deleteAccountDescription} />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">
                        <FormattedMessage
                            id="pages.settings.profile.warning_label"
                            defaultMessage="Warning"
                        />
                    </p>
                    <p className="text-sm">
                        <FormattedMessage
                            id="pages.settings.profile.warning_message"
                            defaultMessage="Please proceed with caution, this cannot be undone."
                        />
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <FormattedMessage
                                id="pages.settings.profile.delete_button"
                                defaultMessage="Delete account"
                            />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            <FormattedMessage
                                id="pages.settings.profile.confirm_delete"
                                defaultMessage="Are you sure you want to delete your account?"
                            />
                        </DialogTitle>
                        <DialogDescription>
                            <FormattedMessage
                                id="pages.settings.profile.delete_warning"
                                defaultMessage="Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password
                            to confirm you would like to permanently delete your account."
                            />
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={deleteUser}>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    <FormattedMessage
                                        id="common.password"
                                        defaultMessage="Password"
                                    />
                                </Label>

                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={passwordPlaceholder}
                                    autoComplete="current-password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal}>
                                        <FormattedMessage
                                            id="common.cancel"
                                            defaultMessage="Cancel"
                                        />
                                    </Button>
                                </DialogClose>

                                <Button variant="destructive" disabled={processing} asChild>
                                    <button type="submit">
                                        <FormattedMessage
                                            id="pages.settings.profile.delete_button"
                                            defaultMessage="Delete account"
                                        />
                                    </button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
