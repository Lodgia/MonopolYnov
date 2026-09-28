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
        introduction: 'Devenez le dernier joueur encore en jeu en achetant des terrains et en faisant payer des loyers à vos adversaires.',
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 select-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-modal-title"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl bg-white border-3 border-red-500 p-5 sm:p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                    <div className="flex items-center gap-2">
                        <h3 id="rules-modal-title" className="font-bold text-base text-red-500 uppercase">
                            Règles du jeu - MonopolYnov
                        </h3>
                    </div>

                    <div className="border-2 border-red-500">
                        <button
                            onClick={onClose}
                            className="inline-block border-2 border-white text-xs font-bold p-1 bg-red-500 text-white cursor-pointer"
                        >
                            ✕ Fermer
                        </button>
                    </div>
                </div>

                {/* 2 Colonnes DA Projet (Bleu 300 / Blanc / Bordures Rouges) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Colonne gauche : Catégories */}
                    <div className="flex flex-col gap-2 bg-blue-300 border-3 border-red-500 p-3.5">
                        <span className="text-xs font-semibold text-red-500 border-b border-zinc-750 pb-1">
                            Sections ({RULE_SECTIONS.length})
                        </span>

                        <div className="flex flex-col gap-2">
                            {RULE_SECTIONS.map((section) => {
                                const isActive = activeSection.id === section.id
                                return (
                                    <div
                                        key={section.id}
                                        className={`border-2 ${isActive ? 'border-red-500' : 'border-blue-500'}`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setActiveSection(section)}
                                            className={`inline-block border-2 border-white text-xs font-bold p-2 w-full text-left cursor-pointer transition ${
                                                isActive ? 'bg-red-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                                            }`}
                                        >
                                            <span className="mr-1.5">{section.icon}</span> {section.title}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Colonne droite : Contenu des règles */}
                    <div className="md:col-span-2 flex flex-col gap-3 bg-blue-300 border-3 border-red-500 p-3.5 text-xs max-h-[60vh] overflow-y-auto">
                        <span className="text-xs font-semibold text-red-500 border-b border-zinc-750 pb-1">
                            {activeSection.icon} {activeSection.title} ({activeSection.label})
                        </span>

                        {/* Intro */}
                        <div className="bg-white border-2 border-red-500 p-3 font-bold text-zinc-900 leading-relaxed shadow-sm">
                            {activeSection.introduction}
                        </div>

                        {/* Grille de cartes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeSection.cards.map((card) => (
                                <div
                                    key={card.title}
                                    className="bg-white border-2 border-red-500 p-3 flex flex-col justify-between gap-2 shadow-sm"
                                >
                                    <div>
                                        <div className="flex items-center justify-between border-b border-zinc-200 pb-1 mb-1.5">
                                            <span className="font-bold text-red-500 text-xs uppercase">
                                                {card.title}
                                            </span>
                                            {card.badge && (
                                                <span className="border-2 border-blue-500">
                                                    <span className="inline-block border-2 border-white text-[9px] font-bold p-0.5 px-1 bg-blue-500 text-white">
                                                        {card.badge}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-zinc-800 text-[11px] leading-relaxed">
                                            {card.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}