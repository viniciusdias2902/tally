import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAtividades } from "../hooks/useAtividades.js";
import { usePastas } from "../hooks/usePastas.js";
import Modal from "../components/ui/Modal.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import FormAtividade from "../components/atividades/FormAtividade.jsx";
import CardAtividade from "../components/atividades/CardAtividade.jsx";
import ModalGerenciarPastas from "../components/pastas/ModalGerenciarPastas.jsx";

export default function Atividades() {
  const { atividades, carregando, erro, criar, atualizar, arquivar, deletar, recarregar } = useAtividades();
  const { pastas, criar: criarPasta, atualizar: atualizarPasta, deletar: deletarPastaApi } = usePastas();
  const [modalAberto, setModalAberto] = useState(false);
  const [modalPastasAberto, setModalPastasAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erroAcao, setErroAcao] = useState("");

  const nomePorPastaId = useMemo(
    () => Object.fromEntries(pastas.map((p) => [p.id, p.nome])),
    [pastas],
  );

  const grupos = useMemo(() => {
    const porPasta = pastas.map((pasta) => ({
      pasta,
      atividades: atividades.filter((a) => a.pastaId === pasta.id),
    }));
    const semPasta = atividades.filter((a) => a.pastaId == null);
    return { porPasta, semPasta };
  }, [atividades, pastas]);

  async function deletarPasta(id) {
    await deletarPastaApi(id);
    await recarregar();
  }

  function abrirCriacao() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(atividade) {
    setEditando(atividade);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  async function handleSalvar(dados) {
    if (editando) {
      await atualizar(editando.id, dados);
    } else {
      await criar(dados);
    }
    fecharModal();
  }

  async function handleArquivar(id) {
    setErroAcao("");
    try {
      await arquivar(id);
    } catch {
      setErroAcao("Erro ao arquivar atividade.");
    }
  }

  async function handleDeletar(id) {
    setErroAcao("");
    try {
      await deletar(id);
    } catch (err) {
      if (err.message === "ATIVIDADE_COM_SESSOES") {
        setErroAcao("Não é possível deletar uma atividade com sessões. Arquive-a.");
      } else {
        setErroAcao("Erro ao deletar atividade.");
      }
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-danger">{erro}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Atividades</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModalPastasAberto(true)}>
            <FolderIcon /> Gerenciar pastas
          </Button>
          <Button onClick={abrirCriacao}>
            <PlusIcon /> Nova atividade
          </Button>
        </div>
      </div>

      {erroAcao && (
        <p className="text-sm text-danger mb-4 text-center">{erroAcao}</p>
      )}

      {atividades.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-text-secondary">
            Nenhuma atividade cadastrada.
          </p>
          <p className="text-xs text-text-muted mt-1">
            Crie sua primeira atividade para começar a registrar.
          </p>
        </div>
      ) : grupos.porPasta.some((g) => g.atividades.length > 0) ? (
        <div className="space-y-8">
          {grupos.porPasta.map(({ pasta, atividades: itens }) =>
            itens.length === 0 ? null : (
              <SecaoPasta
                key={pasta.id}
                titulo={pasta.nome}
                pastaId={pasta.id}
                atividades={itens}
                nomePorPastaId={nomePorPastaId}
                onEditar={abrirEdicao}
                onArquivar={handleArquivar}
                onDeletar={handleDeletar}
              />
            ),
          )}
          {grupos.semPasta.length > 0 && (
            <SecaoPasta
              titulo="Sem pasta"
              atividades={grupos.semPasta}
              nomePorPastaId={nomePorPastaId}
              onEditar={abrirEdicao}
              onArquivar={handleArquivar}
              onDeletar={handleDeletar}
            />
          )}
        </div>
      ) : (
        <GradeAtividades
          atividades={atividades}
          nomePorPastaId={nomePorPastaId}
          onEditar={abrirEdicao}
          onArquivar={handleArquivar}
          onDeletar={handleDeletar}
        />
      )}

      <Modal
        aberto={modalAberto}
        onFechar={fecharModal}
        titulo={editando ? "Editar atividade" : "Nova atividade"}
      >
        <FormAtividade
          atividade={editando}
          pastas={pastas}
          onSalvar={handleSalvar}
          onCancelar={fecharModal}
        />
      </Modal>

      <ModalGerenciarPastas
        aberto={modalPastasAberto}
        onFechar={() => setModalPastasAberto(false)}
        pastas={pastas}
        onCriar={criarPasta}
        onAtualizar={atualizarPasta}
        onDeletar={deletarPasta}
      />
    </div>
  );
}

function SecaoPasta({ titulo, pastaId, atividades, nomePorPastaId, onEditar, onArquivar, onDeletar }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          {titulo}
        </h3>
        {pastaId ? (
          <Link
            to={`/pastas/${pastaId}/dashboard`}
            className="text-xs text-text-muted hover:text-accent"
          >
            Ver dashboard →
          </Link>
        ) : null}
      </div>
      <GradeAtividades
        atividades={atividades}
        nomePorPastaId={nomePorPastaId}
        onEditar={onEditar}
        onArquivar={onArquivar}
        onDeletar={onDeletar}
      />
    </section>
  );
}

function GradeAtividades({ atividades, nomePorPastaId, onEditar, onArquivar, onDeletar }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {atividades.map((atividade) => (
        <CardAtividade
          key={atividade.id}
          atividade={atividade}
          nomePasta={atividade.pastaId ? nomePorPastaId[atividade.pastaId] : null}
          onEditar={onEditar}
          onArquivar={onArquivar}
          onDeletar={onDeletar}
        />
      ))}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}
