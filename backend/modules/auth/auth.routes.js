import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import { registrarSchema, loginSchema, refreshSchema } from "./auth.schemas.js";

export function criarAuthRoutes(authController) {
  const router = Router();

  router.post("/registrar", validar(registrarSchema), authController.registrar);
  router.post("/login", validar(loginSchema), authController.login);
  router.post("/refresh", validar(refreshSchema), authController.refresh);
  router.post("/logout", authController.logout);

  return router;
}
