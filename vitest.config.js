import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["backend/**/*.js"],
      exclude: [
        "backend/generated/**",
        "backend/tests/**",
        "backend/**/__tests__/**",
        "backend/server.js",
      ],
      reporter: ["text", "html"],
    },
    projects: [
      {
        test: {
          name: "unitario",
          include: ["backend/**/__tests__/**/*.test.js"],
        },
      },
      {
        test: {
          name: "integracao",
          include: ["backend/tests/integracao/**/*.test.js"],
          globalSetup: "backend/tests/setup-integracao.js",
          env: {
            DATABASE_URL: "postgresql://tally:tally_secret@localhost:5432/tally_db_teste?schema=public",
            JWT_SECRET: "segredo-teste",
            JWT_ACCESS_TOKEN_EXPIRES_IN: "15m",
            JWT_REFRESH_TOKEN_EXPIRES_IN: "7d",
            JWT_REFRESH_TOKEN_MAX_EXPIRES_IN: "30d",
          },
          sequence: { concurrent: false },
          fileParallelism: false,
        },
      },
    ],
  },
});
