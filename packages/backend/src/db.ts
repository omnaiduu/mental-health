import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
export * from "drizzle-orm";

console.log("Bun.env.DB_PATH", Bun.env.DB_PATH);
const sqlite = new Database(Bun.env.DB_PATH);
export const db = drizzle({ client: sqlite });
export default sqlite;