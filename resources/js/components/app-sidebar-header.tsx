import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { NotificationBell } from './notification-bell';


export function AppSidebarHeader({
  breadcrumbs = [],
}: {
  breadcrumbs?: BreadcrumbItemType[];
}) {

    
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
            <NotificationBell/>
            
          </div>
        </div>
      </div>
    </header>
  );
}