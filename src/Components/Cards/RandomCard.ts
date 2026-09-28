export type CardType = "communityCards" | "luckyCards" | "chance" | "community";

export interface GameCard {
    title: string;
    label: string;
    type: "chance" | "community" | "luckyCards" | "communityCards";
    amount?: number;
    moneyChange?: number;
    destination?: number;
    moveTo?: number;
    passStart?: boolean;
    goToJail?: boolean;
    getOutOfJail?: boolean;
    jailFree?: boolean;
    birthday?: boolean;
    repairRate?: { house: number; hotel: number };
}

export const CHANCE_CARDS: GameCard[] = [
    {
        title: "Carte Chance",
        type: "chance",
        label: "Avancez jusqu'à la case Départ. Recevez 200 €.",
        destination: 0,
        moveTo: 0,
        amount: 200,
        moneyChange: 200,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Rendez-vous à la Rue de la Paix.",
        destination: 39,
        moveTo: 39,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Avancez jusqu'à la Gare de Lyon. Si vous passez par la case Départ, recevez 200 €.",
        destination: 15,
        moveTo: 15,
        passStart: true,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "La banque vous verse un dividende de 50 €.",
        amount: 50,
        moneyChange: 50,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Vous avez gagné le concours de mots croisés : recevez 100 €.",
        amount: 100,
        moneyChange: 100,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Amende pour excès de vitesse : payez 50 € à la banque.",
        amount: -50,
        moneyChange: -50,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Frais de scolarité : payez 150 €.",
        amount: -150,
        moneyChange: -150,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Allez en prison. Rendez-vous directement en prison sans passer par la case Départ.",
        goToJail: true,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Votre immeuble et votre prêt rapportent : touchez 150 €.",
        amount: 150,
        moneyChange: 150,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Vous êtes libéré de prison. Cette carte peut être conservée.",
        jailFree: true,
        getOutOfJail: true,
    },
];

export const COMMUNITY_CARDS: GameCard[] = [
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Erreur de la banque en votre faveur : recevez 200 €.",
        amount: 200,
        moneyChange: 200,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Héritage : vous touchez 100 € de la succession.",
        amount: 100,
        moneyChange: 100,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Les contributions vous remboursent un trop-perçu de 50 €.",
        amount: 50,
        moneyChange: 50,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Payez la note du médecin : versez 50 €.",
        amount: -50,
        moneyChange: -50,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Payez votre police d'assurance hospitalière : 100 €.",
        amount: -100,
        moneyChange: -100,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "C'est votre anniversaire : recevez 20 € de la banque.",
        amount: 20,
        moneyChange: 20,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Allez en prison. Rendez-vous directement en prison sans passer par la case Départ.",
        goToJail: true,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Vente de votre stock usagé : vous recevez 50 €.",
        amount: 50,
        moneyChange: 50,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Vous êtes libéré de prison. Cette carte peut être conservée.",
        jailFree: true,
        getOutOfJail: true,
    },
];

export function drawCard(cardType: CardType): GameCard {
    const list = cardType === "chance" || cardType === "luckyCards" ? CHANCE_CARDS : COMMUNITY_CARDS;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
}

export type CardResult = GameCard;

export default function RandomCard(cardType: CardType): GameCard {
    return drawCard(cardType);
}