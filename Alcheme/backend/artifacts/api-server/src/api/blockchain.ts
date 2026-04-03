/**
 * 区块链查询路由
 *
 * GET  /api/blockchain/badge/:badgeId   查询勋章的链上状态
 * GET  /api/blockchain/can-evolve       检查钱包地址是否可调用 evolve
 * GET  /api/blockchain/stats            查询链上已铸造总数
 */
import { Router, type IRouter } from "express";
import { z } from "zod";
import { getBadgeById } from "../models/supabase.js";
import {
  getTokenInfo,
  checkCanEvolve,
  getTotalMinted,
  isBlockchainConfigured,
} from "../services/blockchain.service.js";
import { success, fail, serverError } from "../utils/response.js";

const router: IRouter = Router();

/**
 * GET /api/blockchain/badge/:badgeId
 * 根据数据库 badgeId 查询该勋章的链上信息
 * 需要该 badge 已完成链上铸造（有 on_chain_token_id）
 */
router.get("/blockchain/badge/:badgeId", async (req, res) => {
  const id = Number(req.params.badgeId);
  if (!Number.isInteger(id) || id <= 0) {
    fail(res, "无效的 badgeId");
    return;
  }

  if (!isBlockchainConfigured()) {
    fail(res, "链上功能未配置（缺少 RPC_URL / CONTRACT_ADDRESS / OWNER_PRIVATE_KEY）");
    return;
  }

  try {
    const badge = await getBadgeById(id);
    if (!badge) {
      fail(res, "找不到指定的勋章");
      return;
    }

    if (!badge.on_chain_token_id) {
      success(res, {
        badgeId: id,
        tokenId: badge.token_id,
        minted: false,
        onChainTokenId: null,
        txHash: badge.tx_hash ?? null,
        walletAddress: badge.wallet_address ?? null,
        ipfsMetadataUrl: badge.ipfs_metadata_url ?? null,
        chainInfo: null,
      });
      return;
    }

    const chainInfo = await getTokenInfo(badge.on_chain_token_id);

    success(res, {
      badgeId: id,
      tokenId: badge.token_id,
      minted: true,
      onChainTokenId: badge.on_chain_token_id,
      txHash: badge.tx_hash ?? null,
      walletAddress: badge.wallet_address ?? null,
      ipfsMetadataUrl: badge.ipfs_metadata_url ?? null,
      chainInfo: {
        metadataUri: chainInfo.metadataUri,
        evolutionCount: chainInfo.evolutionCount,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to query on-chain badge info");
    serverError(res, "链上查询失败，请重试");
  }
});

/**
 * GET /api/blockchain/can-evolve?onChainTokenId=0&walletAddress=0x...
 * 查询指定钱包地址是否有权调用 evolve()
 *
 * 注意：evolve() 必须由用户自己的钱包在前端调用，
 * 后端不持有用户私钥。此接口仅用于前端判断是否显示"进化"按钮。
 */
router.get("/blockchain/can-evolve", async (req, res) => {
  const schema = z.object({
    onChainTokenId: z.string().min(1),
    walletAddress: z.string().min(1),
  });

  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    fail(res, "请提供 onChainTokenId 和 walletAddress");
    return;
  }

  if (!isBlockchainConfigured()) {
    fail(res, "链上功能未配置");
    return;
  }

  try {
    const canEvolve = await checkCanEvolve(
      parsed.data.onChainTokenId,
      parsed.data.walletAddress,
    );

    success(res, {
      onChainTokenId: parsed.data.onChainTokenId,
      walletAddress: parsed.data.walletAddress,
      canEvolve,
      note: "evolve() 需由用户钱包在前端直接调用合约，后端不代签",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to check canEvolve");
    serverError(res, "链上查询失败，请重试");
  }
});

/**
 * GET /api/blockchain/stats
 * 查询合约上已铸造的 SBT 总数
 */
router.get("/blockchain/stats", async (req, res) => {
  if (!isBlockchainConfigured()) {
    success(res, { configured: false, totalMinted: null });
    return;
  }

  try {
    const totalMinted = await getTotalMinted();
    success(res, { configured: true, totalMinted });
  } catch (err) {
    req.log.error({ err }, "Failed to get totalMinted");
    serverError(res, "链上查询失败");
  }
});

export default router;
