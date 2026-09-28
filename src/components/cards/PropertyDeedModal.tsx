import { property, colorNamesFr, colorClasses } from "../../types/Property.ts";
import type { Square } from "../../types/Property.ts";
import { MonopolyButton } from "../ui/MonopolyButton.tsx";

interface PropertyDeedModalProps {
    square: Square | null;
    ownerName?: string;
    ownerColor?: string;
    currentLevel?: number;
    canBuy?: boolean | null;
    canUpgrade?: boolean | null;
    onBuy?: () => void;
    onUpgrade?: () => void;
    onClose: () => void;
}

export function PropertyDeedModal({
    square,
    ownerName,
    ownerColor,
    currentLevel = 0,
    canBuy = false,
    canUpgrade = false,
    onBuy,
    onUpgrade,
    onClose,
}: PropertyDeedModalProps) {
    if (!square) return null;

    const isProp = square.type === "property" && square instanceof property;
    const isStation = square.type === "station" || (isProp && (square as property).type === "station");
    const isUtility = square.type === "utility" || (isProp && (square as property).type === "utility");
    const propObj = square as property;

    const colorClass = propObj.colorKey ? colorClasses[propObj.colorKey] : "bg-zinc-800";
    const groupName = propObj.colorKey ? colorNamesFr[propObj.colorKey] : "Spécial";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 select-none font-sans"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xs overflow-hidden bg-white border-3 border-red-500 text-zinc-900 shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {isProp && propObj.type === "property" && (
                    <div className={`${colorClass} p-3 text-center text-white border-b-2 border-zinc-900`}>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-90">
                            Titre de Propriété
                        </p>
                        <h3 className="text-sm font-black uppercase tracking-tight drop-shadow-sm mt-0.5">
                            {square.name}
                        </h3>
                        <span className="text-[8px] opacity-80 font-mono">
                            Groupe {groupName}
                        </span>
                    </div>
                )}

                {(!isProp || propObj.type !== "property") && (
                    <div className="bg-zinc-900 p-3 text-center text-white border-b-2 border-zinc-900">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                            {isStation ? "🚆 Gare Ferroviaire" : isUtility ? "⚡ Service Public" : "Case Spéciale"}
                        </p>
                        <h3 className="text-sm font-black uppercase tracking-tight mt-0.5">
                            {square.name}
                        </h3>
                    </div>
                )}

                <div className="p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between rounded bg-zinc-100 p-2 border border-zinc-200">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase">Propriétaire :</span>
                        {ownerName ? (
                            <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                                <span
                                    style={ownerColor?.startsWith("#") ? { backgroundColor: ownerColor } : undefined}
                                    className={`w-2.5 h-2.5 rounded-full ${!ownerColor?.startsWith("#") ? (ownerColor || "bg-blue-500") : ""}`}
                                />
                                <span>{ownerName}</span>
                            </div>
                        ) : (
                            <span className="font-semibold text-emerald-600">À vendre</span>
                        )}
                    </div>

                    {isProp && propObj.type === "property" && (
                        <div className="space-y-1 font-mono text-[11px] border-t border-b border-zinc-200 py-2">
                            <div className={`flex justify-between py-0.5 px-1 rounded ${currentLevel === 0 ? "bg-zinc-100 font-bold" : ""}`}>
                                <span className="text-zinc-600">Loyer terrain nu :</span>
                                <span className="font-bold">{propObj.allCost[0]} €</span>
                            </div>
                            <div className={`flex justify-between py-0.5 px-1 rounded ${currentLevel === 1 ? "bg-emerald-100 font-bold" : ""}`}>
                                <span className="text-zinc-600">Avec 1 maison :</span>
                                <span>{propObj.allCost[1]} €</span>
                            </div>
                            <div className={`flex justify-between py-0.5 px-1 rounded ${currentLevel === 2 ? "bg-emerald-100 font-bold" : ""}`}>
                                <span className="text-zinc-600">Avec 2 maisons :</span>
                                <span>{propObj.allCost[2]} €</span>
                            </div>
                            <div className={`flex justify-between py-0.5 px-1 rounded ${currentLevel === 3 ? "bg-emerald-100 font-bold" : ""}`}>
                                <span className="text-zinc-600">Avec 3 maisons :</span>
                                <span>{propObj.allCost[3]} €</span>
                            </div>
                            <div className={`flex justify-between py-0.5 px-1 rounded ${currentLevel === 4 ? "bg-emerald-100 font-bold" : ""}`}>
                                <span className="text-zinc-600">Avec 4 maisons :</span>
                                <span>{propObj.allCost[4]} €</span>
                            </div>
                            <div className={`flex justify-between py-0.5 px-1 rounded ${currentLevel === 5 ? "bg-red-100 font-bold text-red-700" : ""}`}>
                                <span className="text-zinc-600">Avec HÔTEL :</span>
                                <span className="font-bold">{propObj.allCost[5]} €</span>
                            </div>

                            <div className="pt-2 text-[10px] text-zinc-500 space-y-0.5 border-t border-zinc-100">
                                <div className="flex justify-between">
                                    <span>Prix d'achat :</span>
                                    <span className="font-bold text-zinc-800">{propObj.price} €</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Coût par maison :</span>
                                    <span className="font-bold text-zinc-800">{propObj.costHouse} €</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Hypothèque :</span>
                                    <span className="font-bold text-zinc-800">{Math.floor(propObj.price / 2)} €</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {isStation && (
                        <div className="space-y-1 font-mono text-[11px] border-t border-b border-zinc-200 py-2">
                            <div className="flex justify-between py-0.5"><span className="text-zinc-600">1 gare possédée :</span><span>25 €</span></div>
                            <div className="flex justify-between py-0.5"><span className="text-zinc-600">2 gares :</span><span>50 €</span></div>
                            <div className="flex justify-between py-0.5"><span className="text-zinc-600">3 gares :</span><span>100 €</span></div>
                            <div className="flex justify-between py-0.5"><span className="text-zinc-600">4 gares :</span><span className="font-bold text-emerald-600">200 €</span></div>
                            <div className="pt-2 text-[10px] text-zinc-500 flex justify-between border-t border-zinc-100">
                                <span>Prix d'achat :</span>
                                <span className="font-bold text-zinc-800">200 €</span>
                            </div>
                        </div>
                    )}

                    {isUtility && (
                        <div className="space-y-1 font-mono text-[11px] border-t border-b border-zinc-200 py-2">
                            <div className="text-[10px] text-zinc-600 leading-relaxed">
                                Si une compagnie est possédée, le loyer est égal à <strong>4 fois</strong> le montant des dés.
                            </div>
                            <div className="text-[10px] text-zinc-600 leading-relaxed">
                                Si les deux compagnies sont possédées, le loyer est égal à <strong>10 fois</strong> le montant des dés.
                            </div>
                            <div className="pt-2 text-[10px] text-zinc-500 flex justify-between border-t border-zinc-100">
                                <span>Prix d'achat :</span>
                                <span className="font-bold text-zinc-800">150 €</span>
                            </div>
                        </div>
                    )}

                    {(canBuy || canUpgrade) && (
                        <div className="space-y-1.5 pt-1">
                            {canBuy && (
                                <MonopolyButton
                                    variant="success"
                                    fullWidth
                                    onClick={() => {
                                        onBuy?.();
                                        onClose();
                                    }}
                                >
                                    Acheter ({propObj.price ?? 200} €)
                                </MonopolyButton>
                            )}
                            {canUpgrade && (
                                <MonopolyButton
                                    variant="primary"
                                    fullWidth
                                    onClick={() => {
                                        onUpgrade?.();
                                        onClose();
                                    }}
                                >
                                    Construire ({propObj.costHouse} €)
                                </MonopolyButton>
                            )}
                        </div>
                    )}

                    <MonopolyButton
                        variant="secondary"
                        fullWidth
                        onClick={onClose}
                    >
                        Fermer
                    </MonopolyButton>
                </div>
            </div>
        </div>
    );
}

export default PropertyDeedModal;
