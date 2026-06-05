import { useState } from "react";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";

const TIPOS_MEDICAO = [
  { value: "cronometrada", label: "Cronometrada" },
  { value: "binaria", label: "Concluído/Pendente" },
];

export default function FormAtividade({ atividade, pastas = [], onSalvar, onCancelar }) {
  const editando = Boolean(atividade);
  const [nome, setNome] = useState(atividade?.nome ?? "");
  const [tipoMedicao, setTipoMedicao] = useState(atividade?.tipoMedicao ?? "cronometrada");
  const [pastaId, setPastaId] = useState(atividade?.pastaId ?? "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const pastaIdFinal = pastaId || null;
      if (editando) {
        await onSalvar({ nome, pastaId: pastaIdFinal });
      } else {
        await onSalvar({ nome, tipoMedicao, pastaId: pastaIdFinal });
      }
    } catch (err) {
      if (err.message === "ATIVIDADE_JA_EXISTE") {
        setErro("Já existe uma atividade com esse nome.");
      } else {
        setErro("Erro ao salvar atividade. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-tour="form-atividade"
    >
      <Input
        id="nome-atividade"
        label="Nome"
        placeholder="Ex: Leitura, Exercícios..."
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        maxLength={100}
        autoFocus
      />

      {!editando && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">
            Tipo de medição
          </label>
          <div className="flex gap-2">
            {TIPOS_MEDICAO.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTipoMedicao(value)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
                  tipoMedicao === value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-input-bg text-text-secondary hover:border-accent/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-muted">
            {tipoMedicao === "cronometrada"
              ? "Medida por tempo (timer, pomodoro ou manual)."
              : "Medida por conclusão (feito ou não feito)."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pasta-atividade" className="text-sm font-medium text-text-secondary">
          Pasta
        </label>
        <select
          id="pasta-atividade"
          value={pastaId}
          onChange={(e) => setPastaId(e.target.value)}
          className="rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-text-primary shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent cursor-pointer"
        >
          <option value="">— Sem pasta —</option>
          {pastas.map((pasta) => (
            <option key={pasta.id} value={pasta.id}>
              {pasta.nome}
            </option>
          ))}
        </select>
      </div>

      {erro && <p className="text-sm text-danger text-center">{erro}</p>}

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={enviando || !nome.trim()}
          data-tour="botao-criar-atividade"
        >
          {enviando ? "Salvando..." : editando ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
