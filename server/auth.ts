// Authentication: sign up, log in, and a `requireAuth` guard used by every
// protected route. Sessions are simple opaque bearer tokens stored in the
// database (no JWT) — plenty for a local pedagogical server.
import { HttpError, json, readJsonBody, requireString } from "./http.ts";
import { sql } from "./neon_db.ts";

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

  // Vérifier si l'utilisateur existe déjà
  const existing = (await sql`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `) as UserRow[];

  if (existing.length > 0) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt);

  const [newUser] = (await sql`
    INSERT INTO users (email, password_hash, password_salt, profile_picture)
    VALUES (${email}, ${passwordHash}, ${salt}, ${profilePicture})
    RETURNING id, email
  `) as unknown as UserRow[];

  const user: AuthUser = {
    id: Number(newUser.id),
    email: newUser.email,
  };

  const token = await createSession(user.id);

  return json({ token, user }, 201);
}

export async function login(req: Request): Promise<Response> {
  const body = await readJsonBody(req);
  const email = requireString(body, "email").trim().toLowerCase();
  const password = requireString(body, "password");

  const rows = (await sql`
    SELECT id, email, password_hash, password_salt, profile_picture
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `) as unknown as UserRow[];

  const row = rows[0];
  if (!row) {
    throw new HttpError(401, "Invalid email or password");
  }

  const candidateHash = await hashPassword(password, row.password_salt);
  if (candidateHash !== row.password_hash) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = await createSession(row.id);

  return json({
    token,
    user: toAuthUser(row),
  });
}

export async function createSession(userId: number): Promise<string> {
  const token = randomHex(32);
  await sql`
    INSERT INTO sessions (token, user_id)
    VALUES (${token}, ${userId})
  `;
  return token;
}

/** Resolves the authenticated user from the `Authorization: Bearer <token>` header. */
export async function requireAuth(req: Request): Promise<AuthUser> {
  const header = req.headers.get("Authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Missing or malformed Authorization header");
  }

  const rows = (await sql`
    SELECT users.id, users.email, users.password_hash, users.password_salt, users.profile_picture
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ${token}
    LIMIT 1
  `) as unknown as UserRow[];

  const row = rows[0];
  if (!row) {
    throw new HttpError(401, "Invalid or expired session token");
  }

  return toAuthUser(row);
}

export async function findUserByEmail(email: string): Promise<AuthUser | undefined> {
  const rows = (await sql`
    SELECT id, email, password_hash, password_salt, profile_picture
    FROM users
    WHERE email = ${email.trim().toLowerCase()}
    LIMIT 1
  `) as unknown as UserRow[];

  const row = rows[0];
  return row ? toAuthUser(row) : undefined;
}

export async function checkSession(req: Request): Promise<Response> {
  const header = req.headers.get("Authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = await sql`
    SELECT token FROM sessions
    WHERE token = ${token}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return new Response("Unauthorized", { status: 401 });
  }

  return json({ authenticated: true });
}
