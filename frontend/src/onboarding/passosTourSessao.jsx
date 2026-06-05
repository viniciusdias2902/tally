// Passos do tour "guiado por ação": o usuário cria uma atividade,
// registra uma sessão e é levado ao dashboard daquela atividade.
//
// Cada passo de ação fica esperando o usuário realmente clicar/preencher
// antes de avançar. Enquanto algum modal está aberto, o tour fica em
// silêncio — o modal já é o foco visual natural.
//
// Campos extras (interpretados em `TourSessaoContext.jsx`):
//   rota         — caminho fixo para navegar antes do passo.
//   rotaDinamica — fn(state) que retorna a rota (depende do ID capturado).
//   aguardar     — descritor de como detectar a conclusão da ação:
//     { tipo: "evento", nome: "tally:atividade-criada", capturar?: "novaAtividadeId" }
//     { tipo: "rota",   padrao: /regex/ }
//     { tipo: "dom",    seletor: "..." }

const estiloLista = { margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.6 };

export function passosTourSessao({ novaAtividadeId }) {
  return [
    {
      rota: "/atividades",
      target: "body",
      placement: "center",
      title: "Bora criar sua primeira sessão",
      content: (
        <>
          <p>
            Em três passos: criar uma <strong>atividade</strong>, registrar
            uma <strong>sessão</strong> e abrir o <strong>dashboard</strong>{" "}
            dela.
          </p>
          <p style={{ marginTop: 10 }}>
            Eu vou esperar você fazer cada ação. Clique em{" "}
            <strong>Próximo</strong> pra começar.
          </p>
        </>
      ),
    },
    {
      rota: "/atividades",
      target: '[data-tour="nova-atividade"]',
      placement: "bottom",
      title: "1. Crie uma atividade",
      content: (
        <>
          <p>
            Clique em <strong>Nova atividade</strong> e preencha o formulário:
          </p>
          <ul style={estiloLista}>
            <li>
              <strong>Nome</strong> (ex.: "Leitura")
            </li>
            <li>
              <strong>Tipo</strong> — recomendo <strong>Cronometrada</strong>{" "}
              pra essa demo
            </li>
          </ul>
          <p style={{ marginTop: 10 }}>
            Quando clicar em <strong>Criar</strong>, o tour continua sozinho.
          </p>
        </>
      ),
      aguardar: {
        tipo: "evento",
        nome: "tally:atividade-criada",
        capturar: "novaAtividadeId",
      },
    },
    {
      rota: "/atividades",
      target: novaAtividadeId
        ? `[data-atividade-id="${novaAtividadeId}"] [data-tour="botao-registrar"]`
        : '[data-tour="botao-registrar"]',
      placement: "bottom",
      title: "2. Registre uma sessão",
      content: (
        <p>
          Sua atividade está aí. Clique em <strong>Registrar</strong> pra
          começar a primeira sessão.
        </p>
      ),
      aguardar: {
        tipo: "rota",
        padrao: /^\/atividades\/[^/]+\/registrar$/,
      },
    },
    {
      // já estamos em /atividades/:id/registrar — sem navegação
      target: '[data-tour="painel-registro"]',
      placement: "auto",
      title: "Faça a sessão",
      content: (
        <p>
          Escolha um modo (recomendo <strong>Manual</strong> pra demo
          rápida), preencha e clique em <strong>Registrar</strong> — eu te
          levo ao dashboard quando terminar.
        </p>
      ),
      aguardar: { tipo: "evento", nome: "tally:sessao-criada" },
    },
    {
      target: "body",
      placement: "center",
      title: "3. Eis o dashboard!",
      content: (
        <>
          <p>
            Esse é o <strong>dashboard</strong> só dessa atividade. Conforme
            você registra mais sessões, os gráficos vão ganhando vida.
          </p>
          <p style={{ marginTop: 10 }}>
            Você consegue voltar aqui pelo menu <strong>⋮</strong> do card da
            atividade.
          </p>
        </>
      ),
      rotaDinamica: ({ novaAtividadeId }) =>
        novaAtividadeId ? `/atividades/${novaAtividadeId}/dashboard` : null,
    },
  ];
}
