import { Router, type IRouter } from "express";
import { z } from "zod";
import { randomBytes } from "crypto";
import {
  getCardsByIds,
  getCardOresByCardIds,
  getOresByIds,
  getBadgeById,
  getBadgeCardsByBadgeId,
  insertBadge,
  insertBadgeCards,
  uploadBadgeImageToSupabase,
  calcRarity,
  type CardOre,
  type Card,
} from "../models/supabase.js";
import { generateOreIllustration, generateBadgeImage } from "../services/image.service.js";
import { uploadBadgeToIpfs } from "../services/ipfs.service.js";
import { mintSBT, isBlockchainConfigured } from "../services/blockchain.service.js";
import { fail, serverError } from "../utils/response.js";

const router: IRouter = Router();

const forgeSchema = z.object({
  name: z.string().optional(),
  description: z.string().default(""),
  cardIds: z.array(z.number().int().positive()).min(1, "至少需要一张卡片"),
  uploadToIpfs: z.boolean().default(false),
  walletAddress: z.string().optional(),
});

function generateTokenId(): string {
  return "SBT-" + randomBytes(8).toString("hex").toUpperCase();
}

async function collectOreKeywords(cardIds: number[]): Promise<{
  title: string;
  content: string;
  tags: string[];
  type: string;
}> {
  const cardOres = await getCardOresByCardIds(cardIds);
  const oreIds = [...new Set(cardOres.map((co) => co.ore_id))];

  if (oreIds.length === 0) {
    return { title: "成长旅程", content: "Web3 学习与探索的记录", tags: [], type: "text" };
  }

  const ores = await getOresByIds(oreIds);
  const titles = ores.map((o) => o.title).join("、");
  const allTags = ores.flatMap((o) => o.tags ?? []);
  const uniqueTags = [...new Set(allTags)].slice(0, 8);
  const contentSample = ores.map((o) => o.content).join(" ").slice(0, 200);
  const type = ores[0]?.type ?? "text";

  return {
    title: titles.slice(0, 60) || "成长结晶",
    content: contentSample || "个人成长历程的珍贵记录",
    tags: uniqueTags,
    type,
  };
}

function pickHighestRarity(cards: Card[]): string {
  const order = ["legendary", "epic", "rare", "common"];
  for (const r of order) {
    if (cards.some((c) => c.rarity === r)) return r;
  }
  return "common";
}

// ─── POST /forge ─────────────────────────────────────────────────────────────

router.post("/forge", async (req, res) => {
  const parsed = forgeSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "参数错误：" + JSON.stringify(parsed.error.flatten().fieldErrors));
    return;
  }

  const { description, cardIds, uploadToIpfs, walletAddress } = parsed.data;

  try {
    const cards = await getCardsByIds(cardIds);
    if (cards.length === 0) {
      fail(res, "找不到有效的卡片，请检查卡片 ID");
      return;
    }

    const rarity = pickHighestRarity(cards);
    const tokenId = generateTokenId();
    const name = parsed.data.name?.trim() || `${rarity} 勋章`;

    let supabaseImageUrl: string | null = null;
    let ipfsMetadataUrl: string | null = null;
    let onChainTokenId: string | null = null;
    let txHash: string | null = null;

    if (uploadToIpfs) {
      try {
        const oreKeywords = await collectOreKeywords(cardIds);

        const illustrationBuffer = await generateOreIllustration({
          title: oreKeywords.title,
          content: oreKeywords.content,
          tags: oreKeywords.tags,
          type: oreKeywords.type,
        });

        const imageBuffer = await generateBadgeImage({
          name,
          tokenId,
          description,
          rarity,
          illustrationBuffer,
        });

        const [supabaseResult, ipfsUploadResult] = await Promise.allSettled([
          uploadBadgeImageToSupabase(imageBuffer, tokenId),
          uploadBadgeToIpfs({ name, description, tokenId, cardIds }, imageBuffer),
        ]);

        if (supabaseResult.status === "fulfilled") {
          supabaseImageUrl = supabaseResult.value.publicUrl;
        } else {
          req.log.warn({ err: supabaseResult.reason }, "Supabase upload failed");
        }

        if (ipfsUploadResult.status === "fulfilled") {
          ipfsMetadataUrl = ipfsUploadResult.value.metadataUrl ?? null;
        } else {
          req.log.warn({ err: ipfsUploadResult.reason }, "IPFS upload failed");
        }

        if (walletAddress && ipfsMetadataUrl && isBlockchainConfigured()) {
          try {
            const mintResult = await mintSBT(walletAddress, ipfsMetadataUrl);
            onChainTokenId = mintResult.onChainTokenId;
            txHash = mintResult.txHash;
            req.log.info({ onChainTokenId, txHash }, "SBT minted on-chain");
          } catch (mintErr) {
            req.log.warn({ err: mintErr }, "On-chain mint failed, badge saved off-chain");
          }
        }
      } catch (uploadErr) {
        req.log.warn({ err: uploadErr }, "Image/IPFS pipeline failed, badge saved locally");
      }
    }

    const badge = await insertBadge({
      name,
      description,
      token_id: tokenId,
      wallet_address: walletAddress ?? null,
      on_chain_token_id: onChainTokenId,
      tx_hash: txHash,
      ipfs_metadata_url: ipfsMetadataUrl,
    });
    await insertBadgeCards(cardIds.map((card_id) => ({ badge_id: badge.id, card_id })));

    res.status(201).json({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      tokenId: badge.token_id,
      cardIds,
      rarity,
      walletAddress: walletAddress ?? null,
      supabaseImageUrl,
      ipfsMetadataUrl,
      onChainTokenId,
      txHash,
      minted: !!onChainTokenId,
      createdAt: badge.created_at,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to forge badge");
    serverError(res, "铸造失败，请重试");
  }
});

