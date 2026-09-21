import { Player } from "./Player.ts";
import { Propriety } from "./Propriety.ts";

interface CaseProps {
  propriety: Propriety;
  player: Player;
  position?: "top" | "bottom" | "left" | "right" | "corner";
}

export function Case({ propriety, player, position = "bottom" }: CaseProps) {
  const isHorizontal = position === "left" || position === "right";

  return (
    <div
      className={`w-full h-full border border-slate-700 bg-white flex ${
        isHorizontal ? "flex-row" : "flex-col"
      } justify-between overflow-hidden rounded-sm`}
    >
      <div
        className={`${propriety.color} ${
          isHorizontal ? "w-[20%] h-full" : "w-full h-[20%]"
        } ${position === "left" || position === "top" ? "order-first" : "order-last"}`}
      />
      <div
        className={`flex-1 flex justify-between items-center p-0.5 min-w-0 min-h-0 ${
          isHorizontal
            ? "flex-col [writing-mode:vertical-rl]"
            : "flex-col"
        } ${
          position === "bottom" || position === "left" ? "rotate-180" : ""
        }`}
      >
        <h1 className="font-bold text-[8px] leading-tight text-center break-words max-w-full">
          {propriety.name}
        </h1>
        <p className="font-bold text-[9px] shrink-0">
          {propriety.price}$
        </p>
      </div>
    </div>
  );
}