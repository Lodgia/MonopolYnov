export type CardType = "communityCards" | "luckyCards";

export interface CardResult {
    label: string;
    amount?: number;
    destination?: number;
    passStart?: boolean;
    goToJail?: boolean;
    jailFree?: boolean;
    birthday?: boolean;
    repairRate?: { house: number; hotel: number };
}

const cards: Record<CardType, CardResult[]> = {
    communityCards: [
        { label: "Vous avez gagné le prix des mots croisés : recevez F10 000.", amount: 100 },
        { label: "Votre immeuble et votre prêt rapportent : touchez F15 000.", amount: 150 },
        { label: "La banque vous verse un dividende de F5 000.", amount: 50 },
        { label: "Payez pour frais de scolarité : F15 000.", amount: -150 },
        { label: "Amende pour ivresse : payez F2 000.", amount: -20 },
        { label: "Amende pour excès de vitesse : payez F1 500.", amount: -15 },
        { label: "Réparations : versez F2 500 par maison et F10 000 par hôtel.", repairRate: { house: 25, hotel: 100 } },
        { label: "Réparations de voirie : versez F4 000 par maison et F11 500 par hôtel.", repairRate: { house: 40, hotel: 115 } },
        { label: "Vous êtes libéré de prison. Cette carte peut être conservée jusqu’à son utilisation ou sa vente.", jailFree: true },
        { label: "Allez en prison. Ne passez pas par la case départ, ne touchez pas F20 000.", goToJail: true },
        { label: "Reculez de trois cases.", destination: -3 },
        { label: "Rendez-vous à la gare la plus proche. Si vous passez par la case départ, recevez F20 000.", destination: -1, passStart: true },
        { label: "Avancez jusqu’à la Gare de Lyon. Si vous passez par la case départ, recevez F20 000.", destination: 15, passStart: true },
        { label: "Avancez au Boulevard de la Villette. Si vous passez par la case départ, recevez F20 000.", destination: 11, passStart: true },
        { label: "Rendez-vous à l’Avenue Henri-Martin. Si vous passez par la case départ, recevez F20 000.", destination: 24, passStart: true },
        { label: "Rendez-vous à la Rue de la Paix.", destination: 39 },
        { label: "Avancez jusqu’à la case départ. Touchez F20 000.", destination: 0 },
    ],
    luckyCards: [
        { label: "Placez-vous sur la case départ. Touchez F20 000.", destination: 0 },
        { label: "Retournez à Belleville.", destination: 1 },
        { label: "Allez en prison. Ne passez pas par la case départ, ne touchez pas F20 000.", goToJail: true },
        { label: "Vous êtes libéré de prison. Cette carte peut être conservée jusqu’à son utilisation ou sa vente.", jailFree: true },
        { label: "Erreur de la banque en votre faveur : recevez F20 000.", amount: 200 },
        { label: "Recevez votre revenu annuel : F10 000.", amount: 100 },
        { label: "Héritage : vous touchez F10 000.", amount: 100 },
        { label: "La vente de votre stock vous rapporte F5 000.", amount: 50 },
        { label: "Intérêts sur l’emprunt à 7 % : recevez F2 500.", amount: 25 },
        { label: "Les contributions vous remboursent F2 000.", amount: 20 },
        { label: "C’est votre anniversaire ! Chaque joueur vous donne F1 000.", birthday: true },
        { label: "Vous avez gagné le 2e Prix de Beauté : recevez F1 000.", amount: 10 },
        { label: "Payez votre police d’assurance : F5 000.", amount: -50 },
        { label: "Payez la note du médecin : F5 000.", amount: -50 },
        { label: "Payez une amende de F1 000.", amount: -10 },
        { label: "Rendez-vous à la gare la plus proche. Si vous passez par la case départ, recevez F20 000.", destination: -1, passStart: true },
    ],
};

export default function RandomCard(cardType: CardType): CardResult {
    const deck = cards[cardType];
    return deck[Math.floor(Math.random() * deck.length)];
}