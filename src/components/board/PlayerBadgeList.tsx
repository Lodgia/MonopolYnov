import { MonopolyBadge } from "../ui/MonopolyBadge.tsx";
import type { SyncedPlayer } from "../../context/GameContext.tsx";

interface PlayerBadgeListProps {
    players: SyncedPlayer[];
    activePlayerId?: number | null;
    currentTurnIndex?: number;
    currentUserId?: number;
}

export function PlayerBadgeList({
    players,
    activePlayerId,
    currentTurnIndex,
    currentUserId,
}: PlayerBadgeListProps) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl w-full">
            {players.map((p, idx) => {
                const isCurrentTurn =
                    activePlayerId !== undefined && activePlayerId !== null
                        ? p.id === activePlayerId
                        : idx === currentTurnIndex;
                const isMe = currentUserId !== undefined ? p.id === currentUserId : false;
                const hasLeft = p.hasLeft;

                let variant: "default" | "active" | "inactive" | "left" = "default";
                if (hasLeft) {
                    variant = "left";
                } else if (isCurrentTurn) {
                    variant = "active";
                } else {
                    variant = "inactive";
                }

                return (
                    <div key={p.id} className="relative">
                        <MonopolyBadge color={hasLeft ? "#71717a" : p.color} variant={variant}>
                            <span
                                className={`w-3 h-3 rounded-full border border-black inline-block shrink-0 ${
                                    hasLeft ? "grayscale opacity-50" : ""
                                }`}
                                style={{ backgroundColor: p.color || "#000" }}
                            />
                            <span className="truncate max-w-[100px] font-bold">
                                {p.name || p.email}
                                {isMe ? " (Vous)" : ""}
                            </span>
                            <span className="text-zinc-700 font-mono ml-0.5 font-normal">
                                {p.money} €
                            </span>
                            {hasLeft ? (
                                <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 ml-1 uppercase tracking-wider rounded-none shadow-xs border border-white">
                                    A QUITTÉ
                                </span>
                            ) : null}
                            {isCurrentTurn && !hasLeft && (
                                <span className="animate-pulse ml-0.5 text-amber-600 font-extrabold">
                                    🎲
                                </span>
                            )}
                        </MonopolyBadge>
                    </div>
                );
            })}
        </div>
    );
}
