import {Player} from './Player'

export class Propriety{
    buyBy : number;
    playerIn : number;
    name : string;
    costHouse : number;
    allCost : number[];
    price : number

    constructor(name: string,costHouse:number,allCost : number[],price:number){
        this.buyBy = -1;
        this.playerIn = -1;
        this.name = name;
        this.costHouse = costHouse,
        this.allCost = allCost;
        this.price = price;
    }

    upgrade(n:number){
        this.price = this.allCost[n]
    }
    
    isBuyBy(p:Player){
        this.price = this.allCost[0]
        this.buyBy = p.id
    }

    taxe(p:Player){
        p.taxe(this.price)
    }
}