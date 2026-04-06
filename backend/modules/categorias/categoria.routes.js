import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import {
  criarCategoriaSchema,
  listarCategoriasSchema,
  atualizarCategoriaSchema,
  idCategoriaSchema,
  reordenarCategoriasSchema,
} from "./categoria.schemas.js";

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Gerenciamento de categorias de uma atividade
 */

/**
 * @swagger
 * /atividades/{atividadeId}/categorias:
 *   post:
 *     summary: Criar nova categoria
 *     tags: [Categorias]
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
 *             required: [nome]
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Trabalho
 *               cor:
 *                 type: string
 *                 pattern: ^#[0-9A-Fa-f]{6}$
 *                 default: "#6366F1"
 *                 example: "#6366F1"
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *       409:
 *         description: Já existe uma categoria com esse nome nesta atividade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroSimples'
 *             example:
 *               erro: CATEGORIA_JA_EXISTE
 *   get:
 *     summary: Listar categorias da atividade
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: incluirArquivadas
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Incluir categorias arquivadas no resultado
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */

export function criarCategoriaRoutes(categoriaController) {
  const router = Router({ mergeParams: true });

  router.post("/", validar(criarCategoriaSchema), categoriaController.criar);
  router.get("/", validar(listarCategoriasSchema), categoriaController.listar);
  router.put("/:id", validar(atualizarCategoriaSchema), categoriaController.atualizar);
  router.patch("/reordenar", validar(reordenarCategoriasSchema), categoriaController.reordenar);
  router.patch("/:id/arquivar", validar(idCategoriaSchema), categoriaController.arquivar);
  router.patch("/:id/desarquivar", validar(idCategoriaSchema), categoriaController.desarquivar);
  router.delete("/:id", validar(idCategoriaSchema), categoriaController.deletar);

  return router;
}
