import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Building, Loader2 } from 'lucide-react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <GuestLayout>
            <Head title="Connexion" />
            
            <div className="flex flex-col items-center">
                {/* Logo and branding */}
                <div className="mb-10 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-2 rounded-lg bg-blue-50">
                            <Building className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="ml-3 text-3xl font-bold text-blue-600">MediTrack</h1>
                    </div>
                    <p className="text-lg text-gray-600">Système de gestion des stocks de médicaments</p>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-xl rounded-2xl">
                    {status && (
                        <div className="flex items-center p-4 mb-6 text-sm font-medium text-green-700 rounded-lg bg-green-50">
                            <AlertCircle className="w-5 h-5 mr-2 text-green-500" />
                            <span>{status}</span>
                        </div>
                    )}

                    <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Bienvenue</h2>
                    
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <InputLabel htmlFor="email" value="Adresse e-mail" className="font-medium text-gray-700 mb-1.5 block" />
                            
                            <div className="relative rounded-md">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="vous@example.com"
                                />
                            </div>
                            
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <InputLabel htmlFor="password" value="Mot de passe" className="font-medium text-gray-700" />
                                
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-blue-600 transition duration-150 ease-in-out hover:text-blue-800 hover:underline"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                )}
                            </div>
                            
                            <div className="relative rounded-md">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-10 pr-10 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                Se souvenir de moi
                            </span>
                        </div>

                        {/* Login Button */}
                        <div>
                            <PrimaryButton 
                                className="flex justify-center w-full px-4 py-3.5 font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-30 transition-all duration-200"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" />
                                        <span>Connexion...</span>
                                    </>
                                ) : 'Connexion'}
                            </PrimaryButton>
                        </div>
                    </form>
                 
                </div>

                {/* Create Account Link */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Pas encore de compte ?{' '}
                        <Link 
                            href={route('register')} 
                            className="font-medium text-blue-600 transition duration-150 ease-in-out hover:text-blue-500 hover:underline"
                        >
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
