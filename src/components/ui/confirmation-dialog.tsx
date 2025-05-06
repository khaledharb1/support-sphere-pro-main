
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void; // This is required
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmLabel?: string; // Keep for backward compatibility
  cancelLabel?: string; // Keep for backward compatibility
  isDanger?: boolean;
  isLoading?: boolean;
  className?: string;
  contentClassName?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  isLoading = false,
  className,
  contentClassName,
}) => {
  // Use confirmText/cancelText if provided, otherwise fall back to confirmLabel/cancelLabel
  const finalConfirmText = confirmText || confirmLabel;
  const finalCancelText = cancelText || cancelLabel;

  // Handle cancel action - use onCancel if provided, otherwise use onClose
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            contentClassName
          )}
        >
          <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              {finalCancelText}
            </Button>
            <Button 
              variant={isDanger ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={isLoading}
              className={isDanger ? "bg-red-500 hover:bg-red-600 text-white" : ""}
            >
              {isLoading ? "Processing..." : finalConfirmText}
            </Button>
          </div>
          
          <DialogPrimitive.Close 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default ConfirmationDialog;
