import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import { heatmapQuerySchema } from "./dashboard.schemas.js";

export function criarDashboardRoutes(dashboardController) {
  const router = Router();

  router.get("/heatmap", validar(heatmapQuerySchema), dashboardController.heatmap);

  return router;
}
