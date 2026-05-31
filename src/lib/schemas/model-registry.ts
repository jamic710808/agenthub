// ============================================================
// 模型登錄表 Schema (單一資料源 · localStorage · 完整 BYOK)
// ------------------------------------------------------------
// 取代原本三處硬編清單：
//   - agent/[id] 的 MODEL_OPTIONS（Playground 選單）
//   - pipeline 的 PROVIDER_MODEL（編排 LLM 節點）
//   - settings 的 MODEL_PRICING（Token 試算器）
//
// 每個 entry 可設自己的 baseURL + apiKey：
//   空字串 = 回退後端 ENV（預設 6 個模型即如此，行為與升級前一致）
//   有值   = 真的路由到該端點（BYOK，可接任何 OpenAI 相容 gateway）
// ============================================================

import { z } from "zod";

export const MODEL_REGISTRY_KEY = "agenthub:modelRegistry" as const;
export const MAX_MODELS = 50 as const;

export const modelEntrySchema = z.object({
  id: z.string().min(1).max(64).describe("內部唯一 id（uuid）"),
  provider: z.string().min(1).max(40).describe("廠商名，如 OpenAI / Anthropic / 自訂"),
  displayName: z.string().min(1).max(60).describe("UI 顯示名，如 GPT-5.4 Mini"),
  modelId: z.string().min(1).max(128).describe("送給 gateway 的模型 id，如 openai/gpt-5.4-mini"),
  baseURL: z.string().max(200).describe("端點 baseURL；空＝用後端 ENV 預設 gateway"),
  apiKey: z.string().max(200).describe("API 金鑰；空＝用後端 ENV 金鑰"),
  inputPricePer1M: z.number().min(0).max(10000).optional().describe("每百萬輸入 token 價（USD），選填，供試算"),
  outputPricePer1M: z.number().min(0).max(10000).optional().describe("每百萬輸出 token 價（USD），選填"),
  enabled: z.boolean().describe("是否在選單中顯示"),
});
export type ModelEntry = z.infer<typeof modelEntrySchema>;

export const modelRegistrySchema = z.array(modelEntrySchema).max(MAX_MODELS);

// 首次載入（localStorage 空）的預設種子——遷移自原 MODEL_OPTIONS + MODEL_PRICING。
// baseURL/apiKey 留空 → 走後端 ENV（OpenRouter），確保升級後預設行為不變。
export const DEFAULT_MODELS: ModelEntry[] = [
  { id: "seed-gpt-5.4-mini", provider: "OpenAI", displayName: "GPT-5.4 Mini", modelId: "openai/gpt-5.4-mini", baseURL: "", apiKey: "", inputPricePer1M: 0.75, outputPricePer1M: 4.5, enabled: true },
  { id: "seed-gpt-5.4", provider: "OpenAI", displayName: "GPT-5.4", modelId: "openai/gpt-5.4", baseURL: "", apiKey: "", inputPricePer1M: 2.5, outputPricePer1M: 15, enabled: true },
  { id: "seed-claude-haiku-4.5", provider: "Anthropic", displayName: "Claude Haiku 4.5", modelId: "anthropic/claude-haiku-4.5", baseURL: "", apiKey: "", inputPricePer1M: 1, outputPricePer1M: 5, enabled: true },
  { id: "seed-claude-sonnet-4.6", provider: "Anthropic", displayName: "Claude Sonnet 4.6", modelId: "anthropic/claude-sonnet-4.6", baseURL: "", apiKey: "", inputPricePer1M: 3, outputPricePer1M: 15, enabled: true },
  { id: "seed-gemini-2.5-flash", provider: "Google", displayName: "Gemini 2.5 Flash", modelId: "google/gemini-2.5-flash", baseURL: "", apiKey: "", inputPricePer1M: 0.3, outputPricePer1M: 2.5, enabled: true },
  { id: "seed-deepseek-v3.2", provider: "DeepSeek", displayName: "DeepSeek V3.2", modelId: "deepseek/deepseek-v3.2", baseURL: "", apiKey: "", inputPricePer1M: 0.26, outputPricePer1M: 0.42, enabled: true },
];

export function newModelEntry(): ModelEntry {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `model-${Date.now()}`,
    provider: "OpenAI",
    displayName: "新模型",
    modelId: "",
    baseURL: "",
    apiKey: "",
    enabled: true,
  };
}
