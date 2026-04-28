import { useState } from "react";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";

export default function FormConfigPomodoro({
  config,
  onSalvar,
  onRestaurar,
  onCancelar,
}) {
  const [minutosFoco, setMinutosFoco] = useState(String(config.minutosFoco));
  const [minutosPausaCurta, setMinutosPausaCurta] = useState(
    String(config.minutosPausaCurta),
  );
  const [minutosPausaLonga, setMinutosPausaLonga] = useState(
    String(config.minutosPausaLonga),
  );
  const [ciclosAntesLonga, setCiclosAntesLonga] = useState(
    String(config.ciclosAntesLonga),
  );
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);

  function parsePositivo(valor) {
    const n = Number.parseInt(valor, 10);
    if (!Number.isFinite(n) || n < 1) return null;
    return n;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const dados = {
      minutosFoco: parsePositivo(minutosFoco),
      minutosPausaCurta: parsePositivo(minutosPausaCurta),
      minutosPausaLonga: parsePositivo(minutosPausaLonga),
      ciclosAntesLonga: parsePositivo(ciclosAntesLonga),
    };

    if (Object.values(dados).some((v) => v === null)) {
      setErro("Todos os campos devem ser inteiros maiores que zero.");
      return;
    }

    setEnviando(true);
    try {
      await onSalvar(dados);
    } catch {
      setErro("Erro ao salvar configuração. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleRestaurar() {
    setErro("");
    setRestaurando(true);
    try {
      await onRestaurar();
    } catch {
      setErro("Erro ao restaurar padrões. Tente novamente.");
    } finally {
      setRestaurando(false);
    }
  }

  const ocupado = enviando || restaurando;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="config-pomodoro-foco"
          label="Foco (min)"
          type="number"
          min="1"
          inputMode="numeric"
          value={minutosFoco}
          onChange={(e) => setMinutosFoco(e.target.value)}
          required
          autoFocus
        />
        <Input
          id="config-pomodoro-pausa-curta"
          label="Pausa curta (min)"
          type="number"
          min="1"
          inputMode="numeric"
          value={minutosPausaCurta}
          onChange={(e) => setMinutosPausaCurta(e.target.value)}
          required
        />
        <Input
          id="config-pomodoro-pausa-longa"
          label="Pausa longa (min)"
          type="number"
          min="1"
          inputMode="numeric"
          value={minutosPausaLonga}
          onChange={(e) => setMinutosPausaLonga(e.target.value)}
          required
        />
        <Input
          id="config-pomodoro-ciclos"
          label="Ciclos por rodada"
          type="number"
          min="1"
          inputMode="numeric"
          value={ciclosAntesLonga}
          onChange={(e) => setCiclosAntesLonga(e.target.value)}
          required
        />
      </div>

      <p className="text-xs text-text-muted">
        Após cada rodada de ciclos, a pausa longa substitui a curta.
      </p>

      {erro && <p className="text-sm text-danger text-center">{erro}</p>}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRestaurar}
          disabled={ocupado}
        >
          {restaurando ? "Restaurando..." : "Restaurar padrões"}
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancelar}
            disabled={ocupado}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={ocupado}>
            {enviando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
