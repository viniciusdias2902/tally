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

  test("registra sessao binaria como feito", async ({ page }) => {
    await abrirRegistro(page, ATIVIDADE_BINARIA);
    await expect(
      page.getByRole("heading", { name: /registrar conclusão/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /registrar como feito/i }).click();
    await expect(page.getByText(/sessão registrada com sucesso/i)).toBeVisible();
  });

  test("cronometro inicia, pausa e registra sessao", async ({ page }) => {
    await abrirRegistro(page, ATIVIDADE_TEMPO);

    const display = page.getByText(/^\d{2}:\d{2}:\d{2}$/);
    await expect(display).toHaveText("00:00:00");

    await page.getByRole("button", { name: /^iniciar$/i }).click();
    await expect(page.getByRole("button", { name: /^pausar$/i })).toBeVisible();

    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: /^pausar$/i }).click();

    await expect(display).not.toHaveText("00:00:00");

    await page.getByRole("button", { name: /registrar sessão/i }).click();
    await expect(page.getByText(/sessão registrada com sucesso/i)).toBeVisible();
    await expect(display).toHaveText("00:00:00");
  });

  test("registra sessao com categoria selecionada", async ({ page }) => {
    await garantirCategoria(page, ATIVIDADE_BINARIA, "Saude");

    await abrirRegistro(page, ATIVIDADE_BINARIA);
    const seletor = page.getByRole("button", { name: /^saude$/i });
    await seletor.click();
    await expect(seletor).toHaveClass(/text-accent/);

    await page.getByRole("button", { name: /registrar como feito/i }).click();
    await expect(page.getByText(/sessão registrada com sucesso/i)).toBeVisible();
  });
});

async function garantirCategoria(page, atividadeNome, nomeCategoria) {
  await page.getByRole("link", { name: /atividades/i }).first().click();
  const card = page
    .getByRole("heading", { name: atividadeNome })
    .locator("xpath=../..");
  await card.getByTitle("Categorias").click();
  await expect(page.getByRole("heading", { name: "Categorias" })).toBeVisible();

  if (
    await page
      .getByRole("heading", { name: nomeCategoria })
      .isVisible()
      .catch(() => false)
  ) {
    return;
  }
  await page.getByRole("button", { name: /nova categoria/i }).click();
  await page.getByLabel("Nome").fill(nomeCategoria);
  await page.getByRole("button", { name: /^criar$/i }).click();
  await expect(
    page.getByRole("heading", { name: nomeCategoria }),
  ).toBeVisible();
}

async function abrirRegistro(page, atividadeNome) {
  await page.getByRole("link", { name: /atividades/i }).first().click();
  await expect(page.getByRole("heading", { name: "Atividades" })).toBeVisible();
  const card = page
    .getByRole("heading", { name: atividadeNome })
    .locator("xpath=../..");
  await card.getByTitle("Registrar sessão").click();
  await expect(
    page.getByRole("heading", { name: /registrar sessão/i }),
  ).toBeVisible();
}

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
