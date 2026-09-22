import { useEffect, useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { IoReturnDownForward } from "react-icons/io5";
import { MdAssignmentReturn } from "react-icons/md";
import { TfiReload } from "react-icons/tfi";

type props = {
    onClose: () => void;
}

export default function modalPlay({ onClose }: props) {
    const [action, setAction] = useState("choice")
    const [inviteCode, setInviteCode] = useState("");
    const [joinCode, setJoinCode] = useState("")
    const [hostWindow, setHostWindow] = useState<"setting" | "managePlayer">("managePlayer")
    const codeLength = 5;

    const generateInviteCode = async () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < codeLength; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const r = await fetch("/api/game/createGame", {
            method: "POST",
            body: JSON.stringify({ code: result })
        })
        setInviteCode(result.toUpperCase())
    }

    const handleJoinGame = async () => {
        if (joinCode.length !== codeLength) { return }
        const r = await fetch("/api/game/joinGame", {
            method: "POST",
            body: JSON.stringify({ code: joinCode })
        })

        if (!r.ok) {
            const err = await r.json()
            alert(err.err)
        }

        alert("Join de la game !")
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadeIn">
            <div className=" w-1/3 m-auto p-5 rounded-[15px] font-bold text-white fixed inset-0 bg-gray-800 h-fit flex flex-col gap-7">
                {action === "choice" && (
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-center flex items-center justify-center">Que voulez-vous faire ?</h2>
                            <button onClick={onClose}><IoMdCloseCircleOutline /></button>
                        </div>
                        <div className="w-full flex items-center justify-between">
                            <button onClick={() => { generateInviteCode(); setAction("host") }} className="border-2 p-5 bg-slate-700 hover:bg-slate-700/60 transition duration-500 cursor-pointer rounded-[8px]">Héberger une partie</button>
                            <button onClick={() => setAction("join")} className="border-2 p-5 bg-slate-700 hover:bg-slate-700/60 transition duration-500 cursor-pointer rounded-[8px]">Rejoindre une partie</button>
                        </div>
                    </div>
                )}
                {action === "host" && (
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-center flex items-center justify-center gap-3">Création d'une partie ( code : {inviteCode} )<TfiReload onClick={generateInviteCode} /></h2>
                            <button onClick={() => setAction("choice")}><MdAssignmentReturn className="text-[25px]" /></button>
                        </div>
                        <hr className="text-white w-full my-2" />
                        <div className="w-full flex items-center justify-around">
                            <h3 onClick={() => setHostWindow("managePlayer")} className={`${hostWindow === "managePlayer" && "text-orange-500/80 border-b-2 border-b-orange-500"} cursor-pointer`}>Gestion des joueurs</h3>
                            <h3 onClick={() => setHostWindow("setting")} className={`${hostWindow === "setting" && "text-orange-500/80 border-b-2 border-b-orange-500"} cursor-pointer`}>Paramètres de la partie</h3>
                        </div>
                        {hostWindow === "managePlayer" ? (
                            <div className="w-full flex items-center justify-center border-r-5 my-5">
                                <h3>Gestion des joueurs</h3>
                            </div>
                        ) : (
                            <div className="w-full flex">
                                <div className="w-1/2 flex items-center justify-center border-r-5 my-5">
                                    <h3>Gestion des joueurs</h3>
                                </div>
                                <div className="w-1/2 flex items-center justify-center border-2">
                                    <h3>Paramètres</h3>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {action === "join" && (
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-center flex items-center justify-center gap-3">Rejoindre une partie</h2>
                            <button onClick={() => setAction("choice")}><MdAssignmentReturn className="text-[25px]" /></button>
                        </div>
                        <hr className="text-white w-full my-5" />
                        <div className="w-full flex items-center justify-center flex-col gap-2">
                            <h2>Rentrez le code pour rejoindre la partie !</h2>
                            <div className="w-fit border-2 font-mono text-[20px] border-white/40 text-white/80 p-1.5 mt-1 flex items-center justify-between">
                                <input className="w-full outline-none" required value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Code de la partie" type="text" maxLength={codeLength} />
                                <IoReturnDownForward onClick={handleJoinGame} className="mr-2 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadeIn">
        //     <div className=" w-4/7 m-auto p-5 rounded-[15px] font-bold text-white fixed inset-0 bg-gray-800 h-fit flex flex-col gap-7">
        //         <div className="flex items-center justify-between">
        //             <h2 className="text-center flex items-center justify-center">Configuration de la partie</h2>
        //             <button onClick={onClose}><IoMdCloseCircleOutline/></button>
        //         </div>
        // <div className="w-full flex">
        //     <div className="w-1/2 flex items-center justify-center">
        //         <h3>Gestion des joueurs</h3>
        //     </div>
        //     <div className="w-1/2 flex items-center justify-center border-2">
        //         <h3>Paramètres</h3>
        //     </div>
        // </div>
        //     </div>
        // </div>
    )
}