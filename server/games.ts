// Game management, game play, and game history routes.
//
// Design note: this server is meant to work for *any* turn-by-turn game, so
// it never looks at the shape of a game's data. `state` and `endData` are
// opaque strings (e.g. JSON serialized by the front-end) that are stored and
// returned as-is, with no parsing or validation on the server side. The only
// things the server understands structurally are: who the players are,
// whose turn it is, and whether the game is pending/started/ended.
import { findUserByEmail, requireAuth } from "./auth.ts";
import { sql } from "./neon_db.ts";
import {
    HttpError,
    json,
    noContent,
    optionalInt,
    optionalString,
    readJsonBody,
    requireInt,
    requireString,
} from "./http.ts";

interface GameRow {
    id: number;
    creator_id: number;
    min_players: number;
    max_players: number;
    status: "pending" | "started" | "ended";
    state: string;
    current_turn_user_id: number | null;
    end_data: string | null;
    created_at: string;
    started_at: string | null;
    ended_at: string | null;
}

interface PlayerRow {
    id: number;
    email: string;
    profile_picture: string | null;
}

async function getGameRow(id: number): Promise<GameRow> {
    const rows = (await sql`
        SELECT * FROM games WHERE id = ${id} LIMIT 1
    `) as unknown as GameRow[];
    const row = rows[0];
    if (!row) throw new HttpError(404, "Game not found");
    return row;
}

async function getPlayers(gameId: number): Promise<PlayerRow[]> {
    return (await sql`
        SELECT users.id, users.email, users.profile_picture
        FROM game_players
        JOIN users ON users.id = game_players.user_id
        WHERE game_players.game_id = ${gameId}
        ORDER BY game_players.joined_at ASC
    `) as unknown as PlayerRow[];
}

async function isPlayer(gameId: number, userId: number): Promise<boolean> {
    const rows = await sql`
        SELECT 1 FROM game_players WHERE game_id = ${gameId} AND user_id = ${userId} LIMIT 1
    `;
    return rows.length > 0;
}

/** Shapes a game row (plus its players) into the payload sent to clients. */
async function toGamePayload(row: GameRow, viewerId?: number) {
    const playersList = await getPlayers(row.id);
    const players = playersList.map((p) => ({
        id: p.id,
        email: p.email,
        profilePicture: p.profile_picture,
    }));
    return {
        id: row.id,
        creatorId: row.creator_id,
        minPlayers: row.min_players,
        maxPlayers: row.max_players,
        status: row.status,
        players,
        currentTurnUserId: row.current_turn_user_id,
        isYourTurn: viewerId !== undefined ? row.current_turn_user_id === viewerId : undefined,
        state: row.state,
        endData: row.end_data,
        createdAt: row.created_at,
        startedAt: row.started_at,
        endedAt: row.ended_at,
    };
}

export async function createGame(req: Request): Promise<Response> {
    const user = await requireAuth(req);
    const body = await readJsonBody(req);
    const minPlayers = requireInt(body, "minPlayers");
    const maxPlayers = requireInt(body, "maxPlayers");

    if (minPlayers < 1) throw new HttpError(400, "minPlayers must be at least 1");
    if (maxPlayers < minPlayers) {
        throw new HttpError(400, "maxPlayers must be greater than or equal to minPlayers");
    }

    const rows = (await sql`
        INSERT INTO games (creator_id, min_players, max_players, status)
        VALUES (${user.id}, ${minPlayers}, ${maxPlayers}, 'pending')
        RETURNING id
    `) as unknown as { id: number }[];
    const gameId = Number(rows[0].id);

    await sql`
        INSERT INTO game_players (game_id, user_id)
        VALUES (${gameId}, ${user.id})
    `;

    const game = await getGameRow(gameId);
    return json(await toGamePayload(game, user.id), 201);
}

export async function inviteToGame(req: Request, gameId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (game.status !== "pending") {
        throw new HttpError(400, "Players can only be invited before the game has started");
    }
    if (game.creator_id !== user.id) {
        throw new HttpError(403, "Only the game creator can invite players");
    }

    const body = await readJsonBody(req);
    const email = requireString(body, "email");
    const invited = await findUserByEmail(email);
    if (!invited) throw new HttpError(404, "No user with this email exists");
    if (await isPlayer(gameId, invited.id)) {
        throw new HttpError(409, "This player is already in the game");
    }

    const players = await getPlayers(gameId);
    if (players.length >= game.max_players) {
        throw new HttpError(400, "This game already has the maximum number of players");
    }

    await sql`
        INSERT INTO game_players (game_id, user_id)
        VALUES (${gameId}, ${invited.id})
    `;

    const updatedGame = await getGameRow(gameId);
    return json(await toGamePayload(updatedGame, user.id));
}

