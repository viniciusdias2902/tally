import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import {
  heatmapQuerySchema,
  kpisQuerySchema,
  distribuicaoQuerySchema,
  evolucaoQuerySchema,
  topAtividadesQuerySchema,
} from "./dashboard.schemas.js";

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

/**
 * @swagger
 * /dashboard/kpis:
 *   get:
 *     summary: Retorna KPIs agregados (totais e streaks) do escopo informado
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
 *     responses:
 *       200:
 *         description: Totais de tempo, sessões e streaks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSegundos:
 *                   type: integer
 *                   example: 7200
 *                 totalSessoes:
 *                   type: integer
 *                   example: 5
 *                 streakAtual:
 *                   type: integer
 *                   example: 3
 *                 melhorStreak:
 *                   type: integer
 *                   example: 7
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

/**
 * @swagger
 * /dashboard/distribuicao:
 *   get:
 *     summary: Retorna distribuição de tempo no escopo informado (pasta, atividade ou categoria)
 *     description: |
 *       O nível retornado é definido pelo escopo:
 *       - Sem filtro: por pasta (atividades sem pasta agrupadas como "Sem pasta")
 *       - Com pastaId: por atividade dentro da pasta
 *       - Com atividadeId: por categoria dentro da atividade ("Sem categoria" quando aplicável)
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: pastaId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: atividadeId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Distribuição com nível e itens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nivel:
 *                   type: string
 *                   enum: [pasta, atividade, categoria]
 *                 itens:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nome:
 *                         type: string
 *                       totalSegundos:
 *                         type: integer
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

/**
 * @swagger
 * /dashboard/evolucao:
 *   get:
 *     summary: Retorna minutos por dia (em segundos) para o gráfico de evolução temporal
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: pastaId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: atividadeId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *     responses:
 *       200:
 *         description: Lista de dias com total em segundos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   data:
 *                     type: string
 *                     format: date
 *                     example: "2026-04-01"
 *                   totalSegundos:
 *                     type: integer
 *                     example: 1800
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

/**
 * @swagger
 * /dashboard/por-hora:
 *   get:
 *     summary: Retorna total de segundos agrupado por hora do dia (0-23, fuso America/Sao_Paulo)
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: pastaId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: atividadeId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Total por hora
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hora: { type: integer, minimum: 0, maximum: 23 }
 *                   totalSegundos: { type: integer }
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

/**
 * @swagger
 * /dashboard/por-dia-semana:
 *   get:
 *     summary: Retorna total de segundos agrupado por dia da semana (0=domingo)
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: pastaId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: atividadeId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Total por dia da semana
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   diaSemana: { type: integer, minimum: 0, maximum: 6 }
 *                   totalSegundos: { type: integer }
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

/**
 * @swagger
 * /dashboard/por-modo:
 *   get:
 *     summary: Retorna total de segundos e número de sessões por modo
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: pastaId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: atividadeId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Total por modo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   modo:
 *                     type: string
 *                     enum: [timer, pomodoro, manual, check_binario]
 *                   totalSegundos: { type: integer }
 *                   totalSessoes: { type: integer }
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

/**
 * @swagger
 * /dashboard/top-atividades:
 *   get:
 *     summary: Retorna as atividades com maior tempo total (escopo geral)
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 8
 *     responses:
 *       200:
 *         description: Top atividades por tempo total
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   atividadeId: { type: string, format: uuid }
 *                   nome: { type: string }
 *                   pastaNome:
 *                     type: string
 *                     nullable: true
 *                   totalSegundos: { type: integer }
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 */

export function criarDashboardRoutes(dashboardController) {
  const router = Router();

  router.get("/heatmap", validar(heatmapQuerySchema), dashboardController.heatmap);
  router.get("/kpis", validar(kpisQuerySchema), dashboardController.kpis);
  router.get(
    "/distribuicao",
    validar(distribuicaoQuerySchema),
    dashboardController.distribuicao,
  );
  router.get("/evolucao", validar(evolucaoQuerySchema), dashboardController.evolucao);
  router.get("/por-hora", validar(kpisQuerySchema), dashboardController.porHora);
  router.get(
    "/por-dia-semana",
    validar(kpisQuerySchema),
    dashboardController.porDiaSemana,
  );
  router.get("/por-modo", validar(kpisQuerySchema), dashboardController.porModo);
  router.get(
    "/top-atividades",
    validar(topAtividadesQuerySchema),
    dashboardController.topAtividades,
  );

  return router;
}
