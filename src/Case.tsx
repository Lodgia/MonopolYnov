interface CaseProps{
    buyBy : Player,
    playerIn : Player,
    name : string,
    costHouse : number,
    allcost : number[]
    price : number
}
export function Case(props : CaseProps){
    return (
        <>
            <div>
                <p>{props.name}</p>
                <p>{props.price}</p>
            </div>
        </>
    )
}