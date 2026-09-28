import { apiFetch } from '../api/client';

export interface GamePlayer {
  id: number;
  email: string;
  profilePicture: string | null;
  color?: string;
}

export type GameStatus =
  | "pending"
  | "started"
  | "ended";

export interface GameSettings {
  startingMoney?: number;
  turnDuration?: number;
  doublePassGo?: boolean;
  freeParkingPool?: boolean;
  fastMode?: boolean;
  isPrivate?: boolean;
  allowBots?: boolean;
  boardTheme?: string;
  rentInPrison?: boolean;
  evenBuild?: boolean;
  mortgage?: boolean;
}

export interface Game {
  id: number;
  creatorId: number;
  minPlayers: number;
  maxPlayers: number;
  status: GameStatus;
  players: GamePlayer[];
  currentTurnUserId: number | null;
  isYourTurn?: boolean;
  state: string;
  endData: string | null;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

export interface CreateGameRequest {
  minPlayers?: number;
  maxPlayers?: number;
  state?: string;
}

export async function createGame(
  data: CreateGameRequest = { minPlayers: 2, maxPlayers: 4 }
): Promise<Game> {
  return apiFetch<Game>("/games", {
    method: "POST",
    body: JSON.stringify({
      minPlayers: data.minPlayers ?? 2,
      maxPlayers: data.maxPlayers ?? 4,
      state: data.state ?? "",
    }),
  });
}

export async function joinGame(gameId: number): Promise<Game> {
  return apiFetch<Game>(`/games/${gameId}/join`, {
    method: "POST",
  });
}

export async function updateGame(
  gameId: number,
  data: { minPlayers?: number; maxPlayers?: number; state?: string }
): Promise<Game> {
  return apiFetch<Game>(`/games/${gameId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function removePlayer(
  gameId: number,
  userId: number
): Promise<Game> {
  return apiFetch<Game>(`/games/${gameId}/players/${userId}`, {
    method: "DELETE",
  });
}

export async function getGame(gameId: number): Promise<Game> {
  return apiFetch<Game>(`/games/${gameId}`);
}

export async function invitePlayer(
  gameId: number,
  email: string
): Promise<Game> {
  return apiFetch<Game>(`/games/${gameId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export interface JoinGameRequest {
  email: string;
  gameId?: number;
}

export async function joinGameByEmail(
  data: JoinGameRequest,
  gameIdParam?: number
): Promise<Game> {
  const targetId = gameIdParam ?? data.gameId ?? 0;
  return invitePlayer(targetId, data.email);
}

export async function startGame(
  gameId: number,
  state?: string,
  currentTurnUserId?: number
): Promise<Game> {
  return apiFetch<Game>(`/games/${gameId}/start`, {
    method: "POST",
    body: JSON.stringify({ state, currentTurnUserId }),
  });
}

export async function listMyGames(): Promise<Game[]> {
  return apiFetch<Game[]>("/games/mine");
}

export async function listOpenGames(): Promise<Game[]> {
  return apiFetch<Game[]>("/games/open");
}