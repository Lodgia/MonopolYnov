import React, { createContext, useContext, useState } from 'react';
import { Player } from './Player.ts';
import { monopolyBoard } from './allCases.ts';

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
  rollDice: () => DiceRollResult | null;
  resetGame: () => void;
};

const initialPlayersDict: PlayerTurnDict = {
  1: new Player(1, "Joueur 1 (Bleu)", 0, 1500, "bg-blue-500"),
  2: new Player(2, "Joueur 2 (Rouge)", 0, 1500, "bg-red-500"),
  3: new Player(3, "Joueur 3 (Vert)", 0, 1500, "bg-green-500"),
  4: new Player(4, "Joueur 4 (Orange)", 0, 1500, "bg-orange-500"),
};

export const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [turnOrder, setTurnOrder] = useState<PlayerTurnDict>(initialPlayersDict);
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRollResult | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(
    "La partie est prête. Joueur 1 commence !"
  );
  const currentPlayer = turnOrder[1];
  const players = Object.values(turnOrder);

  const rollDice = (): DiceRollResult | null => {
    const currentP = turnOrder[1];
    if (!currentP) return null;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    const oldPose = currentP.c
    currentP.c = (currentP.c + total) % monopolyBoard.length;

    let passedStart = false;
    if (currentP.c > oldPose) {
      currentP.startCase();
      passedStart = true;
    }

    const nextTurnOrder: PlayerTurnDict = {
      1: turnOrder[2],
      2: turnOrder[3],
      3: turnOrder[4],
      4: currentP,
    };

    setTurnOrder(nextTurnOrder);
    const diceResult: DiceRollResult = { dice1, dice2, total };
    setLastDiceRoll(diceResult);

    const squareName = monopolyBoard[currentP.c]?.name ?? `Case ${currentP.c}`;
    setLastActionMessage(
      `${currentP.name} a fait ${total} (${dice1} + ${dice2}) et s'est déplacé sur "${squareName}"${
        passedStart ? " (+200$ au passage par Départ)" : ""
      }. C'est maintenant au tour de ${nextTurnOrder[1]?.name} !`
    );

    return diceResult;
  };

  const resetGame = () => {
    setTurnOrder({
      1: new Player(1, "Joueur 1 (Bleu)", 0, 1500, "bg-blue-500"),
      2: new Player(2, "Joueur 2 (Rouge)", 0, 1500, "bg-red-500"),
      3: new Player(3, "Joueur 3 (Vert)", 0, 1500, "bg-green-500"),
      4: new Player(4, "Joueur 4 (Orange)", 0, 1500, "bg-orange-500"),
    });
    setLastDiceRoll(null);
    setLastActionMessage("Partie réinitialisée. Joueur 1 commence !");
  };

  const value: GameContextValue = {
    turnOrder,
    players,
    currentPlayer,
    lastDiceRoll,
    lastActionMessage,
    rollDice,
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