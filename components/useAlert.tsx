"use client"

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"

import { createContext, useCallback, useContext, useState } from "react"

type AlertOptions = {
    heading?: string
    message: string
    cancelText?: string
    actionText?: string
    onConfirm?: () => void
}

type AlertContextType = {
    showAlert: (options: AlertOptions) => void
}

const AlertContext = createContext<AlertContextType | null>(null)

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null)
    const [open, setOpen] = useState(false)

    const showAlert = useCallback((options: AlertOptions) => {
        setAlertOptions(options)
        setOpen(true)
    }, [])

    const handleConfirm = () => {
        if (alertOptions?.onConfirm) alertOptions.onConfirm()
        setOpen(false)
    }

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertOptions?.heading || "Are you sure?"}</AlertDialogTitle>
                        <AlertDialogDescription>{alertOptions?.message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{alertOptions?.cancelText || "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>
                            {alertOptions?.actionText || "Continue"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AlertContext.Provider>
    )
}

export const useAlert = () => {
    const context = useContext(AlertContext)
    if (!context) throw new Error("useAlert must be used within an AlertProvider")
    return context.showAlert
}