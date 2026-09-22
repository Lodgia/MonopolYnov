
import { Case } from "./Case.tsx";
import { Player } from "./Player.ts";
import { Propriety } from "./Propriety.ts";

export function Board(){
        
    const player = new Player(1,"",1,5000,"bg-blue-500")
    const player2 = new Player(2,"",1,5000,"bg-red-500")
    const prop = new Propriety(1,"rue de la paix",0,[500,100,150,200,15000],200,"blue")
    return (
    <>
    
    <div className="grid grid-cols-[1.5fr_repeat(9,1fr)_1.5fr] grid-rows-[1.5fr_repeat(9,1fr)_1.5fr] gap-0.5 w-full h-full max-w-2xl aspect-square p-2 text-xs font-bold text-center bg-green-100">

        <div className="col-start-1 row-start-1 w-full h-full"><Case players={[player,player2]} propriety={prop} position="corner"/></div>
        <div className="col-start-2 row-start-1 w-full h-full "><Case players={[player]} propriety={prop} position="bottom"/></div>
        <div className="col-start-3 row-start-1 w-full h-full"><Case players={[player]} propriety={prop} position="bottom"/></div>
        <div className="col-start-4 row-start-1 w-full h-full"><Case players={[player]} propriety={prop} position="bottom"/></div>
        <div className="col-start-5 row-start-1 w-full h-full"><Case players={[player]} propriety={prop} position="bottom"/></div>
        <div className="col-start-6 row-start-1 w-full h-full"><Case players={[player]} propriety={prop} position="bottom"/></div>
        <div className="col-start-7 row-start-1 w-full h-full"><Case players={[player]} propriety={prop} position="bottom"/></div>
        <div className="col-start-8 row-start-1 w-full h-full"><Case players={[player]} propriety={prop} position="bottom"/></div>
        <div className="col-start-9 row-start-1 w-full h-full"><Case players={[player]} propriety={prop} position="bottom"/></div>
        <div className="col-start-10 row-start-1 w-full h-full"><Case players={[player]} propriety={prop} position="bottom"/></div>
        <div className="col-start-11 row-start-1 w-full h-full"><Case players={[player]} propriety={prop} position="corner"/></div>

        <div className="col-start-11 row-start-2 w-full h-full"><Case players={[player]} propriety={prop} position="left"/></div>
        <div className="col-start-11 row-start-3 w-full h-full"><Case players={[player]} propriety={prop} position="left"/></div>
        <div className="col-start-11 row-start-4 w-full h-full"><Case players={[player]} propriety={prop} position="left"/></div>
        <div className="col-start-11 row-start-5 w-full h-full"><Case players={[player]} propriety={prop} position="left"/></div>
        <div className="col-start-11 row-start-6 w-full h-full"><Case players={[player]} propriety={prop} position="left"/></div>
        <div className="col-start-11 row-start-7 w-full h-full"><Case players={[player]} propriety={prop} position="left"/></div>
        <div className="col-start-11 row-start-8 w-full h-full"><Case players={[player]} propriety={prop} position="left"/></div>
        <div className="col-start-11 row-start-9 w-full h-full"><Case players={[player]} propriety={prop} position="left"/></div>
        <div className="col-start-11 row-start-10 w-full h-full"><Case players={[player]} propriety={prop} position="left"/></div>

        <div className="col-start-11 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="corner"/></div>
        <div className="col-start-10 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="top"/></div>
        <div className="col-start-9 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="top"/></div>
        <div className="col-start-8 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="top"/></div>
        <div className="col-start-7 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="top"/></div>
        <div className="col-start-6 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="top"/></div>
        <div className="col-start-5 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="top"/></div>
        <div className="col-start-4 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="top"/></div>
        <div className="col-start-3 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="top"/></div>
        <div className="col-start-2 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="top"/></div>

        <div className="col-start-1 row-start-11 w-full h-full"><Case players={[player]} propriety={prop} position="corner"/></div>
        <div className="col-start-1 row-start-10 w-full h-full"><Case players={[player]} propriety={prop} position="right"/></div>
        <div className="col-start-1 row-start-9 w-full h-full"><Case players={[player]} propriety={prop} position="right"/></div>
        <div className="col-start-1 row-start-8 w-full h-full"><Case players={[player]} propriety={prop} position="right"/></div>
        <div className="col-start-1 row-start-7 w-full h-full"><Case players={[player]} propriety={prop} position="right"/></div>
        <div className="col-start-1 row-start-6 w-full h-full"><Case players={[player]} propriety={prop} position="right"/></div>
        <div className="col-start-1 row-start-5 w-full h-full"><Case players={[player]} propriety={prop} position="right"/></div>
        <div className="col-start-1 row-start-4 w-full h-full"><Case players={[player]} propriety={prop} position="right"/></div>
        <div className="col-start-1 row-start-3 w-full h-full"><Case players={[player]} propriety={prop} position="right"/></div>
        <div className="col-start-1 row-start-2 w-full h-full"><Case players={[player]} propriety={prop} position="right"/></div>

        <div className="col-start-2 col-end-11 row-start-2 row-end-11 ">Center
        </div>

    </div>

    </>
   )
}