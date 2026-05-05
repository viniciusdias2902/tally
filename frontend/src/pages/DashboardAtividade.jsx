import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as atividadesApi from "../api/atividades.js";
import * as pastasApi from "../api/pastas.js";

export default function DashboardAtividade() {
  const { atividadeId } = useParams();
  const [atividade, setAtividade] = useState(null);
  const [pasta, setPasta] = useState(null);

  useEffect(() => {
    let cancelado = false;
    atividadesApi
      .buscar(atividadeId)
      .then((dados) => {
        if (cancelado) return;
        setAtividade(dados);
        if (dados.pastaId) {
          return pastasApi.buscar(dados.pastaId).then((p) => {
            if (!cancelado) setPasta(p);
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [atividadeId]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {pasta ? (
          <Link
            to={`/pastas/${pasta.id}/dashboard`}
            className="text-sm text-text-muted hover:text-accent"
          >
            ← {pasta.nome}
          </Link>
        ) : (
          <Link to="/" className="text-sm text-text-muted hover:text-accent">
            ← Dashboard geral
          </Link>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold">
          {atividade ? atividade.nome : "Carregando…"}
        </h2>
        {pasta ? (
          <p className="text-sm text-text-muted">{pasta.nome}</p>
        ) : null}
      </div>
    </div>
  );
}
