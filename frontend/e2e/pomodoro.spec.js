import { test, expect } from "@playwright/test";

const SUFIXO = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const USUARIO = {
  nome: `Teste Pomodoro ${SUFIXO}`,
  email: `pomodoro-${SUFIXO}@e2e.com`,
  senha: "senha1234",
};
const ATIVIDADE = `Estudar ${SUFIXO}`;

test.describe.configure({ mode: "serial" });

test.describe("Pomodoro e Registro Manual", () => {
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

  test("garante atividade base criada", async ({ page }) => {
    await page.getByRole("link", { name: /atividades/i }).first().click();
    await expect(page.getByRole("heading", { name: "Atividades" })).toBeVisible();

    if (!(await page.getByRole("heading", { name: ATIVIDADE }).isVisible().catch(() => false))) {
      await page.getByRole("button", { name: /nova atividade/i }).click();
      await page.getByLabel("Nome").fill(ATIVIDADE);
      await page.getByRole("button", { name: /^criar$/i }).click();
      await expect(page.getByRole("heading", { name: ATIVIDADE })).toBeVisible();
    }
  });

  test("usa pomodoro e registra sessao", async ({ page }) => {
    await abrirRegistro(page, ATIVIDADE);

    // Trocar para aba Pomodoro
    const abaPomodoro = page.getByRole("tab", { name: /pomodoro/i });
    await abaPomodoro.click();
    await expect(abaPomodoro).toHaveAttribute("aria-selected", "true");

    // Verificar estado inicial
    await expect(page.getByText("Pronto")).toBeVisible();

    // Iniciar foco
    await page.getByRole("button", { name: /iniciar foco/i }).click();
    await expect(page.getByText("Em foco")).toBeVisible();

    // Esperar tempo mínimo para acumular foco
    await page.waitForTimeout(2500);

    // Pausar
    await page.getByRole("button", { name: /^pausar$/i }).click();
    await expect(page.getByText(/pausado/i)).toBeVisible();

    // Verificar que foco total não está zerado
    const focoTotal = page.getByText(/foco total/i).locator("xpath=..");
    await expect(focoTotal).not.toHaveText(/00:00:00/);

    // Registrar sessão pomodoro
    await page.getByRole("button", { name: /registrar sessão/i }).click();
    await expect(page.getByText(/sessão registrada com sucesso/i)).toBeVisible();
  });

  test("registra sessao manual", async ({ page }) => {
    await abrirRegistro(page, ATIVIDADE);

    // Trocar para aba Manual
    const abaManual = page.getByRole("tab", { name: /manual/i });
    await abaManual.click();
    await expect(abaManual).toHaveAttribute("aria-selected", "true");

    // Verificar formulário manual
    await expect(page.getByRole("heading", { name: /registro manual/i })).toBeVisible();

    // Preencher duração
    await page.getByLabel(/duração/i).fill("45");

    // Preencher observações
    await page.getByLabel(/observações/i).fill("Sessão de estudo E2E");

    // Registrar
    await page.getByRole("button", { name: /registrar sessão/i }).click();
    await expect(page.getByText(/sessão registrada com sucesso/i)).toBeVisible();
  });
});

/** Navega até a tela de registro de sessão da atividade informada. */
async function abrirRegistro(page, atividadeNome) {
  await page.getByRole("link", { name: /atividades/i }).first().click();
  await expect(page.getByRole("heading", { name: "Atividades" })).toBeVisible();
  const card = page.getByRole("heading", { name: atividadeNome }).locator("xpath=../..");
  await card.getByRole("link", { name: /registrar/i }).click();
  await expect(page.getByRole("heading", { name: /registrar sessão/i })).toBeVisible();
}
