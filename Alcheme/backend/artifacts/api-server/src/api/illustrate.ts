import { Router, type IRouter } from "express";
import { z } from "zod";
import { generateOreIllustration } from "../services/image.service.js";
import { uploadOreIllustrationToSupabase } from "../models/supabase.js";
import { success, fail, serverError } from "../utils/response.js";

const router: IRouter = Router();

const illustrateSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  content: z.string().min(1, "内容不能为空"),
  tags: z.array(z.string()).default([]),
  type: z.enum(["text", "link", "image", "note", "idea", "insight", "question", "resource"]).default("text"),
  oreId: z.union([z.string(), z.number()]).optional(),
  upload: z.boolean().default(false),
});

/**
 * POST /api/ai/illustrate
 * 根据矿石关键词，调用 DALL-E 生成风格化插画
 * upload=true 时同步上传到 Supabase Storage，返回 CDN 公开访问 URL
 */
router.post("/ai/illustrate", async (req, res) => {
  const parsed = illustrateSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "参数错误：" + JSON.stringify(parsed.error.flatten().fieldErrors));
    return;
  }

  const { title, content, tags, type, oreId, upload } = parsed.data;

  try {
    const imageBuffer = await generateOreIllustration({ title, content, tags, type });
    const base64 = imageBuffer.toString("base64");

    if (!upload) {
      success(res, {
        base64Image: `data:image/png;base64,${base64}`,
        supabaseUrl: null,
        message: "插画生成成功（仅 base64，未上传存储）",
      });
      return;
    }

    const key = oreId ?? `tmp-${Date.now()}`;
    const storageResult = await uploadOreIllustrationToSupabase(imageBuffer, key);

    success(res, {
      base64Image: `data:image/png;base64,${base64}`,
      supabaseUrl: storageResult.publicUrl,
      storagePath: storageResult.path,
      message: "插画已上传到 Supabase Storage",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate illustration");
    serverError(res, "插画生成失败，请重试");
  }
});

export default router;
