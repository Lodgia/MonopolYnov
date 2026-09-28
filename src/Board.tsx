
import { Case } from "./Case.tsx";
import { Player } from "./Player.ts";
import {monopolyBoard} from "./allCases.ts"


export function Board(){
    
    let player1 = new Player(1,"p1",24,3500,"bg-blue-500")
    let player2 = new Player(2,"p2",4,3500,"bg-red-500")
    let player3 = new Player(3,"p3",17,3500,"bg-green-500")
    let player4 = new Player(4,"p4",18,3500,"bg-orange-500")
    let players = [player1,player2,player3,player4]

    return (
    <>
    
    <div className="grid grid-cols-[repeat(11,minmax(0,1fr))] grid-rows-[repeat(11,minmax(0,1fr))] gap-0.5 mx-auto w-full max-w-2xl aspect-square p-2 text-xs font-bold text-center bg-green-100">

        <div className="col-start-1 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[0]} position="corner"/></div>
        <div className="col-start-2 row-start-1 w-full h-full "><Case players={players} property={monopolyBoard[1]} position="bottom"/></div>
        <div className="col-start-3 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[2]} position="bottom"/></div>
        <div className="col-start-4 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[3]} position="bottom"/></div>
        <div className="col-start-5 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[4]} position="bottom"/></div>
        <div className="col-start-6 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[5]} position="bottom"/></div>
        <div className="col-start-7 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[6]} position="bottom"/></div>
        <div className="col-start-8 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[7]} position="bottom"/></div>
        <div className="col-start-9 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[8]} position="bottom"/></div>
        <div className="col-start-10 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[9]} position="bottom"/></div>
        <div className="col-start-11 row-start-1 w-full h-full"><Case players={players} property={monopolyBoard[10]} position="corner"/></div>

        <div className="col-start-11 row-start-2 w-full h-full"><Case players={players} property={monopolyBoard[11]} position="left"/></div>
        <div className="col-start-11 row-start-3 w-full h-full"><Case players={players} property={monopolyBoard[12]} position="left"/></div>
        <div className="col-start-11 row-start-4 w-full h-full"><Case players={players} property={monopolyBoard[13]} position="left"/></div>
        <div className="col-start-11 row-start-5 w-full h-full"><Case players={players} property={monopolyBoard[14]} position="left"/></div>
        <div className="col-start-11 row-start-6 w-full h-full"><Case players={players} property={monopolyBoard[15]} position="left"/></div>
        <div className="col-start-11 row-start-7 w-full h-full"><Case players={players} property={monopolyBoard[16]} position="left"/></div>
        <div className="col-start-11 row-start-8 w-full h-full"><Case players={players} property={monopolyBoard[17]} position="left"/></div>
        <div className="col-start-11 row-start-9 w-full h-full"><Case players={players} property={monopolyBoard[18]} position="left"/></div>
        <div className="col-start-11 row-start-10 w-full h-full"><Case players={players} property={monopolyBoard[19]} position="left"/></div>

        <div className="col-start-11 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[20]} position="corner"/></div>
        <div className="col-start-10 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[21]} position="top"/></div>
        <div className="col-start-9 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[22]} position="top"/></div>
        <div className="col-start-8 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[23]} position="top"/></div>
        <div className="col-start-7 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[24]} position="top"/></div>
        <div className="col-start-6 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[25]} position="top"/></div>
        <div className="col-start-5 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[26]} position="top"/></div>
        <div className="col-start-4 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[27]} position="top"/></div>
        <div className="col-start-3 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[28]} position="top"/></div>
        <div className="col-start-2 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[29]} position="top"/></div>

        <div className="col-start-1 row-start-11 w-full h-full"><Case players={players} property={monopolyBoard[30]} position="corner"/></div>
        <div className="col-start-1 row-start-10 w-full h-full"><Case players={players} property={monopolyBoard[31]} position="right"/></div>
        <div className="col-start-1 row-start-9 w-full h-full"><Case players={players} property={monopolyBoard[32]} position="right"/></div>
        <div className="col-start-1 row-start-8 w-full h-full"><Case players={players} property={monopolyBoard[33]} position="right"/></div>
        <div className="col-start-1 row-start-7 w-full h-full"><Case players={players} property={monopolyBoard[34]} position="right"/></div>
        <div className="col-start-1 row-start-6 w-full h-full"><Case players={players} property={monopolyBoard[35]} position="right"/></div>
        <div className="col-start-1 row-start-5 w-full h-full"><Case players={players} property={monopolyBoard[36]} position="right"/></div>
        <div className="col-start-1 row-start-4 w-full h-full"><Case players={players} property={monopolyBoard[37]} position="right"/></div>
        <div className="col-start-1 row-start-3 w-full h-full"><Case players={players} property={monopolyBoard[38]} position="right"/></div>
        <div className="col-start-1 row-start-2 w-full h-full"><Case players={players} property={monopolyBoard[39]} position="right"/></div>

        <div className="col-start-2 col-end-11 row-start-2 row-end-11 ">Center
        </div>

    </div>

    </>
   )
}