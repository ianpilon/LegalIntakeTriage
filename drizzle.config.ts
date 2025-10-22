import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || "./data/sqlite.db";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
