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
  const estudos = await prisma.atividade.create({
    data: {
      usuarioId: usuario.id,
      nome: "Estudos",
      tipoMedicao: "cronometrada",
    },
  });

  const exercicio = await prisma.atividade.create({
    data: {
      usuarioId: usuario.id,
      nome: "Exercício",
      tipoMedicao: "cronometrada",
    },
  });

  const meditacao = await prisma.atividade.create({
    data: {
      usuarioId: usuario.id,
      nome: "Meditação",
      tipoMedicao: "binaria",
    },
  });

  const leitura = await prisma.atividade.create({
    data: {
      usuarioId: usuario.id,
      nome: "Leitura (arquivada)",
      tipoMedicao: "cronometrada",
      arquivada: true,
    },
  });

  console.log("🏷️  Criando categorias...");
  await prisma.categoria.createMany({
    data: [
      { atividadeId: estudos.id, nome: "Matemática", cor: "#6366F1", ordem: 0 },
      { atividadeId: estudos.id, nome: "Português", cor: "#EC4899", ordem: 1 },
      { atividadeId: estudos.id, nome: "Biologia", cor: "#10B981", ordem: 2 },
      { atividadeId: exercicio.id, nome: "Corrida", cor: "#F59E0B", ordem: 0 },
      { atividadeId: exercicio.id, nome: "Musculação", cor: "#EF4444", ordem: 1 },
    ],
  });

  console.log("⚙️  Criando config de pomodoro...");
  await prisma.configPomodoro.create({
    data: {
      atividadeId: estudos.id,
      minutosFoco: 25,
      minutosPausaCurta: 5,
      minutosPausaLonga: 15,
      ciclosAntesLonga: 4,
    },
  });

  console.log("\n✅ Seed concluído!");
  console.log("─────────────────────────────────");
  console.log("  Email:  teste@email.com");
  console.log("  Senha:  senha1234");
  console.log("─────────────────────────────────");
  console.log(`  Atividades criadas:`);
  console.log(`    • ${estudos.nome} (cronometrada, com categorias e pomodoro)`);
  console.log(`    • ${exercicio.nome} (cronometrada, com categorias)`);
  console.log(`    • ${meditacao.nome} (binária)`);
  console.log(`    • ${leitura.nome} (arquivada)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