export async function startGame(req: Request, gameId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (game.creator_id !== user.id) {
        throw new HttpError(403, "Only the game creator can start the game");
    }
    if (game.status !== "pending") {
        throw new HttpError(400, "Game has already started");
    }

    const players = await getPlayers(gameId);
    if (players.length < game.min_players) {
        throw new HttpError(
            400,
            `At least ${game.min_players} players are required to start this game (currently ${players.length})`,
        );
    }

    const body = await readJsonBody(req);
    const initialState = optionalString(body, "state") ?? "";
    const firstTurnUserId = optionalInt(body, "currentTurnUserId") ?? game.creator_id;

    if (!players.some((p) => p.id === firstTurnUserId)) {
        throw new HttpError(400, "currentTurnUserId must be one of the game's players");
    }

    await sql`
        UPDATE games
        SET status = 'started', state = ${initialState}, current_turn_user_id = ${firstTurnUserId}, started_at = NOW()
        WHERE id = ${gameId}
    `;

    const updatedGame = await getGameRow(gameId);
    return json(await toGamePayload(updatedGame, user.id));
}

/** Ongoing games for a user: pending, started, or ended-but-not-yet-seen. */
export async function listMyGames(req: Request): Promise<Response> {
    const user = await requireAuth(req);
    const rows = (await sql`
        SELECT games.* FROM games
        JOIN game_players ON game_players.game_id = games.id
        WHERE game_players.user_id = ${user.id}
          AND (games.status != 'ended' OR game_players.seen_ended = 0)
        ORDER BY games.created_at DESC
    `) as unknown as GameRow[];

    const payload = await Promise.all(rows.map((row) => toGamePayload(row, user.id)));
    return json(payload);
}

export async function markGameSeen(req: Request, gameId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (!(await isPlayer(gameId, user.id))) {
        throw new HttpError(403, "You are not a player in this game");
    }
    if (game.status !== "ended") {
        throw new HttpError(400, "Game has not ended yet");
    }

    await sql`
        UPDATE game_players
        SET seen_ended = 1
        WHERE game_id = ${gameId} AND user_id = ${user.id}
    `;

    return noContent();
}

export async function getGame(req: Request, gameId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (!(await isPlayer(gameId, user.id))) {
        throw new HttpError(403, "You are not a player in this game");
    }

    return json(await toGamePayload(game, user.id));
}

export async function setGameState(req: Request, gameId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (!(await isPlayer(gameId, user.id))) {
        throw new HttpError(403, "You are not a player in this game");
    }
    if (game.status !== "started") {
        throw new HttpError(400, "Game is not currently in progress");
    }
    if (game.current_turn_user_id !== user.id) {
        throw new HttpError(403, "It is not your turn");
    }

    const body = await readJsonBody(req);
    const state = requireString(body, "state");
    const ended = body.ended === true;

    if (ended) {
        const endData = optionalString(body, "endData") ?? null;
        await sql`
            UPDATE games
            SET status = 'ended', state = ${state}, end_data = ${endData}, current_turn_user_id = NULL, ended_at = NOW()
            WHERE id = ${gameId}
        `;
    } else {
        const nextTurnUserId = requireInt(body, "currentTurnUserId");
        if (!(await isPlayer(gameId, nextTurnUserId))) {
            throw new HttpError(400, "currentTurnUserId must be one of the game's players");
        }
        await sql`
            UPDATE games
            SET state = ${state}, current_turn_user_id = ${nextTurnUserId}
            WHERE id = ${gameId}
        `;
    }

    const updatedGame = await getGameRow(gameId);
    return json(await toGamePayload(updatedGame, user.id));
}

export async function listGameHistory(req: Request): Promise<Response> {
    const user = await requireAuth(req);
    const rows = (await sql`
        SELECT games.* FROM games
        JOIN game_players ON game_players.game_id = games.id
        WHERE game_players.user_id = ${user.id} AND games.status = 'ended'
        ORDER BY games.ended_at DESC
    `) as unknown as GameRow[];

    const payload = await Promise.all(rows.map((row) => toGamePayload(row, user.id)));
    return json(payload);
}
