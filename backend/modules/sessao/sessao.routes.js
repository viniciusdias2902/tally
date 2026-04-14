import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import {
  atividadeIdSchema,
  idSessaoSchema,
  criarSessaoSchema,
  listarSessoesSchema,
  atualizarSessaoSchema,
} from "./sessao.schemas.js";

/**
 * @swagger
 * tags:
 *   name: Sessões
 *   description: Gerenciamento de sessões de uma atividade
 */

/**
 * @swagger
 * /atividades/{atividadeId}/sessoes:
 *   post:
 *     summary: Criar nova sessão
 *     tags: [Sessões]
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [iniciadoEm, duracaoSegundos, modo]
 *             properties:
 *               categoriaId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               iniciadoEm:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-08T10:00:00Z"
 *               duracaoSegundos:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1500
 *               modo:
 *                 type: string
 *                 enum: [timer, pomodoro, manual, check_binario]
 *                 example: timer
 *               ciclosPomodoro:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *               observacoes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Sessão criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sessao'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *   get:
 *     summary: Listar sessões da atividade
 *     tags: [Sessões]
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por categoria
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cursor para paginação
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número de resultados por página
 *     responses:
 *       200:
 *         description: Lista de sessões
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sessao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */

/**
 * @swagger
 * /atividades/{atividadeId}/sessoes/duracao:
 *   get:
 *     summary: Somar duração total das sessões
 *     tags: [Sessões]
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Duração total em segundos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSegundos:
 *                   type: integer
 *                   example: 10800
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */

/**
 * @swagger
 * /atividades/{atividadeId}/sessoes/{id}:
 *   get:
 *     summary: Buscar sessão por ID
 *     tags: [Sessões]
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sessão encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sessao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *   put:
 *     summary: Atualizar sessão
 *     tags: [Sessões]
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoriaId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               iniciadoEm:
 *                 type: string
 *                 format: date-time
 *               duracaoSegundos:
 *                 type: integer
 *                 minimum: 0
 *               modo:
 *                 type: string
 *                 enum: [timer, pomodoro, manual, check_binario]
 *               ciclosPomodoro:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *               observacoes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Sessão atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sessao'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *   delete:
 *     summary: Deletar sessão
 *     tags: [Sessões]
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Sessão deletada com sucesso
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */

export function criarSessaoRoutes(sessaoController) {
  const router = Router({ mergeParams: true });

  router.post("/", validar(criarSessaoSchema), sessaoController.criar);
  router.get("/", validar(listarSessoesSchema), sessaoController.listar);
  router.get("/duracao", validar(atividadeIdSchema), sessaoController.somarDuracao);
  router.get("/:id", validar(idSessaoSchema), sessaoController.buscar);
  router.put("/:id", validar(atualizarSessaoSchema), sessaoController.atualizar);
  router.delete("/:id", validar(idSessaoSchema), sessaoController.deletar);

  return router;
}
