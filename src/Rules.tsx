import { useState } from 'react'

type RuleCard = {
    title: string
    text: string
}

type RuleSection = {
    title: string
    label: string
    introduction: string
    cards: RuleCard[]
}

const ruleSections: RuleSection[] = [
    {
        title: 'Début de partie',
        label: 'Le but du jeu',
        introduction: 'Devenez le dernier joueur encore en jeu en faisant payer des loyers à vos adversaires.',
        cards: [
            { title: 'Objectif', text: 'Achetez des propriétés, construisez des maisons et des hôtels, puis percevez des loyers pour ruiner les autres joueurs.' },
            { title: 'Le gagnant', text: 'La partie s’arrête lorsqu’un seul joueur n’est pas en faillite. Ce joueur remporte la partie.' },
        ],
    },
    {
        title: 'Déroulement d’un tour',
        label: 'À votre tour',
        introduction: 'Lancez les deux dés, déplacez votre pion et appliquez l’effet de la case d’arrivée.',
        cards: [
            { title: 'Déplacement', text: 'Avancez votre pion dans le sens des aiguilles d’une montre du nombre de cases indiqué par les dés. Vous pouvez rejouer si vous obtenez un double.' },
            { title: 'Trois doubles', text: 'Si vous obtenez trois doubles consécutifs pendant le même tour, vous allez directement en prison et votre tour s’arrête.' },
            { title: 'Case libre', text: 'Si la case est une propriété sans propriétaire, vous pouvez l’acheter au prix indiqué. Si vous refusez, elle doit être proposée aux enchères.' },
            { title: 'Propriété occupée', text: 'Si elle appartient à un autre joueur, payez le loyer indiqué sur son titre de propriété, sauf si le propriétaire oublie de le réclamer avant le lancer suivant.' },
        ],
    },
    {
        title: 'Propriétés',
        label: 'Acheter et construire',
        introduction: 'Constituez des groupes de couleur pour augmenter vos loyers et développer votre patrimoine.',
        cards: [
            { title: 'Groupes de couleur', text: 'Posséder toutes les propriétés d’un même groupe double le loyer des terrains sans construction et permet de construire.' },
            { title: 'Maisons', text: 'Construisez de manière équilibrée : vous ne pouvez pas poser une deuxième maison sur une propriété tant que chaque propriété du groupe n’en possède pas une.' },
            { title: 'Hôtels', text: 'Après quatre maisons sur une propriété, vous pouvez les rendre à la banque et acheter un hôtel, si la banque en possède encore.' },
            { title: 'Gares et compagnies', text: 'Le loyer des gares dépend du nombre de gares possédées. Celui des compagnies dépend du résultat des dés et du nombre de compagnies détenues.' },
        ],
    },
    {
        title: 'Cases spéciales',
        label: 'Les cases du plateau',
        introduction: 'Certaines cases déclenchent automatiquement une action ou un paiement.',
        cards: [
            { title: 'Départ', text: 'Chaque fois que vous passez ou vous arrêtez sur Départ, la banque vous verse 200 €.' },
            { title: 'Chance et Caisse de communauté', text: 'Piochez la carte correspondante, lisez-la à voix haute et appliquez immédiatement son effet. Replacez ensuite la carte selon ses instructions.' },
            { title: 'Impôts', text: 'Payez le montant indiqué sur la case à la banque.' },
            { title: 'Parc gratuit', text: 'Cette case est une simple case de repos : vous ne recevez pas l’argent des amendes et des impôts.' },
        ],
    },
    {
        title: 'Prison',
        label: 'Entrer et sortir',
        introduction: 'La prison ne vous empêche pas de percevoir des loyers, mais limite vos déplacements pendant quelques tours.',
        cards: [
            { title: 'Aller en prison', text: 'Vous allez en prison si vous tombez sur la case Allez en prison, si une carte vous y envoie ou si vous faites trois doubles consécutifs. Placez votre pion sur la case Prison sans recevoir 200 €.' },
            { title: 'Sortir de prison', text: 'Payez 50 €, utilisez une carte dédiée ou obtenez un double dans l’un de vos trois prochains tours. Après trois tours sans double, payez 50 € puis avancez du résultat obtenu.' },
        ],
    },
    {
        title: 'Fin de partie',
        label: 'Faillite et victoire',
        introduction: 'La partie continue jusqu’à ce qu’il ne reste plus qu’un joueur capable de payer ses dettes.',
        cards: [
            { title: 'Payer ses dettes', text: 'Vous pouvez vendre vos maisons et hôtels à la banque pour la moitié de leur prix afin de réunir de l’argent, puis payer ce que vous devez.' },
            { title: 'Faillite', text: 'Si vous ne pouvez pas payer, même après avoir vendu vos constructions, vous êtes éliminé. Le créancier récupère les biens prévus par la règle concernée.' },
            { title: 'Victoire', text: 'Le dernier joueur encore solvable gagne la partie.' },
        ],
    },
]

