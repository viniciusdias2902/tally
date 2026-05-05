import { ErroApp } from "../../lib/ErroApp.js";

export function criarPastaService(pastaRepository) {
  async function buscarPastaDoUsuario(id, usuarioId) {
    const pasta = await pastaRepository.buscarPorId(id);
    if (!pasta || pasta.usuarioId !== usuarioId) {
      throw new ErroApp("PASTA_NAO_ENCONTRADA", 404);
    }
    return pasta;
  }

  return {
    async criar({ usuarioId, nome }) {
      const ordem = await pastaRepository.contarPorUsuario(usuarioId);
      try {
        return await pastaRepository.criar({ usuarioId, nome, ordem });
      } catch (erro) {
        if (erro.code === "P2002") throw new ErroApp("PASTA_JA_EXISTE", 409);
        throw erro;
      }
    },

    listar(usuarioId) {
      return pastaRepository.listarPorUsuario(usuarioId);
    },

    buscar(id, usuarioId) {
      return buscarPastaDoUsuario(id, usuarioId);
    },

    async atualizar(id, usuarioId, dados) {
      await buscarPastaDoUsuario(id, usuarioId);
      try {
        return await pastaRepository.atualizar(id, dados);
      } catch (erro) {
        if (erro.code === "P2002") throw new ErroApp("PASTA_JA_EXISTE", 409);
        throw erro;
      }
    },

    async deletar(id, usuarioId) {
      await buscarPastaDoUsuario(id, usuarioId);
      return pastaRepository.deletar(id);
    },
  };
}
