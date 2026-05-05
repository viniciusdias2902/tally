import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import {
  criarPastaSchema,
  atualizarPastaSchema,
  idPastaSchema,
} from "./pasta.schemas.js";

/**
 * @swagger
 * tags:
 *   name: Pastas
 *   description: Agrupamento opcional de atividades por pasta do usuário
 */

/**
 * @swagger
 * /pastas:
 *   post:
 *     summary: Criar nova pasta
 *     tags: [Pastas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Faculdade
 *     responses:
 *       201:
 *         description: Pasta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pasta'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       409:
 *         description: Já existe uma pasta com esse nome
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroSimples'
 *             example:
 *               erro: PASTA_JA_EXISTE
 *   get:
 *     summary: Listar pastas do usuário
 *     tags: [Pastas]
 *     responses:
 *       200:
 *         description: Lista de pastas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pasta'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

/**
 * @swagger
 * /pastas/{id}:
 *   get:
 *     summary: Buscar pasta por ID
 *     tags: [Pastas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados da pasta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pasta'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *   patch:
 *     summary: Atualizar pasta
 *     tags: [Pastas]
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
 *                 example: Saúde
 *               ordem:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *     responses:
 *       200:
 *         description: Pasta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pasta'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *       409:
 *         $ref: '#/components/responses/Conflito'
 *   delete:
 *     summary: Deletar pasta
 *     description: Atividades vinculadas perdem o vínculo (pastaId vira null), mas não são removidas.
 *     tags: [Pastas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Pasta deletada com sucesso
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */

export function criarPastaRoutes(pastaController) {
  const router = Router();

  router.post("/", validar(criarPastaSchema), pastaController.criar);
  router.get("/", pastaController.listar);
  router.get("/:id", validar(idPastaSchema), pastaController.buscar);
  router.patch("/:id", validar({ ...idPastaSchema, ...atualizarPastaSchema }), pastaController.atualizar);
  router.delete("/:id", validar(idPastaSchema), pastaController.deletar);

  return router;
}
