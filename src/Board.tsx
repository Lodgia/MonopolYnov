
import React from "react";
import { Case } from "./Case.tsx";
import { Player } from "./Player.ts";
import { Propriety } from "./Propriety.ts";
import {monopolyBoard} from "./allCases.ts"

export function Board(){
        
    const player = new Player(1,"",1,5000,"bg-blue-500")    
    const player2 = new Player(2,"",1,5000,"bg-red-500")
    return (
    <>
    
    <div className="grid grid-cols-[1.5fr_repeat(9,1fr)_1.5fr] grid-rows-[1.5fr_repeat(9,1fr)_1.5fr] gap-0.5 w-full h-full max-w-2xl aspect-square p-2 text-xs font-bold text-center bg-green-100">

        <div className="col-start-1 row-start-1 w-full h-full"><Case players={[player,player2]} propriety={monopolyBoard[0]} position="corner"/></div>
        <div className="col-start-2 row-start-1 w-full h-full "><Case players={[player]} propriety={monopolyBoard[1]} position="bottom"/></div>
        <div className="col-start-3 row-start-1 w-full h-full"><Case players={[player]} propriety={monopolyBoard[2]} position="bottom"/></div>
        <div className="col-start-4 row-start-1 w-full h-full"><Case players={[player]} propriety={monopolyBoard[3]} position="bottom"/></div>
        <div className="col-start-5 row-start-1 w-full h-full"><Case players={[player]} propriety={monopolyBoard[4]} position="bottom"/></div>
        <div className="col-start-6 row-start-1 w-full h-full"><Case players={[player]} propriety={monopolyBoard[5]} position="bottom"/></div>
        <div className="col-start-7 row-start-1 w-full h-full"><Case players={[player]} propriety={monopolyBoard[6]} position="bottom"/></div>
        <div className="col-start-8 row-start-1 w-full h-full"><Case players={[player]} propriety={monopolyBoard[7]} position="bottom"/></div>
        <div className="col-start-9 row-start-1 w-full h-full"><Case players={[player]} propriety={monopolyBoard[8]} position="bottom"/></div>
        <div className="col-start-10 row-start-1 w-full h-full"><Case players={[player]} propriety={monopolyBoard[9]} position="bottom"/></div>
        <div className="col-start-11 row-start-1 w-full h-full"><Case players={[player]} propriety={monopolyBoard[10]} position="corner"/></div>

        <div className="col-start-11 row-start-2 w-full h-full"><Case players={[player]} propriety={monopolyBoard[11]} position="left"/></div>
        <div className="col-start-11 row-start-3 w-full h-full"><Case players={[player]} propriety={monopolyBoard[12]} position="left"/></div>
        <div className="col-start-11 row-start-4 w-full h-full"><Case players={[player]} propriety={monopolyBoard[13]} position="left"/></div>
        <div className="col-start-11 row-start-5 w-full h-full"><Case players={[player]} propriety={monopolyBoard[14]} position="left"/></div>
        <div className="col-start-11 row-start-6 w-full h-full"><Case players={[player]} propriety={monopolyBoard[15]} position="left"/></div>
        <div className="col-start-11 row-start-7 w-full h-full"><Case players={[player]} propriety={monopolyBoard[16]} position="left"/></div>
        <div className="col-start-11 row-start-8 w-full h-full"><Case players={[player]} propriety={monopolyBoard[17]} position="left"/></div>
        <div className="col-start-11 row-start-9 w-full h-full"><Case players={[player]} propriety={monopolyBoard[18]} position="left"/></div>
        <div className="col-start-11 row-start-10 w-full h-full"><Case players={[player]} propriety={monopolyBoard[19]} position="left"/></div>

        <div className="col-start-11 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[20]} position="corner"/></div>
        <div className="col-start-10 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[21]} position="top"/></div>
        <div className="col-start-9 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[22]} position="top"/></div>
        <div className="col-start-8 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[23]} position="top"/></div>
        <div className="col-start-7 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[24]} position="top"/></div>
        <div className="col-start-6 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[25]} position="top"/></div>
        <div className="col-start-5 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[26]} position="top"/></div>
        <div className="col-start-4 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[27]} position="top"/></div>
        <div className="col-start-3 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[28]} position="top"/></div>
        <div className="col-start-2 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[29]} position="top"/></div>

        <div className="col-start-1 row-start-11 w-full h-full"><Case players={[player]} propriety={monopolyBoard[30]} position="corner"/></div>
        <div className="col-start-1 row-start-10 w-full h-full"><Case players={[player]} propriety={monopolyBoard[31]} position="right"/></div>
        <div className="col-start-1 row-start-9 w-full h-full"><Case players={[player]} propriety={monopolyBoard[32]} position="right"/></div>
        <div className="col-start-1 row-start-8 w-full h-full"><Case players={[player]} propriety={monopolyBoard[33]} position="right"/></div>
        <div className="col-start-1 row-start-7 w-full h-full"><Case players={[player]} propriety={monopolyBoard[34]} position="right"/></div>
        <div className="col-start-1 row-start-6 w-full h-full"><Case players={[player]} propriety={monopolyBoard[35]} position="right"/></div>
        <div className="col-start-1 row-start-5 w-full h-full"><Case players={[player]} propriety={monopolyBoard[36]} position="right"/></div>
        <div className="col-start-1 row-start-4 w-full h-full"><Case players={[player]} propriety={monopolyBoard[37]} position="right"/></div>
        <div className="col-start-1 row-start-3 w-full h-full"><Case players={[player]} propriety={monopolyBoard[38]} position="right"/></div>
        <div className="col-start-1 row-start-2 w-full h-full"><Case players={[player]} propriety={monopolyBoard[39]} position="right"/></div>

        <div className="col-start-2 col-end-11 row-start-2 row-end-11 ">Center
        </div>

    </div>

    </>
   )
}