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
    }