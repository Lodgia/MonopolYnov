class Player{
    name : string;
    c : Case ;
    money : number;

    constructor(name:string, c: Case,money : number){
        this.name = name
        this.c = c
        this.money = money
    }

    buy(n:number){
        if(this.money-n>0){
            this.money-=n
            return `Propriété acheté !`
        }
        return `Vous n'avez pas assez d'argent...`
    }

    startCase(){
        this.money+=200
    }
}