import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import { heatmapQuerySchema } from "./dashboard.schemas.js";

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Métricas e gráficos agregados do usuário autenticado
 */

/**
 * @swagger
 * /dashboard/heatmap:
 *   get:
 *     summary: Retorna minutos por dia para heatmap estilo GitHub
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: pastaId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtra sessões pela pasta informada
 *       - in: query
 *         name: atividadeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtra sessões pela atividade informada
 *       - in: query
 *         name: desdeDias
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 730
 *           default: 365
 *         description: Quantidade de dias para trás (incluindo hoje)
 *     responses:
 *       200:
 *         description: Lista de dias com totais em minutos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2026-04-01"
 *                   count:
 *                     type: integer
 *                     example: 90
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

export function criarDashboardRoutes(dashboardController) {
  const router = Router();

  router.get("/heatmap", validar(heatmapQuerySchema), dashboardController.heatmap);

  return router;
}
