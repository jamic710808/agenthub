// ============================================================
// Playground 错误分类器 (宪法 §5.3 禁止静默)
// ------------------------------------------------------------
// 输入：unknown (来自 streamObject onError / useObject error / fetch 异常)
// 输出：PlaygroundError 结构，含面向用户的文案 + 可重试标志 + 原始摘要
//
// 三级判定：
//   1. HTTP 状态码 (若存在)
//   2. 错误体 JSON 的 code/type 字段
//   3. error.message 关键词匹配
// ============================================================

import type {
  PlaygroundError,
  PlaygroundErrorCategory,
} from "@/lib/schemas/playground";

const MESSAGES: Record<PlaygroundErrorCategory, { message: string; retryable: boolean }> = {
  network: {
    message: "網路連線中斷，已渲染的內容已保留，請檢查網路後重試",
    retryable: true,
  },
  auth: {
    message: "API Key 鑑權失敗，請到 Settings 檢查你的 Key",
    retryable: false,
  },
  rate_limit: {
    message: "請求過於頻繁，請稍後再試",
    retryable: true,
  },
  context_too_long: {
    message: "輸入超過所選模型的上下文長度，請縮短輸入或換個上下文更大的模型",
    retryable: false,
  },
  upstream_timeout: {
    message: "上游回應逾時（60 秒上限），請重試或換個模型",
    retryable: true,
  },
  schema_parse_error: {
    message: "模型回傳的結構化資料解析失敗，請重試或換個模型",
    retryable: true,
  },
  unknown: {
    message: "出了點意外，展開「查看詳情」看看原始錯誤",
    retryable: true,
  },
};

function extractHint(err: unknown): string | undefined {
  if (err instanceof Error) return err.message.slice(0, 1000);
  if (typeof err === "string") return err.slice(0, 1000);
  try {
    return JSON.stringify(err).slice(0, 1000);
  } catch {
    return undefined;
  }
}

function pickCategory(err: unknown): PlaygroundErrorCategory {
  // 1) HTTP status（Response / { status } / Error.cause）
  const status =
    (err as { status?: number })?.status ??
    (err as { response?: { status?: number } })?.response?.status;
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "rate_limit";
  if (status === 504) return "upstream_timeout";

  // 2) 错误体 code / type
  const code =
    (err as { code?: string })?.code ??
    (err as { error?: { code?: string; type?: string } })?.error?.code ??
    (err as { error?: { type?: string } })?.error?.type;

  if (code === "context_length_exceeded") return "context_too_long";
  if (code === "invalid_api_key" || code === "authentication_error") return "auth";
  if (code === "rate_limit_exceeded") return "rate_limit";

  // 3) message 关键词兜底
  const msg = (extractHint(err) ?? "").toLowerCase();
  if (!msg) return "unknown";
  if (/fetch failed|network|econnreset|socket hang up/.test(msg)) return "network";
  if (/rate limit|too many requests/.test(msg)) return "rate_limit";
  if (/context length|maximum context|too long/.test(msg)) return "context_too_long";
  if (/timeout|timed out/.test(msg)) return "upstream_timeout";
  if (/api key|unauthorized|forbidden/.test(msg)) return "auth";
  if (/could not parse|invalid json|schema/.test(msg)) return "schema_parse_error";

  return "unknown";
}

export function classifyError(err: unknown): PlaygroundError {
  const category = pickCategory(err);
  const { message, retryable } = MESSAGES[category];
  return {
    category,
    message,
    retryable,
    originalHint: extractHint(err),
  };
}
