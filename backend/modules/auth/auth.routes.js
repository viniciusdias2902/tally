import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import { autenticar } from "../../middlewares/autenticar.js";
import { registrarSchema, loginSchema, refreshSchema } from "./auth.schemas.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e gerenciamento de sessão
 */

/**
 * @swagger
 * /auth/registrar:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, nome, senha]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@exemplo.com
 *               nome:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: João Silva
 *               senha:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 72
 *                 example: senhaSegura123
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       409:
 *         description: E-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroSimples'
 *             example:
 *               erro: EMAIL_JA_EXISTE
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@exemplo.com
 *               senha:
 *                 type: string
 *                 example: senhaSegura123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroSimples'
 *             example:
 *               erro: CREDENCIAIS_INVALIDAS
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens renovados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         description: Refresh token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroSimples'
 *             example:
 *               erro: REFRESH_TOKEN_INVALIDO
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Encerrar sessão do usuário
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Logout realizado com sucesso
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

export function criarAuthRoutes(authController) {
  const router = Router();

  router.post("/registrar", validar(registrarSchema), authController.registrar);
  router.post("/login", validar(loginSchema), authController.login);
  router.post("/refresh", validar(refreshSchema), authController.refresh);
  router.post("/logout", autenticar, authController.logout);

  return router;
}
