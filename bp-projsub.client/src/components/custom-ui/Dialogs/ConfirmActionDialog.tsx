import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ConfirmActionDialogProps {
    title: string;
    description: string;
    onConfirm: () => void;
    triggerButton: ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClassName?: string;
}

export function ConfirmActionDialog({
    title,
    description,
    onConfirm,
    triggerButton,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmButtonClassName = "bg-destructive text-destructive-foreground hover:bg-destructive/90",
}: ConfirmActionDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {triggerButton}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={(e) => e.stopPropagation()}
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.stopPropagation()
                            onConfirm()
                        }}
                        className={confirmButtonClassName}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}