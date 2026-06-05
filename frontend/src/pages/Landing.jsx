import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import Button from "../components/ui/Button.jsx";

const VIDEO_ID = "bp4_7T9J6Fg";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 lg:px-6">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-accent">||||</span> Tally
          </h1>

          <div className="flex-1" />

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-all duration-150"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <Link to="/login">
            <Button variant="ghost" size="md">
              Entrar
            </Button>
          </Link>

          <Link to="/registro" className="hidden sm:inline-flex">
            <Button variant="primary" size="md">
              Criar conta
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-12 text-center lg:pt-24 lg:pb-16">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs font-medium text-text-secondary">
            <span className="text-accent">||||</span>
            Timer · Categoria · Visualização
          </p>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Você dedicou horas estudando.
            <br />
            <span className="text-accent">Sabe pra onde elas foram?</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base text-text-secondary sm:text-lg">
            O Tally cronometra suas sessões, separa por matéria e devolve tudo
            em gráfico. Heatmap anual, distribuição por categoria, evolução
            semanal — o tempo que você investe, transformado em informação.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/registro">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Começar — é de graça
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Já tenho conta
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Sem cartão. Sem trial. Sem catch.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-16 lg:pb-24">
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-bg-elevated shadow-lg dark:border-white/[0.08]">
            <div className="relative aspect-video w-full">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0`}
                title="O que é o Tally"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-text-muted">
            Em 1 minuto, o Tally explicado.
          </p>
        </section>

        <section className="border-t border-border/60 bg-bg-elevated/40">
          <div className="mx-auto max-w-5xl px-4 py-16 lg:py-24">
            <div className="mx-auto max-w-xl text-center">
              <h3 className="text-2xl font-semibold sm:text-3xl">
                Três coisas que viviam em apps separados.{" "}
                <span className="text-accent">Agora num fluxo só.</span>
              </h3>
              <p className="mt-3 text-sm text-text-secondary sm:text-base">
                Pomodoro cronometra mas não sabe o que você estuda. Planilha
                sabe mas tem fricção demais. O Tally junta as duas pontas.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <Pilar
                numero="01"
                titulo="Cronometre"
                descricao="Timer livre ou Pomodoro, vinculados ao que você está fazendo de verdade — não a uma sessão genérica."
              />
              <Pilar
                numero="02"
                titulo="Categorize"
                descricao="Estudos → Bioquímica → 2h45. O tempo ganha contexto e deixa de ser só um número solto."
              />
              <Pilar
                numero="03"
                titulo="Visualize"
                descricao="Heatmap anual estilo GitHub, distribuição por matéria, evolução semanal. Seu mês inteiro numa tela."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 lg:py-24">
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-12">
            <Bloco
              titulo="Funciona com qualquer hábito cronometrado"
              descricao="Nasceu para estudo, mas a estrutura é genérica. Treino, leitura, prática de instrumento — qualquer coisa que tenha duração."
            />
            <Bloco
              titulo="Hábitos binários também"
              descricao="Para o que não tem cronômetro — meditar, beber água — um simples fez/não fez já entra no heatmap."
            />
            <Bloco
              titulo="Registro manual"
              descricao="Esqueceu de ligar o timer? Lança a sessão depois. Sem deixar buracos no histórico."
            />
            <Bloco
              titulo="Roda no seu navegador"
              descricao="O timer não depende do servidor. Você fecha a aba, abre de novo, e a sessão continua de onde parou."
            />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24 text-center">
          <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pare de cronometrar no vazio.
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Em poucos dias o dashboard ganha vida. Cada sessão registrada vira
            um quadrado no heatmap, uma fatia no gráfico, um número que faz
            sentido.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/registro">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Criar conta
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Entrar
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-text-muted sm:flex-row">
          <p>
            <span className="text-accent">||||</span> Tally — projeto acadêmico,
            de graça pra sempre.
          </p>
          <p>Feito para quem leva a sério o tempo que investe.</p>
        </div>
      </footer>
    </div>
  );
}

function Pilar({ numero, titulo, descricao }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-bg-elevated p-6 dark:border-white/[0.08]">
      <span className="font-mono text-xs text-accent">{numero}</span>
      <h4 className="mt-3 text-lg font-semibold text-text-primary">{titulo}</h4>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {descricao}
      </p>
    </div>
  );
}

function Bloco({ titulo, descricao }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-1 w-6 rounded-full bg-accent" />
        <h4 className="text-base font-semibold text-text-primary">{titulo}</h4>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {descricao}
      </p>
    </div>
  );
}

function SunIcon() {
  return (
    <svg
      className="w-[18px] h-[18px] animate-spin-once"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="w-[18px] h-[18px] animate-spin-once"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
      />
    </svg>
  );
}
