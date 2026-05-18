import { test, expect } from "@playwright/test";

const SUFIXO = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const USUARIO = {
  nome: `Teste Dashboard ${SUFIXO}`,
  email: `dashboard-${SUFIXO}@e2e.com`,
  senha: "senha1234",
};
const ATIVIDADE_TEMPO = `Estudar ${SUFIXO}`;
const ATIVIDADE_BINARIA = `Beber agua ${SUFIXO}`;

test.describe.configure({ mode: "serial" });

test.describe("Dashboard e Histórico", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./login");
    if (!(await page.getByLabel("E-mail").isVisible().catch(() => false))) {
      return;
    }
    await page.getByLabel("E-mail").fill(USUARIO.email);
    await page.getByLabel("Senha").fill(USUARIO.senha);
    await page.getByRole("button", { name: /^entrar$/i }).click();
    await page.waitForURL("/tally/app", { timeout: 15000 }).catch(async () => {
      await page.goto("./registro");
      await page.getByLabel("Nome").fill(USUARIO.nome);
      await page.getByLabel("E-mail").fill(USUARIO.email);
      await page.getByLabel("Senha").fill(USUARIO.senha);
      await page.getByRole("button", { name: /criar conta/i }).click();
      await page.waitForURL("/tally/app", { timeout: 15000 });
    });
  });

  test("garante atividades e sessoes base", async ({ page }) => {
    await page.getByRole("link", { name: /atividades/i }).first().click();
    await expect(page.getByRole("heading", { name: "Atividades" })).toBeVisible();

    // Criar atividade cronometrada
    await criarSeNaoExiste(page, ATIVIDADE_TEMPO, "Cronometrada");

    // Criar atividade binária
    await criarSeNaoExiste(page, ATIVIDADE_BINARIA, "Concluído/Pendente");

    // Registrar sessão manual na atividade cronometrada (gera dados para dashboard)
    const cardTempo = page.getByRole("heading", { name: ATIVIDADE_TEMPO }).locator("xpath=../..");
    await cardTempo.getByRole("link", { name: /registrar/i }).click();
    await expect(page.getByRole("heading", { name: /registrar sessão/i })).toBeVisible();

    const abaManual = page.getByRole("tab", { name: /manual/i });
    await abaManual.click();
    await page.getByLabel(/duração/i).fill("30");
    await page.getByRole("button", { name: /registrar sessão/i }).click();
    await expect(page.getByText(/sessão registrada com sucesso/i)).toBeVisible();

    // Registrar check binário
    await page.getByRole("link", { name: /atividades/i }).first().click();
    const cardBinaria = page.getByRole("heading", { name: ATIVIDADE_BINARIA }).locator("xpath=../..");
    await cardBinaria.getByRole("link", { name: /registrar/i }).click();
    await expect(
      page.getByRole("heading", { name: /registrar conclusão/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /registrar como feito/i }).click();
    await expect(page.getByText(/sessão registrada com sucesso/i)).toBeVisible();
  });

  test("exibe sessoes no historico da atividade", async ({ page }) => {
    await page.getByRole("link", { name: /atividades/i }).first().click();
    await expect(page.getByRole("heading", { name: "Atividades" })).toBeVisible();

    // Abrir registro para acessar o link "Ver histórico"
    const card = page.getByRole("heading", { name: ATIVIDADE_TEMPO }).locator("xpath=../..");
    await card.getByRole("button", { name: /mais ações/i }).click();
    await page.getByRole("menu").getByRole("link", { name: /histórico/i }).click();

    // Verificar página de histórico
    await expect(page.getByRole("heading", { name: /histórico/i })).toBeVisible();
    await expect(page.getByText("Manual").first()).toBeVisible();
    await expect(page.getByText(/registrados/i)).toBeVisible();
  });

  test("exibe heatmap no dashboard geral", async ({ page }) => {
    await page.getByRole("link", { name: /dashboard/i }).first().click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    // Verificar seção do heatmap
    await expect(
      page.getByRole("heading", { name: /atividade no último ano/i }),
    ).toBeVisible();

    // Verificar que o SVG do heatmap foi renderizado
    const secaoHeatmap = page
      .getByRole("heading", { name: /atividade no último ano/i })
      .locator("xpath=..");
    await expect(secaoHeatmap.locator("svg").first()).toBeVisible({ timeout: 15000 });
  });

  test("exibe graficos e kpis no dashboard geral", async ({ page }) => {
    await page.getByRole("link", { name: /dashboard/i }).first().click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    // Verificar KPIs
    await expect(page.getByText("Tempo total")).toBeVisible();
    await expect(page.getByText("Sessões")).toBeVisible();
    await expect(page.getByText("Sequência atual")).toBeVisible();
    await expect(page.getByText("Melhor sequência")).toBeVisible();

    // Verificar seções de gráficos
    await expect(page.getByRole("heading", { name: /distribuição/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /evolução/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /top atividades/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /por hora do dia/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /por dia da semana/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /por modo/i })).toBeVisible();
  });

  test("exibe dashboard individual da atividade", async ({ page }) => {
    await page.getByRole("link", { name: /atividades/i }).first().click();
    await expect(page.getByRole("heading", { name: "Atividades" })).toBeVisible();

    // Abrir dashboard da atividade via menu kebab
    const card = page.getByRole("heading", { name: ATIVIDADE_TEMPO }).locator("xpath=../..");
    await card.getByRole("button", { name: /mais ações/i }).click();
    await page.getByRole("menu").getByRole("link", { name: /dashboard/i }).click();

    // Verificar título da atividade
    await expect(
      page.getByRole("heading", { name: ATIVIDADE_TEMPO }),
    ).toBeVisible();

    // Verificar KPIs
    await expect(page.getByText("Tempo total")).toBeVisible();
    await expect(page.getByText("Sessões")).toBeVisible();

    // Verificar seções de gráficos da atividade
    await expect(page.getByRole("heading", { name: /atividade no último ano/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /por categoria/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /evolução/i })).toBeVisible();
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
