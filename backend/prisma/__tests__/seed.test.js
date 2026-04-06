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
  });
});
