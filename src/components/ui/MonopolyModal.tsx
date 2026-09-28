import React, { useEffect } from "react";

interface MonopolyModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    headerBg?: "red" | "blue" | "green" | "yellow";
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
    children: React.ReactNode;
}

export function MonopolyModal({
    isOpen,
    onClose,
    title,
    headerBg = "red",
    maxWidth = "md",
    children,
}: MonopolyModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthStyles = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
    };

    const headerColors = {
        red: "bg-red-600 text-white",
        blue: "bg-blue-600 text-white",
        green: "bg-green-600 text-white",
        yellow: "bg-amber-400 text-zinc-900",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className={`w-full ${maxWidthStyles[maxWidth]} bg-white border-4 border-red-500 shadow-2xl p-2 relative max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-2 border-black flex flex-col flex-1 overflow-hidden bg-zinc-50">
                    {title && (
                        <div
                            className={`p-3 text-center font-bold tracking-wide border-b-2 border-black flex items-center justify-between ${headerColors[headerBg]}`}
                        >
                            <span className="w-6" />
                            <h2 className="text-xl uppercase">{title}</h2>
                            <button
                                onClick={onClose}
                                className="w-6 h-6 flex items-center justify-center font-black hover:opacity-75 cursor-pointer text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <div className="p-5 overflow-y-auto flex-1">{children}</div>
                </div>
            </div>
        </div>
    );
}
