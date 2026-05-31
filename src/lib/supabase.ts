import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// 延遲初始化：Supabase 金鑰未配置時（登入功能暫緩），
// 模組載入不 crash，只在真正呼叫時才建立 client。
// 避免 build 時靜態生成 /login 因缺金鑰而爆炸。
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase 尚未配置，請設定 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY。');
  }
  _client = createClient(url, key);
  return _client;
}

// 向後相容：原本用 supabase.auth.xxx 的地方改呼叫 getSupabase()
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
