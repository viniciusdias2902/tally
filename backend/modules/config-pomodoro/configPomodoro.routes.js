import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import {
  atividadeIdSchema,
  upsertConfigPomodoroSchema,
} from "./configPomodoro.schemas.js";

/**
 * @swagger
 * tags:
 *   name: ConfigPomodoro
 *   description: Configuração do pomodoro de uma atividade
 */

/**
 * @swagger
 * /atividades/{atividadeId}/config-pomodoro:
 *   get:
 *     summary: Buscar configuração do pomodoro
 *     tags: [ConfigPomodoro]
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Configuração do pomodoro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfigPomodoro'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *   put:
 *     summary: Criar ou atualizar configuração do pomodoro
 *     tags: [ConfigPomodoro]
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
 *             properties:
 *               minutosFoco:
 *                 type: integer
 *                 minimum: 1
 *                 default: 25
 *                 example: 25
 *               minutosPausaCurta:
 *                 type: integer
 *                 minimum: 1
 *                 default: 5
 *                 example: 5
 *               minutosPausaLonga:
 *                 type: integer
 *                 minimum: 1
 *                 default: 15
 *                 example: 15
 *               ciclosAntesLonga:
 *                 type: integer
 *                 minimum: 1
 *                 default: 4
 *                 example: 4
 *     responses:
 *       200:
 *         description: Configuração criada ou atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfigPomodoro'
 *       400:
 *         $ref: '#/components/responses/ErroValidacao'
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 *   delete:
 *     summary: Remover configuração do pomodoro
 *     tags: [ConfigPomodoro]
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Configuração removida com sucesso
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         $ref: '#/components/responses/NaoEncontrado'
 */

export function criarConfigPomodoroRoutes(configPomodoroController) {
  const router = Router({ mergeParams: true });

  router.get("/", validar(atividadeIdSchema), configPomodoroController.buscar);
  router.put("/", validar(upsertConfigPomodoroSchema), configPomodoroController.upsert);
  router.delete("/", validar(atividadeIdSchema), configPomodoroController.deletar);

  return router;
}
