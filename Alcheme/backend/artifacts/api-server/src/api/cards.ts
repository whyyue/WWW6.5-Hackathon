import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  getAllCards,
  getAllCardOres,
  getOresByIds,
  insertCard,
  insertCardOres,
  formatCard,
  calcRarity,
} from "../models/supabase.js";
import { fail, serverError } from "../utils/response.js";

const router: IRouter = Router();

const smeltSchema = z.object({
  name: z.string().optional(),
  description: z.string().default(""),
  oreIds: z.array(z.number().int().positive()).min(1, "至少需要一个矿石"),
});

router.get("/cards", async (req, res) => {
  try {
    const [cards, cardOres] = await Promise.all([getAllCards(), getAllCardOres()]);
    res.json(cards.map((card) => formatCard(card, cardOres)));
  } catch (err) {
    req.log.error({ err }, "Failed to get cards");
    serverError(res);
  }
});

router.post("/smelt", async (req, res) => {
  const parsed = smeltSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "参数错误：" + JSON.stringify(parsed.error.flatten().fieldErrors));
    return;
  }

  const { description, oreIds } = parsed.data;

  try {
    const ores = await getOresByIds(oreIds);
    if (ores.length === 0) {
      fail(res, "找不到有效的矿石，请检查矿石 ID");
      return;
    }

    const rarity = calcRarity(ores.length);
    const name = parsed.data.name?.trim() || `${rarity} 卡片`;
    const card = await insertCard({ name, description, rarity });
    await insertCardOres(oreIds.map((ore_id) => ({ card_id: card.id, ore_id })));

    res.status(201).json({ cardId: card.id, ...formatCard(card, []), oreIds });
  } catch (err) {
    req.log.error({ err }, "Failed to smelt card");
    serverError(res, "炼金失败，请重试");
  }
});

export default router;
