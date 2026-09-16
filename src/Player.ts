import {Propriety} from './Propriety.ts'

export class Player{
    id : number;
    name : string;
    c : number ;
    haveProp : Propriety[]
    money : number;

    constructor(id:number ,name:string, c: number,money : number){
        this.id=id
        this.name = name
        this.c = c
        this.haveProp = []
        this.money = money
    }

    buy(p:Propriety){
        if(this.money-p.price>0){
            p.isBuyBy(this)
            this.money-=p.price
            this.haveProp.push(p)
            return true
        }
        return false
    }

    startCase(){
        this.money+=200
    }

    taxe(n:number){
        if(this.money-n>0){
            this.money-=n
            return true
        }
        return false
    }

    checkProp(p:Propriety){
        for (let i=0;i<this.haveProp.length;i++){
            if (this.haveProp[i].id==p.id){
                return true
            }
        }
        return false
    }

    upgrade(p:Propriety){
        if (this.checkProp(p)){
            if (this.money>p.costHouse){
                this.money-=p.costHouse
                p.upgrade()
            }
        }
    }
}