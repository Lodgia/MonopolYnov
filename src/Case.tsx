import {Propriety} from './Propriety.ts'
import {Player} from './Player.ts'
interface CaseProps{
    propriety : Propriety,
    player : Player

}
export function Case(props : CaseProps){
    return (
        <>  
        <div className="absolute border rounded-sm ">
            <div className={`${props.propriety.color} min-w-[200px] min-h-[50px] rounded-t-sm`}></div>
            <div className="rotate-[180] min-h-[200px] text-center ">
                <h1 className="mt-5 font-bold text-[20px]">{props.propriety.name}</h1>
                <p className="mt-35 font-bold">{props.propriety.price}$</p>
            </div>
        </div>
        </>
    )
}