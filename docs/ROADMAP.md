# AgentHub 開發狀態與未完成清單

> 最後更新：2026-05-24
> 此檔追蹤各階段進度與「暫緩/未做」項目，避免遺漏。

## 已完成

### Phase 1 — 讓現有真功能不報錯（2026-05-23）
- `api/agent-run` 改走 OpenRouter（白名單驗證前端模型，預設 `openai/gpt-5.4-mini`）→ Playground 真的能跑、模型選擇生效
- 隱藏登入/註冊入口（Supabase 金鑰未配置，避免點了報錯）
- 新增 `/docs` 佔位頁，修掉死連結 404

### Phase 2 — 打通「執行 → 紀錄」資料鏈（2026-05-23）
- Playground 每次執行寫入 localStorage（`agenthub:runHistory`）
- `/runs` 改讀真實紀錄（棄用 mock），含「清空」鈕
- 真實 trace = 單一 LLM 節點（誠實呈現單次呼叫）
- **儲存後端走 localStorage**（非 Supabase，刻意選的最小基建）

### Phase 3（部分）
- ✅ 商店篩選器真正生效（2026-05-24）：提供商 checkbox、能力標籤（資料動態推導）、真分頁、多條件疊加
- ✅ 編排換 React Flow 真畫布（2026-05-24）：可拖拉/連線/加刪節點、屬性面板雙向綁定、存 localStorage（`agenthub:pipeline`）
- ✅ 模型管理中心 · 單一資料源 + 完整 BYOK（2026-05-24）：新增 `lib/schemas/model-registry.ts`（entry: provider/displayName/modelId/baseURL/apiKey/價格/enabled，種子 6 模型）+ `lib/hooks/use-model-registry.ts`（CRUD）。設定頁新增「模型」分頁可增刪改。**取代原三處硬編清單**：Playground MODEL_OPTIONS、編排 PROVIDER_MODEL、設定 Token 試算器 MODEL_PRICING 全改讀 registry。後端 `agent-run`、`pipeline/node` 接受 per-request baseURL+apiKey（空＝回退 ENV）。Preview 驗證：CRUD、Playground 讀取+執行、編排讀取、DeepSeek 經 ENV 回退真跑通。已知：run 記錄成本仍用 MODEL_PRICING 算（自訂模型顯示 $0）
- ✅ 視覺質感升級 · 靛紫 AI 主題（2026-05-24）：globals.css 色票 220°藍→258°靛紫 + 250°紫灰背景 + 靛紫→洋紅漸層 token；新增質感工具類（text-gradient-brand / bg-gradient-brand / shadow-glow-brand / card-lift）；主按鈕漸層+光暈、卡片 hover 浮起、Hero 標題與統計數字漸層、粒子自動轉靛紫；簡繁修正（定價「专属定制」）。探索過程見 docs/UPGRADE-EXPLORATION.md
- ✅ 設定頁補完「能做真的部分」（2026-05-24）：個人資料顯示名稱存 localStorage（`agenthub:profile`）；API 密鑰本地管理（生成/遮罩顯示/複製/刪除 demo key，`agenthub:apiKeys`）；帳單/團隊/整合改成誠實的「部署後開放」說明（本質需 Stripe/Supabase/OAuth）。Token 預估器原本就是真的

### Phase 4 — 工作流真執行引擎 v1（2026-05-24）
- 客戶端編排：拓撲排序（Kahn，偵測循環）逐節點跑，資料以純文字沿 edges 流動，匯流時串接
- LLM 節點真跑：新增 `/api/pipeline/node`（`generateText` 回純文字，走 OpenRouter，provider→白名單模型）
- 非 LLM 節點誠實透傳（使用者選的方案）：只有 LLM 真跑，其餘把上游輸入往下傳
- 執行時節點狀態即時動畫（idle→active→success/error），畫布底部結果面板顯示最終輸出
- 執行完寫進 `/runs` → **多節點 trace 瀑布圖變真**（Phase 2 當時只有單步）
- Preview 實測通過：5 節點全跑、LLM 真生成、/runs 多節點瀑布圖正確

---

## ⏸️ 暫緩 — 等線上部署再評估納入（非取消）

> 使用者 2026-05-24 決定：這兩項依賴外部帳號/金鑰，等要正式上線時再一起處理。

### 1. 定價接 Stripe（P0 金流）
- 現況：定價頁 `/pricing` 為純靜態，按鈕無金流
- 動工前置：**先呼叫 Codex adversarial review**（auth/payment P0 規則）、需 Stripe 帳號與金鑰
- 範圍：結帳流程、訂閱狀態、settings 帳單頁接真實資料

### 2. 登入補真實 Supabase 金鑰
- 現況：`/login` `/register` 程式已串 Supabase Auth，但 `.env.local` 金鑰是假 placeholder；登入入口已在 header 隱藏
- 動工前置：使用者開 Supabase 專案，提供真實 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 完成後：把 header 登入入口加回來

---

## 未做 — 尚未排程

- **工作流執行 v2（進階）**：v1 是誠實透傳 + 單純文字流。日後可加：節點間結構化資料、真實檢索/工具節點、串流逐 token、平行執行分支、迴圈/條件節點
- **localStorage → Supabase 遷移**：若要跨裝置/永久保存執行紀錄與工作流（schema 已對齊，遷移不難）
- **商店真實 Agent 資料源**：目前 24 筆為 mock，無真實 Agent 註冊表（需 DB）
- **設定頁帳單/團隊/整合**：誠實標示「部署後開放」中，本質需 Stripe/Supabase/OAuth 後端

---

## 已知技術注記
- React Flow v12 完全依賴 ResizeObserver 量尺寸；headless/preview 環境若 RO 不觸發，edges 視覺上畫不出來（資料仍正確）。真實瀏覽器正常
- 啟動：`pnpm -C agenthub dev`（或 workspace 根 `.claude/launch.json` 的 Preview）
