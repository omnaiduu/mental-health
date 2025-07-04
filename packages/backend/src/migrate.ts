import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database(Bun.env.DB_PATH);
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "./migrations" });

export const migrateProductionDB = () =>
	migrate(db, { migrationsFolder: "./migrations" });
