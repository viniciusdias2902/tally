import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import { useOnboarding } from "../onboarding/OnboardingContext.jsx";
import { useTourSessao } from "../onboarding/TourSessaoContext.jsx";

const tutoriais = [
  {
    id: "inicial",
    titulo: "Conheça o Tally",
    descricao:
      "Uma visita guiada pelas três camadas do app (atividades, categorias, sessões), pela barra de navegação e pelos gráficos do dashboard.",
    duracao: "≈ 1 minuto",
    detalhes: [
      "Explica os conceitos centrais do app",
      "Mostra onde fica cada coisa",
      "Você só lê e clica em Próximo — sem precisar criar nada",
    ],
  },
  {
    id: "sessao",
    titulo: "Crie sua primeira sessão",
    descricao:
      "Tutorial prático: você cria uma atividade, registra uma sessão de verdade e chega no dashboard daquela atividade.",
    duracao: "≈ 2 minutos",
    detalhes: [
      "Você executa cada passo de verdade",
      "O tutorial espera você fazer cada ação",
      "Termina no dashboard da atividade que você criou",
    ],
  },
];

export default function Tutoriais() {
  const { iniciar: iniciarTourInicial } = useOnboarding();
  const { iniciar: iniciarTourSessao } = useTourSessao();

  function iniciar(id) {
    if (id === "inicial") iniciarTourInicial();
    else if (id === "sessao") iniciarTourSessao();
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <section>
        <header className="mb-6">
          <h2 className="text-lg font-semibold">Tutoriais</h2>
          <p className="text-sm text-text-muted mt-1">
            Escolha um tour pra ver a qualquer momento.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutoriais.map((tutorial) => (
            <CardTutorial
              key={tutorial.id}
              tutorial={tutorial}
              onIniciar={() => iniciar(tutorial.id)}
            />
          ))}
        </div>
      </section>

      <article className="mt-16 border-t border-border pt-12">
        <header className="mb-8">
          <h2 className="text-lg font-semibold">Entenda o Tally em 5 minutos</h2>
          <p className="text-sm text-text-muted mt-1">
            Uma volta rápida pelos conceitos centrais do app.
          </p>
        </header>

        <Secao titulo="Atividades — o que você quer acompanhar">
          <p>
            Uma <strong>atividade</strong> é qualquer hábito ou área que você
            quer rastrear: estudar, treinar, ler, meditar. Tudo no Tally
            começa criando uma.
          </p>
          <p className="mt-3">Elas vêm em dois sabores:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Cronometrada</strong> — medida em tempo. Bom pra coisas
              como estudar, treinar, programar.
            </li>
            <li>
              <strong>Concluído/Pendente</strong> — só marca feito ou não
              feito no dia. Bom pra hábitos binários: meditar, beber água,
              dormir cedo.
            </li>
          </ul>
          <ImagemTutorial
            src="atividades-visao-geral.png"
            alt="Tela de Atividades com cards dos dois tipos"
            descricao="Página /atividades mostrando os cards de atividade. O ícone do relógio marca as cronometradas (Faculdade, Programação...) e o tique verde marca as concluído/pendente (Meditação, Beber 2L de água...)."
          />
        </Secao>

        <Secao titulo="Pastas — organizando atividades relacionadas">
          <p>
            Quando a lista cresce, <strong>pastas</strong> agrupam atividades
            parecidas — e cada pasta ganha o próprio dashboard com tudo dela
            somado. Opcional: atividades podem ficar soltas se você
            preferir.
          </p>
          <p className="mt-3 text-text-muted">
            Exemplo: pasta <em>Estudos</em> reúne Faculdade, Programação,
            Idiomas e Concurso. Pasta <em>Saúde</em> reúne Exercício,
            Meditação e os check-ins diários.
          </p>
          <ImagemTutorial
            src="atividades-com-pastas.png"
            alt="Atividades agrupadas em pastas"
            descricao="Mesma página /atividades, mas com foco no agrupamento por pastas (Estudos, Saúde, Hobbies). Cada seção tem o título da pasta e um link 'Ver dashboard →' do lado."
          />
        </Secao>

        <Secao titulo="Categorias — pra onde seu tempo foi">
          <p>
            <strong>Categorias</strong> subdividem uma atividade. "Faculdade",
            por exemplo, vira Cálculo, Álgebra Linear, Física, Estruturas de
            Dados... cada uma com sua cor.
          </p>
          <p className="mt-3">
            Ao registrar uma sessão, você escolhe a categoria — e o gráfico de
            distribuição mostra exatamente pra onde seu tempo foi dentro
            daquela atividade.
          </p>
          <ImagemTutorial
            src="categorias-faculdade.png"
            alt="Tela de categorias de uma atividade"
            descricao="Vá no menu (três pontinhos) do card 'Faculdade', clique em 'Categorias'. Tire o print da página /atividades/<id>/categorias mostrando as 6 categorias coloridas (Cálculo, Álgebra Linear, Física, Estruturas de Dados, Banco de Dados, Redes)."
          />
        </Secao>

        <Secao titulo="Sessões — cada registro alimenta os gráficos">
          <p>
            Toda <strong>sessão</strong> que você registra vira ponto nos
            gráficos. Em atividades cronometradas, você escolhe um modo:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Timer</strong> — cronômetro com pausa e retomada. O
              clássico.
            </li>
            <li>
              <strong>Pomodoro</strong> — ciclos de foco e pausa
              configuráveis por atividade.
            </li>
            <li>
              <strong>Manual</strong> — você digita o tempo (caso esqueça de
              ligar o timer).
            </li>
          </ul>
          <p className="mt-3">
            Em atividades concluído/pendente, é mais simples: um botão por
            dia, feito ou não feito.
          </p>
          <ImagemTutorial
            src="registrar-sessao.png"
            alt="Tela de registrar uma sessão cronometrada"
            descricao="Em qualquer atividade cronometrada (ex.: Faculdade), clique em 'Registrar' no card. Tire print de /atividades/<id>/registrar mostrando o seletor de categoria, o seletor de modo (Timer/Pomodoro/Manual) e o painel do modo ativo."
          />
        </Secao>

        <Secao titulo="Dashboards — seus dados em gráficos">
          <p>
            Os <strong>dashboards</strong> são onde tudo vira gráfico. Eles
            existem em três níveis:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Geral</strong> (a página inicial) — soma todas as suas
              atividades.
            </li>
            <li>
              <strong>Por pasta</strong> — só a pasta selecionada.
            </li>
            <li>
              <strong>Por atividade</strong> — uma única atividade, com a
              quebra por categoria.
            </li>
          </ul>
          <p className="mt-3">
            Em todos eles você encontra: KPIs (tempo total, sessões,
            sequência de dias ativos), heatmap anual estilo GitHub, evolução
            dos últimos 30 dias, distribuição por categoria, e padrões por
            hora do dia e dia da semana.
          </p>
          <ImagemTutorial
            src="dashboard-geral.png"
            alt="Dashboard principal com gráficos"
            descricao="Página inicial (/) depois de logar com teste@email.com. O print precisa pegar os KPIs no topo, o heatmap anual, o donut de distribuição e o gráfico de evolução."
          />
          <ImagemTutorial
            src="dashboard-atividade.png"
            alt="Dashboard de uma atividade específica"
            descricao="Menu (três pontinhos) → Dashboard de uma atividade cronometrada (Faculdade ou Programação rendem bem). Tire o print de /atividades/<id>/dashboard mostrando especialmente a distribuição por categoria (donut) e o heatmap."
          />
        </Secao>
      </article>
    </div>
  );
}

