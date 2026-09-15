// Authentication: sign up, log in, and a `requireAuth` guard used by every
// protected route. Sessions are simple opaque bearer tokens stored in the
// database (no JWT) — plenty for a local pedagogical server.
import { db } from "./db.ts";
import { HttpError, json, readJsonBody, requireString } from "./http.ts";

export interface AuthUser {
  id: number;
  email: string;
}

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  password_salt: string;
  profile_picture: string | null;
}

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

// NOTE: this is a salted SHA-256 hash, not bcrypt/argon2. That's a deliberate
// simplification for a local pedagogical project — don't reuse this for
// anything that stores real user passwords.
async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function toAuthUser(row: UserRow): AuthUser {
  return { id: row.id, email: row.email };
}

export async function signup(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const email = requireString(body, "email").trim().toLowerCase();
  const password = requireString(body, "password");
  const profilePicture = typeof body.profilePicture === "string" ? body.profilePicture : null;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) throw new HttpError(409, "An account with this email already exists");

  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt);

  const result = db
    .prepare(
      "INSERT INTO users (email, password_hash, password_salt, profile_picture) VALUES (?, ?, ?, ?)",
    )
    .run(email, passwordHash, salt, profilePicture);

  const user: AuthUser = { id: Number(result.lastInsertRowid), email };
  const token = createSession(user.id);

  return json({ token, user }, 201);
}

export async function login(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const email = requireString(body, "email").trim().toLowerCase();
  const password = requireString(body, "password");

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | UserRow
    | undefined;
  if (!row) throw new HttpError(401, "Invalid email or password");

  const candidateHash = await hashPassword(password, row.password_salt);
  if (candidateHash !== row.password_hash) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = createSession(row.id);
  return json({ token, user: toAuthUser(row) });
}

function createSession(userId: number): string {
  const token = randomHex(32);
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, userId);
  return token;
}

/** Resolves the authenticated user from the `Authorization: Bearer <token>` header. */
export function requireAuth(req: Request): AuthUser {
  const header = req.headers.get("Authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Missing or malformed Authorization header");
  }

  const row = db
    .prepare(
      `SELECT users.* FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ?`,
    )
    .get(token) as UserRow | undefined;

  if (!row) throw new HttpError(401, "Invalid or expired session token");
  return toAuthUser(row);
}

export function findUserByEmail(email: string): AuthUser | undefined {
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase()) as
    | UserRow
    | undefined;
  return row ? toAuthUser(row) : undefined;
}

export function checkSession(req: Request): Response {
    const header = req.headers.get("Authorization") ?? "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return new Response("Unauthorized", { status: 401 });
    }

    // On cherche le token dans la DB
    const session = db
        .prepare("SELECT token FROM sessions WHERE token = ?")
        .get(token);

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    return json({ authenticated: true });
}
