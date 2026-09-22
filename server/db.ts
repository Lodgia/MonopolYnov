// Database setup with Neon (PostgreSQL).
import { sql } from "./neon_db.ts";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

export { sql };

// Conservé temporairement pour assurer le fonctionnement de games.ts
// jusqu'à sa migration complète vers Neon.
const defaultDbPath = fileURLToPath(new URL("./game.db", import.meta.url));
const dbPath = Deno.env.get("GAME_DB_PATH") ?? defaultDbPath;
export const db = new DatabaseSync(dbPath);

/**
 * Initialise le schéma PostgreSQL dans la base de données Neon.
 * Crée les tables users, sessions, games et game_players si elles n'existent pas.
 */
export async function initDb(): Promise<void> {
  console.log("Initialisation du schéma de la base Neon...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      profile_picture TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      min_players INTEGER NOT NULL,
      max_players INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      state TEXT NOT NULL DEFAULT '',
      current_turn_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      end_data TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS game_players (
      game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      seen_ended INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (game_id, user_id)
    );
  `;

  console.log("✅ Schéma Neon initialisé avec succès !");
}

