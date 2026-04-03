import sharp from "sharp";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";

// ─── DALL-E 3 AI 插画生成 ────────────────────────────────────────────────────

export interface OreIllustrationOptions {
  title: string;
  content: string;
  tags?: string[];
  type?: string;
}

/**
 * 根据矿石关键词，调用 DALL-E (gpt-image-1) 生成风格化插画
 */
export async function generateOreIllustration(
  options: OreIllustrationOptions,
): Promise<Buffer> {
  const { title, content, tags = [], type = "text" } = options;

  const keywords = [title, ...tags].filter(Boolean).join("、");
  const prompt = buildIllustrationPrompt(keywords, content, type);

  const buffer = await generateImageBuffer(prompt, "1024x1024");
  return buffer;
}

function buildIllustrationPrompt(keywords: string, content: string, type: string): string {
  const typeStyle: Record<string, string> = {
    idea: "surreal conceptual art, glowing light bulb emerging from crystal ore, dreamlike",
    note: "ancient parchment with glowing runes, mystical knowledge crystal, dark academia",
    insight: "fractal neural network illuminated in gold, cosmic wisdom, futuristic",
    link: "digital portal vortex, data streams forming crystals, cyberpunk neon",
    image: "prismatic gem refracting vivid color spectrums, crystalline beauty",
    text: "floating glowing text fragments crystallizing into a gem, magical realism",
  };

  const style = typeStyle[type] ?? typeStyle.text;

  return [
    `Create a stylized digital illustration for a personal growth NFT card.`,
    `Core theme: "${keywords}".`,
    `Visual concept: ${style}.`,
    `The illustration should feel like a collectible card artwork — rich color, high detail, symbolic imagery that captures the essence of: "${content.slice(0, 100)}".`,
    `Style: cinematic digital painting, dramatic lighting, no text or letters in the image.`,
    `Aspect ratio: square 1:1.`,
  ].join(" ");
}

// ─── Sharp SVG 勋章图片生成（用于 IPFS 封面合成）──────────────────────────────

export interface BadgeImageOptions {
  name: string;
  tokenId: string;
  description?: string;
  rarity?: string;
  illustrationBuffer?: Buffer; // DALL-E 生成的插画叠加到勋章背景
}

const RARITY_COLORS: Record<string, string> = {
  legendary: "#FFD700",
  epic: "#9B59B6",
  rare: "#3498DB",
  common: "#2ECC71",
};

/**
 * 生成 SBT 勋章图片
 * 若传入 illustrationBuffer，则将 DALL-E 插画作为背景底图合成
 */
export async function generateBadgeImage(options: BadgeImageOptions): Promise<Buffer> {
  const { name, tokenId, description = "", rarity = "common", illustrationBuffer } = options;
  const color = RARITY_COLORS[rarity] ?? RARITY_COLORS.common;

  const size = 1024;

  // 覆盖层 SVG（文字 + 边框）
  const overlaySvg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- 暗色渐变蒙层 -->
      <rect width="${size}" height="${size}" fill="rgba(10,10,30,0.55)" rx="40"/>
      <!-- 发光边框 -->
      <rect x="16" y="16" width="${size - 32}" height="${size - 32}"
        fill="none" stroke="${color}" stroke-width="4" rx="32" opacity="0.85"/>
      <!-- 稀有度标签 -->
      <rect x="${size / 2 - 80}" y="${size - 180}" width="160" height="36" rx="18" fill="${color}" opacity="0.92"/>
      <text x="${size / 2}" y="${size - 156}" font-family="sans-serif" font-size="18" fill="#000"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold">${rarity.toUpperCase()}</text>
      <!-- 勋章名 -->
      <text x="${size / 2}" y="${size - 108}" font-family="sans-serif" font-size="32" fill="#ffffff"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold">${escapeXml(name)}</text>
      <!-- 描述 -->
      <text x="${size / 2}" y="${size - 64}" font-family="sans-serif" font-size="18" fill="#cccccc"
        text-anchor="middle" dominant-baseline="middle">${escapeXml(description.slice(0, 36))}</text>
      <!-- Token ID -->
      <text x="${size / 2}" y="${size - 28}" font-family="monospace" font-size="13" fill="#888888"
        text-anchor="middle" dominant-baseline="middle">${escapeXml(tokenId)}</text>
    </svg>
  `;

  if (illustrationBuffer) {
    // 将 DALL-E 插画作为底图，叠加文字覆盖层
    const base = sharp(illustrationBuffer).resize(size, size);
    const overlay = Buffer.from(overlaySvg);
    return base.composite([{ input: overlay }]).png().toBuffer();
  }

  // 无插画时使用纯色背景 + 覆盖层
  const bgSvg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f0f23"/>
          <stop offset="100%" style="stop-color:#1a1a3e"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)" rx="40"/>
      <circle cx="${size / 2}" cy="${size / 2 - 80}" r="200" fill="${color}" opacity="0.08"/>
    </svg>
  `;

  return sharp(Buffer.from(bgSvg))
    .composite([{ input: Buffer.from(overlaySvg) }])
    .png()
    .toBuffer();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
