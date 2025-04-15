import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { 
    HandHeart, 
    ChevronRight, 
    ShieldCheck, 
    LogInIcon, 
    BarChart2,
    Stethoscope,
    Pill,
    Syringe,
    Bell,
    Heart,
    UserPlus,
    Thermometer,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="MediTrack - Gestion d'inventaire pharmaceutique" />
            <div className="flex flex-col min-h-screen bg-background">
                {/* Navigation Bar */}
                <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <Link href="/">
                                    <h1 className="text-xl font-bold text-primary flex items-center sm:text-2xl">
                                        <AppLogoIcon className="w-8 h-8 mr-2" />
                                        MediTrack
                                    </h1>
                                </Link>
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Button variant="default" asChild className="shadow-md">
                                        <Link href={route('dashboard')} className="flex items-center">
                                            <LogInIcon className="w-4 h-4 mr-2" />
                                            Tableau de bord
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            asChild 
                                            className="shadow-sm hidden md:inline-flex"
                                        >
                                            <Link href={route('register')}>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                S'inscrire
                                            </Link>
                                        </Button>
                                        <Button variant="default" asChild className="shadow-md">
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
                </header>

                <div
                    className="absolute"
                    style={{
                        content: '',
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'min(600px, 100vw)',
                        height: 'min(700px, 100vh)',
                        background: 'radial-gradient(circle, rgba(56, 139, 253, 0.15) 30%, rgba(13, 17, 23, 0) 70%)',
                        pointerEvents: 'none',
                        zIndex: 1000,
                    }}
                ></div>

                {/* Hero Section */}
                <section className="flex items-center justify-center flex-grow pt-16 sm:pt-24">
                    <div className="container px-4 py-12 mx-auto max-w-7xl sm:py-16 md:py-24">
                        <div className="max-w-4xl mx-auto text-center">
                            <Badge variant="outline" className="mb-4 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
                                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                                Solutions de santé
                            </Badge>
                            
                            <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
                                Rationalisez votre gestion d'inventaire de <span className="text-blue-600 dark:text-blue-400">médicaments</span>
                            </h1>
                            
                            <p className="max-w-2xl mx-auto mb-8 text-base text-gray-600 dark:text-gray-300 sm:mb-10 sm:text-lg md:text-xl">
                                Une solution complète conçue pour les pharmacies et les établissements de santé afin de suivre, gérer et optimiser efficacement l'inventaire des médicaments.
                            </p>
                            
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button size="lg" variant="default" className="shadow-lg w-full sm:w-auto" asChild>
                                    <Link href={route('login')} className="flex items-center justify-center py-4 px-6 sm:py-6 sm:px-8">
                                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                        Commencer
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                
                                <Button size="lg" variant="outline" className="shadow-md w-full sm:w-auto" asChild>
                                    <Link href="#" className="flex items-center justify-center py-4 px-6 sm:py-6 sm:px-8">
                                        <HandHeart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Soutenez-nous
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Features Section */}
                <section id="features" className="py-16 sm:py-20">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mb-12 text-center sm:mb-16">
                            <h2 className="text-2xl font-bold sm:text-3xl">Fonctionnalités puissantes</h2>
                            <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto sm:text-lg">
                                Tout ce dont vous avez besoin pour gérer efficacement votre inventaire de médicaments et améliorer le service à votre clientèle
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 sm:gap-8">
                            <Card className="shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-lg bg-primary/10 shadow-sm">
                                            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold sm:text-xl">Suivi sécurisé</h3>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground sm:text-base">
                                        Le cryptage de bout en bout et les contrôles d'accès garantissent que vos données restent sécurisées et conformes aux normes RGPD.
                                    </p>
                                </CardContent>
                            </Card>
                            
                            <Card className="shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-lg bg-primary/10 shadow-sm">
                                            <Syringe className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold sm:text-xl">Gestion d'inventaire</h3>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground sm:text-base">
                                        Suivez les niveaux de stock en temps réel, recevez des alertes pour les produits à réapprovisionner et gérez les dates d'expiration.
                                    </p>
                                </CardContent>
                            </Card>
                            
                            <Card className="shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-lg bg-primary/10 shadow-sm">
                                            <Thermometer className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold sm:text-xl">Alertes automatiques</h3>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground sm:text-base">
                                        Notifications configurables pour les stocks faibles, les médicaments périmés et les commandes en attente.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <Separator />


                {/* How It Works Section */}
                <section id="how-it-works" className="py-12 sm:py-16 md:py-24 bg-muted/50">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mb-8 text-center sm:mb-12 md:mb-16">
                            <Badge variant="outline" className="mb-4 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
                                Processus
                            </Badge>
                            <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">Comment ça marche</h2>
                            <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto sm:text-base md:text-lg">
                                MediTrack s'intègre parfaitement dans votre flux de travail quotidien
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3 md:gap-12">
                            {[
                                {
                                    step: 1,
                                    title: "Configuration rapide",
                                    description: "Importez votre inventaire existant ou commencez à ajouter des produits en quelques clics.",
                                    icon: <Pill className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                },
                                {
                                    step: 2,
                                    title: "Gestion quotidienne",
                                    description: "Scannez simplement les produits à l'entrée et à la sortie pour maintenir un inventaire précis.",
                                    icon: <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                },
                                {
                                    step: 3,
                                    title: "Analyses et optimisation",
                                    description: "Utilisez les rapports pour identifier les tendances et prendre des décisions éclairées.",
                                    icon: <BarChart2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                }
                            ].map((item) => (
                                <Card key={item.step} className="flex flex-col items-center text-center bg-background shadow-md hover:shadow-lg transition-shadow p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 bg-primary/10 text-primary text-xs font-bold rounded-bl">
                                        {item.step}
                                    </div>
                                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6 rounded-full bg-primary/10 shadow-sm">
                                        {item.icon}
                                    </div>
                                    <h3 className="mb-4 text-base font-semibold sm:text-lg md:text-xl">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground sm:text-sm md:text-base">{item.description}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-12 sm:py-16 bg-primary/5">
                    <div className="px-4 mx-auto max-w-5xl sm:px-6 lg:px-8">
                        <div className="p-6 sm:p-8 md:p-10 bg-background rounded-2xl shadow-lg border border-primary/20">
                            <div className="text-center">
                                <h2 className="text-xl font-bold mb-4 sm:text-2xl md:text-3xl">Prêt à transformer votre gestion d'inventaire ?</h2>
                                <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto sm:text-base md:text-lg">
                                    Rejoignez des centaines d'établissements de santé qui font confiance à MediTrack.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Button size="lg" variant="default" className="shadow-lg w-full sm:w-auto" asChild>
                                        <Link href={route('register')} className="flex items-center justify-center py-4 px-6 sm:py-5 sm:px-8">
                                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                            Créer un compte
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="shadow-md w-full sm:w-auto" asChild>
                                        <Link href="#" className="flex items-center justify-center py-4 px-6 sm:py-5 sm:px-8">
                                            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                            Soutenir MediTrack
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        
                        <div className="text-center text-xs text-muted-foreground sm:text-sm">
                            © {new Date().getFullYear()} MediTrack. Tous droits réservés.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default Welcome;