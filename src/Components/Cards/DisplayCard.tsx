"use client";

import { useEffect, useState } from "react";

interface DisplayCardProps {
    cardLabel: string;
    cardType: "chance" | "community" | "luckyCards" | "communityCards" | string;
    onClose?: () => void;
    onDismiss?: () => void;
    autoCloseDuration?: number; // duration in seconds (default 5)
}

export default function DisplayCard({
    cardLabel,
    cardType,
    onClose,
    onDismiss,
    autoCloseDuration = 5,
}: DisplayCardProps) {
    const [timeLeft, setTimeLeft] = useState(autoCloseDuration);

    const handleClose = () => {
        onClose?.();
        onDismiss?.();
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const isChance = cardType === "chance" || cardType === "luckyCards";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm select-none font-sans"
            role="dialog"
            aria-modal="true"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-sm bg-white border-3 border-red-500 p-5 flex flex-col gap-4 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Carte Monopoly */}
                <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                    <span className="font-black text-xs text-red-500 uppercase tracking-widest">
                        {isChance ? "❓ CARTE CHANCE ❓" : "🎁 CAISSE DE COMMUNAUTÉ 🎁"}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-zinc-500">
                        {timeLeft}s
                    </span>
                </div>

                {/* Corps de la carte dans le panneau bleu-300 */}
                <div className="bg-blue-300 border-3 border-red-500 p-4 flex flex-col items-center gap-3 text-center">
                    <div className="text-3xl">
                        {isChance ? "🎲" : "💼"}
                    </div>

                    <div className="bg-white border-2 border-red-500 p-3 w-full shadow-sm">
                        <p className="text-xs font-bold leading-relaxed text-zinc-900">
                            {cardLabel}
                        </p>
                    </div>
                </div>

                {/* Barre de progression du timer */}
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-red-500 h-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(timeLeft / autoCloseDuration) * 100}%` }}
                    />
                </div>

                {/* Bouton de confirmation DA */}
                <div className="border-2 border-blue-500 w-full">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="inline-block border-2 border-white text-xs font-bold p-2 bg-blue-500 text-white w-full cursor-pointer hover:bg-blue-600 transition"
                    >
                        Continuer ({timeLeft}s)
                    </button>
                </div>
            </div>
        </div>
    );
}