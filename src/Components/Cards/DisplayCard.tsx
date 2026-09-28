"use client";

interface DisplayCardProps {
    cardLabel: string;
    cardType: "chance" | "community" | "luckyCards" | "communityCards" | string;
    onClose?: () => void;
    onDismiss?: () => void;
}

export default function DisplayCard({ cardLabel, cardType, onClose, onDismiss }: DisplayCardProps) {
    const handleClose = () => {
        onClose?.();
        onDismiss?.();
    };

    const isChance = cardType === "chance" || cardType === "luckyCards";

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200 select-none"
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-sm rounded-xl border-4 ${
                    isChance ? "border-orange-500 bg-amber-50" : "border-blue-600 bg-blue-50"
                } p-5 text-zinc-900 shadow-2xl transition-transform transform scale-100`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Carte Monopoly */}
                <div
                    className={`-mx-5 -mt-5 mb-4 rounded-t-lg py-2.5 px-4 text-center font-black uppercase tracking-widest text-white ${
                        isChance ? "bg-orange-500" : "bg-blue-600"
                    }`}
                >
                    <span className="text-xs">{isChance ? "❓ CARTE CHANCE ❓" : "🎁 CAISSE DE COMMUNAUTÉ 🎁"}</span>
                </div>

                {/* Corps de la carte */}
                <div className="flex flex-col items-center gap-4 text-center py-2">
                    <div className="text-3xl">
                        {isChance ? "🎲" : "💼"}
                    </div>

                    <p className="text-sm font-semibold leading-relaxed text-zinc-800 px-2">
                        {cardLabel}
                    </p>
                </div>

                {/* Bouton de confirmation */}
                <div className="mt-5 pt-3 border-t border-zinc-200">
                    <button
                        type="button"
                        onClick={handleClose}
                        className={`w-full py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider text-white shadow transition-all cursor-pointer ${
                            isChance
                                ? "bg-orange-600 hover:bg-orange-700 active:scale-95"
                                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                        }`}
                    >
                        Continuer
                    </button>
                </div>
            </div>
        </div>
    );
}