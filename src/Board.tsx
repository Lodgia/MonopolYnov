
import React from "react";
import { Case } from "./Case.tsx";
import { Player } from "./Player.ts";
import { property } from "./Property.ts";
import {monopolyBoard} from "./allCases.ts"

export function Board(){
        
    const player = new Player(1,"",1,5000,"bg-blue-500")    
    const player2 = new Player(2,"",1,5000,"bg-red-500")
    return (
    <>
    
    <div className="grid grid-cols-[1.5fr_repeat(9,1fr)_1.5fr] grid-rows-[1.5fr_repeat(9,1fr)_1.5fr] gap-0.5 w-full h-full max-w-2xl aspect-square p-2 text-xs font-bold text-center bg-green-100">

        <div className="col-start-1 row-start-1 w-full h-full"><Case players={[player,player2]} property={monopolyBoard[0]} position="corner"/></div>
        <div className="col-start-2 row-start-1 w-full h-full "><Case players={[player]} property={monopolyBoard[1]} position="bottom"/></div>
        <div className="col-start-3 row-start-1 w-full h-full"><Case players={[player]} property={monopolyBoard[2]} position="bottom"/></div>
        <div className="col-start-4 row-start-1 w-full h-full"><Case players={[player]} property={monopolyBoard[3]} position="bottom"/></div>
        <div className="col-start-5 row-start-1 w-full h-full"><Case players={[player]} property={monopolyBoard[4]} position="bottom"/></div>
        <div className="col-start-6 row-start-1 w-full h-full"><Case players={[player]} property={monopolyBoard[5]} position="bottom"/></div>
        <div className="col-start-7 row-start-1 w-full h-full"><Case players={[player]} property={monopolyBoard[6]} position="bottom"/></div>
        <div className="col-start-8 row-start-1 w-full h-full"><Case players={[player]} property={monopolyBoard[7]} position="bottom"/></div>
        <div className="col-start-9 row-start-1 w-full h-full"><Case players={[player]} property={monopolyBoard[8]} position="bottom"/></div>
        <div className="col-start-10 row-start-1 w-full h-full"><Case players={[player]} property={monopolyBoard[9]} position="bottom"/></div>
        <div className="col-start-11 row-start-1 w-full h-full"><Case players={[player]} property={monopolyBoard[10]} position="corner"/></div>

        <div className="col-start-11 row-start-2 w-full h-full"><Case players={[player]} property={monopolyBoard[11]} position="left"/></div>
        <div className="col-start-11 row-start-3 w-full h-full"><Case players={[player]} property={monopolyBoard[12]} position="left"/></div>
        <div className="col-start-11 row-start-4 w-full h-full"><Case players={[player]} property={monopolyBoard[13]} position="left"/></div>
        <div className="col-start-11 row-start-5 w-full h-full"><Case players={[player]} property={monopolyBoard[14]} position="left"/></div>
        <div className="col-start-11 row-start-6 w-full h-full"><Case players={[player]} property={monopolyBoard[15]} position="left"/></div>
        <div className="col-start-11 row-start-7 w-full h-full"><Case players={[player]} property={monopolyBoard[16]} position="left"/></div>
        <div className="col-start-11 row-start-8 w-full h-full"><Case players={[player]} property={monopolyBoard[17]} position="left"/></div>
        <div className="col-start-11 row-start-9 w-full h-full"><Case players={[player]} property={monopolyBoard[18]} position="left"/></div>
        <div className="col-start-11 row-start-10 w-full h-full"><Case players={[player]} property={monopolyBoard[19]} position="left"/></div>

        <div className="col-start-11 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[20]} position="corner"/></div>
        <div className="col-start-10 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[21]} position="top"/></div>
        <div className="col-start-9 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[22]} position="top"/></div>
        <div className="col-start-8 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[23]} position="top"/></div>
        <div className="col-start-7 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[24]} position="top"/></div>
        <div className="col-start-6 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[25]} position="top"/></div>
        <div className="col-start-5 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[26]} position="top"/></div>
        <div className="col-start-4 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[27]} position="top"/></div>
        <div className="col-start-3 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[28]} position="top"/></div>
        <div className="col-start-2 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[29]} position="top"/></div>

        <div className="col-start-1 row-start-11 w-full h-full"><Case players={[player]} property={monopolyBoard[30]} position="corner"/></div>
        <div className="col-start-1 row-start-10 w-full h-full"><Case players={[player]} property={monopolyBoard[31]} position="right"/></div>
        <div className="col-start-1 row-start-9 w-full h-full"><Case players={[player]} property={monopolyBoard[32]} position="right"/></div>
        <div className="col-start-1 row-start-8 w-full h-full"><Case players={[player]} property={monopolyBoard[33]} position="right"/></div>
        <div className="col-start-1 row-start-7 w-full h-full"><Case players={[player]} property={monopolyBoard[34]} position="right"/></div>
        <div className="col-start-1 row-start-6 w-full h-full"><Case players={[player]} property={monopolyBoard[35]} position="right"/></div>
        <div className="col-start-1 row-start-5 w-full h-full"><Case players={[player]} property={monopolyBoard[36]} position="right"/></div>
        <div className="col-start-1 row-start-4 w-full h-full"><Case players={[player]} property={monopolyBoard[37]} position="right"/></div>
        <div className="col-start-1 row-start-3 w-full h-full"><Case players={[player]} property={monopolyBoard[38]} position="right"/></div>
        <div className="col-start-1 row-start-2 w-full h-full"><Case players={[player]} property={monopolyBoard[39]} position="right"/></div>

        <div className="col-start-2 col-end-11 row-start-2 row-end-11 ">Center
        </div>

    </div>

    </>
   )
}