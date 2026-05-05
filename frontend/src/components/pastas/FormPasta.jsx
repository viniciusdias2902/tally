import { useState } from "react";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";

export default function FormPasta({ pasta, onSalvar, onCancelar }) {
  const editando = Boolean(pasta);
  const [nome, setNome] = useState(pasta?.nome ?? "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await onSalvar({ nome });
    } catch (err) {
      if (err.message === "PASTA_JA_EXISTE") {
        setErro("Já existe uma pasta com esse nome.");
      } else {
        setErro("Erro ao salvar pasta. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="nome-pasta"
        label="Nome"
        placeholder="Ex: Estudos, Saúde..."
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        maxLength={100}
        autoFocus
      />

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
