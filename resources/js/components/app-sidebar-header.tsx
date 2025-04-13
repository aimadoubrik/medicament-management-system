import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { NotificationBell } from './notification-bell';
import { Link, usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, ChevronsUpDown } from 'lucide-react';
import { SharedData } from '@/types';

export function AppSidebarHeader({
  breadcrumbs = [],
}: {
  breadcrumbs?: BreadcrumbItemType[];
}) {
  const { auth } = usePage<SharedData>().props;
  
  const userInitials = auth.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
    
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Sidebar trigger and breadcrumbs */}
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
          
          {/* Right side: Notification bell and user menu */}
          <div className="flex items-center space-x-2">
            <NotificationBell className="mr-1" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-full h-auto"
                >
                  
                  <Avatar className="h-8 w-8 transition-transform border border-border">
                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                <div className="flex items-center gap-2 p-2 sm:hidden">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{auth.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {auth.user.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuLabel className="font-normal hidden sm:block">
                  <span className="text-xs text-muted-foreground">Signed in as</span>
                  <p className="text-sm font-medium mt-0.5">{auth.user.email || 'user@example.com'}</p>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="hidden sm:block" />
                
                <div className="p-1">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex w-full items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Your Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex w-full items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                
                <DropdownMenuSeparator />
                
                <div className="p-1">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/logout"
                      method="post"
                      as="button"
                      className="flex w-full items-center cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}