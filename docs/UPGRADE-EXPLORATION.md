# AgentHub 升級方向探索 Spec（草稿 · brainstorming 進行中）

> 狀態：**探索中（尚未定案，不可據此實作）**
> 開始：2026-05-24
> 方法：brainstorming skill — 一次一問，邊問邊記，最後輸出定稿

---

## 0. 現有脈絡盤點（已知事實）

**技術棧**：Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui + Vercel AI SDK v6 + @xyflow/react

**已做成真功能（Phase 1–4，全客戶端 + localStorage）**
- Playground：真打 OpenRouter，串流結構化輸出
- 執行紀錄 `/runs`：真實 run + trace 瀑布圖
- 商店篩選 `/gallery`：提供商/能力/分頁/搜尋真生效（但資料是 mock）
- 編排 `/pipeline`：React Flow 可編輯+存檔+真執行（LLM 節點真跑，非 LLM 透傳）
- 設定 `/settings`：個資/API key 本地管理、Token 預估器

**持久層**：全部 localStorage（runHistory / myAgents / pipeline / profile / apiKeys）—— 無真實 DB
**資料**：24 個 Agent 為 mock，無真實 Agent 註冊表
**暫緩**：Stripe 金流、Supabase 登入（使用者決定等部署再評估）

**關鍵張力**：使用者提問混用「重寫」與「升級」——需先釐清是「打掉重練」還是「現有基礎演進」。

---

## 1. 要回答的探索問題（本次目標）
1. 原型源碼哪些模組可重用、哪些必須重做
2. 若重寫，建議什麼技術堆疊較穩定
3. 是否分階段、優先做什麼
4. 常見的坑

---

## 2. 問答記錄（逐題累積）

**Q1 最終目標狀態？** → **自己/小團隊內部工具**（單租戶、自己掌控；要跨裝置/永久保存，但不需多租戶隔離；實用為主、不過度工程化）

**Q2 核心用途（複選）？** → **四個全選**：Playground、工作流編排、執行紀錄、Agent 管理。→ 範圍幾乎是整個 app；唯一明確出局＝定價/帳單。

**Q3 規模？** → **2–5 人小團隊**（輕量登入分人、不需複雜角色；資料可交隊互看或各自分離）。

**Q4 部署/資料？** → 使用者請我建議 → **提案：Vercel + Supabase**（見 D2，標記為假設 A3 待確認）。

**Q5 演進 vs 重寫？** → **在現有基礎演進**（保留 Next.js + 設計系統 + 大部分 UI/邏輯，只抽換持久層 + 補登入）。

**⚠️ 重大重新定調（使用者後續澄清）**：專案**不商用、不做內部工具**，真正目的＝**展示 demo**。→ 前面 Q1「內部工具」框架失效，判斷標準改為「demo 看起來真不真/順不順/會不會穿幫」。持久層換 Supabase、登入等「上線級」工作**不再是重點**。

**Q6 改進方向？** → **視覺打磨：讓它更好看**（不是防穿幫、不是展示動線、不是補真功能）。

---

## 3. Decision Log（決策記錄）

**D1：定位 = 內部工具（非對外 SaaS）**
- 決定：目標為自己/小團隊內部使用
- 排除選項：對外 SaaS（多租戶/金流/SaaS auth）、純作品集
- 影響：① 金流(Stripe)可從藍圖移除 ② 多租戶隔離不需要 ③ 真實持久層變必要（localStorage 不足）④ auth 降為小團隊輕量等級

**D2：部署/資料 = Vercel + Supabase（提案·待確認）**
- 決定（建議）：Vercel 部署 + Supabase（Postgres + Auth）
- 替代方案：公司內網自架（資料留內網但維運重）、本機單機同步（多人協作弱）
- 選擇理由：① 延續既有 Vercel 經驗 ② Supabase 一站搞定 DB+Auth 且現有碼已半接 ③ 2–5 人不值得自架維運
- 風險旗標：若要存敏感財務數據，需重新評估自架

**D3：路線 = 演進（非重寫）**
- 決定：在現有 Next.js 基礎上演進
- 替代方案：局部重寫（重整資料/狀態層）、打掉重練
- 選擇理由：四個 Phase 已把功能做成真的、程式可動；2–5 人內部工具撐不起重寫成本；真正缺口只有持久層+登入
- 影響：重用 = 設計系統/UI/業務邏輯/schema；重做 = 持久層(localStorage→Supabase)、補 auth、補真實 Agent 資料源

**D4：用途重新定調 = 展示 demo（推翻 D1 內部工具）**
- 決定：專案目的＝展示，不商用、不做內部工具
- 影響：持久層/登入/Supabase 等上線級工作降為非重點；評估標準改為「demo 體驗」
- 註：D1–D3 的分析仍保留作為「若哪天要認真化」的參考，但非當前目標

**D5：當前工作方向 = 視覺打磨（讓它更好看）**
- 決定：優先做視覺一致性與質感提升
- 排除（暫不做）：防穿幫修補、展示動線設計、補真功能

**D6：打磨層級 = 方案 A 主題質感升級**
- 決定：改 design token + 共用元件，全站生效
- 替代方案：B 輕量一致性掃描（提升細微）、C 關鍵頁重設計（工程大）
- 選擇理由：驚艷度÷工程量最高，不碰功能邏輯、低風險

**D7：色彩主軸 = 靛紫 AI 感（方向 A）**
- 決定：258° 靛紫主色 + 250° 紫灰背景 + 靛紫→洋紅漸層
- 替代方案：B 精煉藍（含蓄）、C 科技青綠（挑題材）
- 選擇理由：一眼讀作 AI 產品、與通用藍拉開差距、貼合 Agent 平台題材

