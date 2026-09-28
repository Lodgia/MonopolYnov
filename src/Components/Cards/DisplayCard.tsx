"use client"

type props = {
    cardLabel: string;
    cardType: string;
    onDismiss: () => void;
}

export default function DisplayCard({ cardLabel, cardType, onDismiss }: props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn" role="presentation" onClick={onDismiss}>
            <div className={`p-3 rounded-[8px] ${cardType === "luckyCards" ? "bg-orange-500/60" : "bg-blue-500/60"} max-w-[90vw]`} role="dialog" aria-modal="true" aria-label={cardType === "luckyCards" ? "Carte Chance" : "Carte Caisse de communauté"} onClick={(event) => event.stopPropagation()}>
                <div className="border-2 border-white p-3 rounded-[8px]">
                    <h1 className="text-center text-white/80 font-bold italic">{cardType === "luckyCards" ? "Chance" : "Communautaire"}</h1>
                    <div className="flex items-center gap-3">
                        <h2 className="text-white italic text-[16px]">{cardLabel}</h2>
                        <img className="w-[150px] h-[150px]" src={cardType === "luckyCards" ? "mainCharacter.png" : "mainCharacter2.png"} alt="" />
                    </div>
                    <button type="button" className="mt-3 w-full rounded bg-white px-3 py-1 text-sm font-bold text-zinc-900" onClick={onDismiss}>Fermer</button>
                </div>
            </div>
        </div>
    )
}