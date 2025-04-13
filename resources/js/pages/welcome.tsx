import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { HandHeart, ChevronRight, ShieldCheck, Package, LogInIcon, BarChart2, Bell, CheckCircle, } from 'lucide-react';

function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const currentYear = new Date().getFullYear();

    return (
        <>
            <Head title="MediTrack - Gestion d'inventaire pharmaceutique" />
            <div className="flex flex-col min-h-screen bg-background">
                {/* Navigation Bar */}
                <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-bold text-primary md:text-2xl">
                                    MediTrack
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Button variant="ghost" asChild>
                                        <Link href={route('dashboard')} className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-4 py-2">
                                            <LogInIcon className="w-4 h-4 mr-2" />
                                            Tableau de bord
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" asChild>
                                            <Link href={route('register')}>
                                                S'inscrire
                                            </Link>
                                        </Button>
                                        <Button variant={"default"} asChild>
                                            <Link href={route('login')}>
                                                <LogInIcon className="w-4 h-4 mr-2" />
                                                Connexion
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex items-center justify-center flex-grow pt-24">
                    <div className="container px-4 py-16 mx-auto max-w-7xl sm:py-24">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-block mb-4 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium md:mb-6 md:text-xl">
                                Solutions de santé
                            </div>
                            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:mb-8 sm:text-5xl md:text-6xl">
                                Rationalisez votre gestion d'inventaire de <span className="text-blue-600 dark:text-blue-400">médicaments</span>
                            </h1>
                            <p className="max-w-2xl mx-auto mb-8 text-lg text-gray-600 dark:text-gray-300 sm:mb-12 sm:text-xl md:text-2xl">
                                Une solution complète conçue pour les pharmacies et les établissements de santé afin de suivre, gérer et optimiser efficacement l'inventaire des médicaments.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button className="flex cursor-pointer items-center justify-center w-full gap-2 px-8 py-6 font-medium text-white transition-all bg-blue-600 rounded-full shadow-sm sm:w-auto hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700">
                                    <Link
                                        href={route('login')}
                                        className="flex items-center justify-center  transition-all rounded-full shadow-md sm:w-auto  hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg group"
                                    >
                                        Commencer
                                        <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button className="cursor-pointer flex items-center justify-center w-full gap-2 px-8 py-6 font-medium text-gray-700 transition-all bg-white border border-gray-200 rounded-full shadow-sm sm:w-auto dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <HandHeart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Soutenez-nous
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Features Section */}
                <div id="features" className="py-20">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold">Fonctionnalités puissantes</h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                                Tout ce dont vous avez besoin pour gérer efficacement votre inventaire de médicaments et améliorer le service à votre clientèle
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <ShieldCheck className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold">Suivi sécurisé</h3>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Le cryptage de bout en bout et les contrôles d'accès garantissent que vos données restent sécurisées et conformes aux normes RGPD.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Package className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold">Gestion d'inventaire</h3>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Suivez les niveaux de stock en temps réel, recevez des alertes pour les produits à réapprovisionner et gérez les dates d'expiration.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Bell className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold">Alertes automatiques</h3>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Notifications configurables pour les stocks faibles, les médicaments périmés et les commandes en attente.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="py-20 bg-muted/50">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold">Comment ça marche</h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                                MediTrack est conçu pour s'intégrer facilement dans votre flux de travail quotidien
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                            {[
                                {
                                    step: 1,
                                    title: "Configuration rapide",
                                    description: "Importez votre inventaire existant ou commencez à ajouter des produits en quelques clics.",
                                    icon: <CheckCircle className="w-8 h-8 text-primary" />
                                },
                                {
                                    step: 2,
                                    title: "Gestion quotidienne",
                                    description: "Scannez simplement les produits à l'entrée et à la sortie pour maintenir un inventaire précis.",
                                    icon: <Package className="w-8 h-8 text-primary" />
                                },
                                {
                                    step: 3,
                                    title: "Analyses et optimisation",
                                    description: "Utilisez les rapports pour identifier les tendances et prendre des décisions éclairées.",
                                    icon: <BarChart2 className="w-8 h-8 text-primary" />
                                }
                            ].map((item) => (
                                <div key={item.step} className="flex flex-col items-center text-center">
                                    <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/10">
                                        {item.icon}
                                    </div>
                                    <div className="py-1 px-3 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                                        Étape {item.step}
                                    </div>
                                    <h3 className="mb-4 text-xl font-semibold">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-12">
                    <div className="pt-4 ">
                        <div className="flex  items-center justify-center gap-4 md:flex-row">
                            <p className="text-sm text-muted-foreground">
                                © {currentYear} MediTrack. Tous droits réservés.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default Welcome;