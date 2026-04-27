import { test, expect } from "@playwright/test";

const SUFIXO = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const USUARIO = {
  nome: `Teste Categorias ${SUFIXO}`,
  email: `categorias-${SUFIXO}@e2e.com`,
  senha: "senha1234",
};
const ATIVIDADE = `Atividade ${SUFIXO}`;

test.describe.configure({ mode: "serial" });

test.describe("Categorias", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./login");
    if (!(await page.getByLabel("E-mail").isVisible().catch(() => false))) {
      return;
    }
    await page.getByLabel("E-mail").fill(USUARIO.email);
    await page.getByLabel("Senha").fill(USUARIO.senha);
    await page.getByRole("button", { name: /^entrar$/i }).click();
    await page
      .waitForURL("/tally/app", { timeout: 10000 })
      .catch(async () => {
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

  test("exibe estado vazio quando nao ha categorias", async ({ page }) => {
    await abrirCategorias(page);
    await expect(page.getByText(/nenhuma categoria cadastrada/i)).toBeVisible();
  });

  test("cria uma nova categoria", async ({ page }) => {
    await abrirCategorias(page);
    await page.getByRole("button", { name: /nova categoria/i }).click();
    await page.getByLabel("Nome").fill("Trabalho");
    await page.getByRole("button", { name: /^criar$/i }).click();
    await expect(page.getByRole("heading", { name: "Trabalho" })).toBeVisible();
  });

  test("impede criar categoria com nome duplicado", async ({ page }) => {
    await abrirCategorias(page);
    await page.getByRole("button", { name: /nova categoria/i }).click();
    await page.getByLabel("Nome").fill("Trabalho");
    await page.getByRole("button", { name: /^criar$/i }).click();
    await expect(page.getByText(/já existe uma categoria/i)).toBeVisible();
    await page.getByRole("button", { name: /cancelar/i }).click();
  });

  test("edita uma categoria", async ({ page }) => {
    await abrirCategorias(page);
    const card = cardDe(page, "Trabalho");
    await card.getByRole("button").nth(0).click();
    await page.getByLabel("Nome").fill("Estudos");
    await page.getByRole("button", { name: /^salvar$/i }).click();
    await expect(page.getByRole("heading", { name: "Estudos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Trabalho" })).not.toBeVisible();
  });

  test("arquiva uma categoria", async ({ page }) => {
    await abrirCategorias(page);
    const card = cardDe(page, "Estudos");
    await card.getByTitle("Arquivar").click();
    await card.getByRole("button", { name: /confirmar/i }).click();
    await expect(page.getByRole("heading", { name: "Estudos" })).not.toBeVisible();
    await expect(page.getByText(/nenhuma categoria cadastrada/i)).toBeVisible();
  });

  test("deleta uma categoria", async ({ page }) => {
    await abrirCategorias(page);
    await page.getByRole("button", { name: /nova categoria/i }).click();
    await page.getByLabel("Nome").fill("Lazer");
    await page.getByRole("button", { name: /^criar$/i }).click();
    await expect(page.getByRole("heading", { name: "Lazer" })).toBeVisible();

    const card = cardDe(page, "Lazer");
    await card.getByTitle("Deletar").click();
    await card.getByRole("button", { name: /confirmar/i }).click();
    await expect(page.getByRole("heading", { name: "Lazer" })).not.toBeVisible();
  });

  test("volta para a lista de atividades pelo breadcrumb", async ({ page }) => {
    await abrirCategorias(page);
    await page.locator("a", { hasText: "Atividades" }).first().click();
    await expect(page).toHaveURL("/tally/app/atividades");
    await expect(page.getByRole("heading", { name: ATIVIDADE })).toBeVisible();
  });
});

async function abrirCategorias(page) {
  await page.getByRole("link", { name: /atividades/i }).first().click();
  await expect(page.getByRole("heading", { name: "Atividades" })).toBeVisible();
  const card = cardDe(page, ATIVIDADE);
  await card.getByTitle("Categorias").click();
  await expect(page.getByRole("heading", { name: "Categorias" })).toBeVisible();
}

function cardDe(page, nome) {
  return page.getByRole("heading", { name: nome }).locator("xpath=../..");
}
