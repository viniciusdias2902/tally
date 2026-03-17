import "dotenv/config";
import express from "express";
import prisma from "./lib/prisma.js";
import { autenticar } from "./middlewares/autenticar.js";
import { tratarErro } from "./middlewares/tratarErro.js";
import { criarUsuarioRepository } from "./modules/auth/usuario.repository.js";
import { criarAuthService } from "./modules/auth/auth.service.js";
import { criarAuthController } from "./modules/auth/auth.controller.js";
import { criarAuthRoutes } from "./modules/auth/auth.routes.js";

const usuarioRepository = criarUsuarioRepository(prisma);
const authService = criarAuthService(usuarioRepository);
const authController = criarAuthController(authService);
const authRoutes = criarAuthRoutes(authController);

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use(autenticar);

app.use(tratarErro);

export default app;
