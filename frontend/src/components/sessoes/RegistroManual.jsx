import { useState } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";

function dataHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function horaAgora() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function RegistroManual({ onRegistrar, enviando }) {
  const [minutos, setMinutos] = useState("");
  const [data, setData] = useState(dataHoje);
  const [hora, setHora] = useState(horaAgora);
  const [observacoes, setObservacoes] = useState("");
  const [confirmacao, setConfirmacao] = useState(null);
  const [erroValidacao, setErroValidacao] = useState("");

  const minutosNum = Number(minutos);
  const valido = minutos !== "" && Number.isFinite(minutosNum) && minutosNum > 0 && data && hora;

  async function handleRegistrar(e) {
    e.preventDefault();
    setConfirmacao(null);
    setErroValidacao("");

    if (!valido) {
      setErroValidacao("Informe minutos, data e hora válidos.");
      return;
    }

    const iniciadoEm = new Date(`${data}T${hora}:00`);
    if (Number.isNaN(iniciadoEm.getTime())) {
      setErroValidacao("Data ou hora inválida.");
      return;
    }

    try {
      await onRegistrar({
        duracaoSegundos: Math.round(minutosNum * 60),
        modo: "manual",
        iniciadoEm: iniciadoEm.toISOString(),
        observacoes: observacoes.trim() || null,
      });
      setMinutos("");
      setObservacoes("");
      setConfirmacao("ok");
    } catch {
      setConfirmacao("erro");
    }
  }

  return (
    <form
      onSubmit={handleRegistrar}
      className="rounded-2xl border border-border bg-bg-elevated p-8 shadow-sm flex flex-col gap-5"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10 text-accent">
          <PencilIcon />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Registro manual</h3>
          <p className="text-xs text-text-muted">
            Para sessões que aconteceram fora do app.
          </p>
        </div>
      </div>

      <Input
        id="minutos"
        label="Duração (minutos)"
        type="number"
        min="1"
        step="1"
        inputMode="numeric"
        placeholder="Ex.: 30"
        value={minutos}
        onChange={(e) => setMinutos(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="data"
          label="Data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
        <Input
          id="hora"
          label="Hora de início"
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="observacoes" className="text-sm font-medium text-text-secondary">
          Observações <span className="text-text-muted font-normal">(opcional)</span>
        </label>
        <textarea
          id="observacoes"
          rows={3}
          maxLength={500}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Ex.: li o capítulo 3 do livro"
          className="rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-text-primary shadow-sm placeholder:text-text-muted transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
        />
      </div>

      {erroValidacao && (
        <p className="text-sm text-danger text-center">{erroValidacao}</p>
      )}

      <Button
        type="submit"
        disabled={!valido || enviando}
        size="lg"
        className="w-full"
      >
        {enviando ? "Registrando..." : "Registrar sessão"}
      </Button>

      <div className="text-center h-4 text-sm">
        {confirmacao === "ok" && (
          <span className="text-success">Sessão registrada com sucesso.</span>
        )}
        {confirmacao === "erro" && (
          <span className="text-danger">Erro ao registrar. Tente novamente.</span>
        )}
      </div>
    </form>
  );
}

function PencilIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  );
}
