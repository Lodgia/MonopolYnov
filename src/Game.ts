import { apiFetch } from '../api/client'

interface GamePlayer {
  id: number;
  email: string;
  profilePicture: string | null;
}

type GameStatus =
  | "pending"
  | "started"
  | "ended";

interface Game {
  id: number;
  creatorId: number;

  minPlayers: number;
  maxPlayers: number;

  status: GameStatus;

  players: GamePlayer[];

  currentTurnUserId: number | null;

  isYourTurn: boolean;

  state: string;

  endData: string | null;

  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

interface CreateGameRequest {
    minPlayers : number;
    maxPlayers : number;
}

export async function createGame(
  data: CreateGameRequest
): Promise<Game> {
  return apiFetch<Game>("/games", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

interface JoinGameRequest {
    email : string;
}

export async function joinGameByEmail(
    data : JoinGameRequest
):Promise<Game> {
    const gameId = 4
    return apiFetch<Game>(`/games/${gameId}/invite`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}