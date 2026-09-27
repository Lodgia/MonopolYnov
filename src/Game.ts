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


// Pour créer un partie : 

//async function handleCreateGame() {
//    try {
//      const game = await createGame();

//      console.log("Partie créée :", game);

//    } catch (error) {
//      console.error(
//        "Erreur création partie :",
//        error
//      );
//    }
//  }