// ─── POST /ipfs/upload-badge ──────────────────────────────────────────────────

router.post("/ipfs/upload-badge", async (req, res) => {
  const schema = z.object({
    badgeId: z.number().int().positive(),
    walletAddress: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "请提供有效的 badgeId");
    return;
  }

  try {
    const badge = await getBadgeById(parsed.data.badgeId);
    if (!badge) {
      fail(res, "找不到指定的勋章");
      return;
    }

    const badgeCards = await getBadgeCardsByBadgeId(badge.id);
    const cardIds = badgeCards.map((bc) => bc.card_id);
    const cards = await getCardsByIds(cardIds);
    const rarity = pickHighestRarity(cards);

    const oreKeywords = await collectOreKeywords(cardIds);
    const illustrationBuffer = await generateOreIllustration({
      title: oreKeywords.title,
      content: oreKeywords.content,
      tags: oreKeywords.tags,
      type: oreKeywords.type,
    });

    const imageBuffer = await generateBadgeImage({
      name: badge.name,
      tokenId: badge.token_id,
      description: badge.description,
      rarity,
      illustrationBuffer,
    });

    const [supabaseResult, ipfsUploadResult] = await Promise.allSettled([
      uploadBadgeImageToSupabase(imageBuffer, badge.token_id),
      uploadBadgeToIpfs(
        { name: badge.name, description: badge.description, tokenId: badge.token_id, cardIds },
        imageBuffer,
      ),
    ]);

    const supabaseImageUrl =
      supabaseResult.status === "fulfilled" ? supabaseResult.value.publicUrl : null;
    const ipfsResult =
      ipfsUploadResult.status === "fulfilled" ? ipfsUploadResult.value : {};

    let onChainTokenId: string | null = null;
    let txHash: string | null = null;
    const targetWallet = parsed.data.walletAddress ?? badge.wallet_address;

    if (targetWallet && ipfsResult.metadataUrl && isBlockchainConfigured()) {
      try {
        const mintResult = await mintSBT(targetWallet, ipfsResult.metadataUrl);
        onChainTokenId = mintResult.onChainTokenId;
        txHash = mintResult.txHash;
      } catch (mintErr) {
        req.log.warn({ err: mintErr }, "On-chain mint failed during ipfs/upload-badge");
      }
    }

    res.json({
      badgeId: badge.id,
      tokenId: badge.token_id,
      supabaseImageUrl,
      ipfsMetadataUrl: ipfsResult.metadataUrl ?? null,
      imageCid: ipfsResult.imageCid ?? null,
      metadataCid: ipfsResult.metadataCid ?? null,
      onChainTokenId,
      txHash,
      minted: !!onChainTokenId,
    });
  } catch (err) {
    req.log.error({ err }, "IPFS upload failed");
    const msg = err instanceof Error ? err.message : "IPFS 上传失败";
    serverError(res, msg);
  }
});

export default router;
