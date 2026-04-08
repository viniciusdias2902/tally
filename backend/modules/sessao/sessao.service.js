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

    async function buscarSessaoDoUsuario(id, usuarioId) {
        const sessao = await sessaoRepository.buscarPorId(id);
        if (!sessao) throw new ErroApp("SESSAO_NAO_ENCONTRADA", 404);
        await verificarAcessoAtividade(sessao.atividadeId, usuarioId);
        return sessao;
    }

    return {
        async criar({ atividadeId, categoriaId, usuarioId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro, observacoes }) {
            await verificarAcessoAtividade(atividadeId, usuarioId);
            await verificarCategoria(categoriaId, usuarioId);
            return sessaoRepository.criar({ atividadeId, categoriaId, iniciadoEm, duracaoSegundos, modo, ciclosPomodoro, observacoes });
        },
    },

        async listar(atividadeId, usuarioId, opcoes) {
        await verificarAcessoAtividade(atividadeId, usuarioId);
        return sessaoRepository.listarPorAtividade(atividadeId, opcoes);
    },

    buscar(id, usuarioId) {
        return buscarSessaoDoUsuario(id, usuarioId);
    },

};
}
