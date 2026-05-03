# AgentHub 開發流程記錄
## 繁體中文化、API 測試、Vercel 部署

**日期**：2026-05-02 夜間 ～ 2026-05-03  
**執行人**：Jamic（協作：Claude Sonnet 4.6）

---

## 一、任務概覽

| 任務 | 狀態 |
|------|------|
| 全站 `.tsx` 簡體 → 繁體轉換 | ✅ 完成 |
| 本地前後端啟動與 API 測試 | ✅ 完成 |
| Vercel 部署（含環境變數、GitHub 整合）| ✅ 完成 |

---

## 二、簡體 → 繁體轉換

### 2-1 掃描策略

以 Grep 全域掃描 `src/**/*.tsx`，使用 CJK 字元區間 `[一-鿿]` 作為比對模式，一次找出所有含中文的行，再逐一判斷是「用戶可見 UI 文字」還是「開發者 JSX 注釋」。

**開發者注釋（不改）範例：**
```tsx
{/* 输出区 */}
{/* SVG 连线 */}
// [Prep-02] 修复 #3: 骨架屏卡片组件
```

**用戶可見文字（必改）範例：**
```tsx
<Button>登录</Button>         // → 登入
<h4>产品</h4>                 // → 產品
defaultValue="你是一个专业..." // → 你是一位專業...
```

### 2-2 修改檔案清單

| 檔案 | 修改重點 |
|------|---------|
| `src/components/layout.tsx` | Header 導覽、Footer 產品/資源/法律欄位 |
| `src/app/agent/[id]/page.tsx` | Playground 頁面全部 UI 文字（13 處）|
| `src/app/gallery/page.tsx` | 能力標籤陣列 |
| `src/app/settings/page.tsx` | 帳單、團隊、整合、Token 預估器輸入/輸出標籤 |
| `src/app/pipeline/page.tsx` | Prompt 模板 `defaultValue` |
| `src/app/not-found.tsx` | 404 頁面文字 |
| `src/app/page.tsx` | 統計數字「5000 万+」→「5000 萬+」|

### 2-3 踩坑說明

#### 坑 1：`万` 不容易被肉眼發現

`万`（U+4E07，簡體）和 `萬`（U+842C，繁體）外形差異很大，但藏在數字中間容易跳過：

```tsx
// 錯誤（簡體）
<span>5000 万+</span>

// 正確（繁體）
<span>5000 萬+</span>
```

**解法**：掃描時用 `[一-鿿]` 覆蓋整個 CJK 區間，不要只比對已知的簡體字詞。

#### 坑 2：Edit tool「File has not been read yet」

Claude Code 的 `Edit` 工具要求在同一次 session 內必須先 `Read` 過該檔案才能編輯。跨 session（context 壓縮後）重新開始時，即使檔案之前讀過，也要重新 `Read` 一次。

**解法**：每個 session 的第一次 edit 前，先 `Read` 目標檔案。

#### 坑 3：PostToolUse Hook 誤報 `isLoading` deprecated

Hook 一直觸發警告說 `isLoading` 已棄用，要改用 `status === "streaming"`。但這個警告針對的是 `useChat` v6；本專案用的是 `useObject`，`isLoading` 在 `useObject` 中仍然有效。

**解法**：確認 hook 是哪個 API 的，不要盲目套用 `useChat` 的遷移建議。

---

## 三、本地啟動與 API 測試

### 3-1 啟動方式

```bash
cd MyAgentHub/agenthub
pnpm dev
# → http://localhost:3000（Next.js 16.2.4 + Turbopack）
```

本專案**沒有獨立的後端進程**。後端邏輯全部是 Next.js API routes，跑在同一個 port 3000 上：

| 路由 | 說明 |
|------|------|
| `POST /api/agent-run` | 串流 AI 回應，使用 `OPENAI_API_KEY` |
| `POST /api/playground/stream` | Playground 串流，優先使用 `OPENROUTER_API_KEY` |

兩個路由都宣告了 `export const runtime = "edge"`，採用 Edge Runtime。

### 3-2 環境變數設定

需在專案根目錄建立 `.env.local`（已被 `.gitignore` 的 `.env*` 規則覆蓋，不會進 git）：

```bash
# OpenRouter — playground/stream 優先讀這組
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# OpenAI 直連 — agent-run route 讀這組
OPENAI_API_KEY=sk-proj-...
```

### 3-3 踩坑說明

#### 坑 4：沒有 `.env.local` 時，API 路由回傳 HTTP 200 但 stream 是空的

兩個 API 路由在沒有 API key 的情況下仍會回傳 HTTP 200，因為 `streamObject` 的錯誤發生在串流內部，不會改變 HTTP status code。

**症狀**：curl 看到 200，但 response body 是空的。  
**查法**：看 Next.js server log（console），才看得到真正的錯誤：

```
[api/agent-run] streamObject error: AI_LoadAPIKeyError:
OpenAI API key is missing. Pass it using the 'apiKey' parameter
or the OPENAI_API_KEY environment variable.
```

**解法**：建立 `.env.local` 並重啟 dev server（Next.js 不會 hot-reload 環境變數）。

#### 坑 5：curl 測試 streaming 看不到 response body

```bash
curl -s -X POST http://localhost:3000/api/agent-run \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
# → 沒有輸出
```

curl 預設不等待 chunked streaming 結束就退出。實際上 server log 顯示 HTTP 200，只是 curl 沒捕到串流內容。

**解法**：確認 server log 有 `POST /api/xxx 200 in NNms`，或在瀏覽器 Playground 頁面直接測試。

