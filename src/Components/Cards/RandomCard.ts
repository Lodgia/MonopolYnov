"use client"

export default function RandomCard (cardType : "communityCards" | "luckyCards") {
    const cards = {
        communityCards: [
            { label: "Vous avez gagné le prix des mots croisés : recevez F10 000." },
            { label: "Votre immeuble et votre prêt rapportent : touchez F15 000." },
            { label: "La banque vous verse un dividende de F5 000." },
            { label: "Payez pour frais de scolarité : f15 000." },
            { label: "Amende pour ivresse : payez F2 000." },
            { label: "Amende pour excès de vitesse : payez F1 500." },
            { label: "Faites des réparations dans toutes vos maisons. Versez pour chaque maison F2 500, et pour chaque hôtel F10 000." },
            { label: "Vous êtes imposé pour les réparations de voirie à raison de F4 000 par maison et F11 500 par hôtel." },
            { label: "Vous êtes libéré de prison. Cette carte peut être conservée jusqu’à ce qu’elle soit utilisée ou vendue." },
            { label: "Aller en prison. Rendez-vous directement à la prison. Ne passez pas par la case départ, ne touchez pas F20 000." },
            { label: "Reculez de trois cases." },
            { label: "Rendez-vous à la gare la plus proche. Si vous passez par la case départ, recevez F20 000." },
            { label: "Avancez jusqu’à la Gare de Lyon. Si vous passez par la case départ, recevez F20 000." },
            { label: "Avancez au Boulevard de La Villette. Si vous passez par la case départ, recevez F20 000." },
            { label: "Rendez-vous à l’Avenue Henri-Martin. Si vous passez par la case départ, recevez F20 000." },
            { label: "Rendez-vous à la Rue de la Paix." },
            { label: "Avancez jusqu’à la case départ. Touchez F20 000." },
        ],
        luckyCards: [
            { label: "Placez-vous sur la case départ. Touchez F20 000." },
            { label: "Retournez à Belleville." },
            { label: "Aller en prison.Rendez - vous directement à la prison.Ne passez pas par la case départ, ne touchez pas F20 000." },
            { label: "Vous êtes libéré de prison.Cette carte peut être conservée jusqu’à ce qu’elle soit utilisée ou vendue." },
            { label: "Erreur de la banque en votre faveur: recevez F20 000." },
            { label: "Recevez votre revenu annuel: f10 000." },
            { label: "Héritage : vous touchez F10 000." },
            { label: "La vente de votre stock vous rapporte F5 000." },
            { label: "Intérêts sur l’emprunt à 7 % : recevez F2 500." },
            { label: "Les contributions vous remboursent F2 000." },
            { label: "C’est votre anniversaire! Chaque joueur vous donne F1 000." },
            { label: "Vous avez gagné le 2e Prix de Beauté: recevez F1 000." },
            { label: "Payez votre Police d’Assurance: f5 000." },
            { label: "Payez la note du médecin: f5 000." },
            { label: "Payez une amende de F1 000 ou bien tirez une carte CHANCE." },
            { label: "Rendez-vous à la gare la plus proche.Si vous passez par la case départ, recevez F20 000." },
        ]
    }

    const card = cardType === "luckyCards" ? cards.luckyCards[Math.round(Math.random() * cards.luckyCards.length)].label : cards.communityCards[Math.round(Math.random() * cards.communityCards.length)].label
    return card
}