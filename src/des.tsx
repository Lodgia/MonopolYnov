import { useGame } from "./GameContext.tsx";
import { monopolyBoard } from "./allCases.ts";
import { property } from "./Property.ts";

export function Des() {
    const {
        gameState,
        activePlayer,
        isMyTurn,
        rollDice,
        buyCurrentProperty,
        payJailFine,
        endTurn,
    } = useGame();

    const currentSq = activePlayer ? monopolyBoard[activePlayer.c] : null;
    const isProperty = currentSq && (currentSq.type === "property" || currentSq.type === "station" || currentSq.type === "utility");
    const propObj = isProperty ? (currentSq as property) : null;
    const propState = isProperty && currentSq ? gameState.properties[currentSq.id] : null;
    const isUnowned = isProperty && propState && propState.ownerId <= 0;
    const canAfford = propObj && activePlayer && activePlayer.money >= propObj.price;

    return (
        <div className="flex flex-col items-center justify-between w-full h-full max-w-sm p-3.5 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-zinc-900 shadow-xl text-zinc-800 select-none">
            {/* 1. Header Joueur Actif & Solde */}
            <div className="w-full flex items-center justify-between border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-2">
                    <span
                        style={activePlayer?.color?.startsWith("#") ? { backgroundColor: activePlayer.color } : undefined}
                        className={`w-3.5 h-3.5 rounded-full ${
                            !activePlayer?.color?.startsWith("#") ? (activePlayer?.color ?? "bg-gray-400") : ""
                        } border border-zinc-800 shadow-sm ${isMyTurn ? "animate-pulse" : ""}`}
                    />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h2 className="text-xs font-black uppercase tracking-tight text-zinc-900">
                                {activePlayer?.name ?? "Joueur"}
                            </h2>
                            {isMyTurn && (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[8px] font-bold px-1 rounded">
                                    Votre tour
                                </span>
                            )}
                        </div>
                        <p className="text-[9.5px] text-zinc-500 font-medium">
                            Case : <span className="font-bold text-zinc-800">{currentSq?.name ?? "Départ"}</span> (#{activePlayer?.c ?? 0})
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block">Trésorerie</span>
                    <span className="text-xs font-black text-emerald-600 font-mono">
                        {activePlayer?.money ?? 0} €
                    </span>
                </div>
            </div>

            {/* 2. Affichage des Dés */}
            <div className="flex flex-col items-center gap-1.5 my-1.5 w-full">
                <div className="flex items-center gap-3">
                    {/* Dé 1 */}
                    <div className="flex flex-col items-center">
                        <div className="w-11 h-11 bg-zinc-900 border-2 border-zinc-800 rounded-lg flex items-center justify-center text-white font-mono text-lg font-black shadow">
                            {gameState.diceRoll ? gameState.diceRoll.dice1 : "-"}
                        </div>
                    </div>

                    <span className="text-sm font-black text-zinc-400">+</span>

                    {/* Dé 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-11 h-11 bg-zinc-900 border-2 border-zinc-800 rounded-lg flex items-center justify-center text-white font-mono text-lg font-black shadow">
                            {gameState.diceRoll ? gameState.diceRoll.dice2 : "-"}
                        </div>
                    </div>

                    <span className="text-sm font-black text-zinc-400">=</span>

                    {/* Total */}
                    <div className="flex flex-col items-center">
                        <div className="w-11 h-11 bg-red-600 border-2 border-red-700 rounded-lg flex items-center justify-center text-white font-mono text-lg font-black shadow">
                            {gameState.diceRoll ? gameState.diceRoll.total : "-"}
                        </div>
                    </div>
                </div>

                {/* Message d'action */}
                {gameState.lastActionMessage && (
                    <p className="text-[9.5px] text-center text-zinc-700 bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1 w-full leading-tight font-medium">
                        {gameState.lastActionMessage}
                    </p>
                )}
            </div>

            {/* 3. Boutons d'Action Tour par Tour */}
            <div className="w-full flex flex-col gap-1.5 pt-1">
                {/* Si le joueur est en prison */}
                {activePlayer?.inJail && isMyTurn && !gameState.hasRolled && (
                    <button
                        type="button"
                        onClick={payJailFine}
                        className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded border border-amber-800 shadow cursor-pointer transition"
                    >
                        🔓 Payer la caution (50 €)
                    </button>
                )}

                {/* Bouton de Lancer de Dés */}
                {!gameState.hasRolled ? (
                    <button
                        type="button"
                        onClick={rollDice}
                        disabled={!isMyTurn}
                        className={`w-full py-2 px-3 font-black text-xs uppercase tracking-wider rounded-lg border-2 shadow transition-all flex items-center justify-center gap-1.5 ${
                            isMyTurn
                                ? "bg-red-600 hover:bg-red-700 active:scale-95 text-white border-red-700 cursor-pointer"
                                : "bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed"
                        }`}
                    >
                        {isMyTurn ? "🎲 Lancer les dés" : `⏳ En attente de ${activePlayer?.name ?? "l'adversaire"}...`}
                    </button>
                ) : (
                    /* Boutons après avoir lancé */
                    <div className="flex flex-col gap-1.5 w-full">
                        {/* Acheter la propriété si disponible */}
                        {isUnowned && canAfford && isMyTurn && (
                            <button
                                type="button"
                                onClick={buyCurrentProperty}
                                className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded border border-emerald-700 shadow cursor-pointer transition"
                            >
                                🏠 Acheter {currentSq?.name} ({propObj?.price} €)
                            </button>
                        )}

                        {/* Fin du tour */}
                        <button
                            type="button"
                            onClick={endTurn}
                            disabled={!isMyTurn}
                            className={`w-full py-2 px-3 font-black text-xs uppercase tracking-wider rounded-lg border-2 shadow transition-all flex items-center justify-center gap-1.5 ${
                                isMyTurn
                                    ? "bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white border-black cursor-pointer"
                                    : "bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed"
                            }`}
                        >
                            {isMyTurn ? "➡️ Fin du tour" : "⏳ Tour adverse..."}
                        </button>
                    </div>
                )}
            </div>

            {/* 4. Mini Liste des Joueurs */}
            <div className="w-full mt-2 pt-2 border-t border-zinc-200">
                <div className="grid grid-cols-2 gap-1.5">
                    {gameState.players.map((p) => {
                        const isActive = p.id === activePlayer?.id;
                        return (
                            <div
                                key={p.id}
                                className={`px-2 py-1 rounded text-left border flex items-center justify-between text-[9px] transition-all ${
                                    isActive
                                        ? "bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm"
                                        : "bg-zinc-50 text-zinc-700 border-zinc-200"
                                }`}
                            >
                                <div className="flex items-center gap-1 truncate max-w-[100px]">
                                    <span
                                        style={p.color?.startsWith("#") ? { backgroundColor: p.color } : undefined}
                                        className={`w-2 h-2 rounded-full border border-white shrink-0 ${
                                            !p.color?.startsWith("#") ? (p.color || "bg-blue-500") : ""
                                        }`}
                                    />
                                    <span className="truncate">{p.name}</span>
                                </div>
                                <span className={`font-mono shrink-0 ${isActive ? "text-emerald-400" : "text-emerald-700"}`}>
                                    {p.money} €
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export const des = Des;