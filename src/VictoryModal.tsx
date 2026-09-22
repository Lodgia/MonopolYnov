import { useEffect, useState } from "react"
import type { Player } from "./Player.ts"

interface VictoryModalProps {
    winner: Player | null
}

export function VictoryModal({ winner }: VictoryModalProps) {
    const [isOpen, setIsOpen] = useState(winner !== null)

    useEffect(() => {
        setIsOpen(winner !== null)
    }, [winner])

    if (!winner || !isOpen) {
        return null
    }

    return (
        <div
            className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/70 p-6"
            role="presentation"
        >
            <section
                aria-labelledby="victory-title"
                aria-modal="true"
                className="w-full max-w-md rounded-xl border-4 border-amber-400 bg-white p-8 text-center shadow-2xl shadow-slate-950/35"
                role="dialog"
            >
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-amber-700">
                    Partie terminée
                </p>
                <h2 className="text-3xl font-bold text-slate-900" id="victory-title">
                    Victoire de {winner.name}
                </h2>
                <p className="my-4 leading-6 text-slate-600">
                    Il ne reste plus que {winner.name} avec de l&apos;argent sur le
                    plateau.
                </p>
                <p className="my-5 text-xl font-bold text-slate-900">
                    Solde final : {winner.money} $
                </p>
                <button
                    className="rounded-md bg-slate-900 px-5 py-3 font-bold text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                    onClick={() => setIsOpen(false)}
                    type="button"
                >
                    Fermer
                </button>
            </section>
        </div>
    )
}