#### 坑 6：`playground/stream` 的模型 ID 都是未來版本名稱

`src/lib/playground/models.ts` 裡的 `providerRouteId` 使用了不存在於 OpenRouter 的模型名稱：

```ts
"claude-4.7": { providerRouteId: "anthropic/claude-opus-4.7" },  // 不存在
"gpt-5.3":    { providerRouteId: "openai/gpt-5.3" },            // 不存在
```

這是原始設計稿的佔位名稱，實際使用時需替換為當時 OpenRouter 上真實可用的模型 ID（如 `anthropic/claude-opus-4`、`openai/gpt-4o`）。

**目前狀態**：`agent-run` 路由走 OpenAI 直連，使用 `gpt-5.4-mini`（正常回應）；`playground/stream` 透過 OpenRouter 但模型名不存在，串流為空。

---

## 四、部署方案選擇

### 4-1 方案比較

| 方案 | Edge Runtime | AI 串流 | 費用 | 適用場景 |
|------|-------------|--------|------|---------|
| **Vercel** | ✅ 原生 | ✅ Fluid Compute | Hobby 免費 / Pro $20/月 | 首選 |
| Cloudflare Pages | ✅ Workers | ✅ 需 `@cloudflare/next-on-pages` | 非常慷慨 | 預算緊且願意踩坑 |
| Railway / Render | ❌ 需改 Node.js | ✅ Node.js 模式可用 | $5/月起 | 有資料庫需求 |
| Fly.io | ❌ 需改 Node.js | ✅ | 按用量 | 全球多區域 |

### 4-2 Vercel Hobby vs Pro 的關鍵差異

本專案 API routes 宣告了 `maxDuration = 60`（60 秒），但 **Vercel Hobby 方案的函式 timeout 預設為 10 秒**，AI 串流呼叫會在 10 秒後被截斷。

**結論**：正式上線需要 Vercel Pro（$20/月），才能跑滿 `maxDuration = 60`。

---

## 五、Vercel 部署流程

### 5-1 執行步驟

```bash
# 1. 確認 .env.local 在 .gitignore 中（已有 .env* 規則）
# 2. 初始化 Vercel 專案並連結
vercel link --scope kenliu19820808 --yes

# 3. 加入環境變數（Production）
printf "sk-or-v1-..." | vercel env add OPENROUTER_API_KEY production --force
printf "https://openrouter.ai/api/v1" | vercel env add OPENROUTER_BASE_URL production --force
printf "sk-proj-..." | vercel env add OPENAI_API_KEY production --force

# 4. 部署到 production
vercel --prod --yes

# 5. 建立 GitHub repo 並推上去
gh repo create agenthub --public --source . --remote origin --push

# 6. 連結 Vercel 到 GitHub（之後 push 自動觸發重新部署）
vercel git connect --yes
```

### 5-2 踩坑說明

#### 坑 7：`vercel --yes` 需要明確指定 `--scope`

```bash
# 失敗
vercel --yes

# 錯誤訊息
{
  "status": "action_required",
  "reason": "missing_scope",
  "message": "Provide --scope or --team explicitly..."
}

# 正確做法：先 link
vercel link --scope kenliu19820808 --yes
# 之後就不需要每次帶 --scope
```

#### 坑 8：`vercel env add` 的 Preview 環境需要 git branch

```bash
# 失敗（沒有 git branch 時）
printf "value" | vercel env add KEY preview --yes --force

# 錯誤：git_branch_required
# 原因：Preview 環境綁定 branch，沒有 commit 的 repo 沒有 branch 名稱

# 解法：先做完初始 commit 再設，或只設 production
vercel env add KEY preview --value "xxx" --yes --force  # 全 preview branch
```

#### 坑 9：`vercel env add` 不接受 `NAME=value` 格式

Vercel CLI v52 的 `env add` 指令從 stdin 讀取 value，不接受 positional argument：

```bash
# 錯誤寫法
vercel env add OPENAI_API_KEY=sk-proj-xxx production

# 正確寫法（stdin）
printf "sk-proj-xxx" | vercel env add OPENAI_API_KEY production --force

# 或使用 --value flag
vercel env add OPENAI_API_KEY production --value "sk-proj-xxx" --force
```

#### 坑 10：Build log 警告「Using edge runtime on a page disables static generation」

```
⚠ Using edge runtime on a page currently disables static generation for that page
```

這是 Next.js 的預期行為，不是錯誤。Edge Runtime 的 API routes 無法在 build time 靜態化，會在 request time 動態執行。對 AI API 路由來說這是正確的設計。

### 5-3 最終部署結果

| 項目 | 結果 |
|------|------|
| Production URL | https://agenthub-amber.vercel.app |
| GitHub Repo | https://github.com/jamic710808/agenthub |
| Build 時間 | 31 秒 |
| 自動部署 | `git push` → Vercel 自動重建 |
| 環境變數 | `OPENROUTER_API_KEY`、`OPENROUTER_BASE_URL`、`OPENAI_API_KEY`（Encrypted） |
| Node.js 版本 | 24.x |

---

## 六、後續待辦

- [ ] 將 `playground/models.ts` 的 `providerRouteId` 替換為 OpenRouter 真實可用的模型 ID
- [ ] 升級 Vercel Pro，讓 `maxDuration = 60` 生效（目前 Hobby 會截斷）
- [ ] 設定 Preview 環境的環境變數（連 GitHub 後可在 Vercel Dashboard 補設）
- [ ] 考慮加入 `OPENAI_BASE_URL` 環境變數讓 `agent-run` 也可走 OpenRouter
