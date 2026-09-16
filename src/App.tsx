import { Case } from "./Case.tsx";
import './index.css'
import { Player } from "./Player.ts";
import {Propriety} from "./Propriety.ts"

const p = new Propriety("Rue de la paix",500,[250,50,75,95,200,1500],250,"brown")
const pl = new Player(-1,"",1,3000)
function App() {

    return (
        <>
            <Case propriety={p} player={pl}></Case>
        </>
    )
}

export default App
