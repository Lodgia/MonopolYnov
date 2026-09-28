import React from "react";

interface DiceDisplayProps {
    dice1: number | null;
    dice2: number | null;
    total: number | null;
    isRolling?: boolean;
}

export function DiceDisplay({ dice1, dice2, total, isRolling = false }: DiceDisplayProps) {
    return (
        <div className="flex items-center gap-3 select-none">
            <div className="flex flex-col items-center">
                <div
                    className={`w-11 h-11 bg-white border-2 border-red-500 shadow flex items-center justify-center text-red-600 font-mono text-xl font-black transition-transform ${
                        isRolling ? "scale-110 rotate-12" : ""
                    }`}
                >
                    {dice1 !== null ? dice1 : "-"}
                </div>
            </div>

            <span className="text-base font-black text-red-500">+</span>

            <div className="flex flex-col items-center">
                <div
                    className={`w-11 h-11 bg-white border-2 border-red-500 shadow flex items-center justify-center text-red-600 font-mono text-xl font-black transition-transform ${
                        isRolling ? "scale-110 -rotate-12" : ""
                    }`}
                >
                    {dice2 !== null ? dice2 : "-"}
                </div>
            </div>

            <span className="text-base font-black text-red-500">=</span>

            <div className="flex flex-col items-center">
                <div
                    className={`w-11 h-11 bg-red-500 border-2 border-white shadow flex items-center justify-center text-white font-mono text-xl font-black ${
                        isRolling ? "scale-115" : ""
                    }`}
                >
                    {total !== null ? total : "-"}
                </div>
            </div>
        </div>
    );
}

export default DiceDisplay;
