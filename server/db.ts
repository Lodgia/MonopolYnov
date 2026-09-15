// Database setup. Uses Deno's built-in `node:sqlite` module (Deno >= 2.9),
// so there is no external dependency to install: the whole persistence
// layer is one file on disk.
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const defaultDbPath = fileURLToPath(new URL("./game.db", import.meta.url));
const dbPath = Deno.env.get("GAME_DB_PATH") ?? defaultDbPath;

export const db = new DatabaseSync(dbPath);

db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    profile_picture TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- status: 'pending' (not started) | 'started' | 'ended'
  -- state and end_data are opaque, front-end-controlled strings (e.g. JSON)
  -- that the server never looks inside of.
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL REFERENCES users(id),
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    state TEXT NOT NULL DEFAULT '',
    current_turn_user_id INTEGER REFERENCES users(id),
    end_data TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    started_at TEXT,
    ended_at TEXT
  );

  CREATE TABLE IF NOT EXISTS game_players (
    game_id INTEGER NOT NULL REFERENCES games(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    seen_ended INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (game_id, user_id)
  );
`);
