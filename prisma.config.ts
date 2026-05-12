import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: "./apps/transaction-engine/.env" });

export default defineConfig({
  schema: "./apps/transaction-engine/prisma/schema.prisma",
  migrations: {
    path: "./apps/transaction-engine/prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
