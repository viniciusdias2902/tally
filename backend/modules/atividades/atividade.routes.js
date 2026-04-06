import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import {
  criarAtividadeSchema,
  atualizarAtividadeSchema,
  listarAtividadesSchema,
  idAtividadeSchema,
} from "./atividade.schemas.js";

/**
 * @swagger
 * tags:
 *   name: Atividades
 *   description: Gerenciamento de atividades do usuário
 */

/**
 * @swagger
 * /atividades:
 *   post:
 *     summary: Criar nova atividade
 *     tags: [Atividades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, tipoMedicao]
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Leitura
 *               tipoMedicao:
 *                 $ref: '#/components/schemas/TipoMedicao'
 *     responses:
 *       201:
 *         description: Atividade criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Atividade'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       409:
 *         description: Já existe uma atividade com esse nome
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroSimples'
 *             example:
 *               erro: ATIVIDADE_JA_EXISTE
 *   get:
 *     summary: Listar atividades do usuário
 *     tags: [Atividades]
 *     parameters:
 *       - in: query
 *         name: incluirArquivadas
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Incluir atividades arquivadas no resultado
 *     responses:
 *       200:
 *         description: Lista de atividades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Atividade'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

/**
 * @swagger
 * /atividades/{id}:
 *   get:
 *     summary: Buscar atividade por ID
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados da atividade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Atividade'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *   patch:
 *     summary: Atualizar nome da atividade
 *     tags: [Atividades]
 *     parameters:
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
 *               nome:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Leitura Diária
 *     responses:
 *       200:
 *         description: Atividade atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Atividade'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *       409:
 *         $ref: '#/components/responses/Conflito'
 *   delete:
 *     summary: Deletar atividade
 *     description: Não é possível deletar uma atividade que possua sessões registradas.
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Atividade deletada com sucesso
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *       409:
 *         description: Atividade possui sessões e não pode ser deletada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroSimples'
 *             example:
 *               erro: ATIVIDADE_COM_SESSOES
 */

/**
 * @swagger
 * /atividades/{id}/arquivar:
 *   patch:
 *     summary: Arquivar atividade
 *     description: Arquiva a atividade e todas as suas categorias.
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Atividade arquivada com sucesso
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */

export function criarAtividadeRoutes(atividadeController) {
  const router = Router();

  router.post("/", validar(criarAtividadeSchema), atividadeController.criar);
  router.get("/", validar(listarAtividadesSchema), atividadeController.listar);
  router.get("/:id", validar(idAtividadeSchema), atividadeController.buscar);
  router.patch("/:id", validar({ ...idAtividadeSchema, ...atualizarAtividadeSchema }), atividadeController.atualizar);
  router.patch("/:id/arquivar", validar(idAtividadeSchema), atividadeController.arquivar);
  router.delete("/:id", validar(idAtividadeSchema), atividadeController.deletar);

  return router;
}
