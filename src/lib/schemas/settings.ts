// ============================================================
// 設定頁持久化 Schema (Phase 3 補完 · localStorage)
// ------------------------------------------------------------
// 只涵蓋「現在就能做真」的兩塊：個人資料、API 密鑰本地管理。
// 帳單/團隊/整合本質需後端（Stripe/Supabase），不在此。
// ============================================================

import { z } from "zod";

export const PROFILE_KEY = "agenthub:profile" as const;
export const API_KEYS_KEY = "agenthub:apiKeys" as const;
export const MAX_API_KEYS = 10 as const;

export const profileSchema = z.object({
  displayName: z.string().max(60),
});
export type Profile = z.infer<typeof profileSchema>;
export const DEFAULT_PROFILE: Profile = { displayName: "Agent Developer" };

export const apiKeySchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(60),
  key: z.string().min(1).max(128),
  createdAt: z.string().min(1),
});
export const apiKeysSchema = z.array(apiKeySchema).max(MAX_API_KEYS);
export type ApiKey = z.infer<typeof apiKeySchema>;

function randomHex(bytesLen: number): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(bytesLen);
    crypto.getRandomValues(bytes);
    return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(16).slice(2).padEnd(bytesLen * 2, "0");
}

// demo key：本地產生，非真實平台金鑰
export function generateApiKey(): string {
  return `ah-sk-${randomHex(16)}`;
}

// 顯示時遮罩中段，只露頭尾
export function maskApiKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 9)}••••••${key.slice(-4)}`;
}
