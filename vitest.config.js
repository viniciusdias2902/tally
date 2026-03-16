import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
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
          sequence: { concurrent: false },
        },
      },
    ],
  },
});
