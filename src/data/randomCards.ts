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
        label: "{player} avance jusqu'à la case Départ et reçoit 200 €.",
        destination: 0,
        moveTo: 0,
        amount: 200,
        moneyChange: 200,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "{player} se rend directement à la Rue de la Paix.",
        destination: 39,
        moveTo: 39,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "{player} avance jusqu'à la Gare de Lyon. S'il passe par la case Départ, il reçoit 200 €.",
        destination: 15,
        moveTo: 15,
        passStart: true,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "La banque verse un dividende de 50 € à {player}.",
        amount: 50,
        moneyChange: 50,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "{player} a gagné le concours de mots croisés : il reçoit 100 €.",
        amount: 100,
        moneyChange: 100,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Amende pour excès de vitesse : {player} paie 50 € à la banque.",
        amount: -50,
        moneyChange: -50,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Frais de scolarité : {player} paie 150 €.",
        amount: -150,
        moneyChange: -150,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Allez en prison ! {player} est envoyé directement en prison sans passer par la case Départ.",
        goToJail: true,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "Les investissements de {player} rapportent : il touche 150 €.",
        amount: 150,
        moneyChange: 150,
    },
    {
        title: "Carte Chance",
        type: "chance",
        label: "{player} obtient une carte 'Vous êtes libéré de prison'.",
        jailFree: true,
        getOutOfJail: true,
    },
];

export const COMMUNITY_CARDS: GameCard[] = [
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Erreur de la banque en faveur de {player} : il reçoit 200 €.",
        amount: 200,
        moneyChange: 200,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Héritage : {player} touche 100 € de la succession.",
        amount: 100,
        moneyChange: 100,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Les contributions remboursent un trop-perçu de 50 € à {player}.",
        amount: 50,
        moneyChange: 50,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Consultation médicale : {player} paie 50 €.",
        amount: -50,
        moneyChange: -50,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Assurance hospitalière : {player} règle la somme de 100 €.",
        amount: -100,
        moneyChange: -100,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "C'est l'anniversaire de {player} : la banque lui offre 20 €.",
        amount: 20,
        moneyChange: 20,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Allez en prison ! {player} est envoyé directement en prison sans passer par la case Départ.",
        goToJail: true,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "Vente de stock usagé : {player} encaisse 50 €.",
        amount: 50,
        moneyChange: 50,
    },
    {
        title: "Caisse de Communauté",
        type: "community",
        label: "{player} obtient une carte 'Vous êtes libéré de prison'.",
        jailFree: true,
        getOutOfJail: true,
    },
];

export function drawCard(cardType: CardType, playerName: string = "Le joueur"): GameCard {
    const list = cardType === "chance" || cardType === "luckyCards" ? CHANCE_CARDS : COMMUNITY_CARDS;
    const index = Math.floor(Math.random() * list.length);
    const card = list[index];
    return {
        ...card,
        label: card.label.replace(/\{player\}/g, playerName),
    };
}

export type CardResult = GameCard;

export default function RandomCard(cardType: CardType, playerName?: string): GameCard {
    return drawCard(cardType, playerName);
}
