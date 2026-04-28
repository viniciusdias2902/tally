import MenuKebab from "../ui/MenuKebab.jsx";
import { formatarDuracao } from "../../utils/formatarDuracao.js";
import { formatarDataRelativa } from "../../utils/formatarDataRelativa.js";

const ROTULOS_MODO = {
  timer: "Timer",
  pomodoro: "Pomodoro",
  manual: "Manual",
  check_binario: "Concluída",
};

export default function CardSessao({ sessao, onDeletar }) {
  const Icone = ICONE_POR_MODO[sessao.modo] ?? ClockIcon;
  const ehBinaria = sessao.modo === "check_binario";

  return (
    <div className="flex items-start gap-4 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-bg-elevated p-4 shadow-sm transition-all duration-150 hover:shadow-md">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-bg-secondary text-text-secondary shrink-0">
        <Icone />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">
          {formatarDataRelativa(sessao.iniciadoEm)}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted flex-wrap">
          <span className="font-mono tabular-nums">
            {ehBinaria ? "—" : formatarDuracao(sessao.duracaoSegundos)}
          </span>
          {sessao.categoria && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: sessao.categoria.cor }}
                aria-hidden="true"
              />
              {sessao.categoria.nome}
            </span>
          )}
          <span>{ROTULOS_MODO[sessao.modo] ?? sessao.modo}</span>
          {sessao.ciclosPomodoro != null && sessao.ciclosPomodoro > 0 && (
            <span>
              {sessao.ciclosPomodoro} ciclo{sessao.ciclosPomodoro === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {sessao.observacoes && (
          <p className="mt-2 text-xs italic text-text-secondary line-clamp-3 break-words">
            {sessao.observacoes}
          </p>
        )}
      </div>

      <MenuKebab>
        <button
          type="button"
          onClick={() => onDeletar(sessao)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors duration-150 cursor-pointer"
        >
          <TrashIcon /> Deletar
        </button>
      </MenuKebab>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

function TomatoIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c-3.5 0-6 2.5-6 6 0 4 3 7 6 7s6-3 6-7c0-3.5-2.5-6-6-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 5c.5-1 1.5-2 3-2M14 6l-1-2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

const ICONE_POR_MODO = {
  timer: ClockIcon,
  pomodoro: TomatoIcon,
  check_binario: CheckIcon,
  manual: PencilIcon,
};
