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

const usuarioRepository = criarUsuarioRepository(prisma);
const authService = criarAuthService(usuarioRepository);
const authController = criarAuthController(authService);
const authRoutes = criarAuthRoutes(authController);

const atividadeRepository = criarAtividadeRepository(prisma);
const atividadeService = criarAtividadeService(atividadeRepository);
const atividadeController = criarAtividadeController(atividadeService);
const atividadeRoutes = criarAtividadeRoutes(atividadeController);

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use(autenticar);

app.use("/atividades", atividadeRoutes);

app.use(tratarErro);

export default app;
