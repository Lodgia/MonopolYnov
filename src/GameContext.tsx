import { createContext, useState, useContext } from 'react';
import { monopolyBoard } from "./allCases.ts";

const initialPlayers =  [{ id: 1, name: 'Chapeau', money: 1500, position: 0 }]
const GameContext = createContext(null)
const initialProperties = monopolyBoard

export const GameProvider = ({ children }) => {
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