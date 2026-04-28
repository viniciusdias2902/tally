import { test, expect } from "@playwright/test";

// --- Helpers ---

const USUARIO_SEED = {
  email: "teste@email.com",
  senha: "senha1234",
};

/**
 * Faz login e navega até a aba Pomodoro.
 * Precondição: seed rodado (teste@email.com com atividades + config pomodoro).
 */
async function logarEIrParaPomodoro(page) {
  await page.goto("./login");
  await page.getByLabel("E-mail").fill(USUARIO_SEED.email);
  await page.getByLabel("Senha").fill(USUARIO_SEED.senha);
  await page.getByRole("button", { name: /entrar/i }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 10000 });

  // Navega via sidebar
  await page.getByRole("link", { name: /^timer$/i }).click();
  await expect(page.getByRole("button", { name: /pomodoro/i })).toBeVisible({ timeout: 10000 });

  // Clica na aba Pomodoro
  await page.getByRole("button", { name: /pomodoro/i }).click();
  await expect(page.getByRole("heading", { name: "Pomodoro" })).toBeVisible({ timeout: 5000 });
}

// --- Tests ---

test.describe("Timer Pomodoro", () => {
  test.describe("Renderização da página", () => {
    test("deve exibir título, seletores e timer parado", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      // Título
      await expect(page.getByRole("heading", { name: "Pomodoro" })).toBeVisible();
      await expect(page.getByText("Foco com intervalos programados")).toBeVisible();

      // Selects
      await expect(page.getByLabel("Atividade")).toBeVisible();
      await expect(page.getByLabel(/Categoria/)).toBeVisible();

      // Timer mostra tempo padrão (25:00 por default)
      await expect(page.getByText("Parado")).toBeVisible();

      // Botão Iniciar
      await expect(page.getByRole("button", { name: /iniciar/i })).toBeVisible();
    });

    test("botão Iniciar deve estar desabilitado sem atividade", async ({ page }) => {
      await logarEIrParaPomodoro(page);
      await expect(page.getByRole("button", { name: /iniciar/i })).toBeDisabled();
    });

    test("select de categoria deve estar desabilitado sem atividade", async ({ page }) => {
      await logarEIrParaPomodoro(page);
      await expect(page.getByLabel(/Categoria/)).toBeDisabled();
    });
  });

  test.describe("Seleção de atividade e categoria", () => {
    test("deve carregar apenas atividades cronometradas no select", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      const selectAtividade = page.getByLabel("Atividade");
      const opcoes = selectAtividade.locator("option");

      // O seed cria 7 atividades cronometradas ativas + 1 opção padrão
      const count = await opcoes.count();
      expect(count).toBe(8); // 7 cronometradas + "Selecione..."

      // Verificar que atividades binárias NÃO estão presentes
      const textos = await opcoes.allTextContents();
      expect(textos).not.toContain("Meditação");
      expect(textos).not.toContain("Journaling");
      expect(textos).not.toContain("Alimentação saudável");
    });

    test("deve carregar configuração do pomodoro ao selecionar atividade com config", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      // Faculdade: config 50/10/30/3
      await page.getByLabel("Atividade").selectOption({ label: "Faculdade" });

      // Deve exibir info da config
      await expect(page.getByText("50min foco")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("10min pausa")).toBeVisible();
      await expect(page.getByText("30min longa")).toBeVisible();
      await expect(page.getByText("3 ciclos")).toBeVisible();
    });

    test("deve usar config padrão quando atividade não tem config salva", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      // Exercício: sem config pomodoro no seed → defaults 25/5/15/4
      await page.getByLabel("Atividade").selectOption({ label: "Exercício" });

      await expect(page.getByText("25min foco")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("5min pausa")).toBeVisible();
      await expect(page.getByText("15min longa")).toBeVisible();
      await expect(page.getByText("4 ciclos")).toBeVisible();
    });

    test("deve carregar categorias ao selecionar atividade", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      await page.getByLabel("Atividade").selectOption({ label: "Faculdade" });

      const selectCategoria = page.getByLabel(/Categoria/);
      await expect(selectCategoria).toBeEnabled();

      const opcoes = selectCategoria.locator("option");
      const count = await opcoes.count();
      expect(count).toBeGreaterThan(1); // 6 categorias + "Sem categoria"
    });

    test("deve atualizar config ao trocar de atividade", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      // Faculdade: 50/10/30/3
      await page.getByLabel("Atividade").selectOption({ label: "Faculdade" });
      await expect(page.getByText("50min foco")).toBeVisible({ timeout: 3000 });

      // Troca para Concurso: 25/5/15/4
      await page.getByLabel("Atividade").selectOption({ label: "Concurso" });
      await expect(page.getByText("25min foco")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("4 ciclos")).toBeVisible();
    });

    test("deve resetar categoria ao trocar atividade", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      const selectCategoria = page.getByLabel(/Categoria/);

      await page.getByLabel("Atividade").selectOption({ label: "Faculdade" });
      await expect(selectCategoria).toBeEnabled();
      await selectCategoria.selectOption({ label: "Cálculo" });

      // Troca para Programação
      await page.getByLabel("Atividade").selectOption({ label: "Programação" });
      await expect(selectCategoria).toHaveValue("");
    });
  });

  test.describe("Controles do pomodoro", () => {
    test("deve iniciar e mostrar botões Pausar, Pular e Parar", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      await page.getByLabel("Atividade").selectOption({ label: "Concurso" });
      await page.getByRole("button", { name: /iniciar/i }).click();

      // Botões visíveis
      await expect(page.getByRole("button", { name: /pausar/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /pular/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /parar/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /iniciar/i })).not.toBeVisible();
    });

    test("deve exibir estado Foco e indicador de ciclo ao iniciar", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      // Concurso: 25/5/15/4
      await page.getByLabel("Atividade").selectOption({ label: "Concurso" });
      await page.getByRole("button", { name: /iniciar/i }).click();

      // Estado
      await expect(page.getByText("🔴 Foco")).toBeVisible();
      await expect(page.getByText("Ciclo 1 de 4")).toBeVisible();
    });

    test("deve pausar e retomar o pomodoro", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      await page.getByLabel("Atividade").selectOption({ label: "Concurso" });
      await page.getByRole("button", { name: /iniciar/i }).click();

      // Pausar
      await page.getByRole("button", { name: /pausar/i }).click();
      await expect(page.getByRole("button", { name: /retomar/i })).toBeVisible();

      // Retomar
      await page.getByRole("button", { name: /retomar/i }).click();
      await expect(page.getByRole("button", { name: /pausar/i })).toBeVisible();
    });

    test("deve transitar de Foco para Pausa Curta ao pular", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      // Concurso: 25/5/15/4
      await page.getByLabel("Atividade").selectOption({ label: "Concurso" });
      await page.getByRole("button", { name: /iniciar/i }).click();

      // Verifica estado inicial
      await expect(page.getByText("🔴 Foco")).toBeVisible();

      // Pular foco → vai para Pausa Curta
      await page.getByRole("button", { name: /pular/i }).click();

      await expect(page.getByText("🟢 Pausa Curta")).toBeVisible({ timeout: 3000 });
    });

    test("deve transitar de Pausa Curta para Foco ao pular novamente", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      await page.getByLabel("Atividade").selectOption({ label: "Concurso" });
      await page.getByRole("button", { name: /iniciar/i }).click();

      // Pular Foco → Pausa Curta
      await page.getByRole("button", { name: /pular/i }).click();
      await expect(page.getByText("🟢 Pausa Curta")).toBeVisible({ timeout: 3000 });

      // Pular Pausa Curta → Foco (ciclo 2)
      await page.getByRole("button", { name: /pular/i }).click();
      await expect(page.getByText("🔴 Foco")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Ciclo 2 de 4")).toBeVisible();
    });

    test("deve ir para Pausa Longa após completar todos os ciclos", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      // Programação: 60/10/30/2 (apenas 2 ciclos → mais rápido de testar)
      await page.getByLabel("Atividade").selectOption({ label: "Programação" });
      await page.getByRole("button", { name: /iniciar/i }).click();

      // Ciclo 1: Foco → Pausa Curta
      await expect(page.getByText("🔴 Foco")).toBeVisible();
      await expect(page.getByText("Ciclo 1 de 2")).toBeVisible();
      await page.getByRole("button", { name: /pular/i }).click();
      await expect(page.getByText("🟢 Pausa Curta")).toBeVisible({ timeout: 3000 });

      // Pausa Curta → Foco Ciclo 2
      await page.getByRole("button", { name: /pular/i }).click();
      await expect(page.getByText("🔴 Foco")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Ciclo 2 de 2")).toBeVisible();

      // Ciclo 2: Foco → Pausa Longa (último ciclo)
      await page.getByRole("button", { name: /pular/i }).click();
      await expect(page.getByText("🔵 Pausa Longa")).toBeVisible({ timeout: 3000 });
    });

    test("deve reiniciar ciclos após Pausa Longa", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      // Programação: 60/10/30/2
      await page.getByLabel("Atividade").selectOption({ label: "Programação" });
      await page.getByRole("button", { name: /iniciar/i }).click();

      // Avançar até Pausa Longa: Foco→Pausa→Foco→Pausa Longa
      await page.getByRole("button", { name: /pular/i }).click(); // Foco 1 → Pausa Curta
      await expect(page.getByText("🟢 Pausa Curta")).toBeVisible({ timeout: 3000 });
      await page.getByRole("button", { name: /pular/i }).click(); // Pausa Curta → Foco 2
      await expect(page.getByText("🔴 Foco")).toBeVisible({ timeout: 3000 });
      await page.getByRole("button", { name: /pular/i }).click(); // Foco 2 → Pausa Longa
      await expect(page.getByText("🔵 Pausa Longa")).toBeVisible({ timeout: 3000 });

      // Pular Pausa Longa → volta ao Foco (ciclo 1)
      await page.getByRole("button", { name: /pular/i }).click();
      await expect(page.getByText("🔴 Foco")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Ciclo 1 de 2")).toBeVisible();
    });

    test("selects devem ficar desabilitados com pomodoro ativo", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      await page.getByLabel("Atividade").selectOption({ label: "Faculdade" });
      await page.getByRole("button", { name: /iniciar/i }).click();

      await expect(page.getByLabel("Atividade")).toBeDisabled();
      await expect(page.getByLabel(/Categoria/)).toBeDisabled();
    });
  });

  test.describe("Salvamento de sessão", () => {
    test("deve parar e salvar sessão com sucesso", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      await page.getByLabel("Atividade").selectOption({ label: "Concurso" });
      await page.getByRole("button", { name: /iniciar/i }).click();

      // Esperar um pouco para acumular tempo de foco
      await page.waitForTimeout(1500);

      // Parar
      await page.getByRole("button", { name: /parar/i }).click();

      // Toast de sucesso
      await expect(page.getByText("Sessão Pomodoro salva com sucesso!")).toBeVisible({ timeout: 5000 });

      // Volta ao estado idle
      await expect(page.getByText("Parado")).toBeVisible();
      await expect(page.getByRole("button", { name: /iniciar/i })).toBeVisible();
    });

    test("deve salvar sessão com categoria selecionada", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      await page.getByLabel("Atividade").selectOption({ label: "Faculdade" });
      await page.getByLabel(/Categoria/).selectOption({ label: "Cálculo" });

      await page.getByRole("button", { name: /iniciar/i }).click();
      await page.waitForTimeout(1500);
      await page.getByRole("button", { name: /parar/i }).click();

      await expect(page.getByText("Sessão Pomodoro salva com sucesso!")).toBeVisible({ timeout: 5000 });
    });

    test("deve voltar a habilitar selects após parar", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      await page.getByLabel("Atividade").selectOption({ label: "Concurso" });
      await page.getByRole("button", { name: /iniciar/i }).click();
      await page.waitForTimeout(1500);
      await page.getByRole("button", { name: /parar/i }).click();

      await expect(page.getByText("Sessão Pomodoro salva com sucesso!")).toBeVisible({ timeout: 5000 });

      await expect(page.getByLabel("Atividade")).toBeEnabled();
    });
  });

  test.describe("Navegação entre tabs", () => {
    test("deve alternar entre Timer Livre e Pomodoro", async ({ page }) => {
      await logarEIrParaPomodoro(page);

      // Está no Pomodoro
      await expect(page.getByRole("heading", { name: "Pomodoro" })).toBeVisible();

      // Clica na aba Timer Livre
      await page.getByRole("button", { name: /timer livre/i }).click();
      await expect(page.getByRole("heading", { name: "Timer Livre" })).toBeVisible();

      // Volta para Pomodoro
      await page.getByRole("button", { name: /pomodoro/i }).click();
      await expect(page.getByRole("heading", { name: "Pomodoro" })).toBeVisible();
    });
  });
});