---

## 6. Exit Criteria（brainstorming 收尾檢查）
- ✅ Understanding 已確認（含中途重新定調為 demo）
- ✅ 設計方案已接受（方案 A + 靛紫）
- ✅ 主要假設已記錄（A1–A5）
- ✅ 風險已標記（pipeline 連線、簡繁、資料敏感度）
- ✅ Decision Log 完整（D1–D7）
- → 可交接實作（待使用者指示）

---

## 3.5 各頁面真假對照（現況 · Phase 1–4 之後）

**✅ 真的會跑**
- Playground `/agent/[id]`：🟢 全真（真打 OpenRouter、串流結構化輸出、加入我的Agent）。demo 王牌
- 執行紀錄 `/runs`：🟢 全真（真實 run + 多節點 trace 瀑布圖）
- 編排 `/pipeline`：🟢 真含真執行（React Flow 可編輯/存檔/執行；⚠️ 連線視覺依賴 ResizeObserver，受限瀏覽器可能不顯示 → demo 風險）
- 商店 `/gallery`：🟡 互動真、資料假（篩選/分頁/搜尋真生效，Agent 為 mock 24 筆）
- 設定 `/settings`：🟡 半真（個資/API key/Token 預估真；帳單/團隊/整合誠實空態）
- 文檔 `/docs`：⚪ 靜態佔位頁

**❌ 純展示**
- 首頁 `/`：統計數字寫死、賣點靜態
- 定價 `/pricing`：無金流、按鈕無作用
- 登入/註冊：程式接 Supabase 但金鑰假 → 必失敗（入口已隱藏）
- 商店 Agent 卡片內容：mock

---

## 3.6 設計改進建議（demo 導向，三層按殺傷力）
1. 消除「看起來壞掉」：pipeline 連線消失風險、登入入口（可改假登入放行）
2. 讓假的誠實或華麗：首頁假數字、定價死按鈕加 toast
3. 視覺一致性：簡繁混用（如定價「专属定制」）、空態/loading 風格不一

> 使用者選定方向＝**視覺一致性與質感打磨**。

---

## 3.7 最終設計：靛紫 AI 質感升級（方案 A）

**色彩主軸**：靛紫 AI 感（方向 A）。從 220° 電光藍 → 258° 靛紫主色 + 250° 紫灰背景軸。

**① 色票 token 對照（`src/app/globals.css` @theme）**

| Token | 現值 | 建議新值 |
|-------|------|---------|
| `--color-primary-default` | `hsl(220 100% 65%)` | `hsl(258 90% 66%)` |
| `--color-primary-hover` | `hsl(220 90% 65%)` | `hsl(258 90% 72%)` |
| `--color-primary-active` | `hsl(220 90% 55%)` | `hsl(258 85% 58%)` |
| `--color-bg-base` | `hsl(220 15% 10%)` | `hsl(250 20% 8%)` |
| `--color-bg-subtle` | `hsl(220 15% 13%)` | `hsl(250 18% 11%)` |
| `--color-bg-muted` | `hsl(220 15% 17%)` | `hsl(250 16% 15%)` |
| `--color-bg-elevated` | `hsl(220 15% 22%)` | `hsl(250 15% 20%)` |
| `--color-fg-default` | `hsl(220 10% 95%)` | `hsl(250 15% 96%)` |
| `--color-fg-secondary` | `hsl(220 10% 70%)` | `hsl(250 12% 72%)` |
| `--color-fg-muted` | `hsl(220 10% 50%)` | `hsl(250 12% 52%)` |
| `--color-border-default` | `hsl(220 15% 22%)` | `hsl(250 15% 20%)` |
| `--color-border-subtle` | `hsl(220 15% 17%)` | `hsl(250 15% 15%)` |
| `--color-border-strong` | `hsl(220 15% 30%)` | `hsl(250 15% 28%)` |
| 狀態色 success/warning/error | 維持 | 維持（語意不破壞）|
| **新增** accent 漸層 | — | `linear-gradient(135deg, hsl(258 90% 66%), hsl(286 85% 68%))` |

**② 質感清單（共用元件層）**
- 漸層重點：主按鈕、Hero 標題、首頁統計數字
- 光暈陰影：卡片 hover 用主色 violet glow（取代純黑陰影）
- 玻璃感：header/彈窗/卡片 hover 細微通透
- 微互動：卡片 hover 微浮起、按鈕 active、過渡統一 200ms
- 粒子背景：首頁調靛紫色調

**③ 套用範圍（surgical）**：主＝globals.css token；次＝button/card 元件 hover/shadow + Hero/Stats；**不碰**功能邏輯/結構/schema。

**④ 順手一致性**：簡繁掃描、空態插畫統一靛紫調。

---

## 4. 假設（Assumptions）

- A1：「跨裝置/永久保存」為真需求 → 需要真實 DB（規模：2–5 人，已確認）
- A2：使用者偏好「能跑就好、不過度工程化」（依 CLAUDE.md profile：財務主管、vibe coding）
- A3：部署 = Vercel + Supabase（待使用者確認）
- A4：Playground/紀錄存的是 prompt/輸出，非員工 PII；雲端存放可接受（前提：不把 PII 貼進 prompt）

---

## 5. 待釐清（Open Questions）

- Q2：核心 job-to-be-done 是什麼（哪些既有頁面真的要、哪些可砍）
- 規模：幾人用、資料量級
- 部署目標：本機 / Vercel / 自架
- 登入要做到什麼程度
