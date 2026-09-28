import { useState, useEffect } from 'react'

export type RuleCard = {
    title: string
    text: string
}

export type RuleSection = {
    id: string
    title: string
    introduction: string
    cards: RuleCard[]
}

export const RULE_SECTIONS: RuleSection[] = [
    {
        id: 'start',
        title: 'Début de partie',
        introduction: 'Le but : acheter des terrains et rester le dernier joueur en jeu.',
        cards: [
            {
                title: 'Votre objectif',
                text: 'Achetez des propriétés, construisez dessus et percevez des loyers.',
            },
            {
                title: 'L’argent de départ',
                text: 'La banque donne 1 500 € à chaque joueur au début de la partie.',
            },
            {
                title: 'Qui gagne ?',
                text: 'La partie se termine quand il ne reste qu’un joueur qui n’a pas fait faillite.',
            },
        ],
    },
    {
        id: 'turn',
        title: 'Votre tour',
        introduction: 'Lancez les dés, avancez votre pion et faites ce qu’indique la case.',
        cards: [
            {
                title: 'Les dés',
                text: 'Avancez du total obtenu. Si les deux dés affichent le même nombre, vous rejouez après avoir fait ce que demande la case.',
            },
            {
                title: 'Trois doubles de suite',
                text: 'Au troisième double d’affilée, allez directement en prison sans passer par Départ.',
            },
            {
                title: 'Acheter un terrain',
                text: 'La case est libre ? Vous pouvez l’acheter à la banque au prix indiqué sur le plateau.',
            },
            {
                title: 'Payer un loyer',
                text: 'La propriété appartient à un autre joueur ? Payez-lui le loyer indiqué sur sa carte.',
            },
        ],
    },
    {
        id: 'properties',
        title: 'Terrains et maisons',
        introduction: 'Réunissez toutes les propriétés d’une couleur pour construire et gagner plus de loyers.',
        cards: [
            {
                title: 'Avoir toute une couleur',
                text: 'Le loyer des terrains sans maison double. Vous pouvez aussi y construire des maisons.',
            },
            {
                title: 'Construire des maisons',
                text: 'Construisez à parts égales : chaque terrain doit avoir une maison avant d’en ajouter une deuxième sur un autre.',
            },
            {
                title: 'Remplacer par un hôtel',
                text: 'Après quatre maisons sur un terrain, vous pouvez les remplacer par un hôtel en payant son prix.',
            },
            {
                title: 'Gares et services',
                text: 'Le loyer des gares augmente avec leur nombre. Pour les services, il dépend du résultat des dés.',
            },
        ],
    },
    {
        id: 'special',
        title: 'Cases spéciales',
        introduction: 'Certaines cases vous font gagner ou payer de l’argent, ou vous font piocher une carte.',
        cards: [
            {
                title: 'Départ',
                text: 'La banque vous verse 200 € quand vous passez par Départ ou vous arrêtez dessus.',
            },
            {
                title: 'Chance et Caisse de communauté',
                text: 'Piochez une carte et suivez ce qu’elle indique.',
            },
            {
                title: 'Impôts et taxes',
                text: 'Payez à la banque le montant indiqué sur la case.',
            },
            {
                title: 'Parc Gratuit',
                text: 'Vous pouvez vous y arrêter sans payer ni recevoir d’argent.',
            },
        ],
    },
    {
        id: 'jail',
        title: 'La Prison',
        introduction: 'En prison, vous ne bougez pas, mais vous continuez à recevoir vos loyers.',
        cards: [
            {
                title: 'Aller en prison',
                text: 'Vous y allez si une case ou une carte vous l’ordonne, ou si vous faites trois doubles de suite.',
            },
            {
                title: 'En sortir',
                text: 'Faites un double en trois tours, payez 50 € avant de lancer les dés, ou utilisez une carte de sortie.',
            },
            {
                title: 'Simple visite',
                text: 'Si votre déplacement vous amène sur la case Prison, vous êtes simplement de passage.',
            },
        ],
    },
    {
        id: 'endgame',
        title: 'Faillite et fin de partie',
        introduction: 'Si vous ne pouvez pas payer, vous pouvez vendre ou hypothéquer vos biens. Sinon, vous faites faillite.',
        cards: [
            {
                title: 'Vendre ou hypothéquer',
                text: 'Vous pouvez vendre vos maisons et hôtels à moitié prix, ou hypothéquer un terrain sans maison.',
            },
            {
                title: 'Faire faillite',
                text: 'Si vous ne pouvez toujours pas payer, vous quittez la partie et vos biens vont à la personne à qui vous devez de l’argent.',
            },
            {
                title: 'Gagner la partie',
                text: 'Le dernier joueur qui n’a pas fait faillite gagne.',
            },
        ],
    },
]

interface RulesModalProps {
    isOpen?: boolean
    onClose: () => void
}

export default function Rules({ isOpen = true, onClose }: RulesModalProps) {
    const [activeSection, setActiveSection] = useState<RuleSection>(RULE_SECTIONS[0])

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-modal-title"
            onClick={onClose}
        >
            <div
                className="flex max-h-[min(700px,calc(100vh-2rem))] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                    <div>
                        <span className="text-xs font-medium text-zinc-400">MonopolYnov</span>
                        <h2 id="rules-modal-title" className="text-lg font-semibold text-white">
                            Les règles du jeu
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                        aria-label="Fermer les règles"
                        title="Fermer (Échap)"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </header>

                <nav aria-label="Catégories des règles" className="flex gap-1 overflow-x-auto border-b border-zinc-800 px-4 py-2">
                        {RULE_SECTIONS.map((section) => {
                            const isActive = activeSection.id === section.id
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSection(section)}
                                    aria-pressed={isActive}
                                    className={`shrink-0 rounded px-3 py-2 text-left text-sm transition ${
                                        isActive
                                            ? 'bg-zinc-800 text-white'
                                            : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                                    }`}
                                >
                                    {section.title}
                                </button>
                            )
                        })}
                </nav>

                <main className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="mb-5">
                        <h3 className="text-base font-semibold text-white">{activeSection.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                            {activeSection.introduction}
                        </p>
                    </div>

                    <div className="divide-y divide-zinc-800">
                        {activeSection.cards.map((card) => (
                            <article key={card.title} className="py-3 first:pt-0 last:pb-0">
                                <h4 className="text-sm font-medium text-zinc-100">{card.title}</h4>
                                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{card.text}</p>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