export default function Rules() {
    const [activeSection, setActiveSection] = useState(ruleSections[0])
    const [isOpen, setIsOpen] = useState(false)

    if (!isOpen) {
        return (
            <button
                type="button"
                className="fixed bottom-6 right-6 z-40 rounded-lg border-2 border-black bg-red-700 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300"
                onClick={() => setIsOpen(true)}
            >
                Règles du jeu
            </button>
        )
    }

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="rules-title"
                onClick={() => setIsOpen(false)}
            >
                <section
                    className="flex max-h-[min(720px,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-xl border-2 border-black bg-white shadow-2xl md:flex-row"
                    onClick={(event) => event.stopPropagation()}
                >
                    <aside className="flex w-full shrink-0 flex-col bg-black p-6 text-white md:w-64">
                        <div className="mb-8 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">MonopolYnov</p>
                                <h1 id="rules-title" className="mt-2 text-2xl font-bold">Règles du jeu</h1>
                            </div>
                            <button type="button" className="rounded-lg p-2 text-neutral-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400 md:hidden" aria-label="Fermer les règles" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true" className="text-2xl leading-none">×</span>
                            </button>
                        </div>

                        <nav aria-label="Sections des règles" className="grid gap-1 md:block">
                            {ruleSections.map((section) => (
                                <button
                                    key={section.title}
                                    type="button"
                                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-red-400 ${activeSection.title === section.title ? 'bg-red-700 font-semibold text-white' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}
                                    aria-current={activeSection.title === section.title ? 'page' : undefined}
                                    onClick={() => setActiveSection(section)}
                                >
                                    {section.title}
                                </button>
                            ))}
                        </nav>

                        <button type="button" className="mt-6 hidden rounded-lg border border-neutral-600 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-neutral-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400 md:mt-auto md:block" onClick={() => setIsOpen(false)}>
                            Fermer
                        </button>
                    </aside>

                    <div className="flex min-h-0 flex-1 flex-col">
                        <header className="flex items-center justify-between border-b-2 border-black bg-white px-6 py-5 md:px-8">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-red-700">Guide de partie</p>
                                <h2 className="mt-1 text-xl font-bold text-black">{activeSection.title}</h2>
                            </div>
                            <button type="button" className="hidden rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-red-400 md:block" aria-label="Fermer les règles" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true" className="text-2xl leading-none">×</span>
                            </button>
                        </header>

                        <main className="min-h-0 flex-1 overflow-y-auto bg-neutral-100 px-6 py-6 md:px-8">
                            <div className="rounded-lg border-2 border-black bg-white p-6">
                                <p className="text-sm font-bold uppercase tracking-wider text-red-700">{activeSection.label}</p>
                                <h3 className="mt-3 text-2xl font-bold text-black">{activeSection.title}</h3>
                                <p className="mt-2 max-w-2xl text-neutral-600">{activeSection.introduction}</p>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {activeSection.cards.map((card, index) => (
                                    <article key={card.title} className="rounded-lg border border-black bg-white p-5">
                                        <div className={`mb-4 h-2 w-16 ${index % 2 === 0 ? 'bg-red-700' : 'bg-black'}`} />
                                        <h3 className="font-semibold text-black">{card.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-neutral-600">{card.text}</p>
                                    </article>
                                ))}
                            </div>
                        </main>
                    </div>
                </section>
            </div>
        </>
    )
}