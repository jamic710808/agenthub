// ============================================================
// 流式 AI API Route · /api/agent-run
// ------------------------------------------------------------
// provider    = OpenAI-compatible                ← OpenRouter / Azure / 自建也能用
// baseURL     = OPENAI_BASE_URL env（可选）       ← 未设就走官方 OpenAI
// model       = openai/gpt-5.4-mini (OpenRouter 命名，2026-04 默认)
//              其他 OpenRouter 可选:
//              - openai/gpt-5.4-nano          ($0.20/$1.25)  更便宜
//              - anthropic/claude-haiku-4.5   ($1/$5)        Claude 便宜档
//              - anthropic/claude-sonnet-4.6  ($3/$15)       Claude 旗舰
//              - google/gemini-2.5-flash      ($0.30/$2.50)  Google 便宜
//              - google/gemini-2.5-pro        ($1.25/$10)    Google 旗舰
//              - deepseek/deepseek-v3.2       ($0.26/$0.42)  成本王
//              - qwen/qwen3.5-flash-02-23     ($0.07/$0.26)  国产极便宜
// maxDuration = 60 秒                             ← 预估更久就调大
// schema      = @/lib/schemas/agent-output       ← 前后端共用
// ============================================================

import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { agentOutputSchema } from "@/lib/schemas/agent-output";

// 模型登錄表（settings 模型管理）為單一資料源：前端逐次帶 model + baseURL + apiKey。
// baseURL/apiKey 為空 → 回退伺服器 ENV（預設 6 個模型即如此，行為與升級前一致）。
const ENV_API_KEY = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
const ENV_BASE_URL = process.env.OPENROUTER_BASE_URL ?? process.env.OPENAI_BASE_URL;
const DEFAULT_MODEL = "openai/gpt-5.4-mini";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, model, baseURL, apiKey } = (await req.json()) as {
    prompt?: string;
    model?: string;
    baseURL?: string;
    apiKey?: string;
  };

  const userPrompt = (prompt ?? "").trim();
  if (!userPrompt) {
    return new Response("prompt is required", { status: 400 });
  }

  // per-request client：BYOK 有值就用，否則回退 ENV
  const openai = createOpenAI({
    apiKey: apiKey?.trim() || ENV_API_KEY,
    baseURL: baseURL?.trim() || ENV_BASE_URL,
  });
  const resolvedModel = model?.trim() || DEFAULT_MODEL;

  const result = streamObject({
    model: openai(resolvedModel),
    schema: agentOutputSchema,
    system:
      "你是一位寫作助手。用戶會給你一個 prompt，你必須嚴格遵守傳入的 schema 產出結構化響應：" +
      "title 是簡潔主標題，sections 是 1-8 段分段正文（合理混用 heading/paragraph/bullet），" +
      "summary 是一句話摘要。" +
      "不要返回純文本，不要附加解釋說明，所有內容必須塞進 schema 的對應字段，一個字段都不能漏。",
    prompt: userPrompt,
    onError: ({ error }) => {
      console.error("[api/agent-run] streamObject error:", error);
    },
  });

  return result.toTextStreamResponse();
}
