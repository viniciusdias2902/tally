import { test, expect } from "@playwright/test";

const USUARIO = {
  nome: `Teste E2E ${Date.now()}`,
  email: `teste-${Date.now()}@e2e.com`,
  senha: "senha1234",
};

test.describe("Autenticação", () => {
  test("deve exibir a página de login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /tally/i })).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
  });

  test("deve navegar para registro e voltar", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /criar conta/i }).click();
    await expect(page).toHaveURL("/registro");

    await page.getByRole("link", { name: /entrar/i }).click();
    await expect(page).toHaveURL("/login");
  });

  test("deve redirecionar para login quando não autenticado", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("deve exibir erro com credenciais inválidas", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("inexistente@email.com");
    await page.getByLabel("Senha").fill("senhaerrada");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(/incorretos|erro/i)).toBeVisible();
  });

  test("deve registrar, logar e ver o dashboard", async ({ page }) => {
    await page.goto("/registro");
    await page.getByLabel("Nome").fill(USUARIO.nome);
    await page.getByLabel("E-mail").fill(USUARIO.email);
    await page.getByLabel("Senha").fill(USUARIO.senha);
    await page.getByRole("button", { name: /criar conta/i }).click();

    await expect(page).toHaveURL("/", { timeout: 5000 });
    await expect(page.getByText("Dashboard")).toBeVisible();
  });
});
