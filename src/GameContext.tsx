import React, { createContext, useContext, useEffect, useState } from 'react';
import { Player } from './Player.ts';
import { monopolyBoard } from './allCases.ts';
import type { CardType } from './Components/Cards/RandomCard.ts';

export type PlayerTurnDict = {
  [order: number]: Player;
};

export type DiceRollResult = {
  dice1: number;
  dice2: number;
  total: number;
};

export type GameContextValue = {
  turnOrder: PlayerTurnDict;
  players: Player[];
  currentPlayer: Player;
  lastDiceRoll: DiceRollResult | null;
  lastActionMessage: string | null;
  lastCard: { label: string; type: CardType } | null;
  rollDice: () => DiceRollResult | null;
  dismissCard: () => void;
  useJailFreeCard: () => void;
  resetGame: () => void;
};

const initialPlayersDict: PlayerTurnDict = {
  1: new Player(1, "Joueur 1 (Bleu)", 0, 1500, "bg-blue-500"),
  2: new Player(2, "Joueur 2 (Rouge)", 0, 1500, "bg-red-500"),
  3: new Player(3, "Joueur 3 (Vert)", 0, 1500, "bg-green-500"),
  4: new Player(4, "Joueur 4 (Orange)", 0, 1500, "bg-orange-500"),
};

export const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider = ({ children, initialPlayers }: { children: React.ReactNode; initialPlayers?: Player[] }) => {
  const createDict = (list?: Player[]): PlayerTurnDict => {
    if (list && list.length > 0) {
      const dict: PlayerTurnDict = {};
      list.forEach((p, idx) => {
        dict[idx + 1] = p;
      });
      return dict;
    }
    return initialPlayersDict;
  };

  const cloneDict = (source: PlayerTurnDict): PlayerTurnDict => {
    const cloned: PlayerTurnDict = {};
    Object.entries(source).forEach(([order, player]) => {
      const copy = new Player(player.id, player.name, player.c, player.money, player.color);
      copy.haveProp = [...player.haveProp];
      copy.isInJail = player.isInJail;
      copy.jailTurns = player.jailTurns;
      copy.jailFreeCards = player.jailFreeCards;
      cloned[Number(order)] = copy;
    });
    return cloned;
  };

  const [turnOrder, setTurnOrder] = useState<PlayerTurnDict>(() => createDict(initialPlayers));
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRollResult | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>("La partie est prête !");
  const [lastCard, setLastCard] = useState<GameContextValue["lastCard"]>(null);

  useEffect(() => {
    if (initialPlayers && initialPlayers.length > 0) {
      setTurnOrder(createDict(initialPlayers));
    }
  }, [initialPlayers]);

  const currentPlayer = turnOrder[1];
  const players = Object.values(turnOrder);

  const rollDice = (): DiceRollResult | null => {
    const updatedTurnOrder = cloneDict(turnOrder);
    const currentP = updatedTurnOrder[1];
    if (!currentP) return null;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    const messages: string[] = [];
    let passedStart = false;
    let moved = true;

    if (currentP.isInJail) {
      if (dice1 === dice2) {
        currentP.isInJail = false;
        currentP.jailTurns = 0;
        messages.push(`${currentP.name} sort de prison grâce à un double`);
      } else if (currentP.jailTurns < 2) {
        currentP.jailTurns++;
        moved = false;
        messages.push(`${currentP.name} reste en prison (${currentP.jailTurns}/3)`);
      } else {
        currentP.money -= 50;
        currentP.isInJail = false;
        currentP.jailTurns = 0;
        messages.push(`${currentP.name} paie 50 $ et sort de prison`);
      }
    }

    if (moved) {
      const oldPosition = currentP.c;
      currentP.c = (currentP.c + total) % monopolyBoard.length;
      if (currentP.c < oldPosition) {
        currentP.startCase();
        passedStart = true;
      }

      for (let resolved = 0; resolved < 4; resolved++) {
        const landedSquare = monopolyBoard[currentP.c];
        const positionBeforeAction = currentP.c;
        const delta = landedSquare.action({
          player: currentP,
          players: Object.values(updatedTurnOrder),
          diceTotal: total,
          onCardDrawn: (label, type) => setLastCard({ label, type }),
        });
        currentP.money += delta;

        if (delta !== 0) {
          messages.push(`${delta > 0 ? "Encaissement" : "Paiement"} de ${Math.abs(delta)} $ (${landedSquare.name})`);
        }

        if (currentP.isInJail || currentP.c === positionBeforeAction) break;
      }
    }

    const keys = Object.keys(updatedTurnOrder).map(Number).sort((a, b) => a - b);
    const count = keys.length;
    const nextTurnOrder: PlayerTurnDict = {};
    for (let i = 0; i < count; i++) {
      const currentOrderKey = keys[i];
      const nextPlayer = (i === count - 1) ? currentP : updatedTurnOrder[keys[i + 1]];
      nextTurnOrder[currentOrderKey] = nextPlayer;
    }

    setTurnOrder(nextTurnOrder);
    const diceResult: DiceRollResult = { dice1, dice2, total };
    setLastDiceRoll(diceResult);

    const squareName = monopolyBoard[currentP.c]?.name ?? `Case ${currentP.c}`;
    setLastActionMessage(
      `${currentP.name} a fait ${total} (${dice1} + ${dice2})${moved ? ` et arrive sur « ${squareName} »` : ""}${
        passedStart ? " (+200 $ au passage par Départ)" : ""
      }${messages.length ? `. ${messages.join(". ")}` : ""}. C'est maintenant au tour de ${nextTurnOrder[1]?.name} !`
    );

    return diceResult;
  };

  const dismissCard = () => setLastCard(null);

  const useJailFreeCard = () => {
    const updatedTurnOrder = cloneDict(turnOrder);
    const currentP = updatedTurnOrder[1];
    if (!currentP?.isInJail || currentP.jailFreeCards < 1) return;
    currentP.jailFreeCards--;
    currentP.isInJail = false;
    currentP.jailTurns = 0;
    setTurnOrder(updatedTurnOrder);
    setLastActionMessage(`${currentP.name} utilise une carte de sortie de prison.`);
  };

  const resetGame = () => {
    setTurnOrder(createDict(initialPlayers));
    setLastDiceRoll(null);
    setLastCard(null);
    setLastActionMessage("Partie réinitialisée. " + (turnOrder[1]?.name ?? "Joueur 1") + " commence !");
  };

  const value: GameContextValue = {
    turnOrder,
    players,
    currentPlayer,
    lastDiceRoll,
    lastActionMessage,
    lastCard,
    rollDice,
    dismissCard,
    useJailFreeCard,
    resetGame,
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