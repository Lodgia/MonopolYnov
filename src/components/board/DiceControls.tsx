import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext.tsx";
import { monopolyBoard } from "../../data/allCases.ts";
import { property } from "../../types/Property.ts";
import { DiceDisplay } from "./DiceDisplay.tsx";
import { PlayerBadgeList } from "./PlayerBadgeList.tsx";
import { MonopolyButton } from "../ui/MonopolyButton.tsx";

export function DiceControls() {
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

    const currentSq = activePlayer ? monopolyBoard[activePlayer.c] : null;
    const isProperty = currentSq && (currentSq.type === "property" || currentSq.type === "station" || currentSq.type === "utility");
    const propObj = isProperty ? (currentSq as property) : null;
    const propState = isProperty && currentSq ? gameState.properties[currentSq.id] : null;
    const isUnowned = isProperty && propState && propState.ownerId <= 0;
    const canAfford = propObj && activePlayer && activePlayer.money >= propObj.price;

    useEffect(() => {
        if (gameState.diceRoll) {
            setIsRollingAnim(true);
            const t = setTimeout(() => setIsRollingAnim(false), 600);
            return () => clearTimeout(t);
        }
    }, [gameState.diceRoll?.total]);

    useEffect(() => {
        if (!isMyTurn || gameState.winnerId) {
            setTimer(0);
            return;
        }

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
                                {activePlayer?.hasLeft && (
                                    <span className="text-[8px] text-red-600 font-bold ml-1">(A quitté)</span>
                                )}
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

            <div className="flex flex-col items-center gap-2 my-2 w-full">
                <DiceDisplay
                    dice1={gameState.diceRoll?.dice1 ?? null}
                    dice2={gameState.diceRoll?.dice2 ?? null}
                    total={gameState.diceRoll?.total ?? null}
                    isRolling={isRollingAnim}
                />

                {gameState.lastActionMessage && (
                    <div className="bg-blue-300 border-2 border-red-500 p-2 w-full text-center shadow-sm">
                        <p className="text-[10px] font-bold text-zinc-900 leading-snug">
                            {gameState.lastActionMessage}
                        </p>
                    </div>
                )}
            </div>

            <div className="w-full flex flex-col gap-2 pt-1">
                {activePlayer?.inJail && isMyTurn && !gameState.hasRolled && (
                    <MonopolyButton
                        variant="danger"
                        className="w-full"
                        onClick={payJailFine}
                    >
                        🔓 Payer la caution (50 €)
                    </MonopolyButton>
                )}

                {(!gameState.hasRolled || canRollAgain) && (
                    <MonopolyButton
                        variant="red"
                        className="w-full"
                        onClick={rollDice}
                        disabled={!isMyTurn}
                    >
                        {isMyTurn
                            ? canRollAgain
                                ? `🎲 Rejouer (Double !) (${timer}s)`
                                : `🎲 Lancer les dés (${timer}s)`
                            : `⏳ En attente de ${activePlayer?.name ?? "l'adversaire"}...`}
                    </MonopolyButton>
                )}

                {gameState.hasRolled && (
                    <div className="flex flex-col gap-1.5 w-full">
                        {isUnowned && canAfford && isMyTurn && (
                            <MonopolyButton
                                variant="danger"
                                className="w-full"
                                onClick={handleBuyAndFinish}
                            >
                                🏠 Acheter {currentSq?.name} ({propObj?.price} €)
                            </MonopolyButton>
                        )}

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

            <PlayerBadgeList
                players={gameState.players}
                activePlayerId={activePlayer?.id ?? null}
            />
        </div>
    );
}

export const Des = DiceControls;
