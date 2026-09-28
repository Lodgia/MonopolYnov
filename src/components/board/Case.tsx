import { property, SpecialSquare, colorClasses } from "../../types/Property.ts";
import type { Square } from "../../types/Property.ts";

export interface CasePlayerInfo {
    id: number;
    name: string;
    c: number;
    color: string;
    hasLeft?: boolean;
}

interface CaseProps {
    property: Square;
    players: CasePlayerInfo[];
    ownerColor?: string;
    level?: number;
    position?: "top" | "bottom" | "left" | "right" | "corner";
    onClick?: () => void;
}

export function Case({
    property: sq,
    players,
    ownerColor,
    level = 0,
    position = "bottom",
    onClick,
}: CaseProps) {
    const isHorizontal = position === "left" || position === "right";
    const isCorner = position === "corner";
    const isProp = sq.type === "property" || sq.type === "station" || sq.type === "utility";
    const propObj = isProp ? (sq as property) : null;

    const playersOnCase = players.filter((p) => p.c === sq.id && !p.hasLeft);
    const colorClass = propObj?.colorKey ? colorClasses[propObj.colorKey] : "";

    const getSpecialIcon = (sqItem: Square) => {
        if (sqItem.id === 0) return "🚩";
        if (sqItem.id === 10) return "🔒";
        if (sqItem.id === 20) return "🚗";
        if (sqItem.id === 30) return "👮";
        if (sqItem.type === "station") return "🚆";
        if (sqItem.type === "utility") return sqItem.name.includes("Électricité") ? "⚡" : "💧";
        if (sqItem.type === "special") {
            const spec = sqItem as SpecialSquare;
            if (spec.subType === "chance") return "❓";
            if (spec.subType === "community") return "🎁";
            if (spec.subType === "tax") return "💰";
        }
        return "";
    };

    const icon = getSpecialIcon(sq);

    return (
        <div
            onClick={onClick}
            className={`w-full h-full min-w-0 min-h-0 border border-zinc-700 bg-white flex ${
                isHorizontal ? "flex-row" : "flex-col"
            } justify-between overflow-hidden rounded-[2px] transition-all hover:ring-2 hover:ring-amber-400 hover:z-20 cursor-pointer relative shadow-sm select-none`}
        >
            {colorClass && !isCorner && (
                <div
                    className={`${colorClass} ${
                        isHorizontal ? "w-[24%] h-full" : "w-full h-[22%]"
                    } ${
                        position === "left" || position === "top" ? "order-first" : "order-last"
                    } relative flex items-center justify-center`}
                >
                    {level > 0 && (
                        <div className="flex gap-0.5 items-center justify-center">
                            {level === 5 ? (
                                <span className="text-[8px] leading-none" title="Hôtel">🏨</span>
                            ) : (
                                Array.from({ length: level }).map((_, i) => (
                                    <span key={i} className="text-[7px] leading-none" title="Maison">🏠</span>
                                ))
                            )}
                        </div>
                    )}

                    {ownerColor && (
                        <span
                            style={ownerColor.startsWith("#") ? { backgroundColor: ownerColor } : undefined}
                            className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full border border-white ${
                                !ownerColor.startsWith("#") ? ownerColor : ""
                            }`}
                            title="Propriétaire"
                        />
                    )}
                </div>
            )}

            <div
                className={`flex-1 flex justify-between items-center p-0.5 min-w-0 min-h-0 ${
                    isHorizontal ? "flex-col [writing-mode:vertical-rl]" : "flex-col"
                } ${position === "bottom" || position === "left" ? "rotate-180" : ""}`}
            >
                <div className="flex items-center gap-0.5 max-w-full overflow-hidden">
                    {icon && <span className="text-[9px] shrink-0 leading-none">{icon}</span>}
                    <h1 className="min-w-0 min-h-0 overflow-hidden font-bold text-[7.5px] leading-tight text-center text-zinc-900 break-words max-w-full">
                        {sq.name}
                    </h1>
                </div>

                <div className="flex flex-wrap gap-0.5 justify-center items-center my-0.5 max-w-full">
                    {playersOnCase.map((p) => (
                        <div
                            key={p.id}
                            style={p.color?.startsWith("#") ? { backgroundColor: p.color } : undefined}
                            className={`w-2.5 h-2.5 rounded-full border border-zinc-900 shadow-sm transition-transform transform scale-105 ${
                                !p.color?.startsWith("#") ? (p.color || "bg-blue-500") : ""
                            }`}
                            title={`${p.name} (Position ${p.c})`}
                        />
                    ))}
                </div>

                {propObj && propObj.price > 0 ? (
                    <p className="font-extrabold text-[8px] text-zinc-800 font-mono shrink-0">
                        {propObj.price} €
                    </p>
                ) : (
                    <div className="h-1" />
                )}
            </div>
        </div>
    );
}

export default Case;
