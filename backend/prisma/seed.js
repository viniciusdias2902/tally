import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";

const SENHA_HASH = await bcrypt.hash("senha1234", 12);

async function main() {
  console.log("🌱 Limpando banco...");
  await prisma.$executeRaw`TRUNCATE TABLE sessoes, config_pomodoro, categorias, atividades, usuarios CASCADE`;

  console.log("👤 Criando usuário...");
  const usuario = await prisma.usuario.create({
    data: {
      email: "teste@email.com",
      nome: "Usuário Teste",
      senhaHash: SENHA_HASH,
    },
  });

  console.log("🏃 Criando atividades...");

  const [
    faculdade,
    programacao,
    idiomas,
    concurso,
    exercicio,
    leitura,
    meditacao,
    alimentacao,
    sono,
    agua,
    journaling,
    muzica,
    // arquivadas
    cursinho,
    tcc,
    inglesBasico,
  ] = await Promise.all([
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Faculdade", tipoMedicao: "cronometrada" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Programação", tipoMedicao: "cronometrada" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Idiomas", tipoMedicao: "cronometrada" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Concurso", tipoMedicao: "cronometrada" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Exercício", tipoMedicao: "cronometrada" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Leitura", tipoMedicao: "cronometrada" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Meditação", tipoMedicao: "binaria" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Alimentação saudável", tipoMedicao: "binaria" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Dormir no horário", tipoMedicao: "binaria" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Beber 2L de água", tipoMedicao: "binaria" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Journaling", tipoMedicao: "binaria" },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Violão", tipoMedicao: "cronometrada" },
    }),
    // arquivadas
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Cursinho", tipoMedicao: "cronometrada", arquivada: true },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "TCC", tipoMedicao: "cronometrada", arquivada: true },
    }),
    prisma.atividade.create({
      data: { usuarioId: usuario.id, nome: "Inglês básico", tipoMedicao: "cronometrada", arquivada: true },
    }),
  ]);

  console.log("🏷️  Criando categorias...");
  await prisma.categoria.createMany({
    data: [
      // Faculdade
      { atividadeId: faculdade.id, nome: "Cálculo", cor: "#6366F1", ordem: 0 },
      { atividadeId: faculdade.id, nome: "Álgebra Linear", cor: "#8B5CF6", ordem: 1 },
      { atividadeId: faculdade.id, nome: "Física", cor: "#EC4899", ordem: 2 },
      { atividadeId: faculdade.id, nome: "Estruturas de Dados", cor: "#10B981", ordem: 3 },
      { atividadeId: faculdade.id, nome: "Banco de Dados", cor: "#F59E0B", ordem: 4 },
      { atividadeId: faculdade.id, nome: "Redes", cor: "#EF4444", ordem: 5 },

      // Programação
      { atividadeId: programacao.id, nome: "Projetos pessoais", cor: "#6366F1", ordem: 0 },
      { atividadeId: programacao.id, nome: "LeetCode", cor: "#F59E0B", ordem: 1 },
      { atividadeId: programacao.id, nome: "Cursos", cor: "#10B981", ordem: 2 },
      { atividadeId: programacao.id, nome: "Leitura técnica", cor: "#8B5CF6", ordem: 3 },

      // Idiomas
      { atividadeId: idiomas.id, nome: "Inglês", cor: "#3B82F6", ordem: 0 },
      { atividadeId: idiomas.id, nome: "Espanhol", cor: "#EF4444", ordem: 1 },
      { atividadeId: idiomas.id, nome: "Japonês", cor: "#EC4899", ordem: 2 },

      // Concurso
      { atividadeId: concurso.id, nome: "Português", cor: "#6366F1", ordem: 0 },
      { atividadeId: concurso.id, nome: "Raciocínio Lógico", cor: "#10B981", ordem: 1 },
      { atividadeId: concurso.id, nome: "Direito Constitucional", cor: "#F59E0B", ordem: 2 },
      { atividadeId: concurso.id, nome: "Informática", cor: "#8B5CF6", ordem: 3 },
      { atividadeId: concurso.id, nome: "Questões", cor: "#EF4444", ordem: 4 },

      // Exercício
      { atividadeId: exercicio.id, nome: "Musculação", cor: "#EF4444", ordem: 0 },
      { atividadeId: exercicio.id, nome: "Corrida", cor: "#F59E0B", ordem: 1 },
      { atividadeId: exercicio.id, nome: "Ciclismo", cor: "#10B981", ordem: 2 },
      { atividadeId: exercicio.id, nome: "Alongamento", cor: "#6366F1", ordem: 3 },

      // Leitura
      { atividadeId: leitura.id, nome: "Ficção", cor: "#8B5CF6", ordem: 0 },
      { atividadeId: leitura.id, nome: "Não-ficção", cor: "#10B981", ordem: 1 },
      { atividadeId: leitura.id, nome: "Técnico", cor: "#6366F1", ordem: 2 },
      { atividadeId: leitura.id, nome: "Filosofia", cor: "#EC4899", ordem: 3 },

      // Violão
      { atividadeId: muzica.id, nome: "Técnica", cor: "#F59E0B", ordem: 0 },
      { atividadeId: muzica.id, nome: "Repertório", cor: "#10B981", ordem: 1 },
      { atividadeId: muzica.id, nome: "Teoria musical", cor: "#6366F1", ordem: 2 },

      // Cursinho (arquivada)
      { atividadeId: cursinho.id, nome: "Matemática", cor: "#6366F1", ordem: 0 },
      { atividadeId: cursinho.id, nome: "Redação", cor: "#EC4899", ordem: 1 },
      { atividadeId: cursinho.id, nome: "Ciências da Natureza", cor: "#10B981", ordem: 2 },
      { atividadeId: cursinho.id, nome: "Ciências Humanas", cor: "#F59E0B", ordem: 3 },

      // TCC (arquivada)
      { atividadeId: tcc.id, nome: "Pesquisa", cor: "#8B5CF6", ordem: 0 },
      { atividadeId: tcc.id, nome: "Escrita", cor: "#6366F1", ordem: 1 },
      { atividadeId: tcc.id, nome: "Revisão", cor: "#10B981", ordem: 2 },
    ],
  });

  console.log("⚙️  Criando configs de pomodoro...");
  await prisma.configPomodoro.createMany({
    data: [
      {
        atividadeId: faculdade.id,
        minutosFoco: 50,
        minutosPausaCurta: 10,
        minutosPausaLonga: 30,
        ciclosAntesLonga: 3,
      },
      {
        atividadeId: programacao.id,
        minutosFoco: 60,
        minutosPausaCurta: 10,
        minutosPausaLonga: 30,
        ciclosAntesLonga: 2,
      },
      {
        atividadeId: concurso.id,
        minutosFoco: 25,
        minutosPausaCurta: 5,
        minutosPausaLonga: 15,
        ciclosAntesLonga: 4,
      },
      {
        atividadeId: idiomas.id,
        minutosFoco: 30,
        minutosPausaCurta: 5,
        minutosPausaLonga: 15,
        ciclosAntesLonga: 4,
      },
    ],
  });

  console.log("\n✅ Seed concluído!");
  console.log("─────────────────────────────────────────");
  console.log("  Email:  teste@email.com");
  console.log("  Senha:  senha1234");
  console.log("─────────────────────────────────────────");
  console.log("  Atividades ativas (12):");
  console.log("    Cronometradas:");
  console.log("    • Faculdade         — 6 categorias, pomodoro 50/10");
  console.log("    • Programação       — 4 categorias, pomodoro 60/10");
  console.log("    • Idiomas           — 3 categorias, pomodoro 30/5");
  console.log("    • Concurso          — 5 categorias, pomodoro 25/5");
  console.log("    • Exercício         — 4 categorias");
  console.log("    • Leitura           — 4 categorias");
  console.log("    • Violão            — 3 categorias");
  console.log("    Binárias:");
  console.log("    • Meditação");
  console.log("    • Alimentação saudável");
  console.log("    • Dormir no horário");
  console.log("    • Beber 2L de água");
  console.log("    • Journaling");
  console.log("  Arquivadas (3):");
  console.log("    • Cursinho          — 4 categorias");
  console.log("    • TCC               — 3 categorias");
  console.log("    • Inglês básico");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
