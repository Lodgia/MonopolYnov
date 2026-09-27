import { Player } from './Player.ts';

export type ColorsProp = "brown" | "cyan" | "pink" | "orange" | "red" | "yellow" | "green" | "blue" | "";

const colorClasses = {
    brown: "bg-yellow-950",
    cyan: "bg-blue-300",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    yellow: "bg-amber-300",
    blue: "bg-blue-500",
    green: "bg-green-500",
};

export interface Square {
    id: number;
    name: string;
    type: "property" | "station" | "utility" | "special";
    color?: string;
}

export class Propriety implements Square {
    id: number;
    name: string;
    type: "property" | "station" | "utility";
    buyBy: number;
    playerIn: number;
    costHouse: number;
    allCost: number[];
    price: number;
    color: string;
    level: number;

    constructor(id: number, name: string, type: "property" | "station" | "utility", costHouse: number, allCost: number[], price: number, color: ColorsProp) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.buyBy = -1;
        this.playerIn = -1;
        this.costHouse = costHouse;
        this.level = 0;
        this.allCost = allCost;
        this.price = price;
        this.color = color ? colorClasses[color] : "";
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
}

export class SpecialSquare implements Square {
    id: number;
    name: string;
    type: "special";
    subType: "start" | "chance" | "community" | "tax" | "jail" | "parking" | "go-to-jail";

    constructor(id: number, name: string, subType: "start" | "chance" | "community" | "tax" | "jail" | "parking" | "go-to-jail") {
        this.id = id;
        this.name = name;
        this.type = "special";
        this.subType = subType;
    }
}