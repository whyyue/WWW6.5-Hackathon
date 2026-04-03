import { Router, type IRouter } from "express";
import { z } from "zod";
import { summarizeContent } from "../services/ai.service.js";
import { success, fail, serverError } from "../utils/response.js";

const router: IRouter = Router();

const summarizeSchema = z.object({
  content: z.string().min(1, "内容不能为空"),
});

router.post("/ai/summarize", async (req, res) => {
  const parsed = summarizeSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, parsed.error.flatten().fieldErrors.content?.[0] ?? "参数错误");
    return;
  }

  try {
    const result = await summarizeContent(parsed.data.content);
    success(res, result);
  } catch (err) {
    req.log.error({ err }, "AI summarize failed");
    serverError(res, "AI 摘要失败，请重试");
  }
});

export default router;
