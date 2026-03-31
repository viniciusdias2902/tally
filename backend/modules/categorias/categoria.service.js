import { ErroApp } from "../../lib/ErroApp.js";

export function criarCategoriaService(categoriaRepository, atividadeService) {
  async function verificarPosseAtividade(atividadeId, usuarioId) {
    return atividadeService.buscar(atividadeId, usuarioId);
  }

  async function buscarCategoriaDoUsuario(id, usuarioId) {
    const categoria = await categoriaRepository.buscarPorId(id);
    if (!categoria) throw new ErroApp("CATEGORIA_NAO_ENCONTRADA", 404);
    await verificarPosseAtividade(categoria.atividadeId, usuarioId);
    return categoria;
  }

  return {
    async criar({ atividadeId, usuarioId, nome, cor }) {
      await verificarPosseAtividade(atividadeId, usuarioId);
      const ordem = await categoriaRepository.contarPorAtividade(atividadeId);
      try {
        return await categoriaRepository.criar({ atividadeId, nome, cor, ordem });
      } catch (erro) {
        if (erro.code === "P2002") throw new ErroApp("CATEGORIA_JA_EXISTE", 409);
        throw erro;
      }
    },

    async listar(atividadeId, usuarioId, opcoes) {
      await verificarPosseAtividade(atividadeId, usuarioId);
      return categoriaRepository.listarPorAtividade(atividadeId, opcoes);
    },

    buscar(id, usuarioId) {
      return buscarCategoriaDoUsuario(id, usuarioId);
    },

    async atualizar(id, usuarioId, dados) {
      await buscarCategoriaDoUsuario(id, usuarioId);
      try {
        return await categoriaRepository.atualizar(id, dados);
      } catch (erro) {
        if (erro.code === "P2002") throw new ErroApp("CATEGORIA_JA_EXISTE", 409);
        throw erro;
      }
    },

    async arquivar(id, usuarioId) {
      await buscarCategoriaDoUsuario(id, usuarioId);
      return categoriaRepository.arquivar(id);
    },

    async desarquivar(id, usuarioId) {
      await buscarCategoriaDoUsuario(id, usuarioId);
      return categoriaRepository.desarquivar(id);
    },

    async deletar(id, usuarioId) {
      await buscarCategoriaDoUsuario(id, usuarioId);
      const temSessoes = await categoriaRepository.possuiSessoes(id);
      if (temSessoes) throw new ErroApp("CATEGORIA_COM_SESSOES", 409);
      return categoriaRepository.deletar(id);
    },

    async reordenar(atividadeId, usuarioId, ordenacoes) {
      await verificarPosseAtividade(atividadeId, usuarioId);
      return categoriaRepository.atualizarOrdem(ordenacoes);
    },
  };
}
