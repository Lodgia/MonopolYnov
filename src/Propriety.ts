import {Player} from './Player.ts'

type ColorsProp = "brown"|"cyan"|"pink"|"orange"|"red"|"yellow"|"green"|"blue"|""
const colorClasses = {
    brown: "bg-yellow-950",
    cyan:"bg-blue-300",
    pink:"bg-pink-500",
    orange:"bg-orange-500",
    red: "bg-red-500",
    yellow: "bg-amber-300",
    blue: "bg-blue-500",
    green: "bg-green-500",
};

export class Propriety{
    id : number
    buyBy : number;
    playerIn : number;
    name : string;
    costHouse : number;
    allCost : number[];
    price : number
    color : string
    level : number

    constructor(id : number,name: string,costHouse:number,allCost : number[],price:number,color : ColorsProp){
        this.id=id
        this.buyBy = -1;
        this.playerIn = -1;
        this.name = name;
        this.costHouse = costHouse;
        this.level = 0;
        this.allCost = allCost;
        this.price = price;
        this.color = colorClasses[color];
    }

    upgrade(){
        this.level++
        this.price = this.allCost[this.level]
    }
    
    isBuyBy(p:Player){
        this.price = this.allCost[this.level++]
        this.buyBy = p.id
    }

    taxe(p:Player){
        p.taxe(this.price)
    }
}