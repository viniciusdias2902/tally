import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as pastasApi from "../api/pastas.js";

export default function DashboardPasta() {
  const { pastaId } = useParams();
  const [pasta, setPasta] = useState(null);

  useEffect(() => {
    let cancelado = false;
    pastasApi
      .buscar(pastaId)
      .then((dados) => {
        if (!cancelado) setPasta(dados);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [pastaId]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/"
          className="text-sm text-text-muted hover:text-accent"
        >
          ← Dashboard geral
        </Link>
      </div>
      <h2 className="text-lg font-semibold">
        {pasta ? pasta.nome : "Carregando…"}
      </h2>
    </div>
  );
}
