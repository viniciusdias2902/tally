import { useState } from "react";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";

const CORES_PADRAO = [
  "#6366F1",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
];

export default function FormCategoria({ categoria, onSalvar, onCancelar }) {
  const editando = Boolean(categoria);
  const [nome, setNome] = useState(categoria?.nome ?? "");
  const [cor, setCor] = useState(categoria?.cor ?? CORES_PADRAO[0]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await onSalvar({ nome, cor });
    } catch (err) {
      if (err.message === "CATEGORIA_JA_EXISTE") {
        setErro("Já existe uma categoria com esse nome nesta atividade.");
      } else {
        setErro("Erro ao salvar categoria. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="nome-categoria"
        label="Nome"
        placeholder="Ex: Trabalho, Estudos..."
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        maxLength={100}
        autoFocus
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">Cor</label>
        <div className="flex flex-wrap gap-2">
          {CORES_PADRAO.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCor(c)}
              aria-label={`Selecionar cor ${c}`}
              className={`h-8 w-8 rounded-full border-2 transition-all duration-150 cursor-pointer ${
                cor === c
                  ? "border-text-primary scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label
            className="relative h-8 w-8 rounded-full border-2 border-border bg-bg-secondary cursor-pointer flex items-center justify-center text-text-muted hover:border-accent/40 transition-all duration-150"
            title="Cor personalizada"
          >
            <input
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value.toUpperCase())}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <PlusIcon />
          </label>
        </div>
        <p className="text-xs text-text-muted">Selecione ou personalize.</p>
      </div>

      {erro && <p className="text-sm text-danger text-center">{erro}</p>}

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando || !nome.trim()}>
          {enviando ? "Salvando..." : editando ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}

function PlusIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
