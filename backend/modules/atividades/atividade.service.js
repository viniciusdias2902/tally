import { ErroApp } from "../../lib/ErroApp.js";

export function criarAtividadeService(atividadeRepository, pastaService) {
  async function buscarAtividadeDoUsuario(id, usuarioId) {
    const atividade = await atividadeRepository.buscarPorId(id);
    if (!atividade || atividade.usuarioId !== usuarioId) {
      throw new ErroApp("ATIVIDADE_NAO_ENCONTRADA", 404);
    }
    return atividade;
  }

  async function validarPasta(pastaId, usuarioId) {
    if (pastaId == null) return;
    await pastaService.buscar(pastaId, usuarioId);
  }

  return {
    async criar({ usuarioId, nome, tipoMedicao, pastaId }) {
      await validarPasta(pastaId, usuarioId);
      try {
        return await atividadeRepository.criar({ usuarioId, nome, tipoMedicao, pastaId });
      } catch (erro) {
        if (erro.code === "P2002") throw new ErroApp("ATIVIDADE_JA_EXISTE", 409);
        throw erro;
      }
    },

    listar(usuarioId, opcoes) {
      return atividadeRepository.listarPorUsuario(usuarioId, opcoes);
    },

    buscar(id, usuarioId) {
      return buscarAtividadeDoUsuario(id, usuarioId);
    },

    async atualizar(id, usuarioId, dados) {
      await buscarAtividadeDoUsuario(id, usuarioId);
      if ("pastaId" in dados) await validarPasta(dados.pastaId, usuarioId);
      try {
        return await atividadeRepository.atualizar(id, dados);
      } catch (erro) {
        if (erro.code === "P2002") throw new ErroApp("ATIVIDADE_JA_EXISTE", 409);
        throw erro;
      }
    },

    async arquivar(id, usuarioId) {
      await buscarAtividadeDoUsuario(id, usuarioId);
      await atividadeRepository.arquivarCategorias(id);
      return atividadeRepository.arquivar(id);
    },

    async deletar(id, usuarioId) {
      await buscarAtividadeDoUsuario(id, usuarioId);
      const temSessoes = await atividadeRepository.possuiSessoes(id);
      if (temSessoes) throw new ErroApp("ATIVIDADE_COM_SESSOES", 409);
      return atividadeRepository.deletar(id);
    },
  };
}
