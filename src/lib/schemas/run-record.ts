// ============================================================
// Run 記錄 Schema (Phase 2 · localStorage 持久化)
// ------------------------------------------------------------
// 刻意沿用 /runs 頁原本就在消費的 mock 形狀（mock-data.ts RUN_HISTORY），
// 這樣瀑布圖渲染器（buildTrace + TraceWaterfall）一行都不用改，只換資料來源。
//
// 為什麼不用 schemas/runhistory.ts：那套是為 Drizzle/SQLite 設計的扁平化+游標分頁
// 重量級結構，對 localStorage 屬過度工程（憲法 §Simplicity First）。
// ============================================================

import { z } from "zod";
import { findModel } from "@/lib/schemas/model-pricing";
import { estimateTokens } from "@/lib/token-estimator";

export const RUN_HISTORY_KEY = "agenthub:runHistory" as const;
export const MAX_RUNS = 50 as const;

// 與 /runs 的 RawTraceNode / buildTrace 對齊：duration 是 "2.34s" 字串、type 是節點種類
export const rawTraceNodeSchema = z.object({
  name: z.string().min(1).max(120),
  duration: z.string().min(1).max(16),
  type: z.enum(["llm", "tool", "retrieval", "agent"]),
});

export const runRecordSchema = z.object({
  id: z.string().min(1).max(64),
  timestamp: z.string().min(1).describe("ISO 字串，排序與顯示用"),
  agentId: z.string().min(1).max(64),
  agent: z.string().min(1).max(120).describe("Agent 名稱（列表顯示）"),
  model: z.string().min(1).max(64),
  status: z.enum(["success", "error"]),
  duration: z.string().min(1).max(16).describe('總耗時，如 "2.34s"'),
  cost: z.string().min(1).max(16).describe('預估成本，如 "$0.0042"'),
  input: z.string().max(50_000),
  output: z.string().max(100_000),
  trace: z.array(rawTraceNodeSchema).max(20),
});

export const runHistorySchema = z.array(runRecordSchema).max(MAX_RUNS);

export type RunRecord = z.infer<typeof runRecordSchema>;

/**
 * 把一次完成的 Playground 呼叫組成一筆 RunRecord。
 * 成本用 estimateTokens + 定價表粗估（與設定頁的 Token 預估器同口徑），
 * 誤差 ±30%，僅供事後參考——真實計費以 provider 為準。
 */
export function createRunRecord(args: {
  agentId: string;
  agentName: string;
  model: string;
  prompt: string;
  status: "success" | "error";
  durationMs: number;
  output: string;
  // 可選：自訂 trace（如工作流多節點執行）；不給則預設單一 LLM 節點
  trace?: RunRecord["trace"];
}): RunRecord {
  const { agentId, agentName, model, prompt, status, durationMs, output, trace } = args;

  const m = findModel(model);
  const inputTokens = estimateTokens(prompt);
  const outputTokens = estimateTokens(output);
  const costUSD = m
    ? (inputTokens / 1_000_000) * m.inputPricePer1M +
      (outputTokens / 1_000_000) * m.outputPricePer1M
    : 0;

  const durationSec = (durationMs / 1000).toFixed(2) + "s";

  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    agentId,
    agent: agentName,
    model,
    status,
    duration: durationSec,
    cost: "$" + costUSD.toFixed(4),
    input: prompt,
    output,
    // 預設單一 LLM 節點；工作流執行會傳入多節點 trace
    trace: trace ?? [
      {
        name: `LLM:${model}`,
        duration: durationSec,
        type: "llm" as const,
      },
    ],
  };
}
