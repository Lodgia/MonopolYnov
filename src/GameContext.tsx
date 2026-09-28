import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { monopolyBoard } from "./allCases.ts";
import { property, SpecialSquare } from "./Property.ts";
import { drawCard } from "./Components/Cards/RandomCard.ts";
import { getGame, setGameState, getMeUser, type UserMe } from "./Game.ts";

export const PAWN_PALETTE = [
    "#ef4444", // Rouge Monopoly
    "#3b82f6", // Bleu Roi
    "#10b981", // Vert Émeraude
    "#f59e0b", // Jaune Ambré
    "#8b5cf6", // Violet
    "#ec4899", // Rose
    "#06b6d4", // Cyan
    "#84cc16", // Lime
];

export function getUniquePawnColors(count: number): string[] {
    const shuffled = [...PAWN_PALETTE].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export interface SyncedPlayer {
    id: number;
    name: string;
    c: number;
    money: number;
    color: string;
    inJail: boolean;
    jailTurns: number;
    isBot?: boolean;
    isBankrupt?: boolean;
}

export interface PropertyState {
    ownerId: number; // -1 if unowned
    level: number;   // 0 = base, 1-4 = houses, 5 = hotel
}

export interface SyncedGameState {
    version: number;
    players: SyncedPlayer[];
    properties: Record<number, PropertyState>;
    currentTurnPlayerId: number;
    hasRolled: boolean;
    canRollAgain?: boolean;
    diceRoll: { dice1: number; dice2: number; total: number } | null;
    doubleCount: number;
    lastActionMessage: string;
    activeCard?: {
        type: "chance" | "community";
        title: string;
        label: string;
    } | null;
    winnerId?: number | null;
}

export interface GameContextValue {
    gameState: SyncedGameState;
    players: SyncedPlayer[];
    me: UserMe | null;
    isMyTurn: boolean;
    activePlayer: SyncedPlayer | null;
    canRollAgain: boolean;
    rollDice: () => void;
    buyCurrentProperty: () => void;
    upgradeProperty: (squareId: number) => void;
    payJailFine: () => void;
    endTurn: () => void;
    closeActiveCard: () => void;
    resetGame: () => void;
    isLoading: boolean;
}

const defaultProperties: Record<number, PropertyState> = {};
monopolyBoard.forEach((sq) => {
    if (sq.type === "property" || sq.type === "station" || sq.type === "utility") {
        defaultProperties[sq.id] = { ownerId: -1, level: 0 };
    }
});

const defaultInitialColors = getUniquePawnColors(2);
const defaultInitialState: SyncedGameState = {
    version: 1,
    players: [
        { id: 1, name: "Joueur 1", c: 0, money: 1500, color: defaultInitialColors[0], inJail: false, jailTurns: 0 },
        { id: 2, name: "Joueur 2", c: 0, money: 1500, color: defaultInitialColors[1], inJail: false, jailTurns: 0 },
    ],
    properties: defaultProperties,
    currentTurnPlayerId: 1,
    hasRolled: false,
    canRollAgain: false,
    diceRoll: null,
    doubleCount: 0,
    lastActionMessage: "La partie est prête. À vous de jouer !",
    activeCard: null,
    winnerId: null,
};

export const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider = ({
    children,
    gameId,
    initialPlayers,
}: {
    children: React.ReactNode;
    gameId?: number;
    initialPlayers?: SyncedPlayer[];
}) => {
    const [me, setMe] = useState<UserMe | null>(null);
    const [gameState, setGameStateLocal] = useState<SyncedGameState>(() => {
        if (initialPlayers && initialPlayers.length > 0) {
            return {
                ...defaultInitialState,
                players: initialPlayers,
                currentTurnPlayerId: initialPlayers[0].id,
            };
        }
        return defaultInitialState;
    });
    const [isLoading] = useState(false);
    const isBotRunningRef = useRef(false);

    // 1. Fetch current logged-in user
    useEffect(() => {
        getMeUser()
            .then((u) => setMe(u))
            .catch(() => {
                setMe({ id: 1, email: "joueur@monopolynov.local", profilePicture: null, color: "#ef4444" });
            });
    }, []);

    // 2. Poll remote game state if online gameId is present
    useEffect(() => {
        if (!gameId) return;

        let isMounted = true;
        const fetchRemote = async () => {
            try {
                const g = await getGame(gameId);
                if (!isMounted || !g) return;

                if (g.state && g.state.trim().startsWith("{")) {
                    try {
                        const parsed: SyncedGameState = JSON.parse(g.state);
                        setGameStateLocal((prev) => {
                            if (
                                parsed.version > prev.version ||
                                parsed.currentTurnPlayerId !== prev.currentTurnPlayerId ||
                                parsed.hasRolled !== prev.hasRolled ||
                                parsed.winnerId !== prev.winnerId ||
                                JSON.stringify(parsed.activeCard) !== JSON.stringify(prev.activeCard)
                            ) {
                                return parsed;
                            }
                            return prev;
                        });
                    } catch {
                        // ignore
                    }
                } else if (g.players && g.players.length > 0) {
                    setGameStateLocal((prev) => {
                        if (prev.players.length === g.players.length) return prev;
                        const uniqueColors = getUniquePawnColors(g.players.length);
                        const syncedP: SyncedPlayer[] = g.players.map((p, idx) => ({
                            id: p.id,
                            name: p.email.split("@")[0],
                            c: 0,
                            money: 1500,
                            color: p.color || uniqueColors[idx],
                            inJail: false,
                            jailTurns: 0,
                        }));
                        return {
                            ...prev,
                            players: syncedP,
                            currentTurnPlayerId: g.currentTurnUserId ?? syncedP[0]?.id ?? 1,
                        };
                    });
                }
            } catch {
                // error polling
            }
        };

        fetchRemote();
        const interval = setInterval(fetchRemote, 1000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [gameId]);

    // Active player and turn checking
    const activePlayer = gameState.players.find((p) => p.id === gameState.currentTurnPlayerId) ?? gameState.players[0] ?? null;
    const isMyTurn = !gameId || (me !== null && activePlayer?.id === me.id) || (activePlayer?.isBot === true);
    const canRollAgain = !!gameState.canRollAgain;

    // Save and synchronize state
    const syncState = useCallback(
        async (newState: SyncedGameState, nextTurnUserId?: number) => {
            setGameStateLocal(newState);
            if (gameId) {
                try {
                    await setGameState(gameId, {
                        state: JSON.stringify(newState),
                        currentTurnUserId: nextTurnUserId ?? newState.currentTurnPlayerId,
                        ended: !!newState.winnerId,
                    });
                } catch (err) {
                    console.error("Erreur sync state:", err);
                }
            }
        },
        [gameId]
    );

    // Helper: calculate rent on a square
    const calculateRent = useCallback(
        (sq: property, properties: Record<number, PropertyState>, players: SyncedPlayer[], diceTotal: number): number => {
            const propState = properties[sq.id];
            if (!propState || propState.ownerId <= 0) return 0;

            if (sq.type === "station") {
                const ownerStations = monopolyBoard.filter(
                    (s) => s.type === "station" && properties[s.id]?.ownerId === propState.ownerId
                ).length;
                return [25, 50, 100, 200][Math.min(ownerStations - 1, 3)] || 25;
            }

            if (sq.type === "utility") {
                const ownerUtilities = monopolyBoard.filter(
                    (s) => s.type === "utility" && properties[s.id]?.ownerId === propState.ownerId
                ).length;
                return ownerUtilities >= 2 ? diceTotal * 10 : diceTotal * 4;
            }

            // Normal property
            const sameGroup = monopolyBoard.filter(
                (s) => s.type === "property" && (s as property).colorKey === sq.colorKey
            );
            const isFullGroup = sameGroup.every((s) => properties[s.id]?.ownerId === propState.ownerId);

            return sq.getRent(propState.level, isFullGroup, 1, diceTotal);
        },
        []
    );

    // 3. Roll Dice logic
    const rollDice = useCallback(() => {
        if (!activePlayer || (!canRollAgain && gameState.hasRolled) || !isMyTurn) return;

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;
        const isDouble = dice1 === dice2;

        let newPlayers = [...gameState.players];
        let pIndex = newPlayers.findIndex((p) => p.id === activePlayer.id);
        let p = { ...newPlayers[pIndex] };
        let newProps = { ...gameState.properties };
        let newDoubleCount = isDouble ? gameState.doubleCount + 1 : 0;
        let actionMsg = "";
        let drawnCard: { type: "chance" | "community"; title: string; label: string } | null = null;
        let isNowInJail = p.inJail;

        // In Jail handling
        if (p.inJail) {
            if (isDouble) {
                p.inJail = false;
                p.jailTurns = 0;
                p.c = (p.c + total) % 40;
                actionMsg = `🎉 Double (${dice1}+${dice2}) ! ${p.name} sort de prison et avance de ${total} cases.`;
            } else {
                p.jailTurns += 1;
                if (p.jailTurns >= 3) {
                    p.money = Math.max(0, p.money - 50);
                    p.inJail = false;
                    p.jailTurns = 0;
                    p.c = (p.c + total) % 40;
                    actionMsg = `${p.name} paie 50 € de caution après 3 tours et avance de ${total} cases.`;
                } else {
                    actionMsg = `${p.name} fait ${dice1}+${dice2} (pas de double) et reste en prison (Tour ${p.jailTurns}/3).`;
                    newPlayers[pIndex] = p;
                    const nextSt: SyncedGameState = {
                        ...gameState,
                        version: gameState.version + 1,
                        players: newPlayers,
                        hasRolled: true,
                        canRollAgain: false,
                        diceRoll: { dice1, dice2, total },
                        doubleCount: 0,
                        lastActionMessage: actionMsg,
                    };
                    syncState(nextSt);
                    return;
                }
            }
        } else {
            // Normal movement
            if (newDoubleCount === 3) {
                p.inJail = true;
                p.jailTurns = 0;
                p.c = 10;
                actionMsg = `🚨 3 doubles consécutifs ! ${p.name} est envoyé directement en prison.`;
                newPlayers[pIndex] = p;
                const nextSt: SyncedGameState = {
                    ...gameState,
                    version: gameState.version + 1,
                    players: newPlayers,
                    hasRolled: true,
                    canRollAgain: false,
                    diceRoll: { dice1, dice2, total },
                    doubleCount: 0,
                    lastActionMessage: actionMsg,
                };
                syncState(nextSt);
                return;
            }

            const oldPos = p.c;
            p.c = (p.c + total) % 40;
            let passedGo = p.c < oldPos;
            if (passedGo) {
                p.money += 200;
            }

            const landedSq = monopolyBoard[p.c];
            actionMsg = `${p.name} a fait ${total} (${dice1}+${dice2})${isDouble ? " 🎲 Double !" : ""} et s'arrête sur "${landedSq.name}"${
                passedGo ? " (+200 € Départ)" : ""
            }.`;

            if (landedSq.id === 30) {
                p.c = 10;
                p.inJail = true;
                p.jailTurns = 0;
                isNowInJail = true;
                actionMsg += ` 👮 Allez en prison !`;
            } else if (landedSq.id === 4) {
                p.money = Math.max(0, p.money - 200);
                actionMsg += ` 💰 Paye 200 € d'impôts.`;
            } else if (landedSq.id === 38) {
                p.money = Math.max(0, p.money - 100);
                actionMsg += ` 💍 Paye 100 € de taxe de luxe.`;
            } else if (landedSq.type === "special") {
                const spec = landedSq as SpecialSquare;
                if (spec.subType === "chance" || spec.subType === "community") {
                    const card = drawCard(spec.subType, p.name);
                    drawnCard = {
                        type: spec.subType,
                        title: spec.subType === "chance" ? "Carte Chance" : "Caisse de Communauté",
                        label: card.label,
                    };

                    if (card.moneyChange) {
                        p.money = Math.max(0, p.money + card.moneyChange);
                    }
                    if (card.goToJail) {
                        p.c = 10;
                        p.inJail = true;
                        p.jailTurns = 0;
                        isNowInJail = true;
                    } else if (card.moveTo !== undefined) {
                        p.c = card.moveTo;
                    }
                    actionMsg += ` 🃏 Tire : "${card.label}"`;
                }
            } else if (landedSq.type === "property" || landedSq.type === "station" || landedSq.type === "utility") {
                const propState = newProps[landedSq.id];
                if (propState && propState.ownerId > 0 && propState.ownerId !== p.id) {
                    const owner = newPlayers.find((pl) => pl.id === propState.ownerId);
                    const rent = calculateRent(landedSq as property, newProps, newPlayers, total);
                    if (rent > 0) {
                        p.money = Math.max(0, p.money - rent);
                        if (owner) {
                            owner.money += rent;
                        }
                        actionMsg += ` 💸 Verse ${rent} € de loyer à ${owner?.name ?? "l'adversaire"}.`;
                    }
                }
            }
        }

        newPlayers[pIndex] = p;

        // Double roll allows property buying AND rolling again!
        const willCanRollAgain = isDouble && newDoubleCount < 3 && !isNowInJail;

        const nextSt: SyncedGameState = {
            ...gameState,
            version: gameState.version + 1,
            players: newPlayers,
            properties: newProps,
            hasRolled: true,
            canRollAgain: willCanRollAgain,
            diceRoll: { dice1, dice2, total },
            doubleCount: newDoubleCount,
            lastActionMessage: actionMsg,
            activeCard: drawnCard,
        };

        syncState(nextSt);
    }, [activePlayer, gameState, isMyTurn, canRollAgain, syncState, calculateRent]);

    // 4. Buy property logic (works even after double roll!)
    const buyCurrentProperty = useCallback(() => {
        if (!activePlayer || !isMyTurn) return;

        const landedSq = monopolyBoard[activePlayer.c];
        if (!landedSq || (landedSq.type !== "property" && landedSq.type !== "station" && landedSq.type !== "utility")) {
            return;
        }

        const propObj = landedSq as property;
        const propState = gameState.properties[landedSq.id];
        if (propState && propState.ownerId > 0) return;
        if (activePlayer.money < propObj.price) return;

        const newPlayers = gameState.players.map((p) =>
            p.id === activePlayer.id ? { ...p, money: p.money - propObj.price } : p
        );

        const newProperties = {
            ...gameState.properties,
            [landedSq.id]: { ownerId: activePlayer.id, level: 0 },
        };

        const nextSt: SyncedGameState = {
            ...gameState,
            version: gameState.version + 1,
            players: newPlayers,
            properties: newProperties,
            lastActionMessage: `🏠 ${activePlayer.name} a acheté "${landedSq.name}" pour ${propObj.price} €.`,
        };

        syncState(nextSt);
    }, [activePlayer, isMyTurn, gameState, syncState]);

    // 5. Upgrade property (houses / hotel)
    const upgradeProperty = useCallback(
        (squareId: number) => {
            if (!activePlayer || !isMyTurn) return;

            const sq = monopolyBoard[squareId];
            if (!sq || sq.type !== "property") return;

            const propObj = sq as property;
            const propState = gameState.properties[squareId];
            if (!propState || propState.ownerId !== activePlayer.id || propState.level >= 5) return;
            if (activePlayer.money < propObj.costHouse) return;

            const newPlayers = gameState.players.map((p) =>
                p.id === activePlayer.id ? { ...p, money: p.money - propObj.costHouse } : p
            );

            const newProperties = {
                ...gameState.properties,
                [squareId]: { ...propState, level: propState.level + 1 },
            };

            const nextSt: SyncedGameState = {
                ...gameState,
                version: gameState.version + 1,
                players: newPlayers,
                properties: newProperties,
                lastActionMessage: `🔨 ${activePlayer.name} a construit sur "${sq.name}" (Niveau ${
                    propState.level + 1 === 5 ? "Hôtel" : propState.level + 1
                }).`,
            };

            syncState(nextSt);
        },
        [activePlayer, isMyTurn, gameState, syncState]
    );

    // 6. Pay jail fine (50 €)
    const payJailFine = useCallback(() => {
        if (!activePlayer || !activePlayer.inJail || !isMyTurn || activePlayer.money < 50) return;

        const newPlayers = gameState.players.map((p) =>
            p.id === activePlayer.id ? { ...p, money: p.money - 50, inJail: false, jailTurns: 0 } : p
        );

        const nextSt: SyncedGameState = {
            ...gameState,
            version: gameState.version + 1,
            players: newPlayers,
            lastActionMessage: `🔓 ${activePlayer.name} a payé 50 € et sort de prison !`,
        };

        syncState(nextSt);
    }, [activePlayer, isMyTurn, gameState, syncState]);

    // 7. End Turn logic
    const endTurn = useCallback(() => {
        if (!activePlayer || !gameState.hasRolled || !isMyTurn) return;

        // Check for bankrupt players (money <= 0 with debts)
        const activePlayersList = gameState.players.filter((p) => !p.isBankrupt && p.money >= 0);
        if (activePlayersList.length <= 1) {
            const winner = activePlayersList[0] || activePlayer;
            const nextSt: SyncedGameState = {
                ...gameState,
                version: gameState.version + 1,
                winnerId: winner.id,
                lastActionMessage: `🏆 Victoire de ${winner.name} ! Tous les autres joueurs sont en faillite.`,
            };
            syncState(nextSt);
            return;
        }

        const currentIndex = activePlayersList.findIndex((p) => p.id === activePlayer.id);
        const nextIndex = (currentIndex + 1) % activePlayersList.length;
        const nextPlayer = activePlayersList[nextIndex];

        const nextSt: SyncedGameState = {
            ...gameState,
            version: gameState.version + 1,
            currentTurnPlayerId: nextPlayer.id,
            hasRolled: false,
            canRollAgain: false,
            diceRoll: null,
            doubleCount: 0,
            activeCard: null,
            lastActionMessage: `Fin du tour de ${activePlayer.name}. C'est maintenant au tour de ${nextPlayer.name} !`,
        };

        syncState(nextSt, nextPlayer.id);
    }, [activePlayer, gameState, isMyTurn, syncState]);

    const closeActiveCard = useCallback(() => {
        const nextSt = { ...gameState, version: gameState.version + 1, activeCard: null };
        syncState(nextSt);
    }, [gameState, syncState]);

    const resetGame = useCallback(() => {
        const uniqueColors = getUniquePawnColors(gameState.players.length);
        const nextSt: SyncedGameState = {
            ...defaultInitialState,
            players: gameState.players.map((p, idx) => ({
                ...p,
                c: 0,
                money: 1500,
                color: uniqueColors[idx] || p.color,
                inJail: false,
                jailTurns: 0,
            })),
            properties: defaultProperties,
            currentTurnPlayerId: gameState.players[0]?.id ?? 1,
        };
        syncState(nextSt);
    }, [gameState.players, syncState]);

    const value: GameContextValue = {
        gameState,
        players: gameState.players,
        me,
        isMyTurn,
        activePlayer,
        canRollAgain,
        rollDice,
        buyCurrentProperty,
        upgradeProperty,
        payJailFine,
        endTurn,
        closeActiveCard,
        resetGame,
        isLoading,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGame doit être utilisé au sein d'un GameProvider");
    }
    return context;
};