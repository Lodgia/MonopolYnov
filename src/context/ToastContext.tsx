import React, { createContext, useContext, useState, useCallback } from "react";

export interface ToastMessage {
    id: string;
    text: string;
    type?: "info" | "success" | "warning" | "danger";
    icon?: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: ToastMessage[];
    addToast: (text: string, type?: ToastMessage["type"], icon?: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (text: string, type: ToastMessage["type"] = "info", icon?: string, duration: number = 3500) => {
            const id = `${Date.now()}-${Math.random()}`;
            const defaultIcon =
                type === "danger" ? "🚨" : type === "success" ? "🏆" : type === "warning" ? "⚠️" : "🎲";
            const newToast: ToastMessage = {
                id,
                text,
                type,
                icon: icon || defaultIcon,
                duration,
            };

            setToasts((prev) => [...prev.slice(-4), newToast]);

            setTimeout(() => {
                removeToast(id);
            }, duration);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        return {
            toasts: [],
            addToast: () => {},
            removeToast: () => {},
        };
    }
    return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void; }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none font-sans">
            {toasts.map((toast) => (
                <div key={toast.id} onClick={() => onDismiss(toast.id)} className="pointer-events-auto bg-white border-3 border-red-500 shadow-2xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-all transform hover:scale-102 animate-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center gap-2.5">
                        <span className="text-lg shrink-0">{toast.icon}</span>
                        <p className="text-xs font-bold text-zinc-900 leading-snug">{toast.text}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }} className="text-red-500 hover:text-red-700 text-xs font-black p-1 shrink-0 cursor-pointer">✕</button>
                </div>
            ))}
        </div>
    );
}
