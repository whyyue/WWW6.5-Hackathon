import { Router, type IRouter } from "express";
import { getDb } from "../models/supabase.js";
import { serverError } from "../utils/response.js";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  try {
    const db = getDb();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [oreCountRes, cardCountRes, badgeCountRes, recentOresRes, typeCountRes] =
      await Promise.all([
        db.from("ores").select("*", { count: "exact", head: true }),
        db.from("cards").select("*", { count: "exact", head: true }),
        db.from("badges").select("*", { count: "exact", head: true }),
        db.from("ores").select("created_at").gte("created_at", sevenDaysAgo),
        db.from("ores").select("type"),
      ]);

    const totalOres = oreCountRes.count ?? 0;
    const totalCards = cardCountRes.count ?? 0;
    const totalMedals = badgeCountRes.count ?? 0;

    // 近 7 天每天矿石数量
    const heat: number[] = Array(7).fill(0);
    for (const ore of recentOresRes.data ?? []) {
      const daysAgo = Math.floor(
        (now.getTime() - new Date(ore.created_at).getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysAgo >= 0 && daysAgo < 7) {
        heat[6 - daysAgo] += 1;
      }
    }

    // 六维雷达：按矿石类型分布映射到 6 个维度
    const typeCounts: Record<string, number> = {};
    for (const row of typeCountRes.data ?? []) {
      typeCounts[row.type] = (typeCounts[row.type] ?? 0) + 1;
    }
    const base = Math.max(totalOres, 1);
    const radar = [
      Math.min(100, Math.round(((typeCounts["idea"] ?? 0) + (typeCounts["insight"] ?? 0)) / base * 100 + 30)),
      Math.min(100, Math.round(((typeCounts["image"] ?? 0) + (typeCounts["note"] ?? 0)) / base * 100 + 25)),
      Math.min(100, Math.round((totalCards / Math.max(totalOres / 3, 1)) * 100)),
      Math.min(100, Math.round(((typeCounts["link"] ?? 0) + (typeCounts["resource"] ?? 0)) / base * 100 + 20)),
      Math.min(100, Math.round(((typeCounts["text"] ?? 0) + (typeCounts["question"] ?? 0)) / base * 100 + 35)),
      Math.min(100, Math.round((totalMedals / Math.max(totalCards / 2, 1)) * 100 + 20)),
    ];

    res.json({ radar, heat, totalOres, totalCards, totalMedals });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    serverError(res);
  }
});

export default router;
