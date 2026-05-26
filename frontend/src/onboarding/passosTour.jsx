// Descritores dos passos do tour. Cada passo é uma etapa do walkthrough
// explicativo: navega para `rota`, dá spotlight em `target` e mostra o popup.
//
// Campos:
//   rota     — caminho do react-router onde o passo acontece (sem o basename).
//   target   — seletor CSS do elemento destacado, ou "body" para popup centralizado.
//   placement— posição do popup em relação ao alvo ("center" para o meio da tela).
//   title    — título do popup.
//   content  — corpo do popup (JSX).
//
// O atributo data-tour="..." correspondente a cada `target` está marcado no JSX
// dos componentes reais (Topbar, Dashboard, Atividades).

const estiloLista = { margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.6 };

export const PASSOS = [
  {
    rota: "/",
    target: "body",
    placement: "center",
    title: "Bem-vindo ao Tally 👋",
    content: (
      <>
        <p>
          O Tally transforma o tempo que você dedica aos seus hábitos em
          gráficos. Em menos de 1 minuto eu te mostro como ele funciona.
        </p>
        <p style={{ marginTop: 10 }}>Tudo gira em torno de três camadas:</p>
        <ul style={estiloLista}>
          <li>
            <strong>Atividade</strong> — o hábito (Estudos, Exercício…)
          </li>
          <li>
            <strong>Categoria</strong> — subdivisão opcional (Bioquímica, Corrida…)
          </li>
          <li>
            <strong>Sessão</strong> — cada registro de tempo que você faz
          </li>
        </ul>
      </>
    ),
  },
  {
    rota: "/",
    target: '[data-tour="topbar"]',
    placement: "bottom",
    title: "Sua navegação",
    content: (
      <>
        <p>
          Aqui em cima você alterna entre <strong>Dashboard</strong> (suas
          análises) e <strong>Atividades</strong> (onde você cria e registra os
          hábitos).
        </p>
        <p style={{ marginTop: 10 }}>
          Também é onde você troca entre tema claro/escuro e sai da conta.
        </p>
      </>
    ),
  },
  {
    rota: "/",
    target: '[data-tour="dashboard-kpis"]',
    placement: "bottom",
    title: "Seus números",
    content: (
      <>
        <p>
          Quando você registrar sessões, aqui aparecem o <strong>tempo total</strong>,
          o número de <strong>sessões</strong> e sua <strong>sequência</strong> de
          dias seguidos ativos.
        </p>
        <p style={{ marginTop: 10 }}>
          Está tudo zerado porque sua conta é nova — vamos resolver isso já.
        </p>
      </>
    ),
  },
  {
    rota: "/",
    target: '[data-tour="dashboard-graficos"]',
    placement: "top",
    title: "Seus gráficos",
    content: (
      <p>
        Um <strong>heatmap anual</strong> estilo GitHub e a{" "}
        <strong>distribuição</strong> do seu tempo entre as atividades. Junto
        com evolução, ranking e horários, eles se preenchem sozinhos conforme
        você registra sessões.
      </p>
    ),
  },
  {
    rota: "/atividades",
    target: '[data-tour="nova-atividade"]',
    placement: "bottom",
    title: "Crie uma atividade",
    content: (
      <>
        <p>
          Tudo começa aqui. Uma <strong>atividade</strong> é um hábito que você
          quer acompanhar.
        </p>
        <p style={{ marginTop: 10 }}>Ela pode ser de dois tipos:</p>
        <ul style={estiloLista}>
          <li>
            <strong>Cronometrada</strong> — medida por tempo: timer, pomodoro
            ou manual (estudar, treinar, ler)
          </li>
          <li>
            <strong>Concluído/Pendente</strong> — medida por conclusão: só marca
            feito ou não feito (meditar, beber água)
          </li>
        </ul>
      </>
    ),
  },
  {
    rota: "/atividades",
    target: '[data-tour="gerenciar-pastas"]',
    placement: "bottom",
    title: "Organize em pastas",
    content: (
      <p>
        Opcional: agrupe atividades relacionadas em <strong>pastas</strong> (ex.:
        uma pasta “Faculdade” com Bioquímica e Anatomia). Cada pasta tem seu
        próprio dashboard.
      </p>
    ),
  },
  {
    rota: "/atividades",
    target: "body",
    placement: "center",
    title: "Registrando uma sessão",
    content: (
      <>
        <p>
          Cada atividade vira um card com o botão <strong>Registrar</strong>. Ao
          registrar uma atividade cronometrada, você escolhe o modo:
        </p>
        <ul style={estiloLista}>
          <li>
            <strong>Timer livre</strong> — cronômetro com pausa e retomada
          </li>
          <li>
            <strong>Pomodoro</strong> — ciclos de foco e pausa
          </li>
          <li>
            <strong>Manual</strong> — digita o tempo (caso esqueça de ligar)
          </li>
        </ul>
        <p style={{ marginTop: 10 }}>
          O timer roda no seu navegador. Quando você para, a sessão é salva
          automaticamente.
        </p>
      </>
    ),
  },
  {
    rota: "/atividades",
    target: "body",
    placement: "center",
    title: "Categorias e o menu do card",
    content: (
      <>
        <p>
          No menu <strong>⋮</strong> de cada card você acessa o{" "}
          <strong>Histórico</strong> de sessões, o <strong>Dashboard</strong> só
          daquela atividade e as <strong>Categorias</strong>.
        </p>
        <p style={{ marginTop: 10 }}>
          Categorias subdividem uma atividade — em Estudos, por exemplo:
          Bioquímica, Anatomia, Fisiologia. É assim que os gráficos mostram para
          onde seu tempo realmente foi.
        </p>
      </>
    ),
  },
  {
    rota: "/atividades",
    target: '[data-tour="nova-atividade"]',
    placement: "bottom",
    title: "É com você agora 🎉",
    content: (
      <p>
        Crie sua primeira atividade e comece a registrar — em poucos dias o
        dashboard ganha vida. Quer rever este tutorial? É só clicar no{" "}
        <strong>?</strong> na barra do topo.
      </p>
    ),
  },
];
