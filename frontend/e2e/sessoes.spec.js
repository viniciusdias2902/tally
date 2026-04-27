import { test, expect } from "@playwright/test";

const SUFIXO = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const USUARIO = {
  nome: `Teste Sessoes ${SUFIXO}`,
  email: `sessoes-${SUFIXO}@e2e.com`,
  senha: "senha1234",
};
const ATIVIDADE_TEMPO = `Estudar ${SUFIXO}`;
const ATIVIDADE_BINARIA = `Beber agua ${SUFIXO}`;

test.describe.configure({ mode: "serial" });

test.describe("Sessões", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./login");
    if (!(await page.getByLabel("E-mail").isVisible().catch(() => false))) {
      return;
    }
    await page.getByLabel("E-mail").fill(USUARIO.email);
    await page.getByLabel("Senha").fill(USUARIO.senha);
    await page.getByRole("button", { name: /^entrar$/i }).click();
    await page.waitForURL("/tally/app", { timeout: 10000 }).catch(async () => {
      await page.goto("./registro");
      await page.getByLabel("Nome").fill(USUARIO.nome);
      await page.getByLabel("E-mail").fill(USUARIO.email);
      await page.getByLabel("Senha").fill(USUARIO.senha);
      await page.getByRole("button", { name: /criar conta/i }).click();
      await page.waitForURL("/tally/app", { timeout: 10000 });
    });
  });

  test("garante atividades base criadas", async ({ page }) => {
    await page.getByRole("link", { name: /atividades/i }).first().click();
    await expect(page.getByRole("heading", { name: "Atividades" })).toBeVisible();

    await criarSeNaoExiste(page, ATIVIDADE_TEMPO, "Cronometrada");
    await criarSeNaoExiste(page, ATIVIDADE_BINARIA, "Binária");
  });
});

async function criarSeNaoExiste(page, nome, tipo) {
  if (await page.getByRole("heading", { name: nome }).isVisible().catch(() => false)) {
    return;
  }
  await page.getByRole("button", { name: /nova atividade/i }).click();
  await page.getByLabel("Nome").fill(nome);
  await page.getByRole("button", { name: tipo }).click();
  await page.getByRole("button", { name: /^criar$/i }).click();
  await expect(page.getByRole("heading", { name: nome })).toBeVisible();
}
