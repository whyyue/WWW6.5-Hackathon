import { openai } from "@workspace/integrations-openai-ai-server";

const PROMPTS = {
  refine: `你是一个成长型思维教练。用户将提交一段原始想法或笔记，
请将它提炼成一段清晰、有洞见、具有启发性的文字。
要求：
- 保留原意的核心价值
- 语言精炼，去掉冗余
- 以第一人称表达，更有力量感
- 不超过200字
直接输出提炼后的内容，不需要解释。`,

  summarize: `你是一个知识萃取专家。根据用户提供的内容，
请提取出以下信息并以 JSON 格式返回：
{
  "title": "一句话标题（不超过20字）",
  "summary": "核心摘要（50字以内）",
  "tags": ["标签1", "标签2", "标签3"],
  "type": "text | idea | insight | question | resource"
}
只返回 JSON，不要有其他内容。`,
};

export async function refineContent(rawContent: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: PROMPTS.refine },
      { role: "user", content: rawContent },
    ],
  });
  return response.choices[0]?.message?.content ?? rawContent;
}

export interface SummarizeResult {
  title: string;
  summary: string;
  tags: string[];
  type: string;
}

export async function summarizeContent(content: string): Promise<SummarizeResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: PROMPTS.summarize },
      { role: "user", content },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as SummarizeResult;
    return {
      title: parsed.title ?? "未命名",
      summary: parsed.summary ?? "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      type: parsed.type ?? "text",
    };
  } catch {
    return { title: "未命名", summary: raw, tags: [], type: "text" };
  }
}
