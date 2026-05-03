// ============================================================
// 流式 AI API Route · /api/playground/stream
// ------------------------------------------------------------
// Feature      specs/001-playground  (plan.md §4)
// Runtime      edge                          (宪法 §5.3 NON-NEGOTIABLE)
// maxDuration  60                            (Vercel Hobby 默认 10s 会截断)
// Provider     OpenAI-compatible gateway     (默认 OpenRouter)
// Schema       @/lib/schemas/playground      (前后端共用 SSOT)
//
// 请求体:
//   { prompt: string(1..50000), modelId: PlaygroundModelId }
//
// 响应:
//   text/plain (Object Stream)  — useObject 消费 partialObject
// 错误:
//   400 / 401 / 403 / 429 / 504 / 500  — 见 plan.md §4.1
// ============================================================

import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import {
  playgroundErrorSchema,
  playgroundRequestSchema,
  playgroundResponseSchema,
} from "@/lib/schemas/playground";
import {
  PLAYGROUND_MODELS,
  resolveProviderRouteId,
} from "@/lib/playground/models";
import { classifyError } from "@/lib/playground/errors";

// 宪法 §5.1：必须用工厂模式，baseURL 从 env 读取；禁止裸 import(...) 直接指向 api.openai.com
const openai = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL ?? process.env.OPENAI_BASE_URL,
});

export const runtime = "edge";
export const maxDuration = 60;

const SYSTEM_PROMPT = `你是一位嚴謹的結構化輸出 AI Agent。對用戶的 prompt，你必須以 JSON 結構作答，嚴格遵守傳入的 schema：

1. 輸出順序：先產 thinking（含 summary 與 steps），再產 toolCalls（如有），最後產 finalAnswer——這是流式字段級漸進渲染的前提
2. 若本次不需要調用任何工具，請**省略** toolCalls 字段（不要給空陣列 []）
3. 所有枚舉字段必須精確匹配：
   - thinking.steps[].kind ∈ {analyze, plan, verify, decide}
   - toolCalls[].status ∈ {ok, error, timeout}
4. finalAnswer 是 markdown 字符串，禁止使用 $...$ 或 $$...$$ 包裹的數學公式（前端不渲染 KaTeX）
5. 不要返回 schema 之外的字段，不要返回純文本或附加解釋`;

function errorResponse(err: unknown, fallbackStatus = 500): Response {
  const classified = classifyError(err);
  const status =
    classified.category === "auth"
      ? 401
      : classified.category === "rate_limit"
      ? 429
      : classified.category === "context_too_long"
      ? 400
      : classified.category === "upstream_timeout"
      ? 504
      : classified.category === "schema_parse_error"
      ? 400
      : fallbackStatus;

  // 错误体过一次 schema 自校验，保证前端拿到的错误结构稳定
  const body = playgroundErrorSchema.parse(classified);
  return Response.json(body, { status });
}

export async function POST(req: Request) {
  // —— 入口校验 ——
  let raw: unknown;
  try {
    raw = await req.json();
  } catch (err) {
    return errorResponse(err, 400);
  }

  const parsed = playgroundRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      playgroundErrorSchema.parse({
        category: "schema_parse_error",
        message: "请求格式错误：prompt 或 modelId 不合法",
        retryable: false,
        originalHint: parsed.error.message.slice(0, 1000),
      }),
      { status: 400 },
    );
  }

  const { prompt, modelId } = parsed.data;

  const modelEntry = PLAYGROUND_MODELS[modelId];
  if (!modelEntry.enabled) {
    return Response.json(
      playgroundErrorSchema.parse({
        category: "unknown",
        message: `模型 ${modelEntry.displayName} 尚未啟用，請在選擇器中換一個`,
        retryable: false,
      }),
      { status: 400 },
    );
  }

  // —— 流式生成 ——
  try {
    const result = streamObject({
      model: openai(resolveProviderRouteId(modelId)),
      schema: playgroundResponseSchema,
      system: SYSTEM_PROMPT,
      prompt,
      // 宪法 §5.3：onError 必须设置，禁止静默
      onError: ({ error }) => {
        console.error("[api/playground/stream] streamObject error", {
          modelId,
          error,
        });
      },
    });

    // 宪法 §5.3：只用 toTextStreamResponse()，保证 useObject 能消费
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[api/playground/stream] fatal", err);
    return errorResponse(err);
  }
}
