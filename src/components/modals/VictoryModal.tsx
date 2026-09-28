import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface WinnerInfo {
    id?: number;
    name: string;
    money?: number;
    color?: string;
}

interface VictoryModalProps {
    winner: WinnerInfo | null;
    onClose?: () => void;
}

export function VictoryModal({ winner, onClose }: VictoryModalProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(winner !== null);

    useEffect(() => {
        setIsOpen(winner !== null);
    }, [winner]);

    if (!winner || !isOpen) {
        return null;
    }

    const handleClose = () => {
        setIsOpen(false);
        onClose?.();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none backdrop-blur-sm font-sans"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-md bg-white border-3 border-red-500 p-6 flex flex-col gap-4 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                    <h2 className="font-black text-sm text-red-500 uppercase tracking-widest mx-auto">
                        🏆 VICTOIRE MONOPOLYNOV 🏆
                    </h2>
                </div>

                <div className="bg-blue-300 border-3 border-red-500 p-5 flex flex-col items-center gap-3">
                    <div className="text-5xl animate-bounce">
                        👑
                    </div>

                    <div className="bg-white border-2 border-red-500 p-4 w-full shadow-sm flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-zinc-500 uppercase">
                            Grand Vainqueur
                        </span>
                        <h3 className="text-xl font-black text-red-600 uppercase tracking-wide">
                            {winner.name}
                        </h3>
                        <p className="text-xs text-zinc-700 font-medium">
                            Dernier magnat de l'immobilier encore solvable !
                        </p>
                        {winner.money !== undefined && (
                            <p className="text-sm font-black text-emerald-600 font-mono mt-1">
                                Fortune finale : {winner.money} €
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200">
                    <div className="border-2 border-blue-500">
                        <button
                            onClick={() => {
                                handleClose();
                                navigate("/home");
                            }}
                            className="inline-block border-2 border-white text-xs font-bold p-2 bg-blue-500 text-white w-full cursor-pointer hover:bg-blue-600 transition"
                        >
                            🏠 Hub / Accueil
                        </button>
                    </div>

                    <div className="border-2 border-red-500">
                        <button
                            onClick={() => {
                                handleClose();
                                navigate("/history");
                            }}
                            className="inline-block border-2 border-white text-xs font-bold p-2 bg-red-500 text-white w-full cursor-pointer hover:bg-red-600 transition"
                        >
                            📜 Historique
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VictoryModal;
