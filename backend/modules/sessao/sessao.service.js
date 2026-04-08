import { ErroApp } from "../../lib/ErroApp.js";

export function criarSessaoService(sessaoRepository, atividadeService, categoriaService) {
    async function verificarAcessoAtividade(atividadeId, usuarioId) {
        return atividadeService.buscar(atividadeId, usuarioId);
    }

