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
        <div className="victory-modal-backdrop" role="presentation">
            <section
                aria-labelledby="victory-title"
                aria-modal="true"
                className="victory-modal"
                role="dialog"
            >
                <p className="victory-modal-eyebrow">Partie terminée</p>
                <h2 id="victory-title">Victoire de {winner.name}</h2>
                <p>
                    Il ne reste plus que {winner.name} avec de l&apos;argent sur le
                    plateau.
                </p>
                <p className="victory-modal-balance">
                    Solde final : {winner.money} $
                </p>
                <button
                    className="victory-modal-close"
                    onClick={() => setIsOpen(false)}
                    type="button"
                >
                    Fermer
                </button>
            </section>
        </div>
    )
}