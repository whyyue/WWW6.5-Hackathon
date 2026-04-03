import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const message = err instanceof Error ? err.message : "未知错误";
  logger.error({ err, url: req.url, method: req.method }, "Unhandled error");
  res.status(500).json({ success: false, error: message });
}
