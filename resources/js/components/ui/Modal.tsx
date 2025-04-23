import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogOverlay,
    DialogPortal,
    // DialogClose // Only import if explicitly needed, e.g., in the footer
} from '@/components/ui/dialog'; // Assuming Shadcn UI components directory
import { cn } from '@/lib/utils';   // Assuming Shadcn utility function

interface ModalProps {
    /** Controls whether the modal is open or closed */
    isOpen: boolean;
    /** Function to call when the modal requests to be closed */
    onClose: () => void;
    /** The title displayed in the modal header */
    title: string;
    /** Optional description displayed below the title */
    description?: string;
    /** The main content of the modal */
    children: React.ReactNode;
    /** Optional content to display in the modal footer (e.g., buttons) */
    footerContent?: React.ReactNode;
    /** Additional CSS classes for the DialogContent */
    className?: string;
    /** Additional CSS classes specifically for the scrollable content area */
    contentClassName?: string;
    /** Size preset for the modal width */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** If true, prevents closing the modal by clicking the overlay or pressing Escape */
    preventClose?: boolean;
    /** If true, hides the overlay backdrop */
    hideOverlay?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footerContent,
    className,
    contentClassName,
    size = 'xl',
    preventClose = false,
    hideOverlay = false,
}: ModalProps) {

    // Size mapping using Tailwind CSS max-width utilities
    const sizeClasses = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        // Adjusted 'full' for better responsiveness and height control
        full: 'sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-[95vw] h-[90vh]',
    };

    // Use Dialog's controlled state pattern
    const handleOpenChange = (open: boolean) => {
        // Only call onClose when the dialog is requesting to close
        if (!open) {
            onClose();
        }
        // Note: We don't need to handle preventClose here;
        // it's handled by preventing default actions below.
    };

    return (
        // The modal prop ensures proper ARIA attributes and focus trapping
        <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
            <DialogPortal>
                {!hideOverlay && (
                    // Use default Shadcn overlay styles unless specific override needed
                    <DialogOverlay />
                )}
                <DialogContent
                    className={cn(
                        // Base Shadcn styles are implicitly included
                        sizeClasses[size], // Apply size class
                        className          // Apply user-provided classes
                    )}
                    // Prevent closing via Escape key if preventClose is true
                    onEscapeKeyDown={(e) => {
                        if (preventClose) {
                            e.preventDefault();
                        }
                        // No need for an 'else' branch, as default behavior
                        // will trigger onOpenChange(false) if not prevented.
                    }}
                    // Prevent closing via clicking outside if preventClose is true
                    // Use onPointerDownOutside for better reliability than onInteractOutside
                    onPointerDownOutside={(e) => {
                        if (preventClose) {
                            e.preventDefault();
                        }
                        // No need for an 'else' branch here either.
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && (
                            <DialogDescription>{description}</DialogDescription>
                        )}
                    </DialogHeader>

                    {/* Scrollable content area */}
                    <div
                        className={cn(
                            "py-4 max-h-[70vh] overflow-y-auto", // Basic scrolling
                            // Optional: Add custom scrollbar styles if desired project-wide
                            "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/30 hover:scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent",
                            contentClassName // Allow specific styling for this area
                        )}
                    >
                        {children}
                    </div>

                    {footerContent && (
                        // Apply default Shadcn footer styles
                        <DialogFooter>
                            {footerContent}
                        </DialogFooter>
                    )}
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}