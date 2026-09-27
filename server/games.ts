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
    if (!row) throw new HttpError(404, "Partie introuvable");
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
    const minPlayers = optionalInt(body, "minPlayers") ?? 2;
    const maxPlayers = optionalInt(body, "maxPlayers") ?? 4;
    const state = optionalString(body, "state") ?? "";

    if (minPlayers < 1) throw new HttpError(400, "Le nombre minimum de joueurs doit être d'au moins 1");
    if (maxPlayers < minPlayers) {
        throw new HttpError(400, "Le nombre maximum de joueurs doit être supérieur ou égal au minimum");
    }

    const rows = (await sql`
        INSERT INTO games (creator_id, min_players, max_players, status, state)
        VALUES (${user.id}, ${minPlayers}, ${maxPlayers}, 'pending', ${state})
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

export async function joinGame(req: Request, gameId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (game.status !== "pending") {
        throw new HttpError(400, "Cette partie a déjà commencé ou est terminée");
    }

    if (await isPlayer(gameId, user.id)) {
        return json(await toGamePayload(game, user.id));
    }

    const players = await getPlayers(gameId);
    if (players.length >= game.max_players) {
        throw new HttpError(400, "Cette partie a atteint le nombre maximum de joueurs");
    }

    await sql`
        INSERT INTO game_players (game_id, user_id)
        VALUES (${gameId}, ${user.id})
    `;

    const updatedGame = await getGameRow(gameId);
    return json(await toGamePayload(updatedGame, user.id));
}

export async function updateGame(req: Request, gameId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (game.creator_id !== user.id) {
        throw new HttpError(403, "Seul le créateur peut modifier les paramètres");
    }
    if (game.status !== "pending") {
        throw new HttpError(400, "Impossible de modifier les paramètres après le démarrage");
    }

    const body = await readJsonBody(req);
    const minPlayers = optionalInt(body, "minPlayers") ?? game.min_players;
    const maxPlayers = optionalInt(body, "maxPlayers") ?? game.max_players;
    const state = optionalString(body, "state") ?? game.state;

    if (minPlayers < 1) throw new HttpError(400, "Le minimum de joueurs doit être d'au moins 1");
    if (maxPlayers < minPlayers) {
        throw new HttpError(400, "Le maximum de joueurs doit être supérieur ou égal au minimum");
    }

    await sql`
        UPDATE games
        SET min_players = ${minPlayers}, max_players = ${maxPlayers}, state = ${state}
        WHERE id = ${gameId}
    `;

    const updatedGame = await getGameRow(gameId);
    return json(await toGamePayload(updatedGame, user.id));
}

export async function removePlayer(req: Request, gameId: number, targetUserId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (game.creator_id !== user.id && user.id !== targetUserId) {
        throw new HttpError(403, "Vous n'avez pas l'autorisation de retirer ce joueur");
    }
    if (game.status !== "pending") {
        throw new HttpError(400, "Impossible de retirer un joueur d'une partie en cours");
    }
    if (targetUserId === game.creator_id) {
        throw new HttpError(400, "Le créateur ne peut pas être retiré de la partie");
    }

    await sql`
        DELETE FROM game_players
        WHERE game_id = ${gameId} AND user_id = ${targetUserId}
    `;

    const updatedGame = await getGameRow(gameId);
    return json(await toGamePayload(updatedGame, user.id));
}

export async function inviteToGame(req: Request, gameId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (game.status !== "pending") {
        throw new HttpError(400, "Les joueurs ne peuvent être invités qu'avant le début de la partie");
    }
    if (game.creator_id !== user.id) {
        throw new HttpError(403, "Seul le créateur peut inviter des joueurs");
    }

    const body = await readJsonBody(req);
    const email = requireString(body, "email");
    const invited = await findUserByEmail(email);
    if (!invited) throw new HttpError(404, "Aucun utilisateur trouvé avec cet email");
    if (await isPlayer(gameId, invited.id)) {
        throw new HttpError(409, "Ce joueur fait déjà partie du salon");
    }

    const players = await getPlayers(gameId);
    if (players.length >= game.max_players) {
        throw new HttpError(400, "Le salon a atteint sa capacité maximale de joueurs");
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
        throw new HttpError(403, "Seul le créateur peut lancer la partie");
    }
    if (game.status !== "pending") {
        throw new HttpError(400, "La partie a déjà commencé");
    }

    const players = await getPlayers(gameId);
    if (players.length < game.min_players) {
        throw new HttpError(
            400,
            `Au moins ${game.min_players} joueurs sont requis pour lancer la partie (${players.length} actuellement)`,
        );
    }

    const body = await readJsonBody(req);
    const state = optionalString(body, "state") ?? game.state;
    const firstTurnUserId = optionalInt(body, "currentTurnUserId") ?? game.creator_id;

    if (!players.some((p) => p.id === firstTurnUserId)) {
        throw new HttpError(400, "Le premier joueur doit faire partie des participants");
    }

    await sql`
        UPDATE games
        SET status = 'started', state = ${state}, current_turn_user_id = ${firstTurnUserId}, started_at = NOW()
        WHERE id = ${gameId}
    `;

    const updatedGame = await getGameRow(gameId);
    return json(await toGamePayload(updatedGame, user.id));
}

/** Open games waiting for players. */
export async function listOpenGames(req: Request): Promise<Response> {
    const user = await requireAuth(req);
    const rows = (await sql`
        SELECT games.* FROM games
        WHERE games.status = 'pending'
        ORDER BY games.created_at DESC
        LIMIT 20
    `) as unknown as GameRow[];

    const payload = await Promise.all(rows.map((row) => toGamePayload(row, user.id)));
    return json(payload);
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
        throw new HttpError(403, "Vous ne faites pas partie de cette partie");
    }
    if (game.status !== "ended") {
        throw new HttpError(400, "La partie n'est pas encore terminée");
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
        throw new HttpError(403, "Vous ne faites pas partie de cette partie");
    }

    return json(await toGamePayload(game, user.id));
}

export async function setGameState(req: Request, gameId: number): Promise<Response> {
    const user = await requireAuth(req);
    const game = await getGameRow(gameId);

    if (!(await isPlayer(gameId, user.id))) {
        throw new HttpError(403, "Vous ne faites pas partie de cette partie");
    }
    if (game.status !== "started") {
        throw new HttpError(400, "La partie n'est pas en cours");
    }
    if (game.current_turn_user_id !== user.id) {
        throw new HttpError(403, "Ce n'est pas votre tour");
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
            throw new HttpError(400, "Le joueur suivant doit faire partie des participants");
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
