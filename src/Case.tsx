import { Player } from "./Player.ts";
import { property, type Square } from "./Property.ts";

interface CaseProps {
  property: Square;
  players: Player[];
  position?: "top" | "bottom" | "left" | "right" | "corner";
}

export function Case({ property, players, position = "bottom" }: CaseProps) {
  const isHorizontal = position === "left" || position === "right";
  const pl = (allPlayers: Player[]) => {
    const playersOnCase = allPlayers.filter((p) => p.c === property.id);
    if (playersOnCase.length === 0) return null;
    return (
      <div className="flex gap-0.5 justify-center">
        {playersOnCase.map((p) => (
          <div key={p.id} style={p.color?.startsWith("#") ? { backgroundColor: p.color } : undefined} className={`w-2 h-2 rounded-full ${!p.color?.startsWith("#") ? p.color : ""}`} />
        ))}
      </div>
    );
  };
  return (
    <div
      className={`w-full h-full min-w-0 min-h-0 border border-slate-700 bg-white flex ${
        isHorizontal ? "flex-row" : "flex-col"
      } justify-between overflow-hidden rounded-sm`}
    >
      <div
        className={`${property.color} ${
          isHorizontal ? "w-[20%] h-full" : "w-full h-[20%]"
        } ${
          position === "left" || position === "top"
            ? "order-first"
            : "order-last"
        }`}
      />
      <div
        className={`flex-1 flex justify-between items-center p-0.5 min-w-0 min-h-0 ${
          isHorizontal ? "flex-col [writing-mode:vertical-rl]" : "flex-col"
        } ${position === "bottom" || position === "left" ? "rotate-180" : ""}`}
      >
        <h1 className="min-w-0 min-h-0 overflow-hidden font-bold text-[8px] leading-tight text-center break-words max-w-full">
          {property.name}
        </h1>
        {pl(players)}
        <p className="font-bold text-[9px] shrink-0">
          {(property as property).price}
        </p>
      </div>
    </div>
  );
}
