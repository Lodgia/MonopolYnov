import { useEffect, useState, useRef } from "react";
import { useGame } from "./GameContext.tsx";
import { monopolyBoard } from "./allCases.ts";
import { property } from "./Property.ts";

export function Des() {
    const {
        gameState,
        activePlayer,
        isMyTurn,
        canRollAgain,
        rollDice,
        buyCurrentProperty,
        payJailFine,
        endTurn,
    } = useGame();

    const [timer, setTimer] = useState<number>(0);
    const [isRollingAnim, setIsRollingAnim] = useState<boolean>(false);
    const lastTurnIdRef = useRef<number | null>(null);
    const lastRolledRef = useRef<boolean>(false);

    const currentSq = activePlayer ? monopolyBoard[activePlayer.c] : null;
    const isProperty = currentSq && (currentSq.type === "property" || currentSq.type === "station" || currentSq.type === "utility");
    const propObj = isProperty ? (currentSq as property) : null;
    const propState = isProperty && currentSq ? gameState.properties[currentSq.id] : null;
    const isUnowned = isProperty && propState && propState.ownerId <= 0;
    const canAfford = propObj && activePlayer && activePlayer.money >= propObj.price;

    // Trigger visual dice roll animation when diceRoll updates
    useEffect(() => {
        if (gameState.diceRoll) {
            setIsRollingAnim(true);
            const t = setTimeout(() => setIsRollingAnim(false), 600);
            return () => clearTimeout(t);
        }
    }, [gameState.diceRoll?.total]);

    // Automatic turn transition & cooldown timer
    useEffect(() => {
        if (!isMyTurn || gameState.winnerId) {
            setTimer(0);
            return;
        }

        // Case 1: Active player has not yet rolled -> countdown 15s to auto-roll
        if (!gameState.hasRolled) {
            setTimer(15);
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        rollDice();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }

        // Case 2: Active player has rolled and made a double -> countdown to auto-re-roll or let them buy
        if (canRollAgain) {
            setTimer(isUnowned && canAfford ? 8 : 4);
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        rollDice();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }

        // Case 3: Active player has rolled normal turn
        // If unowned and can afford: 8s to decide, then auto-pass
        // If cannot buy or already resolved: 3.5s auto-pass to next player
        const initialDelay = isUnowned && canAfford ? 8 : 3;
        setTimer(initialDelay);

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    endTurn();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [
        isMyTurn,
        gameState.hasRolled,
        canRollAgain,
        gameState.winnerId,
        isUnowned,
        canAfford,
        gameState.currentTurnPlayerId,
        rollDice,
        endTurn,
    ]);

    const handleBuyAndFinish = () => {
        buyCurrentProperty();
        if (!canRollAgain) {
            setTimeout(() => {
                endTurn();
            }, 600);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between w-full h-full max-w-sm p-3.5 bg-white border-3 border-red-500 shadow-2xl text-zinc-900 select-none font-sans rounded-none">
            {/* 1. Header Joueur Actif & Solde DA */}
            <div className="w-full bg-blue-300 border-2 border-red-500 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span
                        style={activePlayer?.color?.startsWith("#") ? { backgroundColor: activePlayer.color } : undefined}
                        className={`w-4 h-4 rounded-full border-2 border-white shadow shrink-0 ${
                            !activePlayer?.color?.startsWith("#") ? (activePlayer?.color ?? "bg-gray-400") : ""
                        } ${isMyTurn ? "animate-pulse ring-2 ring-red-500" : ""}`}
                    />
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                            <h2 className="text-xs font-black uppercase tracking-tight text-zinc-900 truncate">
                                {activePlayer?.name ?? "Joueur"}
                            </h2>
                            {isMyTurn && (
                                <span className="border border-red-500">
                                    <span className="inline-block border border-white text-[8px] font-bold px-1 bg-red-500 text-white">
                                        À vous !
                                    </span>
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-zinc-800 font-bold truncate">
                            {currentSq?.name ?? "Départ"} (#{activePlayer?.c ?? 0})
                        </p>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <span className="text-[9px] uppercase font-bold text-red-600 block">Solde</span>
                    <span className="text-xs font-black text-zinc-900 font-mono">
                        {activePlayer?.money ?? 0} €
                    </span>
                </div>
            </div>

            {/* 2. Affichage des Dés DA */}
            <div className="flex flex-col items-center gap-2 my-2 w-full">
                <div className="flex items-center gap-3">
                    {/* Dé 1 */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-11 h-11 bg-white border-2 border-red-500 shadow flex items-center justify-center text-red-600 font-mono text-xl font-black transition-transform ${
                                isRollingAnim ? "scale-110 rotate-12" : ""
                            }`}
                        >
                            {gameState.diceRoll ? gameState.diceRoll.dice1 : "-"}
                        </div>
                    </div>

                    <span className="text-base font-black text-red-500">+</span>

                    {/* Dé 2 */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-11 h-11 bg-white border-2 border-red-500 shadow flex items-center justify-center text-red-600 font-mono text-xl font-black transition-transform ${
                                isRollingAnim ? "scale-110 -rotate-12" : ""
                            }`}
                        >
                            {gameState.diceRoll ? gameState.diceRoll.dice2 : "-"}
                        </div>
                    </div>

                    <span className="text-base font-black text-red-500">=</span>

                    {/* Total */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-11 h-11 bg-red-500 border-2 border-white shadow flex items-center justify-center text-white font-mono text-xl font-black ${
                                isRollingAnim ? "scale-115" : ""
                            }`}
                        >
                            {gameState.diceRoll ? gameState.diceRoll.total : "-"}
                        </div>
                    </div>
                </div>

                {/* Message d'action DA */}
                {gameState.lastActionMessage && (
                    <div className="bg-blue-300 border-2 border-red-500 p-2 w-full text-center shadow-sm">
                        <p className="text-[10px] font-bold text-zinc-900 leading-snug">
                            {gameState.lastActionMessage}
                        </p>
                    </div>
                )}
            </div>

            {/* 3. Boutons d'Action & Automatisation du Tour */}
            <div className="w-full flex flex-col gap-2 pt-1">
                {/* Si le joueur est en prison */}
                {activePlayer?.inJail && isMyTurn && !gameState.hasRolled && (
                    <div className="border-2 border-red-500">
                        <button
                            type="button"
                            onClick={payJailFine}
                            className="inline-block border-2 border-white text-xs font-bold p-2 bg-red-500 text-white w-full cursor-pointer hover:bg-red-600 transition"
                        >
                            🔓 Payer la caution (50 €)
                        </button>
                    </div>
                )}

                {/* Bouton de Lancer de Dés (ou Rejouer Double) */}
                {!gameState.hasRolled || canRollAgain ? (
                    <div className="border-2 border-blue-500">
                        <button
                            type="button"
                            onClick={rollDice}
                            disabled={!isMyTurn}
                            className={`inline-block border-2 border-white text-xs font-black p-2.5 w-full uppercase tracking-wider transition ${
                                isMyTurn
                                    ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer active:scale-98 shadow-md"
                                    : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                            }`}
                        >
                            {isMyTurn
                                ? canRollAgain
                                    ? `🎲 Rejouer (Double !) (${timer}s)`
                                    : `🎲 Lancer les dés (${timer}s)`
                                : `⏳ En attente de ${activePlayer?.name ?? "l'adversaire"}...`}
                        </button>
                    </div>
                ) : null}

                {/* Boutons après avoir lancé : Acheter & Passage Auto */}
                {gameState.hasRolled && (
                    <div className="flex flex-col gap-1.5 w-full">
                        {/* Acheter la propriété si disponible */}
                        {isUnowned && canAfford && isMyTurn && (
                            <div className="border-2 border-red-500">
                                <button
                                    type="button"
                                    onClick={handleBuyAndFinish}
                                    className="inline-block border-2 border-white text-xs font-bold p-2 bg-red-500 text-white w-full cursor-pointer hover:bg-red-600 transition shadow"
                                >
                                    🏠 Acheter {currentSq?.name} ({propObj?.price} €)
                                </button>
                            </div>
                        )}

                        {/* Indicateur de passage automatique */}
                        {isMyTurn && !canRollAgain && (
                            <div className="flex items-center justify-between bg-blue-300 border border-red-400 px-2 py-1 text-[10px] font-bold text-zinc-800">
                                <span>Passage automatique au joueur suivant</span>
                                <button
                                    onClick={endTurn}
                                    className="underline text-red-600 hover:text-red-800 cursor-pointer"
                                >
                                    Passer maintenant ({timer}s) →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 4. Grille des Joueurs DA */}
            <div className="w-full mt-2 pt-2 border-t border-zinc-700">
                <div className="grid grid-cols-2 gap-1.5">
                    {gameState.players.map((p) => {
                        const isActive = p.id === activePlayer?.id;
                        return (
                            <div
                                key={p.id}
                                className={`p-1.5 border-2 flex items-center justify-between text-[10px] transition-all ${
                                    isActive
                                        ? "bg-red-500 text-white border-white font-bold shadow-md"
                                        : "bg-blue-300 text-zinc-900 border-red-500 font-semibold"
                                }`}
                            >
                                <div className="flex items-center gap-1.5 truncate max-w-[100px]">
                                    <span
                                        style={p.color?.startsWith("#") ? { backgroundColor: p.color } : undefined}
                                        className={`w-2.5 h-2.5 rounded-full border border-white shrink-0 ${
                                            !p.color?.startsWith("#") ? (p.color || "bg-blue-500") : ""
                                        }`}
                                    />
                                    <span className="truncate">{p.name}</span>
                                </div>
                                <span className={`font-mono font-bold shrink-0 ${isActive ? "text-white" : "text-zinc-900"}`}>
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