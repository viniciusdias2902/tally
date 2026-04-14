import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import prisma from "./lib/prisma.js";
import { swaggerSpec } from "./lib/swagger.js";
import { autenticar } from "./middlewares/autenticar.js";
import { tratarErro } from "./middlewares/tratarErro.js";
import { criarUsuarioRepository } from "./modules/auth/usuario.repository.js";
import { criarAuthService } from "./modules/auth/auth.service.js";
import { criarAuthController } from "./modules/auth/auth.controller.js";
import { criarAuthRoutes } from "./modules/auth/auth.routes.js";
import { criarAtividadeRepository } from "./modules/atividades/atividade.repository.js";
import { criarAtividadeService } from "./modules/atividades/atividade.service.js";
import { criarAtividadeController } from "./modules/atividades/atividade.controller.js";
import { criarAtividadeRoutes } from "./modules/atividades/atividade.routes.js";
import { criarCategoriaRepository } from "./modules/categorias/categoria.repository.js";
import { criarCategoriaService } from "./modules/categorias/categoria.service.js";
import { criarCategoriaController } from "./modules/categorias/categoria.controller.js";
import { criarCategoriaRoutes } from "./modules/categorias/categoria.routes.js";
import { criarSessaoRepository } from "./modules/sessao/sessao.repository.js";
import { criarSessaoService } from "./modules/sessao/sessao.service.js";
import { criarSessaoController } from "./modules/sessao/sessao.controller.js";
import { criarSessaoRoutes } from "./modules/sessao/sessao.routes.js";
import { criarConfigPomodoroRepository } from "./modules/config-pomodoro/configPomodoro.repository.js";
import { criarConfigPomodoroService } from "./modules/config-pomodoro/configPomodoro.service.js";
import { criarConfigPomodoroController } from "./modules/config-pomodoro/configPomodoro.controller.js";
import { criarConfigPomodoroRoutes } from "./modules/config-pomodoro/configPomodoro.routes.js";

// --- Auth ---
const usuarioRepository = criarUsuarioRepository(prisma);
const authService = criarAuthService(usuarioRepository);
const authController = criarAuthController(authService);
const authRoutes = criarAuthRoutes(authController);

// --- Atividades ---
const atividadeRepository = criarAtividadeRepository(prisma);
const atividadeService = criarAtividadeService(atividadeRepository);
const atividadeController = criarAtividadeController(atividadeService);
const atividadeRoutes = criarAtividadeRoutes(atividadeController);

// --- Categorias ---
const categoriaRepository = criarCategoriaRepository(prisma);
const categoriaService = criarCategoriaService(categoriaRepository, atividadeService);
const categoriaController = criarCategoriaController(categoriaService);
const categoriaRoutes = criarCategoriaRoutes(categoriaController);

// --- Sessões ---
const sessaoRepository = criarSessaoRepository(prisma);
const sessaoService = criarSessaoService(sessaoRepository, atividadeService, categoriaService);
const sessaoController = criarSessaoController(sessaoService);
const sessaoRoutes = criarSessaoRoutes(sessaoController);

// --- Config Pomodoro ---
const configPomodoroRepository = criarConfigPomodoroRepository(prisma);
const configPomodoroService = criarConfigPomodoroService(configPomodoroRepository, atividadeService);
const configPomodoroController = criarConfigPomodoroController(configPomodoroService);
const configPomodoroRoutes = criarConfigPomodoroRoutes(configPomodoroController);

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api-docs", (_req, res) => {
  const base = process.env.API_BASE_URL || "";
  res.redirect(301, `${base}/api-docs/`);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use(autenticar);

app.use("/atividades", atividadeRoutes);
app.use("/atividades/:atividadeId/categorias", categoriaRoutes);
app.use("/atividades/:atividadeId/sessoes", sessaoRoutes);
app.use("/atividades/:atividadeId/config-pomodoro", configPomodoroRoutes);

app.use(tratarErro);

export default app;
