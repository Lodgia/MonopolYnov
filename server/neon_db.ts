import { neon } from "npm:@neondatabase/serverless";

const DATABASE_URL = Deno.env.get("DATABASE_URL");

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(DATABASE_URL);
