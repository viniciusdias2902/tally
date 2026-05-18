import { test, expect } from '@playwright/test';

const USUARIO = {
  nome: `José ${Date.now()}`,
  email: `jose-${Date.now()}@e2e.com`,
  senha: "senha1234",
};

test.describe("Autenticação", () => {
  test("deve exibir a página de login", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: /tally/i })
    ).toBeVisible();
    await expect(page.getByRole("E-mail")).toBeVisible();
    await expect(page.getByRole("Senha")).toBeVisible();
  });
})