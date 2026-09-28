import { Player } from './Player.ts';
import RandomCard, { type CardType } from '../data/randomCards.ts';

export interface SquareActionContext {
    player: Player;
    players: Player[];
    diceTotal: number;
    onCardDrawn: (label: string, type: CardType) => void;
}

export type ColorsProp = "brown" | "cyan" | "pink" | "orange" | "red" | "yellow" | "green" | "blue" | "";

export const colorClasses: Record<string, string> = {
    brown: "bg-yellow-950",
    cyan: "bg-blue-300",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    yellow: "bg-amber-300",
    blue: "bg-blue-500",
    green: "bg-green-500",
    "": "bg-zinc-700",
};

export const colorNamesFr: Record<string, string> = {
    brown: "Marron",
    cyan: "Bleu ciel",
    pink: "Rose",
    orange: "Orange",
    red: "Rouge",
    yellow: "Jaune",
    green: "Vert",
    blue: "Bleu foncé",
    "": "Spécial",
};

export interface Square {
    id: number;
    name: string;
    type: "property" | "station" | "utility" | "special";
    color?: string;
    colorKey?: ColorsProp;
    price?: number;
    subType?: "start" | "chance" | "community" | "tax" | "jail" | "parking" | "go-to-jail";
    action?: (context: SquareActionContext) => number;
}

export class property implements Square {
    id: number;
    name: string;
    type: "property" | "station" | "utility";
    buyBy: number;
    playerIn: number;
    costHouse: number;
    allCost: number[];
    price: number;
    color: string;
    colorKey: ColorsProp;
    level: number;
    action?: (context: SquareActionContext) => number;

    constructor(
        id: number,
        name: string,
        type: "property" | "station" | "utility",
        costHouse: number,
        allCost: number[],
        price: number,
        color: ColorsProp
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.buyBy = -1;
        this.playerIn = -1;
        this.costHouse = costHouse;
        this.level = 0;
        this.allCost = allCost;
        this.price = price;
        this.colorKey = color;
        this.color = color ? colorClasses[color] : "";
        this.action = ({ player, players, diceTotal }) => {
            if (this.buyBy === -1 || this.buyBy === player.id) return 0;

            const owner = players.find((candidate) => candidate.id === this.buyBy);
            if (!owner) return 0;

            let rent = 0;
            if (this.type === "utility") {
                const ownedUtilities = players.flatMap((candidate) => candidate.haveProp)
                    .filter((owned) => owned.type === "utility" && owned.buyBy === owner.id).length;
                rent = diceTotal * (ownedUtilities > 1 ? 10 : 4);
            } else {
                const ownedInGroup = players.flatMap((candidate) => candidate.haveProp)
                    .filter((owned) => owned.type === this.type && owned.buyBy === owner.id).length;
                const rentIndex = this.type === "station" ? Math.max(0, ownedInGroup - 1) : this.level;
                rent = this.allCost[Math.min(rentIndex, this.allCost.length - 1)] ?? 0;
            }

            owner.money += rent;
            return -rent;
        };
    }

    upgrade() {
        if (this.level < this.allCost.length - 1) {
            this.level++;
            this.price = this.allCost[this.level];
        }
    }

    isBuyBy(p: Player) {
        this.buyBy = p.id;
    }

    taxe(p: Player) {
        p.taxe(this.price);
    }

    getRent(level: number = this.level, isFullGroup: boolean = false, stationCount: number = 1, diceTotal: number = 7): number {
        if (this.type === "station") {
            const stationRents = [25, 50, 100, 200];
            const idx = Math.min(Math.max(stationCount - 1, 0), 3);
            return stationRents[idx];
        }

        if (this.type === "utility") {
            return stationCount >= 2 ? diceTotal * 10 : diceTotal * 4;
        }

        if (level === 0) {
            return isFullGroup ? this.allCost[0] * 2 : this.allCost[0];
        }

        return this.allCost[Math.min(level, this.allCost.length - 1)] ?? this.allCost[0];
    }
}

export class SpecialSquare implements Square {
    id: number;
    name: string;
    type: "special";
    subType: "start" | "chance" | "community" | "tax" | "jail" | "parking" | "go-to-jail";
    action?: (context: SquareActionContext) => number;

    constructor(
        id: number,
        name: string,
        subType: "start" | "chance" | "community" | "tax" | "jail" | "parking" | "go-to-jail"
    ) {
        this.id = id;
        this.name = name;
        this.type = "special";
        this.subType = subType;
        this.action = ({ player, players, onCardDrawn }) => {
            if (this.subType === "start") return 200;
            if (this.subType === "tax") return this.id === 4 ? -200 : -100;
            if (this.subType === "go-to-jail") {
                player.c = 10;
                player.isInJail = true;
                player.jailTurns = 0;
                return 0;
            }
            if (this.subType !== "chance" && this.subType !== "community") return 0;

            const cardType: CardType = this.subType === "chance" ? "luckyCards" : "communityCards";
            const card = RandomCard(cardType);
            onCardDrawn(card.label, cardType);

            if (card.jailFree) {
                player.jailFreeCards++;
                return 0;
            }
            if (card.goToJail) {
                player.c = 10;
                player.isInJail = true;
                player.jailTurns = 0;
                return 0;
            }
            if (card.destination !== undefined) {
                const destination = card.destination === -1
                    ? [5, 15, 25, 35].find((station) => station > player.c) ?? 5
                    : (card.destination < 0
                        ? (player.c + card.destination + 40) % 40
                        : card.destination);
                const passedStart = card.passStart && destination > 0 && destination < player.c;
                player.c = destination;
                return (card.amount ?? 0) + (passedStart ? 200 : 0);
            }
            if (card.birthday) {
                const others = players.filter((candidate) => candidate.id !== player.id);
                others.forEach((candidate) => { candidate.money -= 10; });
                return others.length * 10;
            }
            if (card.repairRate) {
                const properties = player.haveProp;
                const houses = properties.reduce((sum, owned) => sum + Math.min(owned.level, 4), 0);
                const hotels = properties.filter((owned) => owned.level >= 5).length;
                return -(houses * card.repairRate.house + hotels * card.repairRate.hotel);
            }
            return card.amount ?? 0;
        };
    }
}
