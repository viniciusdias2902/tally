import { ErroApp } from "../../lib/ErroApp.js";

export function criarSessaoService(sessaoRepository, atividadeService, categoriaService) {
    async function verificarAcessoAtividade(atividadeId, usuarioId) {
        return atividadeService.buscar(atividadeId, usuarioId);
    }

    async function verificarCategoria(categoriaId, usuarioId) {
        if (!categoriaId) return;
        const categoria = await categoriaService.buscar(categoriaId, usuarioId);
        if (categoria.arquivada) throw new ErroApp("CATEGORIA_ARQUIVADA", 422);
        return categoria;
    }
