import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { success } from "../utils/response.js";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  success(res, data);
});

export default router;
