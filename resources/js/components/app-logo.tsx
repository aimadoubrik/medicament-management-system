import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="bg-outline-primary flex aspect-square size-8 items-center justify-center rounded-md border">
                <AppLogoIcon className="size-7 fill-current" />
            </div>
            <div className="grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">MediTrack</span>
            </div>
        </>
    );
}
