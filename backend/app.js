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
const categoriaService = criarCategoriaService(categoriaRepository);
const categoriaController = criarCategoriaController(categoriaService);
const categoriaRoutes = criarCategoriaRoutes(categoriaController);

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use(autenticar);

app.use("/atividades", atividadeRoutes);
app.use("/atividades/:atividadeId/categorias", categoriaRoutes);

app.use(tratarErro);

export default app;
