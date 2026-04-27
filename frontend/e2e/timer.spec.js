import { test, expect } from "@playwright/test";

// --- Helpers ---

const USUARIO_SEED = {
  email: "teste@email.com",
  senha: "senha1234",
};

/**
 * Faz login com o usuário do seed e navega até a página do timer.
 * Precondição: o seed já foi rodado (teste@email.com com atividades).
 */
async function logarEIrParaTimer(page) {
  await page.goto("./login");
  await page.getByLabel("E-mail").fill(USUARIO_SEED.email);
  await page.getByLabel("Senha").fill(USUARIO_SEED.senha);
  await page.getByRole("button", { name: /entrar/i }).click();
  await expect(page).toHaveURL(/\/tally\/app\/?$/, { timeout: 5000 });

  await page.goto("./timer");
  await expect(page.getByRole("heading", { name: "Timer Livre" })).toBeVisible({ timeout: 10000 });
}

// --- Tests ---

test.describe("Timer Livre", () => {
  test.describe("Renderização da página", () => {
    test("deve exibir título, seletores e timer zerado", async ({ page }) => {
      await logarEIrParaTimer(page);

      // Título e subtítulo
      await expect(page.getByRole("heading", { name: "Timer Livre" })).toBeVisible();
      await expect(page.getByText("Selecione uma atividade e controle seu tempo")).toBeVisible();

      // Selects
      await expect(page.getByLabel("Atividade")).toBeVisible();
      await expect(page.getByLabel(/Categoria/)).toBeVisible();

      // Timer zerado
      await expect(page.getByText("00:00:00")).toBeVisible();
      await expect(page.getByText("Parado")).toBeVisible();

      // Botão Iniciar visível
      await expect(page.getByRole("button", { name: /iniciar/i })).toBeVisible();
    });

    test("botão Iniciar deve estar desabilitado sem atividade selecionada", async ({ page }) => {
      await logarEIrParaTimer(page);
      await expect(page.getByRole("button", { name: /iniciar/i })).toBeDisabled();
    });

    test("select de categoria deve estar desabilitado sem atividade", async ({ page }) => {
      await logarEIrParaTimer(page);
      await expect(page.getByLabel(/Categoria/)).toBeDisabled();
    });

    test("deve exibir link Timer Livre na sidebar", async ({ page }) => {
      await logarEIrParaTimer(page);
      await expect(page.getByRole("link", { name: /timer livre/i })).toBeVisible();
    });
  });

  test.describe("Seleção de atividade e categoria", () => {
    test("deve carregar atividades no select", async ({ page }) => {
      await logarEIrParaTimer(page);

      const selectAtividade = page.getByLabel("Atividade");
      const opcoes = selectAtividade.locator("option");

      // O seed cria 12 atividades ativas + 1 opção padrão "Selecione..."
      const count = await opcoes.count();
      expect(count).toBeGreaterThan(1);
    });

    test("deve habilitar botão Iniciar ao selecionar atividade", async ({ page }) => {
      await logarEIrParaTimer(page);

      const selectAtividade = page.getByLabel("Atividade");
      // Seleciona a primeira atividade (não a opção padrão)
      const primeiraOpcao = selectAtividade.locator("option:not([value=''])").first();
      const valor = await primeiraOpcao.getAttribute("value");
      await selectAtividade.selectOption(valor);

      await expect(page.getByRole("button", { name: /iniciar/i })).toBeEnabled();
    });

    test("deve carregar categorias ao selecionar atividade com categorias", async ({ page }) => {
      await logarEIrParaTimer(page);

      // Selecionar "Faculdade" que tem 6 categorias no seed
      const selectAtividade = page.getByLabel("Atividade");
      await selectAtividade.selectOption({ label: "Faculdade" });

      const selectCategoria = page.getByLabel(/Categoria/);
      await expect(selectCategoria).toBeEnabled();

      // Deve ter as categorias do seed + opção "Sem categoria"
      const opcoes = selectCategoria.locator("option");
      const count = await opcoes.count();
      expect(count).toBeGreaterThan(1);
    });

    test("deve resetar categoria ao trocar atividade", async ({ page }) => {
      await logarEIrParaTimer(page);

      const selectAtividade = page.getByLabel("Atividade");
      const selectCategoria = page.getByLabel(/Categoria/);

      // Seleciona Faculdade e uma categoria
      await selectAtividade.selectOption({ label: "Faculdade" });
      await expect(selectCategoria).toBeEnabled();

      // Seleciona Cálculo
      await selectCategoria.selectOption({ label: "Cálculo" });

      // Troca para Programação
      await selectAtividade.selectOption({ label: "Programação" });

      // Categoria deve voltar ao padrão (valor vazio)
      await expect(selectCategoria).toHaveValue("");
    });
  });

  test.describe("Controles do timer", () => {
    test("deve iniciar o timer e mostrar botões Pausar e Parar", async ({ page }) => {
      await logarEIrParaTimer(page);

      const selectAtividade = page.getByLabel("Atividade");
      await selectAtividade.selectOption({ label: "Faculdade" });

      await page.getByRole("button", { name: /iniciar/i }).click();

      // Botões de controle mudam
      await expect(page.getByRole("button", { name: /pausar/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /parar/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /iniciar/i })).not.toBeVisible();

      // Status muda
      await expect(page.getByText("Rodando")).toBeVisible();
    });

    test("deve pausar e retomar o timer", async ({ page }) => {
      await logarEIrParaTimer(page);

      const selectAtividade = page.getByLabel("Atividade");
      await selectAtividade.selectOption({ label: "Faculdade" });

      // Iniciar
      await page.getByRole("button", { name: /iniciar/i }).click();
      await expect(page.getByText("Rodando")).toBeVisible();

      // Pausar
      await page.getByRole("button", { name: /pausar/i }).click();
      await expect(page.getByText("Pausado")).toBeVisible();
      await expect(page.getByRole("button", { name: /retomar/i })).toBeVisible();

      // Retomar
      await page.getByRole("button", { name: /retomar/i }).click();
      await expect(page.getByText("Rodando")).toBeVisible();
      await expect(page.getByRole("button", { name: /pausar/i })).toBeVisible();
    });

    test("selects devem ficar desabilitados com timer ativo", async ({ page }) => {
      await logarEIrParaTimer(page);

      const selectAtividade = page.getByLabel("Atividade");
      await selectAtividade.selectOption({ label: "Faculdade" });

      await page.getByRole("button", { name: /iniciar/i }).click();

      await expect(page.getByLabel("Atividade")).toBeDisabled();
      await expect(page.getByLabel(/Categoria/)).toBeDisabled();
    });

    test("deve parar o timer e salvar sessão com sucesso", async ({ page }) => {
      await logarEIrParaTimer(page);

      const selectAtividade = page.getByLabel("Atividade");
      await selectAtividade.selectOption({ label: "Faculdade" });

      // Iniciar e esperar um pouco para acumular tempo
      await page.getByRole("button", { name: /iniciar/i }).click();
      await page.waitForTimeout(1500);

      // Parar
      await page.getByRole("button", { name: /parar/i }).click();

      // Toast de sucesso
      await expect(page.getByText("Sessão salva com sucesso!")).toBeVisible({ timeout: 5000 });

      // Volta ao estado idle
      await expect(page.getByText("00:00:00")).toBeVisible();
      await expect(page.getByText("Parado")).toBeVisible();
      await expect(page.getByRole("button", { name: /iniciar/i })).toBeVisible();
    });

    test("deve salvar sessão com categoria selecionada", async ({ page }) => {
      await logarEIrParaTimer(page);

      // Selecionar atividade e categoria
      await page.getByLabel("Atividade").selectOption({ label: "Faculdade" });
      await page.getByLabel(/Categoria/).selectOption({ label: "Cálculo" });

      // Iniciar, esperar e parar
      await page.getByRole("button", { name: /iniciar/i }).click();
      await page.waitForTimeout(1500);
      await page.getByRole("button", { name: /parar/i }).click();

      // Toast de sucesso
      await expect(page.getByText("Sessão salva com sucesso!")).toBeVisible({ timeout: 5000 });
    });

    test("deve voltar a habilitar selects após parar", async ({ page }) => {
      await logarEIrParaTimer(page);

      const selectAtividade = page.getByLabel("Atividade");
      await selectAtividade.selectOption({ label: "Faculdade" });

      // Iniciar e parar
      await page.getByRole("button", { name: /iniciar/i }).click();
      await page.waitForTimeout(1500);
      await page.getByRole("button", { name: /parar/i }).click();

      await expect(page.getByText("Sessão salva com sucesso!")).toBeVisible({ timeout: 5000 });

      // Selects devem estar habilitados novamente
      await expect(page.getByLabel("Atividade")).toBeEnabled();
    });
  });

  test.describe("Navegação", () => {
    test("deve acessar timer pelo link da sidebar", async ({ page }) => {
      await logarEIrParaTimer(page);

      // Volta ao dashboard
      await page.goto("./");
      await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

      // Clica no link do Timer na sidebar
      await page.getByRole("link", { name: /timer livre/i }).click();
      await expect(page).toHaveURL(/\/timer$/);
      await expect(page.getByRole("heading", { name: "Timer Livre" })).toBeVisible();
    });
  });
});
