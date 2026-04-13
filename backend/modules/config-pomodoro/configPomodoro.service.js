import { ErroApp } from "../../lib/ErroApp.js";

export function criarConfigPomodoroService(configPomodoroRepository, atividadeService) {
  async function verificarPosseAtividade(atividadeId, usuarioId) {
    return atividadeService.buscar(atividadeId, usuarioId);
  }

  return {
    async buscar(atividadeId, usuarioId) {
      await verificarPosseAtividade(atividadeId, usuarioId);
      const config = await configPomodoroRepository.buscarPorAtividade(atividadeId);
      if (!config) throw new ErroApp("CONFIG_POMODORO_NAO_ENCONTRADA", 404);
      return config;
    },

    async upsert({ atividadeId, usuarioId, minutosFoco, minutosPausaCurta, minutosPausaLonga, ciclosAntesLonga }) {
      await verificarPosseAtividade(atividadeId, usuarioId);
      return configPomodoroRepository.upsert({ atividadeId, minutosFoco, minutosPausaCurta, minutosPausaLonga, ciclosAntesLonga });
    },

    async deletar(atividadeId, usuarioId) {
      await verificarPosseAtividade(atividadeId, usuarioId);
      const config = await configPomodoroRepository.buscarPorAtividade(atividadeId);
      if (!config) throw new ErroApp("CONFIG_POMODORO_NAO_ENCONTRADA", 404);
      return configPomodoroRepository.deletarPorAtividade(atividadeId);
    },
  };
}
