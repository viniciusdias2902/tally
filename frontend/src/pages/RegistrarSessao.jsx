import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as atividadesApi from "../api/atividades.js";
import { useCategorias } from "../hooks/useCategorias.js";
import { useModoCronometrado } from "../hooks/useModoCronometrado.js";
import { useRegistroSessao } from "../hooks/useRegistroSessao.js";
import Spinner from "../components/ui/Spinner.jsx";
import SeletorCategoria from "../components/sessoes/SeletorCategoria.jsx";
import RegistroBinario from "../components/sessoes/RegistroBinario.jsx";
import RegistroCronometrado from "../components/sessoes/RegistroCronometrado.jsx";
import RegistroPomodoro from "../components/sessoes/RegistroPomodoro.jsx";
import SeletorModoCronometrado from "../components/sessoes/SeletorModoCronometrado.jsx";

export default function RegistrarSessao() {
  const { atividadeId } = useParams();
  const [atividade, setAtividade] = useState(null);
  const [erroAtividade, setErroAtividade] = useState(null);
  const [categoriaId, setCategoriaId] = useState(null);

  const { categorias, carregando: carregandoCategorias } =
    useCategorias(atividadeId);
  const { registrar, enviando } = useRegistroSessao(atividadeId);
  const { modo, setModo } = useModoCronometrado();

  useEffect(() => {
    let cancelado = false;
    atividadesApi
      .buscar(atividadeId)
      .then((dados) => {
        if (!cancelado) setAtividade(dados);
      })
      .catch((err) => {
        if (!cancelado) setErroAtividade(err.message);
      });
    return () => {
      cancelado = true;
    };
  }, [atividadeId]);

  async function handleRegistrar(dados) {
    return registrar({ ...dados, categoriaId });
  }

  if (erroAtividade) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-danger">{erroAtividade}</p>
      </div>
    );
  }

  if (!atividade || carregandoCategorias) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const ehBinaria = atividade.tipoMedicao === "binaria";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/atividades"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors duration-150 mb-2"
        >
          <ChevronLeftIcon />
          Atividades
        </Link>
        <div>
          <h2 className="text-lg font-semibold">Registrar sessão</h2>
          <p className="text-xs text-text-muted truncate">{atividade.nome}</p>
        </div>
      </div>

      <div className="space-y-6">
        <SeletorCategoria
          categorias={categorias}
          valor={categoriaId}
          onMudar={setCategoriaId}
        />

        {ehBinaria ? (
          <RegistroBinario onRegistrar={handleRegistrar} enviando={enviando} />
        ) : (
          <>
            <SeletorModoCronometrado modo={modo} onMudar={setModo} />
            <div key={modo} className="animate-fade-slide-in">
              {modo === "pomodoro" ? (
                <RegistroPomodoro
                  chave={atividadeId}
                  onRegistrar={handleRegistrar}
                  enviando={enviando}
                />
              ) : (
                <RegistroCronometrado
                  chave={atividadeId}
                  onRegistrar={handleRegistrar}
                  enviando={enviando}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
