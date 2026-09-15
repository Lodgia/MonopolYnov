// Entry point: a tiny hand-rolled router built on Deno's native HTTP server
// and Web-standard URLPattern (no framework). See routes.md for the route
// list this implements, and openapi.yaml (browsable at /docs) for full
// request/response details.
import "./db.ts"; // ensures the schema is created on startup
import { login, signup } from "./auth.ts";
import { serveDocsPage, serveOpenApiSpec } from "./docs.ts";
import { CORS_HEADERS, HttpError, json } from "./http.ts";
import {
  createGame,
  getGame,
  inviteToGame,
  listGameHistory,
  listMyGames,
  markGameSeen,
  setGameState,
  startGame,
} from "./games.ts";

type Handler = (req: Request, params: Record<string, string>) => Response | Promise<Response>;

interface Route {
  method: string;
  pattern: URLPattern;
  handler: Handler;
}

function route(method: string, path: string, handler: Handler): Route {
  return { method, pattern: new URLPattern({ pathname: path }), handler };
}

const routes: Route[] = [
  route("GET", "/", (req) => Response.redirect(new URL("/docs", req.url), 302)),
  route("GET", "/docs", () => serveDocsPage()),
  route("GET", "/openapi.yaml", () => serveOpenApiSpec()),

  route("POST", "/auth/signup", (req) => signup(req)),
  route("POST", "/auth/login", (req) => login(req)),

  route("POST", "/games", (req) => createGame(req)),
  route("GET", "/games/mine", (req) => listMyGames(req)),
  route("GET", "/games/history", (req) => listGameHistory(req)),
  route("POST", "/games/:id/invite", (req, p) => inviteToGame(req, Number(p.id))),
  route("POST", "/games/:id/start", (req, p) => startGame(req, Number(p.id))),
  route("POST", "/games/:id/seen", (req, p) => markGameSeen(req, Number(p.id))),
  route("GET", "/games/:id", (req, p) => getGame(req, Number(p.id))),
  route("PUT", "/games/:id/state", (req, p) => setGameState(req, Number(p.id))),
];

async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);

  for (const r of routes) {
    if (r.method !== req.method) continue;
    const match = r.pattern.exec(url);
    if (!match) continue;
    return await r.handler(req, match.pathname.groups as Record<string, string>);
  }

  throw new HttpError(404, `No route for ${req.method} ${url.pathname}`);
}

Deno.serve({ port: Number(Deno.env.get("PORT") ?? 8000) }, async (req) => {
  try {
    return await handleRequest(req);
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message }, err.status);
    }
    console.error(err);
    return json({ error: "Internal server error" }, 500);
  }
});
