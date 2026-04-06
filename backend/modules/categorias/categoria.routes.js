import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import {
  criarCategoriaSchema,
  listarCategoriasSchema,
  atualizarCategoriaSchema,
  idCategoriaSchema,
  reordenarCategoriasSchema,
} from "./categoria.schemas.js";


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
