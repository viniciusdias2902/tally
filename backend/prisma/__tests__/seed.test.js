import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = {
  $executeRaw: vi.fn(),
  $disconnect: vi.fn(),
  usuario: { create: vi.fn() },
  atividade: { create: vi.fn() },
  categoria: { createMany: vi.fn() },
  configPomodoro: { createMany: vi.fn() },
};

vi.mock("dotenv/config", () => ({}));

vi.mock("../../lib/prisma.js", () => ({
  default: prismaMock,
}));

vi.mock("bcrypt", () => ({
  default: { hash: vi.fn().mockResolvedValue("hash_fake") },
}));

describe("seed", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.restoreAllMocks();

    prismaMock.$executeRaw.mockResolvedValue(undefined);
    prismaMock.$disconnect.mockResolvedValue(undefined);
    prismaMock.usuario.create.mockResolvedValue({ id: "u1" });
    prismaMock.atividade.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: `id-${data.nome}`, ...data })
    );
    prismaMock.categoria.createMany.mockResolvedValue({ count: 1 });
    prismaMock.configPomodoro.createMany.mockResolvedValue({ count: 1 });
  });

  async function executarSeed() {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => {});
    await import("../seed.js");
    await vi.dynamicImportSettled();
  }

  describe("execução com sucesso", () => {
    it("deve truncar as tabelas antes de semear", async () => {
      await executarSeed();

      expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
    });

    it("deve criar um usuário com email e senha hash", async () => {
      await executarSeed();

      expect(prismaMock.usuario.create).toHaveBeenCalledWith({
        data: {
          email: "teste@email.com",
          nome: "Usuário Teste",
          senhaHash: "hash_fake",
        },
      });
    });

    it("deve criar 15 atividades (12 ativas + 3 arquivadas)", async () => {
      await executarSeed();

      expect(prismaMock.atividade.create).toHaveBeenCalledTimes(15);
    });

    it("deve criar atividades cronometradas e binárias", async () => {
      await executarSeed();

      const chamadas = prismaMock.atividade.create.mock.calls.map((c) => c[0].data);

      const cronometradas = chamadas.filter((d) => d.tipoMedicao === "cronometrada");
      const binarias = chamadas.filter((d) => d.tipoMedicao === "binaria");

      expect(cronometradas).toHaveLength(10);
      expect(binarias).toHaveLength(5);
    });

    it("deve criar 3 atividades arquivadas", async () => {
      await executarSeed();

      const chamadas = prismaMock.atividade.create.mock.calls.map((c) => c[0].data);
      const arquivadas = chamadas.filter((d) => d.arquivada === true);

      expect(arquivadas).toHaveLength(3);
      expect(arquivadas.map((a) => a.nome)).toEqual(["Cursinho", "TCC", "Inglês básico"]);
    });

    it("deve vincular todas as atividades ao usuário criado", async () => {
      await executarSeed();

      const chamadas = prismaMock.atividade.create.mock.calls.map((c) => c[0].data);
      const todosComUsuario = chamadas.every((d) => d.usuarioId === "u1");

      expect(todosComUsuario).toBe(true);
    });

    it("deve criar categorias para as atividades", async () => {
      await executarSeed();

      expect(prismaMock.categoria.createMany).toHaveBeenCalledOnce();

      const { data } = prismaMock.categoria.createMany.mock.calls[0][0];
      expect(data).toHaveLength(36);
    });

    it("deve criar configs de pomodoro para 4 atividades", async () => {
      await executarSeed();

      expect(prismaMock.configPomodoro.createMany).toHaveBeenCalledOnce();

      const { data } = prismaMock.configPomodoro.createMany.mock.calls[0][0];
      expect(data).toHaveLength(4);
    });

    it("deve exibir o resumo no console", async () => {
      await executarSeed();

      expect(console.log).toHaveBeenCalled();

      const mensagens = console.log.mock.calls.map((c) => c[0]);
      expect(mensagens).toContain("\n✅ Seed concluído!");
    });

    it("deve desconectar o prisma após a execução", async () => {
      await executarSeed();

      expect(prismaMock.$disconnect).toHaveBeenCalledOnce();
    });
  });

  describe("execução com erro", () => {
    it("deve exibir o erro no console e encerrar com código 1", async () => {
      const erro = new Error("falha no banco");
      prismaMock.usuario.create.mockRejectedValue(erro);

      await executarSeed();

      expect(console.error).toHaveBeenCalledWith(erro);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("deve desconectar o prisma mesmo em caso de erro", async () => {
      prismaMock.usuario.create.mockRejectedValue(new Error("falha"));

      await executarSeed();

      expect(prismaMock.$disconnect).toHaveBeenCalledOnce();
    });
  });
});