function CardTutorial({ tutorial, onIniciar }) {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-bg-elevated p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-text-primary">
          {tutorial.titulo}
        </h3>
        <span className="text-xs text-text-muted whitespace-nowrap">
          {tutorial.duracao}
        </span>
      </div>

      <p className="text-sm text-text-secondary mb-4">{tutorial.descricao}</p>

      <ul className="space-y-1.5 mb-6">
        {tutorial.detalhes.map((detalhe) => (
          <li
            key={detalhe}
            className="flex items-start gap-2 text-sm text-text-secondary"
          >
            <CheckIcon />
            <span>{detalhe}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Button onClick={onIniciar} className="w-full">
          Iniciar tutorial
        </Button>
      </div>
    </section>
  );
}

function Secao({ titulo, children }) {
  return (
    <section className="mb-10 last:mb-0">
      <h3 className="text-base font-semibold text-text-primary mb-3">
        {titulo}
      </h3>
      <div className="text-sm text-text-secondary leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function ImagemTutorial({ src, alt, descricao }) {
  const [erro, setErro] = useState(false);
  const url = `${import.meta.env.BASE_URL}tutoriais/${src}`;

  if (erro) {
    return (
      <figure className="mt-5 rounded-2xl border-2 border-dashed border-border bg-bg-secondary/40 p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <PicIcon />
          <p className="text-sm font-medium text-text-secondary">
            Adicione a imagem em{" "}
            <code className="font-mono text-xs text-accent">
              frontend/public/tutoriais/{src}
            </code>
          </p>
          <p className="text-xs text-text-muted max-w-xl">{descricao}</p>
        </div>
      </figure>
    );
  }

  return (
    <figure className="mt-5">
      <img
        src={url}
        alt={alt}
        onError={() => setErro(true)}
        className="w-full rounded-2xl border border-border shadow-sm"
      />
      <figcaption className="mt-2 text-xs text-text-muted text-center">
        {alt}
      </figcaption>
    </figure>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 mt-0.5 text-accent shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function PicIcon() {
  return (
    <svg
      className="w-8 h-8 text-text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}
