import { execSync } from "node:child_process";
import dotenv from "dotenv";

export async function setup() {
  dotenv.config({ path: ".env.test", override: true });

  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    env: { ...process.env },
    stdio: "inherit",
  });
}
