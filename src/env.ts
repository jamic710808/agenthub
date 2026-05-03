import { z } from "zod";

const serverSchema = z.object({
  OPENAI_API_KEY: z
    .string()
    .startsWith("sk-", "OPENAI_API_KEY 必須以 sk- 開頭")
    .describe("OpenAI API Key，用於調用 GPT 模型；從 platform.openai.com/api-keys 獲取"),
  ANTHROPIC_API_KEY: z
    .string()
    .startsWith("sk-ant-", "ANTHROPIC_API_KEY 必須以 sk-ant- 開頭")
    .describe("Anthropic API Key，用於調用 Claude 模型；從 console.anthropic.com/settings/keys 獲取"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL 必須是合法 URL")
    .describe("應用對外 URL，用於 OAuth 回調 / 分享連結；本地填 http://localhost:3000"),
});

const sharedSchema = z.object({});

const processEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

const merged = serverSchema.merge(clientSchema).merge(sharedSchema);

const parsed = merged.safeParse(processEnv);

if (!parsed.success) {
  const flat = parsed.error.flatten().fieldErrors;
  const lines = Object.entries(flat).map(
    ([k, msgs]) => `  - ${k}: ${(msgs ?? []).join("; ")}`,
  );
  throw new Error(
    "❌ 環境變數校驗失敗：\n" +
      lines.join("\n") +
      "\n\n請對照 .env.example 檢查 .env.local，確保所有必填變數都填了且格式正確。",
  );
}

export const env = parsed.data;
