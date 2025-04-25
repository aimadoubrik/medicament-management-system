import React from 'react'; // Import React
import AppLogoIcon from '@/components/app-logo-icon'; // Assuming path is correct
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Re-added Card imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed unused Separator and Heart imports
import { type SharedData } from '@/types'; // Assuming path is correct
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart2,
    ChevronRight,
    // Heart removed
    LogInIcon,
    Pill,
    ShieldCheck,
    Stethoscope,
    Syringe,
    Thermometer,
    UserPlus,
    Zap, // Added Zap for CTA emphasis
} from 'lucide-react';

// TypeScript global declaration for route() - good practice
// Ensure you have @types/ziggy-js installed or declare globally
declare global {
    // eslint-disable-next-line no-unused-vars
    function route(name?: string, params?: any, absolute?: boolean, customZiggy?: any): string;
}


function Welcome() {
    // Get auth data from Inertia props
    const { auth } = usePage<SharedData>().props;
    const currentYear = new Date().getFullYear();

    // Feature data array for cleaner mapping
    const features = [
        {
            icon: <ShieldCheck className="h-6 w-6 text-primary" />, // Icon color set here
            title: 'Secure Tracking',
            description:
                'End-to-end encryption and access controls ensure your data remains secure and compliant.',
        },
        {
            icon: <Syringe className="h-6 w-6 text-primary" />, // Icon color set here
            title: 'Inventory Management',
            description:
                'Track stock levels in real-time, receive reorder alerts, and manage expiration dates effortlessly.',
        },
        {
            icon: <Thermometer className="h-6 w-6 text-primary" />, // Icon color set here
            title: 'Automatic Alerts',
            description:
                'Configurable notifications for low stock, expiring medications, and pending orders.',
        },
    ];

    // How it works data array
    const howItWorksSteps = [
        {
            step: 1,
            title: 'Quick Setup',
            description:
                'Import your existing inventory or start adding products in just a few clicks.',
            icon: <Pill className="h-8 w-8 text-primary" />, // Icon color set here
        },
        {
            step: 2,
            title: 'Daily Management',
            description:
                'Simply scan products in and out to maintain an accurate inventory count easily.',
            icon: <Stethoscope className="h-8 w-8 text-primary" />, // Icon color set here
        },
        {
            step: 3,
            title: 'Analytics & Optimization',
            description:
                'Use insightful reports to identify trends, forecast needs, and make informed decisions.',
            icon: <BarChart2 className="h-8 w-8 text-primary" />, // Icon color set here
        },
    ];

    return (
        <>
            {/* Set page title */}
            <Head title="MediTrack - Pharmaceutical Inventory Management" />

            {/* Main container */}
            <div className="bg-background text-foreground flex min-h-screen flex-col">

                {/* Navigation Bar */}
                <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Logo */}
                        <Link href={route('home')} className="flex items-center gap-2 mr-6">
                            <AppLogoIcon className="text-primary h-8 w-8 sm:h-10 sm:w-10" />
                            <span className="hidden font-bold sm:inline-block text-lg">
                                MediTrack
                            </span>
                        </Link>

                        {/* Navigation Buttons */}
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            {auth.user ? (
                                // If user is logged in, show Dashboard button
                                <Button variant="default" size="sm" asChild>
                                    <Link href={route('dashboard')} className="flex items-center">
                                        <LogInIcon className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                // If user is not logged in, show Sign Up and Login buttons
                                <>
                                    <Button
                                        variant="ghost" // Use ghost for secondary action
                                        size="sm"
                                        asChild
                                        className="hidden sm:inline-flex" // Hide on small screens
                                    >
                                        <Link href={route('register')}>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Register
                                        </Link>
                                    </Button>
                                    <Button variant="default" size="sm" asChild>
                                        <Link href={route('login')}>

                                            <LogInIcon className="mr-2 h-4 w-4" />
                                            Login
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>
              
                {/* Main Content Area */}
                <main className="flex-grow">
                    {/* Hero Section (remains the same) */}
                    <section className="relative isolate overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
                        {/* Background Gradient & Shapes */}
                        <div
                            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                            aria-hidden="true"
                        >
                            <div
                                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/40 to-primary/80 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                                style={{
                                    clipPath:
                                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                }}
                            />
                        </div>
                         {/* Radial Gradient (subtler) */}
                         <div
                            className="absolute left-1/2 top-0 -z-20 h-[min(500px,60vh)] w-[min(600px,80vw)] -translate-x-1/2 pointer-events-none bg-[radial-gradient(circle,hsla(var(--primary),0.1)_20%,transparent_75%)]"
                            aria-hidden="true"
                         ></div>


                        {/* Content */}
                        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                            <Badge
                                variant="outline"
                                className="mb-4 rounded-full border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-sm"
                            >
                                <Stethoscope className="mr-2 inline h-4 w-4" />
                                Innovative Health Solutions
                            </Badge>
                            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-tight">
                                Streamline Your <br className="hidden sm:inline" />
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-primary px-1">
                                        Medicine Inventory
                                    </span>
                                    {/* Underline effect */}
                                    <svg
                                        className="absolute bottom-0 left-0 z-0 w-full h-2.5 sm:h-3 text-primary/30"
                                        viewBox="0 0 100 12" preserveAspectRatio="none" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path d="M0 10 C 20 12, 40 12, 50 10 S 80 8, 100 10" stroke="none" />
                                    </svg>
                                </span>{' '}
                                Management
                            </h1>

                            <p className="mx-auto mb-8 max-w-2xl text-base text-gray-600 sm:mb-10 sm:text-lg md:text-xl dark:text-gray-300">
                                Une solution complète conçue pour les établissements de santé afin de suivre, gérer et optimiser
                                efficacement l'inventaire des médicaments avec précision et fiabilité.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Button size="lg" asChild className="group shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
                                    <Link
                                        href={route('register')} // Link to registration
                                        className="flex items-center"
                                    >
                                        Get Started Now
                                        <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Bottom Gradient Fade */}
                        <div
                            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                            aria-hidden="true"
                        >
                            <div
                                className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary/40 to-primary/80 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                                style={{
                                    clipPath:
                                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                }}
                            />
                        </div>
                    </section>

                    {/* Features Section - Using Cards */}
                    <section id="features" className="py-16 sm:py-24 bg-muted/50">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl lg:text-center">
                                <h2 className="text-base font-semibold leading-7 text-primary">
                                    Core Capabilities
                                </h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                    Everything You Need to Optimize Operations
                                </p>
                                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                                    MediTrack provides powerful, easy-to-use tools to streamline
                                    your pharmaceutical inventory management from end to end.
                                </p>
                            </div>
                            {/* Grid for Feature Cards */}
                            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3 lg:gap-8">
                                {features.map((feature) => (
                                    <Card key={feature.title} className="flex flex-col transition-shadow hover:shadow-lg bg-card">
                                        <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                            {/* Icon Wrapper */}
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
                                                {feature.icon}
                                            </div>
                                            {/* Title */}
                                            <CardTitle className="text-lg font-semibold leading-6 text-card-foreground">
                                                {feature.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow pt-0">
                                            {/* Description */}
                                            <p className="text-base leading-7 text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* How It Works Section - Using Cards */}
                    <section id="how-it-works" className="py-16 sm:py-24 overflow-hidden">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl lg:text-center mb-12 sm:mb-16">
                                <h2 className="text-base font-semibold leading-7 text-primary">Get Started Easily</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">A Simple Three-Step Process</p>
                                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                                    Integrating MediTrack into your daily workflow is straightforward and quick.
                                </p>
                            </div>
                            {/* Grid for How It Works Cards */}
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                {howItWorksSteps.map((item) => (
                                    <Card
                                        key={item.step}
                                        className="relative flex flex-col items-center p-6 text-center transition-shadow hover:shadow-lg bg-card overflow-hidden"
                                    >
                                        {/* Step Badge */}
                                        <Badge variant="secondary" className="absolute top-4 right-4">
                                             Step {item.step}
                                        </Badge>
                                        {/* Icon */}
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 shadow-sm border border-primary/20">
                                            {item.icon}
                                        </div>
                                        {/* Title */}
                                        <CardTitle className="mb-3 text-xl font-semibold text-card-foreground">
                                            {item.title}
                                        </CardTitle>
                                        {/* Description */}
                                        <CardContent className="p-0 flex-grow">
                                            <p className="text-base text-muted-foreground">{item.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                        </div>
                    </section>

                    {/* CTA Section (remains the same) */}
                    <section className="relative isolate overflow-hidden bg-background py-16 sm:py-24">
                         {/* Background Gradient */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/10 via-background to-background" aria-hidden="true"></div>
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 items-center">
                                <div className="max-w-xl lg:max-w-lg">
                                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                        Ready to Transform Your Inventory Management?
                                    </h2>
                                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                                        Join hundreds of healthcare facilities trusting MediTrack for
                                        efficiency, accuracy, and peace of mind. Sign up today!
                                    </p>
                                    <div className="mt-6 flex max-w-md gap-x-4">
                                        <Button size="lg" asChild className="flex-none shadow-lg hover:shadow-primary/40 transition-shadow duration-300">
                                            <Link href={route('register')} className="flex items-center">
                                                <Zap className="mr-2 h-5 w-5" /> {/* Changed icon */}
                                                Create Free Account
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                                {/* Optional: Add an illustrative image or graphic */}
                                <div className="flex justify-center lg:justify-end">
                                     {/* Placeholder for an image/graphic */}
                                     <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shadow-inner">
                                        <Pill className="w-1/2 h-1/2 text-primary/50" strokeWidth={1}/>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </main>

                {/* Footer (remains the same) */}
                <footer className="border-t border-border/40 bg-background">
                    <div className="mx-auto max-w-7xl overflow-hidden px-6 py-8 sm:py-12 lg:px-8">
                        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
                            {/* Add Footer Links if needed */}
                        </nav>
                        <Link href={route('home')} className="flex items-center justify-center gap-2 mt-8">
                             <AppLogoIcon className="text-primary h-6 w-6" />
                             <span className="font-semibold text-foreground">
                                 MediTrack
                             </span>
                        </Link>
                        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                            &copy; {new Date().getFullYear()} MediTrack. All rights reserved.
                        </p>
                    </div>
                </footer>

            </div>
        </>

    );
}
export default Welcome;