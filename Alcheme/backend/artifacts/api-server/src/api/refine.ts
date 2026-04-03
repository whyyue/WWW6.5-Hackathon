import { Router, type IRouter } from "express";
import { z } from "zod";
import { refineContent } from "../services/ai.service.js";
import { success, fail, serverError } from "../utils/response.js";

const router: IRouter = Router();

const refineSchema = z.object({
  content: z.string().min(1, "内容不能为空"),
});

router.post("/ai/refine", async (req, res) => {
  const parsed = refineSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, parsed.error.flatten().fieldErrors.content?.[0] ?? "参数错误");
    return;
  }

  try {
    const refined = await refineContent(parsed.data.content);
    success(res, { refined });
  } catch (err) {
    req.log.error({ err }, "AI refine failed");
    serverError(res, "AI 提炼失败，请重试");
  }
});

export default router;
