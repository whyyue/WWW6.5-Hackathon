import type { Response } from "express";

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

export function serverError(res: Response, message = "服务器内部错误，请稍后重试") {
  return res.status(500).json({ success: false, error: message });
}
