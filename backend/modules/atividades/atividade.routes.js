import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import {
  criarAtividadeSchema,
  atualizarAtividadeSchema,
  listarAtividadesSchema,
  idAtividadeSchema,
} from "./atividade.schemas.js";

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
