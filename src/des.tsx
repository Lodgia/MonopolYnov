import { useGame } from "./GameContext.tsx";
import { monopolyBoard } from "./allCases.ts";

export function Des({ score }: { score?: (n: number) => void } = {}) {
    const { turnOrder, rollDice, lastDiceRoll, lastActionMessage, resetGame, useJailFreeCard } = useGame();
    const activePlayer = turnOrder[1];

    const handleRoll = () => {
        const res = rollDice();
        if (res && score) {
            score(res.total);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between w-full h-full max-w-md p-3 bg-white/95 rounded-xl border-2 border-red-500 shadow-md text-zinc-800 select-none">
            <div className="w-full flex items-center justify-between border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-2">
                    <span style={activePlayer?.color?.startsWith("#") ? { backgroundColor: activePlayer.color } : undefined} className={`w-4 h-4 rounded-full ${!activePlayer?.color?.startsWith("#") ? (activePlayer?.color ?? "bg-gray-400") : ""} border border-zinc-700 shadow-sm animate-pulse`} />
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-wide text-zinc-900">
                            Tour actuel : {activePlayer?.name ?? "Inconnu"}
                        </h2>
                        <p className="text-[10px] text-zinc-500">
                            Case actuelle : <span className="font-semibold text-zinc-700">{monopolyBoard[activePlayer?.c]?.name ?? "Départ"}</span> (#{activePlayer?.c})
                        </p>
                        {activePlayer?.isInJail && <p className="text-[10px] font-bold text-red-600">En prison • {activePlayer.jailTurns}/3 tours</p>}
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Solde</span>
                    <span className="text-xs font-black text-emerald-600 font-mono">
                        {activePlayer?.money} $
                    </span>
                </div>
            </div>
            <div className="flex flex-col items-center gap-2 my-2">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5">Dé 1</span>
                        <div className="w-12 h-12 bg-zinc-900 border-2 border-red-500 rounded-lg flex items-center justify-center text-white font-mono text-xl font-black shadow-md">
                            {lastDiceRoll ? lastDiceRoll.dice1 : "-"}
                        </div>
                    </div>

                    <span className="text-lg font-black text-red-500">+</span>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5">Dé 2</span>
                        <div className="w-12 h-12 bg-zinc-900 border-2 border-red-500 rounded-lg flex items-center justify-center text-white font-mono text-xl font-black shadow-md">
                            {lastDiceRoll ? lastDiceRoll.dice2 : "-"}
                        </div>
                    </div>

                    <span className="text-lg font-black text-zinc-400">=</span>

                    <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5">Total</span>
                        <div className="w-12 h-12 bg-red-500 border-2 border-zinc-900 rounded-lg flex items-center justify-center text-white font-mono text-xl font-black shadow-md">
                            {lastDiceRoll ? lastDiceRoll.total : "-"}
                        </div>
                    </div>
                </div>
                {lastActionMessage && (
                    <p className="text-[10px] text-center text-zinc-700 bg-red-50 border border-red-200 rounded px-2 py-1 max-w-xs leading-tight">
                        {lastActionMessage}
                    </p>
                )}
            </div>

            <div className="w-full flex flex-col items-center gap-1.5">
                {activePlayer?.isInJail && activePlayer.jailFreeCards > 0 && (
                    <button onClick={useJailFreeCard} className="w-full rounded border border-amber-500 bg-amber-100 px-3 py-1.5 text-[10px] font-bold text-zinc-900 cursor-pointer">
                        Utiliser une carte de sortie ({activePlayer.jailFreeCards})
                    </button>
                )}
                <button
                    onClick={handleRoll}
                    className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition duration-150 cursor-pointer border-2 border-white flex items-center justify-center gap-1.5"
                    title={`Lancer les dés pour ${activePlayer?.name}`}
                >
                    Lancer les dés ({activePlayer?.name})
                </button>
            </div>

            <div className="w-full mt-2 pt-2 border-t border-zinc-200">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                        Ordre d'attente (Clés du dictionnaire)
                    </span>
                    <button
                        onClick={resetGame}
                        className="text-[9px] text-red-500 hover:underline cursor-pointer font-semibold"
                        title="Réinitialiser les positions et les tours"
                    >
                        Réinitialiser
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((orderKey) => {
                        const player = turnOrder[orderKey];
                        const isFirst = orderKey === 1;
                        return (
                            <div
                                key={orderKey}
                                className={`p-1 rounded text-center border transition-all ${isFirst
                                        ? "bg-red-500 text-white border-red-600 shadow-sm"
                                        : "bg-zinc-50 text-zinc-700 border-zinc-200"
                                    }`}
                            >
                                <div className="text-[8px] font-mono font-bold opacity-80">
                                    Clé {orderKey} {isFirst ? "x" : ""}
                                </div>
                                <div className="flex items-center justify-center gap-1 my-0.5">
                                    <span style={player?.color?.startsWith("#") ? { backgroundColor: player.color } : undefined} className={`w-2 h-2 rounded-full ${!player?.color?.startsWith("#") ? (player?.color ?? "bg-gray-400") : ""} border border-white`} />
                                    <span className="text-[9px] font-bold truncate max-w-[50px]">
                                        {player?.name ?? `J${orderKey}`}
                                    </span>
                                </div>
                                <div className="text-[8px] font-mono opacity-90">
                                    Case {player?.c ?? 0}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export const des = Des;