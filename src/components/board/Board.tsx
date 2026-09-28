import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Case } from "./Case.tsx";
import { monopolyBoard } from "../../data/allCases.ts";
import { DiceControls } from "./DiceControls.tsx";
import { GameProvider, useGame, type SyncedPlayer } from "../../context/GameContext.tsx";
import { getGame } from "../../types/Game.ts";
import { PropertyDeedModal } from "../cards/PropertyDeedModal.tsx";
import { DisplayCard } from "../cards/DisplayCard.tsx";
import { RulesModal } from "../modals/RulesModal.tsx";
import { HistoryModal } from "../modals/HistoryModal.tsx";
import { VictoryModal } from "../modals/VictoryModal.tsx";
import type { Square } from "../../types/Property.ts";

function BoardInner({ gameId }: { gameId?: string }) {
    const navigate = useNavigate();
    const { gameState, activePlayer, isMyTurn, buyCurrentProperty, upgradeProperty, closeActiveCard, leaveCurrentGame } = useGame();
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const getSquareOwner = (sqId: number) => {
        const propState = gameState.properties[sqId];
        if (!propState || propState.ownerId <= 0) return { name: undefined, color: undefined, level: 0 };
        const owner = gameState.players.find((p) => p.id === propState.ownerId);
        return {
            name: owner?.name,
            color: owner?.color,
            level: propState.level ?? 0,
        };
    };

    const selectedOwner = selectedSquare ? getSquareOwner(selectedSquare.id) : null;
    const isSelectedCurrent = selectedSquare && activePlayer && activePlayer.c === selectedSquare.id;
    const canBuySelected = isSelectedCurrent && isMyTurn && selectedOwner?.name === undefined;
    const canUpgradeSelected = isMyTurn && selectedOwner?.name === activePlayer?.name;

    const handleLeave = () => {
        if (window.confirm("Êtes-vous sûr de vouloir quitter la partie en cours ?")) {
            leaveCurrentGame();
            navigate("/home");
        }
    };

    return (
        <div className="min-h-screen w-full bg-blue-900 text-zinc-100 flex flex-col items-center justify-center p-2 sm:p-4 select-none antialiased font-sans">
            <div className="w-full max-w-2xl flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <div className="border-2 border-red-500">
                        <button
                            onClick={handleLeave}
                            className="inline-block border-2 border-white text-xs font-bold p-1 px-2.5 bg-red-500 text-white cursor-pointer hover:bg-red-600 transition"
                        >
                            ← Quitter la partie
                        </button>
                    </div>
                    <span className="font-bold text-sm text-white">MonopolYnov</span>
                    {gameId && (
                        <span className="border-2 border-blue-500">
                            <span className="inline-block border-2 border-white text-[10px] font-bold p-0.5 px-2 bg-blue-500 text-white font-mono">
                                Salon #{gameId}
                            </span>
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="border-2 border-blue-500">
                        <button
                            onClick={() => setHistoryOpen(true)}
                            className="inline-block border-2 border-white text-xs font-bold p-1 px-2.5 bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition"
                        >
                            📜 Historique
                        </button>
                    </div>
                    <div className="border-2 border-blue-500">
                        <button
                            onClick={() => setRulesOpen(true)}
                            className="inline-block border-2 border-white text-xs font-bold p-1 px-2.5 bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition"
                        >
                            📖 Règles
                        </button>
                    </div>
                </div>
            </div>

            {gameState.players.some((p) => p.hasLeft) && (
                <div className="w-full max-w-2xl bg-amber-400 text-zinc-900 border-2 border-red-500 p-2 mb-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
                    <span>⚠️</span>
                    <span>
                        {gameState.players.filter((p) => p.hasLeft).map((p) => p.name).join(", ")} a quitté la partie. Le jeu continue avec les joueurs actifs.
                    </span>
                </div>
            )}

            <div className="grid grid-cols-[repeat(11,minmax(0,1fr))] grid-rows-[repeat(11,minmax(0,1fr))] gap-0.5 mx-auto w-full max-w-2xl aspect-square p-2 text-xs font-bold text-center bg-green-100 border-3 border-red-500 shadow-2xl">
                <div className="col-start-1 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[0]} position="corner" onClick={() => setSelectedSquare(monopolyBoard[0])} />
                </div>
                <div className="col-start-2 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[1]} ownerColor={getSquareOwner(1).color} level={getSquareOwner(1).level} position="bottom" onClick={() => setSelectedSquare(monopolyBoard[1])} />
                </div>
                <div className="col-start-3 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[2]} position="bottom" onClick={() => setSelectedSquare(monopolyBoard[2])} />
                </div>
                <div className="col-start-4 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[3]} ownerColor={getSquareOwner(3).color} level={getSquareOwner(3).level} position="bottom" onClick={() => setSelectedSquare(monopolyBoard[3])} />
                </div>
                <div className="col-start-5 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[4]} position="bottom" onClick={() => setSelectedSquare(monopolyBoard[4])} />
                </div>
                <div className="col-start-6 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[5]} ownerColor={getSquareOwner(5).color} position="bottom" onClick={() => setSelectedSquare(monopolyBoard[5])} />
                </div>
                <div className="col-start-7 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[6]} ownerColor={getSquareOwner(6).color} level={getSquareOwner(6).level} position="bottom" onClick={() => setSelectedSquare(monopolyBoard[6])} />
                </div>
                <div className="col-start-8 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[7]} position="bottom" onClick={() => setSelectedSquare(monopolyBoard[7])} />
                </div>
                <div className="col-start-9 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[8]} ownerColor={getSquareOwner(8).color} level={getSquareOwner(8).level} position="bottom" onClick={() => setSelectedSquare(monopolyBoard[8])} />
                </div>
                <div className="col-start-10 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[9]} ownerColor={getSquareOwner(9).color} level={getSquareOwner(9).level} position="bottom" onClick={() => setSelectedSquare(monopolyBoard[9])} />
                </div>
                <div className="col-start-11 row-start-1 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[10]} position="corner" onClick={() => setSelectedSquare(monopolyBoard[10])} />
                </div>

                <div className="col-start-11 row-start-2 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[11]} ownerColor={getSquareOwner(11).color} level={getSquareOwner(11).level} position="left" onClick={() => setSelectedSquare(monopolyBoard[11])} />
                </div>
                <div className="col-start-11 row-start-3 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[12]} ownerColor={getSquareOwner(12).color} position="left" onClick={() => setSelectedSquare(monopolyBoard[12])} />
                </div>
                <div className="col-start-11 row-start-4 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[13]} ownerColor={getSquareOwner(13).color} level={getSquareOwner(13).level} position="left" onClick={() => setSelectedSquare(monopolyBoard[13])} />
                </div>
                <div className="col-start-11 row-start-5 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[14]} ownerColor={getSquareOwner(14).color} level={getSquareOwner(14).level} position="left" onClick={() => setSelectedSquare(monopolyBoard[14])} />
                </div>
                <div className="col-start-11 row-start-6 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[15]} ownerColor={getSquareOwner(15).color} position="left" onClick={() => setSelectedSquare(monopolyBoard[15])} />
                </div>
                <div className="col-start-11 row-start-7 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[16]} ownerColor={getSquareOwner(16).color} level={getSquareOwner(16).level} position="left" onClick={() => setSelectedSquare(monopolyBoard[16])} />
                </div>
                <div className="col-start-11 row-start-8 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[17]} position="left" onClick={() => setSelectedSquare(monopolyBoard[17])} />
                </div>
                <div className="col-start-11 row-start-9 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[18]} ownerColor={getSquareOwner(18).color} level={getSquareOwner(18).level} position="left" onClick={() => setSelectedSquare(monopolyBoard[18])} />
                </div>
                <div className="col-start-11 row-start-10 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[19]} ownerColor={getSquareOwner(19).color} level={getSquareOwner(19).level} position="left" onClick={() => setSelectedSquare(monopolyBoard[19])} />
                </div>

                <div className="col-start-11 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[20]} position="corner" onClick={() => setSelectedSquare(monopolyBoard[20])} />
                </div>
                <div className="col-start-10 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[21]} ownerColor={getSquareOwner(21).color} level={getSquareOwner(21).level} position="top" onClick={() => setSelectedSquare(monopolyBoard[21])} />
                </div>
                <div className="col-start-9 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[22]} position="top" onClick={() => setSelectedSquare(monopolyBoard[22])} />
                </div>
                <div className="col-start-8 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[23]} ownerColor={getSquareOwner(23).color} level={getSquareOwner(23).level} position="top" onClick={() => setSelectedSquare(monopolyBoard[23])} />
                </div>
                <div className="col-start-7 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[24]} ownerColor={getSquareOwner(24).color} level={getSquareOwner(24).level} position="top" onClick={() => setSelectedSquare(monopolyBoard[24])} />
                </div>
                <div className="col-start-6 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[25]} ownerColor={getSquareOwner(25).color} position="top" onClick={() => setSelectedSquare(monopolyBoard[25])} />
                </div>
                <div className="col-start-5 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[26]} ownerColor={getSquareOwner(26).color} level={getSquareOwner(26).level} position="top" onClick={() => setSelectedSquare(monopolyBoard[26])} />
                </div>
                <div className="col-start-4 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[27]} ownerColor={getSquareOwner(27).color} level={getSquareOwner(27).level} position="top" onClick={() => setSelectedSquare(monopolyBoard[27])} />
                </div>
                <div className="col-start-3 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[28]} ownerColor={getSquareOwner(28).color} position="top" onClick={() => setSelectedSquare(monopolyBoard[28])} />
                </div>
                <div className="col-start-2 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[29]} ownerColor={getSquareOwner(29).color} level={getSquareOwner(29).level} position="top" onClick={() => setSelectedSquare(monopolyBoard[29])} />
                </div>

                <div className="col-start-1 row-start-11 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[30]} position="corner" onClick={() => setSelectedSquare(monopolyBoard[30])} />
                </div>
                <div className="col-start-1 row-start-10 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[31]} ownerColor={getSquareOwner(31).color} level={getSquareOwner(31).level} position="right" onClick={() => setSelectedSquare(monopolyBoard[31])} />
                </div>
                <div className="col-start-1 row-start-9 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[32]} ownerColor={getSquareOwner(32).color} level={getSquareOwner(32).level} position="right" onClick={() => setSelectedSquare(monopolyBoard[32])} />
                </div>
                <div className="col-start-1 row-start-8 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[33]} position="right" onClick={() => setSelectedSquare(monopolyBoard[33])} />
                </div>
                <div className="col-start-1 row-start-7 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[34]} ownerColor={getSquareOwner(34).color} level={getSquareOwner(34).level} position="right" onClick={() => setSelectedSquare(monopolyBoard[34])} />
                </div>
                <div className="col-start-1 row-start-6 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[35]} ownerColor={getSquareOwner(35).color} position="right" onClick={() => setSelectedSquare(monopolyBoard[35])} />
                </div>
                <div className="col-start-1 row-start-5 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[36]} position="right" onClick={() => setSelectedSquare(monopolyBoard[36])} />
                </div>
                <div className="col-start-1 row-start-4 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[37]} ownerColor={getSquareOwner(37).color} level={getSquareOwner(37).level} position="right" onClick={() => setSelectedSquare(monopolyBoard[37])} />
                </div>
                <div className="col-start-1 row-start-3 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[38]} position="right" onClick={() => setSelectedSquare(monopolyBoard[38])} />
                </div>
                <div className="col-start-1 row-start-2 w-full h-full">
                    <Case players={gameState.players} property={monopolyBoard[39]} ownerColor={getSquareOwner(39).color} level={getSquareOwner(39).level} position="right" onClick={() => setSelectedSquare(monopolyBoard[39])} />
                </div>

                <div className="col-start-2 col-end-11 row-start-2 row-end-11 flex items-center justify-center p-2">
                    <DiceControls />
                </div>
            </div>

            <PropertyDeedModal
                square={selectedSquare}
                ownerName={selectedOwner?.name}
                ownerColor={selectedOwner?.color}
                currentLevel={selectedOwner?.level}
                canBuy={canBuySelected}
                canUpgrade={canUpgradeSelected}
                onBuy={buyCurrentProperty}
                onUpgrade={() => selectedSquare && upgradeProperty(selectedSquare.id)}
                onClose={() => setSelectedSquare(null)}
            />

            {gameState.activeCard && (
                <DisplayCard
                    cardLabel={gameState.activeCard.label}
                    cardType={gameState.activeCard.type}
                    onClose={closeActiveCard}
                />
            )}

            <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
            <HistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />

            {gameState.winnerId && (
                <VictoryModal
                    winner={
                        gameState.players.find((p) => p.id === gameState.winnerId) ?? {
                            name: `Joueur #${gameState.winnerId}`,
                        }
                    }
                />
            )}
        </div>
    );
}

export function Board() {
    const { id } = useParams<{ id: string }>();
    const [initialPlayers, setInitialPlayers] = useState<SyncedPlayer[] | undefined>(undefined);

    useEffect(() => {
        if (!id) return;
        getGame(Number(id))
            .then((g) => {
                if (g && g.players && g.players.length > 0) {
                    const defaultColors = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-orange-500"];
                    const pList: SyncedPlayer[] = g.players.map((p, idx) => ({
                        id: p.id,
                        name: p.email.split("@")[0],
                        c: 0,
                        money: 1500,
                        color: p.color || defaultColors[idx % defaultColors.length],
                        inJail: false,
                        jailTurns: 0,
                    }));
                    setInitialPlayers(pList);
                }
            })
            .catch(() => {});
    }, [id]);

    return (
        <GameProvider gameId={id ? Number(id) : undefined} initialPlayers={initialPlayers}>
            <BoardInner gameId={id} />
        </GameProvider>
    );
}

export default Board;
