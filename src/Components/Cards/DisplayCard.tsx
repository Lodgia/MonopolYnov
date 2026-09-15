"use client"

type props = {
    cardLabel: string;
    cardType: string;
}

export default function DisplayCard({ cardLabel, cardType }: props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
            <div className={`p-3 rounded-[8px] ${cardType === "luckyCards" ? "bg-blue-500/60" : "bg-orange-500/60"} max-w-1/5`}>
                <div className="border-2 border-white p-3 rounded-[8px]">
                    <h1 className="text-center text-white/80 font-bold italic">{cardType === "luckyCards" ? "Chance" : "Communautaire"}</h1>
                    <div className="flex items-center gap-3">
                        <h2 className="text-white italic text-[16px]">{cardLabel}</h2>
                        <img className="w-[150px] h-[150px]" src={cardType === "luckyCards" ? "mainCharacter.png" : "mainCharacter2.png"} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}