import React, { createContext, useState, useContext } from 'react';
import { monopolyBoard } from "./allCases.ts";

const initialPlayers =  [{ id: 1, name: 'Chapeau', money: 1500, position: 0 }]
type Player = (typeof initialPlayers)[number]
type GameContextValue = {
  players: Player[];
  properties: typeof monopolyBoard;
  currentPlayerId: number;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setProperties: React.Dispatch<React.SetStateAction<typeof monopolyBoard>>;
}

const GameContext = createContext<GameContextValue | null>(null)
const initialProperties = monopolyBoard

export const GameProvider = ({children}:any) => {
  const [players, setPlayers] = useState(initialPlayers);
  const [properties, setProperties] = useState(initialProperties);
  const [currentPlayerId, setCurrentPlayerId] = useState(1);
  const value = {
    players,
    properties,
    currentPlayerId,
    setPlayers,
    setProperties
  };
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}