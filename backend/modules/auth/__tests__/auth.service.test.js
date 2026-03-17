import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { criarAuthService } from "../auth.service.js";
import { ErroApp } from "../../../lib/ErroApp.js";

const JWT_SECRET = "segredo-teste";
const JWT_ACCESS_TOKEN_EXPIRES_IN = "15m";
const JWT_REFRESH_TOKEN_EXPIRES_IN = "7d";

function criarRepositorioMock() {
  return {
    buscarPorEmail: vi.fn(),
    criar: vi.fn(),
    atualizarRefreshToken: vi.fn(),
    buscarPorId: vi.fn(),
  };
}

describe("auth.service", () => {
  let repositorio;
  let servico;

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = JWT_ACCESS_TOKEN_EXPIRES_IN;
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = JWT_REFRESH_TOKEN_EXPIRES_IN;

    repositorio = criarRepositorioMock();
    servico = criarAuthService(repositorio);
  });

  describe("registrar", () => {
    it("deve criar usuario e retornar tokens", async () => {
      repositorio.buscarPorEmail.mockResolvedValue(null);
      repositorio.criar.mockResolvedValue({ id: "1" });
      repositorio.atualizarRefreshToken.mockResolvedValue(null);

      const resultado = await servico.registrar({
        email: "teste@email.com",
        nome: "Teste",
        senha: "senha1234",
      });

      expect(repositorio.buscarPorEmail).toHaveBeenCalledWith("teste@email.com");
      expect(repositorio.criar).toHaveBeenCalledWith(
        expect.objectContaining({ email: "teste@email.com", nome: "Teste" })
      );
      expect(resultado).toHaveProperty("accessToken");
      expect(resultado).toHaveProperty("refreshToken");
    });

    it("deve gerar hash da senha ao criar", async () => {
      repositorio.buscarPorEmail.mockResolvedValue(null);
      repositorio.criar.mockResolvedValue({ id: "1" });
      repositorio.atualizarRefreshToken.mockResolvedValue(null);

      await servico.registrar({
        email: "teste@email.com",
        nome: "Teste",
        senha: "senha1234",
      });

      const { senhaHash } = repositorio.criar.mock.calls[0][0];
      expect(senhaHash).not.toBe("senha1234");
      expect(await bcrypt.compare("senha1234", senhaHash)).toBe(true);
    });

    it("deve salvar o refreshToken no repositorio", async () => {
      repositorio.buscarPorEmail.mockResolvedValue(null);
      repositorio.criar.mockResolvedValue({ id: "1" });
      repositorio.atualizarRefreshToken.mockResolvedValue(null);

      const resultado = await servico.registrar({
        email: "teste@email.com",
        nome: "Teste",
        senha: "senha1234",
      });

      expect(repositorio.atualizarRefreshToken).toHaveBeenCalledWith(
        "1",
        resultado.refreshToken
      );
    });

    it("deve lançar ErroApp 409 se email já existe", async () => {
      repositorio.buscarPorEmail.mockResolvedValue({ id: "1" });

      await expect(
        servico.registrar({ email: "existe@email.com", nome: "X", senha: "senha1234" })
      ).rejects.toThrow(ErroApp);

      await expect(
        servico.registrar({ email: "existe@email.com", nome: "X", senha: "senha1234" })
      ).rejects.toMatchObject({ message: "EMAIL_JA_EXISTE", codigoStatus: 409 });
    });
  });

  describe("login", () => {
    const senhaPlana = "senha1234";
    let senhaHash;

    beforeEach(async () => {
      senhaHash = await bcrypt.hash(senhaPlana, 4);
    });

    it("deve retornar tokens com credenciais válidas", async () => {
      repositorio.buscarPorEmail.mockResolvedValue({ id: "1", senhaHash });
      repositorio.atualizarRefreshToken.mockResolvedValue(null);

      const resultado = await servico.login({ email: "teste@email.com", senha: senhaPlana });

      expect(resultado).toHaveProperty("accessToken");
      expect(resultado).toHaveProperty("refreshToken");
    });

    it("deve lançar ErroApp 401 se usuario não existe", async () => {
      repositorio.buscarPorEmail.mockResolvedValue(null);

      await expect(
        servico.login({ email: "nao@existe.com", senha: "qualquer" })
      ).rejects.toMatchObject({ message: "CREDENCIAIS_INVALIDAS", codigoStatus: 401 });
    });

    it("deve lançar ErroApp 401 se senha incorreta", async () => {
      repositorio.buscarPorEmail.mockResolvedValue({ id: "1", senhaHash });

      await expect(
        servico.login({ email: "teste@email.com", senha: "errada" })
      ).rejects.toMatchObject({ message: "CREDENCIAIS_INVALIDAS", codigoStatus: 401 });
    });
  });

  describe("refresh", () => {
    it("deve retornar novos tokens com refreshToken válido", async () => {
      const tokenValido = jwt.sign({ sub: "1" }, JWT_SECRET, { expiresIn: "7d" });
      repositorio.buscarPorId.mockResolvedValue({ id: "1", refreshToken: tokenValido });
      repositorio.atualizarRefreshToken.mockResolvedValue(null);

      const resultado = await servico.refresh(tokenValido);

      expect(resultado).toHaveProperty("accessToken");
      expect(resultado).toHaveProperty("refreshToken");
      expect(repositorio.atualizarRefreshToken).toHaveBeenCalledWith(
        "1",
        resultado.refreshToken
      );
    });

    it("deve lançar ErroApp 401 com token expirado", async () => {
      const tokenExpirado = jwt.sign({ sub: "1" }, JWT_SECRET, { expiresIn: "0s" });

      await expect(
        servico.refresh(tokenExpirado)
      ).rejects.toMatchObject({ message: "REFRESH_TOKEN_INVALIDO", codigoStatus: 401 });
    });

    it("deve lançar ErroApp 401 com token inválido", async () => {
      await expect(
        servico.refresh("token-invalido")
      ).rejects.toMatchObject({ message: "REFRESH_TOKEN_INVALIDO", codigoStatus: 401 });
    });

    it("deve lançar ErroApp 401 se token não corresponde ao salvo", async () => {
      const token = jwt.sign({ sub: "1" }, JWT_SECRET, { expiresIn: "7d" });
      repositorio.buscarPorId.mockResolvedValue({ id: "1", refreshToken: "outro-token" });

      await expect(
        servico.refresh(token)
      ).rejects.toMatchObject({ message: "REFRESH_TOKEN_INVALIDO", codigoStatus: 401 });
    });

    it("deve lançar ErroApp 401 se usuario não existe", async () => {
      const token = jwt.sign({ sub: "1" }, JWT_SECRET, { expiresIn: "7d" });
      repositorio.buscarPorId.mockResolvedValue(null);

      await expect(
        servico.refresh(token)
      ).rejects.toMatchObject({ message: "REFRESH_TOKEN_INVALIDO", codigoStatus: 401 });
    });
  });

  describe("logout", () => {
    it("deve limpar o refreshToken do usuario", async () => {
      repositorio.atualizarRefreshToken.mockResolvedValue(null);

      await servico.logout("1");

      expect(repositorio.atualizarRefreshToken).toHaveBeenCalledWith("1", null);
    });
  });
});
