import { useEffect, useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { TfiReload } from "react-icons/tfi";

type props = {
    onClose: () => void;
}

export default function modalPlay({ onClose }: props) {
    const [action, setAction] = useState("choice")
    const [inviteCode, setInviteCode] = useState("");

    const generateInviteCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        const length = 8;
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setInviteCode(result.toUpperCase())
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadeIn">
            <div className=" w-2/7 m-auto p-5 rounded-[15px] font-bold text-white fixed inset-0 bg-gray-800 h-fit flex flex-col gap-7">
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
                            <button onClick={() => setAction("choice")}><IoMdCloseCircleOutline /></button>
                        </div>
                        <hr className="text-white w-full my-5" />
                        <div className="w-full flex">
                            <div className="w-1/2 flex items-center justify-center border-r-5 my-5">
                                <h3>Gestion des joueurs</h3>
                            </div>
                            <div className="w-1/2 flex items-center justify-center border-2">
                                <h3>Paramètres</h3>
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