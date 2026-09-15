import {Propriety} from './Propriety.ts'
import {Player} from './Player.ts'
interface CaseProps{
    propriety : Propriety,
    player : Player

}
export function Case(props : CaseProps){
    return (
        <>
            <div>
                <p>{props.propriety.name}</p>
                <p>{props.propriety.price}</p>
            </div>
        </>
    )
}