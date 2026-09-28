import React, { useEffect } from "react";

interface MonopolyModalProps {
    isOpen?: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

export function MonopolyModal({
    isOpen = true,
    onClose,
    title,
    children,
    maxWidth = "2xl",
}: MonopolyModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWClass =
        maxWidth === "sm"
            ? "max-w-sm"
            : maxWidth === "md"
            ? "max-w-md"
            : maxWidth === "lg"
            ? "max-w-lg"
            : maxWidth === "xl"
            ? "max-w-xl"
            : maxWidth === "4xl"
            ? "max-w-4xl"
            : "max-w-2xl";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 select-none backdrop-blur-sm font-sans"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className={`w-full ${maxWClass} bg-white border-3 border-red-500 p-5 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
                    <h3 className="font-bold text-sm sm:text-base text-red-500 uppercase tracking-wide">
                        {title}
                    </h3>
                    <div className="border-2 border-red-500">
                        <button
                            onClick={onClose}
                            className="inline-block border-2 border-white text-xs font-bold p-1 px-2 bg-red-500 text-white cursor-pointer hover:bg-red-600 transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}

export default MonopolyModal;
