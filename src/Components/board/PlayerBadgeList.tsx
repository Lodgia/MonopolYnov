import React from "react";
import type { SyncedPlayer } from "../../GameContext.tsx";

interface PlayerBadgeListProps {
    players: SyncedPlayer[];
    activePlayerId: number | null;
}

export function PlayerBadgeList({ players, activePlayerId }: PlayerBadgeListProps) {
    return (
        <div className="w-full mt-2 pt-2 border-t border-zinc-700">
            <div className="grid grid-cols-2 gap-1.5">
                {players.map((p) => {
                    const isActive = p.id === activePlayerId;
                    const hasLeft = !!p.hasLeft;

                    return (
                        <div
                            key={p.id}
                            className={`p-1.5 border-2 flex items-center justify-between text-[10px] transition-all ${
                                hasLeft
                                    ? "bg-zinc-200 text-zinc-500 border-zinc-400 opacity-60 line-through"
                                    : isActive
                                    ? "bg-red-500 text-white border-white font-bold shadow-md"
                                    : "bg-blue-300 text-zinc-900 border-red-500 font-semibold"
                            }`}
                        >
                            <div className="flex items-center gap-1.5 truncate max-w-[110px]">
                                <span
                                    style={p.color?.startsWith("#") ? { backgroundColor: p.color } : undefined}
                                    className={`w-2.5 h-2.5 rounded-full border border-white shrink-0 ${
                                        !p.color?.startsWith("#") ? (p.color || "bg-blue-500") : ""
                                    }`}
                                />
                                <span className="truncate">
                                    {p.name} {hasLeft && <span className="text-[8px] font-bold text-red-600">(A quitté)</span>}
                                </span>
                            </div>
                            <span
                                className={`font-mono font-bold shrink-0 ${
                                    hasLeft ? "text-zinc-500" : isActive ? "text-white" : "text-zinc-900"
                                }`}
                            >
                                {p.money} €
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PlayerBadgeList;
