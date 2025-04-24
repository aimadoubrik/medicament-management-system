import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart2, ChevronRight, Heart, LogInIcon, Pill, ShieldCheck,
    Stethoscope, Syringe, Thermometer, UserPlus, Clock, CheckCircle,
    Zap, PhoneCall, Calendar, RefreshCw
} from 'lucide-react';

function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const currentYear = new Date().getFullYear();

    return (
        <>
            <Head title="MediTrack - Solution intelligente de gestion pharmaceutique" />
            <div className="bg-background flex min-h-screen flex-col">
                {/* Navigation Bar */}
                <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 right-0 left-0 z-50 w-full backdrop-blur">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <AppLogoIcon className="text-primary size-14 fill-current mr-2" />
                                </Link>
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Button variant="default" asChild className="shadow-md">
                                        <Link href={route('dashboard')} className="flex items-center">
                                            <LogInIcon className="mr-2 h-4 w-4" />
                                            Tableau de bord
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" asChild className="hidden shadow-sm md:inline-flex">
                                            <Link href={route('register')}>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                S'inscrire
                                            </Link>
                                        </Button>
                                        <Button variant="default" asChild className="shadow-md">
                                            <Link href={route('login')}>
                                                <LogInIcon className="mr-2 h-4 w-4" />
                                                Connexion
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <div
                    className="absolute"
                    style={{
                        content: '',
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'min(700px, 100vw)',
                        height: 'min(800px, 100vh)',
                        background: 'radial-gradient(circle, rgba(248, 112, 6, 0.2) 20%, rgba(13, 17, 23, 0) 70%)',
                        pointerEvents: 'none',
                        zIndex: 1000,
                    }}
                ></div>
                <section className="relative flex flex-grow items-center justify-center overflow-hidden pt-16 sm:pt-24">
                    {/* Decorative elements */}
                    <div className="absolute top-32 left-8 h-24 w-24 rounded-full bg-orange-500/10 blur-3xl"></div>
                    <div className="absolute right-8 bottom-16 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl"></div>

                    <div className="relative z-10 container mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-24">
                        <div className="mx-auto max-w-4xl text-center">
                            <Badge
                                variant="outline"
                                className="mb-4 rounded-full border-orange-200 bg-orange-100 px-4 py-1.5 text-xs font-medium text-orange-700 sm:text-sm dark:border-orange-800/50 dark:bg-orange-900/30 dark:text-orange-300"
                            >
                                <Stethoscope className="mr-2 inline h-4 w-4 sm:h-5 sm:w-5" />
                                Solutions de santé innovantes
                            </Badge>
                            <h1 className="mb-4 text-3xl leading-tight font-bold text-gray-900 sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
                                Rationalisez votre gestion d'inventaire de{' '}
                                <span className="relative">
                                    <span className="relative z-10 px-1 font-extrabold text-orange-600 dark:text-orange-400">médicaments</span>
                                    <span className="absolute -bottom-1 left-0 z-0 h-3 w-full -rotate-1 rounded-sm bg-orange-200/50 dark:bg-orange-700/30"></span>
                                </span>
                            </h1>
                            <p className="mx-auto mb-8 max-w-2xl text-base text-gray-600 sm:mb-10 sm:text-lg md:text-xl dark:text-gray-300">
                                Une solution complète conçue pour les établissements de santé afin de suivre, gérer et optimiser
                                efficacement l'inventaire des médicaments avec précision et fiabilité.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    variant="default"
                                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg transition-all duration-300 hover:from-orange-500 hover:to-orange-600 sm:w-auto"
                                    asChild
                                >
                                    <Link href={route('login')} className="flex items-center justify-center px-6 py-4 sm:px-8 sm:py-5">
                                        <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        Commencer maintenant
                                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Features Section */}
                <section id="features" className="py-16 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center sm:mb-16">
                            <Badge
                                variant="outline"
                                className="bg-primary/10 text-primary mb-4 rounded-full px-3 py-1 text-xs font-medium"
                            >
                                Tout-en-un
                            </Badge>
                            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Fonctionnalités puissantes</h2>
                            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base sm:text-lg">
                                Tout ce dont vous avez besoin pour optimiser votre gestion d'inventaire et améliorer votre service client
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: <Thermometer className="text-primary h-5 w-5 sm:h-6 sm:w-6" />,
                                    title: "Alertes personnalisées",
                                    description: "Configurez des notifications pour les stocks faibles, dates d'expiration et conditions de stockage anormales."
                                },
                                {
                                    icon: <BarChart2 className="text-primary h-5 w-5 sm:h-6 sm:w-6" />,
                                    title: "Analyses avancées",
                                    description: "Tableaux de bord intuitifs pour visualiser les tendances et prendre des décisions stratégiques basées sur les données."
                                },
                                {
                                    icon: <Calendar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />,
                                    title: "Gestion des expiration",
                                    description: "Minimisez les pertes avec notre système de rotation des stocks qui priorise l'utilisation des produits à date d'expiration proche."
                                },
                            ].map((feature, idx) => (
                                <Card key={idx} className="shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-orange-100 dark:border-orange-900/30">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 rounded-lg p-3 shadow-sm">
                                                {feature.icon}
                                            </div>
                                            <h3 className="text-lg font-semibold sm:text-xl">{feature.title}</h3>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm sm:text-base">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <Separator />

                {/* How It Works Section - Redesigned */}
                <section id="how-it-works" className="bg-muted/50 py-12 sm:py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <Badge variant="outline" className="bg-primary/10 text-primary mb-4 rounded-full px-3 py-1 text-xs font-medium">
                                Simple et efficace
                            </Badge>
                            <h2 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">Comment ça marche</h2>
                            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg">
                                MediTrack s'intègre parfaitement dans votre flux de travail quotidien
                            </p>
                        </div>

                        <div className="relative mt-16">
                            {/* Connection line */}
                            <div className="absolute top-24 left-0 w-full h-0.5 bg-orange-200 dark:bg-orange-800/30 hidden md:block"></div>

                            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                                {[
                                    {
                                        step: 1,
                                        title: 'Configuration rapide',
                                        description: 'Importez votre inventaire existant ou commencez à ajouter des produits en quelques clics. Notre assistant vous guide à chaque étape.',
                                        icon: <Pill className="text-primary h-6 w-6 sm:h-8 sm:w-8" />,
                                    },
                                    {
                                        step: 2,
                                        title: 'Gestion quotidienne',
                                        description: "Scannez simplement les codes à l'entrée et à la sortie. Le système met à jour automatiquement votre inventaire en temps réel.",
                                        icon: <Stethoscope className="text-primary h-6 w-6 sm:h-8 sm:w-8" />,
                                    },
                                    {
                                        step: 3,
                                        title: 'Analyses et optimisation',
                                        description: 'Exploitez nos tableaux de bord et rapports détaillés pour identifier les tendances, optimiser les stocks et réduire les coûts.',
                                        icon: <BarChart2 className="text-primary h-6 w-6 sm:h-8 sm:w-8" />,
                                    },
                                ].map((item) => (
                                    <div key={item.step} className="relative flex flex-col items-center">
                                        <div className="bg-primary text-white relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold shadow-lg md:h-16 md:w-16 md:text-xl">
                                            {item.step}
                                        </div>
                                        <div className="bg-background mt-4 rounded-xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30 w-full">
                                            <div className="mb-4 flex justify-center">
                                                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                                                    {item.icon}
                                                </div>
                                            </div>
                                            <h3 className="mb-4 text-center text-lg font-semibold md:text-xl">{item.title}</h3>
                                            <p className="text-muted-foreground text-center text-sm md:text-base">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>


                {/* Footer - Enhanced */}
                <footer className="bg-gray-50 dark:bg-gray-900/50 py-6 flex justify-center">
                    <Link href="/" className="flex items-center justify-center space-x-3 hover:opacity-80 transition-opacity">
                        <AppLogoIcon className="text-primary size-8 fill-current" />
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700 pr-2">
                                Tazzanine Association
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 pl-1">
                                © {currentYear}
                            </span>
                        </div>
                    </Link>
                </footer>

            </div>
        </>

    );
}
export default Welcome;