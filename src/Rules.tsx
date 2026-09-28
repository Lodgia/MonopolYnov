import { useState, useEffect } from 'react'

export type RuleCard = {
    title: string
    text: string
    badge?: string
}

export type RuleSection = {
    id: string
    title: string
    label: string
    color: string
    icon: string
    introduction: string
    cards: RuleCard[]
}

export const RULE_SECTIONS: RuleSection[] = [
    {
        id: 'start',
        title: 'Début de partie',
        label: 'Objectif & Lancement',
        color: 'bg-emerald-600',
        icon: '🎲',
        introduction: 'Devenez le dernier magnat encore en jeu en achetant des terrains et en faisant payer des loyers à vos adversaires.',
        cards: [
            { 
                title: 'Objectif du jeu', 
                text: 'Achetez des propriétés, construisez des maisons et des hôtels, puis percevez des loyers pour ruiner les autres joueurs et éviter la faillite.',
                badge: 'But'
            },
            { 
                title: 'Capital initial', 
                text: 'Chaque joueur débute la partie avec 1 500 € en liquide distribués par la banque pour démarrer ses premiers investissements.',
                badge: '1 500 €'
            },
            { 
                title: 'Le vainqueur', 
                text: 'La partie s’arrête lorsqu’il ne reste plus qu’un seul joueur solvable. Ce joueur remporte la victoire.',
                badge: 'Victoire'
            },
        ],
    },
    {
        id: 'turn',
        title: 'Déroulement du tour',
        label: 'Mécaniques de tour',
        color: 'bg-blue-600',
        icon: '🔄',
        introduction: 'À votre tour, lancez les deux dés, avancez votre pion et appliquez l’effet de la case sur laquelle vous vous arrêtez.',
        cards: [
            { 
                title: 'Déplacement & Doubles', 
                text: 'Avancez dans le sens des aiguilles d’une montre selon la somme des dés. Si vous faites un double, vous rejouez un tour complet après avoir résolu votre case.',
                badge: 'Dés'
            },
            { 
                title: 'Trois doubles consécutifs', 
                text: 'Si vous obtenez 3 doubles d’affilée au cours du même tour, vous êtes immédiatement envoyé en prison sans passer par la case Départ.',
                badge: 'Prison'
            },
            { 
                title: 'Achat de propriété libre', 
                text: 'Si vous atterrissez sur une propriété sans propriétaire, vous pouvez l’acheter à la banque pour le prix affiché sur le plateau.',
                badge: 'Achat'
            },
            { 
                title: 'Paiement du loyer', 
                text: 'Si la propriété appartient déjà à un autre joueur, vous devez lui verser le loyer indiqué sur sa carte de titre de propriété.',
                badge: 'Loyer'
            },
        ],
    },
    {
        id: 'properties',
        title: 'Propriétés & Bâtiments',
        label: 'Gestion du patrimoine',
        color: 'bg-amber-600',
        icon: '🏠',
        introduction: 'Regroupez les quartiers d’une même couleur pour doubler vos loyers et construire des bâtiments.',
        cards: [
            { 
                title: 'Monopole de couleur', 
                text: 'Posséder toutes les propriétés d’un même groupe de couleur double le loyer des terrains nus et autorise la construction de maisons.',
                badge: 'Monopole'
            },
            { 
                title: 'Construction équilibrée', 
                text: 'Vous devez construire de façon homogène : interdiction de poser une 2ème maison sur un terrain tant que les autres terrains du groupe n’en ont pas au moins une.',
                badge: 'Maisons'
            },
            { 
                title: 'Hôtels luxueux', 
                text: 'Après 4 maisons sur une propriété, vous pouvez les échanger contre un hôtel en payant le coût requis. Un seul hôtel par case.',
                badge: 'Hôtel'
            },
            { 
                title: 'Gares & Compagnies', 
                text: 'Le loyer des gares augmente avec le nombre de gares possédées (25, 50, 100, 200 €). Le loyer des services publics dépend du résultat des dés (x4 ou x10).',
                badge: 'Services'
            },
        ],
    },
    {
        id: 'special',
        title: 'Cases spéciales',
        label: 'Événements & Taxes',
        color: 'bg-purple-600',
        icon: '❓',
        introduction: 'Certaines cases du plateau déclenchent des bonus financiers, des taxes ou des tirages de cartes surprises.',
        cards: [
            { 
                title: 'Case Départ', 
                text: 'Chaque fois que vous passez ou vous arrêtez sur la case Départ, la banque vous verse automatiquement une prime de 200 €.',
                badge: '+200 €'
            },
            { 
                title: 'Chance & Caisse de communauté', 
                text: 'Tirez la première carte du paquet correspondant, lisez son effet à voix haute et appliquez immédiatement la consigne (gain, perte, déplacement).',
                badge: 'Cartes'
            },
            { 
                title: 'Impôts & Taxes', 
                text: 'Payez immédiatement à la banque le montant forfaitaire exigé par la case (ex: Impôt sur le revenu ou Taxe de luxe).',
                badge: 'Taxe'
            },
            { 
                title: 'Parc Gratuit', 
                text: 'Une zone neutre de repos où il ne se passe rien : aucun paiement n’est requis et aucune somme n’est perçue.',
                badge: 'Repos'
            },
        ],
    },
    {
        id: 'jail',
        title: 'La Prison',
        label: 'Enfermement & Évasion',
        color: 'bg-rose-600',
        icon: '🔒',
        introduction: 'La prison limite vos mouvements sur le plateau mais ne vous empêche pas de percevoir vos loyers habituels !',
        cards: [
            { 
                title: 'Comment y aller', 
                text: 'Vous allez directement en prison en tombant sur la case "Allez en prison", en tirant une carte punitive ou en faisant 3 doubles consécutifs.',
                badge: 'Entrée'
            },
            { 
                title: 'Comment en sortir', 
                text: 'Obtenez un double lors de vos 3 prochains tours, payez une amende de 50 € avant de lancer les dés, ou utilisez une carte "Vous êtes libéré de prison".',
                badge: 'Sortie'
            },
            { 
                title: 'Visite simple', 
                text: 'Si vous atterrissez sur la case Prison lors d’un déplacement normal sans y être envoyé, vous êtes en "Simple Visite" sans pénalité.',
                badge: 'Visite'
            },
        ],
    },
    {
        id: 'endgame',
        title: 'Faillite & Victoire',
        label: 'Fin de la partie',
        color: 'bg-zinc-800',
        icon: '🏆',
        introduction: 'Quand un joueur ne peut plus honorer ses dettes, il doit déclarer faillite et quitter la partie.',
        cards: [
            { 
                title: 'Hypothèque & Vente', 
                text: 'Pour réunir des liquidités, vous pouvez revendre vos maisons/hôtels à la banque pour la moitié de leur prix ou hypothéquer des terrains nus.',
                badge: 'Sauvetage'
            },
            { 
                title: 'Déclaration de faillite', 
                text: 'Si votre trésorerie et la valeur de vos biens ne suffisent pas à régler votre créancier, vous êtes éliminé. Vos biens reviennent au créancier.',
                badge: 'Élimination'
            },
            { 
                title: 'Victoire finale', 
                text: 'Le dernier joueur survivant après l’élimination de tous ses adversaires est proclamé vainqueur de MonopolYnov !',
                badge: 'Vainqueur'
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
                className="flex max-h-[min(700px,calc(100vh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-2xl md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Volet Latéral / Menu des catégories */}
                <aside className="flex w-full shrink-0 flex-col border-b border-zinc-800 bg-zinc-950 p-4 md:w-60 md:border-b-0 md:border-r">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold">
                                MonopolYnov
                            </span>
                            <h2 id="rules-modal-title" className="text-base font-bold text-white tracking-tight">
                                Règles du Jeu
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-7 w-7 items-center justify-center rounded border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden cursor-pointer"
                            aria-label="Fermer"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Liste des onglets */}
                    <nav className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
                        {RULE_SECTIONS.map((section) => {
                            const isActive = activeSection.id === section.id
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSection(section)}
                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition cursor-pointer whitespace-nowrap md:whitespace-normal ${
                                        isActive
                                            ? 'bg-zinc-800 text-white border border-zinc-700 font-semibold shadow-sm'
                                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                                    }`}
                                >
                                    <span className="text-sm shrink-0">{section.icon}</span>
                                    <span className="truncate">{section.title}</span>
                                </button>
                            )
                        })}
                    </nav>

                    <div className="mt-auto hidden pt-4 md:block">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded border border-zinc-700 bg-zinc-800 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition cursor-pointer"
                        >
                            Fermer
                        </button>
                    </div>
                </aside>

                {/* Zone Principale de Contenu */}
                <div className="flex min-h-0 flex-1 flex-col bg-zinc-900">
                    {/* Header de la section active façon carte Monopoly */}
                    <header className="border-b border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`h-8 w-2 rounded-full ${activeSection.color}`} />
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                                    {activeSection.label}
                                </span>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <span>{activeSection.icon}</span> {activeSection.title}
                                </h3>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="hidden h-7 w-7 items-center justify-center rounded border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white md:flex cursor-pointer text-xs"
                            title="Fermer (Échap)"
                        >
                            ✕
                        </button>
                    </header>

                    {/* Contenu Défilable */}
                    <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                        {/* Encart résumé / introduction */}
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3.5 text-xs text-zinc-300 leading-relaxed">
                            {activeSection.introduction}
                        </div>

                        {/* Grille des cartes de règles */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            {activeSection.cards.map((card) => (
                                <article
                                    key={card.title}
                                    className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-zinc-700"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <h4 className="font-semibold text-xs text-white">
                                                {card.title}
                                            </h4>
                                            {card.badge && (
                                                <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 shrink-0">
                                                    {card.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            {card.text}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
