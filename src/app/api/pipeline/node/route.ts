// ============================================================
// 工作流單一 LLM 節點執行 · /api/pipeline/node
// ------------------------------------------------------------
// 客戶端編排器逐節點呼叫；只有 llm 節點會打這支。
// 吃 { model, promptTemplate, input } → 回純文字 { text }。
// 走 OpenRouter（與 agent-run 同一組 env），非串流（await 後回整段）。
// ============================================================

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

// BYOK：baseURL/apiKey 由前端（模型登錄表 entry）逐次帶入，空＝回退 ENV
const ENV_API_KEY = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
const ENV_BASE_URL = process.env.OPENROUTER_BASE_URL ?? process.env.OPENAI_BASE_URL;
const DEFAULT_MODEL = "openai/gpt-5.4-mini";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { model, promptTemplate, input, baseURL, apiKey } = (await req.json()) as {
    model?: string;
    promptTemplate?: string;
    input?: string;
    baseURL?: string;
    apiKey?: string;
  };

  const openai = createOpenAI({
    apiKey: apiKey?.trim() || ENV_API_KEY,
    baseURL: baseURL?.trim() || ENV_BASE_URL,
  });
  const resolvedModel = model?.trim() || DEFAULT_MODEL;
  const upstream = (input ?? "").trim();
  const template = (promptTemplate ?? "").trim();

  // 把模板裡的 {{...}} 佔位符換成上游輸入；沒佔位符就把輸入接在模板後面
  const prompt = template.includes("{{")
    ? template.replace(/\{\{[^}]+\}\}/g, upstream)
    : template
    ? `${template}\n\n${upstream}`
    : upstream;

  if (!prompt) {
    return Response.json({ error: "node has no input" }, { status: 400 });
  }

  try {
    const result = await generateText({
      model: openai(resolvedModel),
      prompt,
    });
    return Response.json({ text: result.text });
  } catch (err) {
    console.error("[api/pipeline/node] generateText error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "節點執行失敗" },
      { status: 500 },
    );
  }
}
