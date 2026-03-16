import "dotenv/config";
import express from "express";
import prisma from "./lib/prisma.js";
import { autenticar } from "./middlewares/autenticar.js";
import { tratarErro } from "./middlewares/tratarErro.js";
import { criarUsuarioRepositorio } from "./modules/auth/usuario.repositorio.js";
import { criarAuthServico } from "./modules/auth/auth.servico.js";
import { criarAuthController } from "./modules/auth/auth.controller.js";
import { criarAuthRoutes } from "./modules/auth/auth.routes.js";

const usuarioRepositorio = criarUsuarioRepositorio(prisma);
const authServico = criarAuthServico(usuarioRepositorio);
const authController = criarAuthController(authServico);
const authRoutes = criarAuthRoutes(authController);

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use(autenticar);

app.use(tratarErro);

export default app;
