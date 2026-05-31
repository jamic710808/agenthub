"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { User, Key, CreditCard, Users, Link as LinkIcon, AlertCircle, Save, Copy, Trash2, Plus, Check, Cpu, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { estimateTokens, formatUSD, levelOf } from '@/lib/token-estimator';
import { useProfile, useApiKeys } from '@/lib/hooks/use-settings';
import { maskApiKey, MAX_API_KEYS } from '@/lib/schemas/settings';
import { useModelRegistry } from '@/lib/hooks/use-model-registry';
import { newModelEntry, MAX_MODELS, type ModelEntry } from '@/lib/schemas/model-registry';

// [Prep-02] 修复 #3: 钥匙 SVG 空态插画
function KeyIllustration() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-fg-muted">
      <circle cx="22" cy="22" r="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="22" cy="22" r="5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="31" y1="31" x2="54" y2="54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="54" x2="54" y2="46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="54" x2="46" y2="54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="44" y1="44" x2="44" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// [Prep-02] 修复 #3: 通用空态插画（用于账单/团队/集成）
function EmptyIllustration() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-fg-muted">
      <rect x="8" y="12" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="32" x2="20" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: '個人資料', icon: User },
    { id: 'models', label: '模型', icon: Cpu },
    { id: 'apikeys', label: 'API 密鑰', icon: Key },
    { id: 'billing', label: '帳單', icon: CreditCard },
    { id: 'team', label: '團隊', icon: Users },
    { id: 'integrations', label: '整合', icon: LinkIcon },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1024px] flex-col px-[24px] py-[24px] gap-[24px]">
      {/* [Prep-02] 修复 #4: md 下顶部水平 Tabs */}
      <div>
        <h2 className="mb-[12px] text-[20px] font-semibold text-fg-default">帳戶設置</h2>
        <div className="flex overflow-x-auto border-b border-border-default md:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-[8px] px-[12px] py-[12px] text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-default/40 ${
                  activeTab === tab.id
                    ? 'text-primary-default border-b-2 border-primary-default'
                    : 'text-fg-secondary hover:text-fg-default'
                }`}
              >
                <Icon className="h-[14px] w-[14px]" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-[24px]">
        {/* 左侧 Sidebar（md 以上） */}
        <aside className="hidden w-[200px] shrink-0 md:block">
          <nav className="sticky top-[80px] flex flex-col gap-[4px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-[12px] rounded-[8px] px-[12px] py-[8px] text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-default/40 ${
                    activeTab === tab.id
                      ? 'bg-primary-default/10 text-primary-default'
                      : 'text-fg-secondary hover:bg-bg-subtle hover:text-fg-default'
                  }`}
                >
                  <Icon className={`h-[16px] w-[16px] ${activeTab === tab.id ? 'text-primary-default' : 'text-fg-muted'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 右侧表单区 */}
        <main className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-[24px]">
              <div>
                <h1 className="text-[20px] font-semibold text-fg-default">個人資料</h1>
                <p className="mt-[4px] text-[13px] text-fg-secondary">管理你的基本資訊和頭像。</p>
              </div>

              <ProfileForm />

              <Card className="border-status-error/50">
                <CardHeader className="p-[20px] pb-[12px]">
                  <CardTitle className="text-[16px] text-status-error">危險操作</CardTitle>
                  <CardDescription className="text-[13px]">永久刪除你的帳戶及所有相關資料。</CardDescription>
                </CardHeader>
                <CardContent className="px-[20px] pb-[12px] pt-0">
                  <p className="text-[13px] text-fg-secondary">
                    刪除帳戶後，你建立的 Agent、運行歷史和綁定的 API 密鑰將被永久清除且無法恢復。
                  </p>
                </CardContent>
                <CardFooter className="border-t border-border-subtle px-[20px] py-[12px]">
                  <Button variant="outline" className="text-status-error hover:bg-status-error/10 hover:border-status-error">刪除帳戶</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="flex flex-col gap-[24px]">
              <div>
                <h1 className="text-[20px] font-semibold text-fg-default">模型管理</h1>
                <p className="mt-[4px] text-[13px] text-fg-secondary">
                  全站單一資料源——這裡增刪改的模型，Playground 與工作流編排都會即時讀取。
                </p>
              </div>
              <ModelRegistryPanel />
            </div>
          )}

          {/* [Prep-02] 修复 #3: API Keys 空态 + Phase-3 Token 预估器 */}
          {activeTab === 'apikeys' && (
            <div className="flex flex-col gap-[24px]">
              <div>
                <h1 className="text-[20px] font-semibold text-fg-default">API 密鑰</h1>
                <p className="mt-[4px] text-[13px] text-fg-secondary">管理你的 API Key，用於程式化存取。</p>
              </div>
              <ApiKeysPanel />

              <TokenEstimator />
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="flex flex-col gap-[24px]">
              <div>
                <h1 className="text-[20px] font-semibold text-fg-default">帳單</h1>
                <p className="mt-[4px] text-[13px] text-fg-secondary">查看用量和帳單明細。</p>
              </div>
              <div className="flex h-[320px] flex-col items-center justify-center gap-[8px] rounded-[8px] border border-dashed border-border-strong px-[24px] text-center">
                <EmptyIllustration />
                <p className="mt-[16px] text-[14px] font-medium text-fg-secondary">帳單需接入金流後開放</p>
                <p className="text-[13px] text-fg-muted">用量與帳單明細需要訂閱方案（Stripe），將於上線部署時納入。</p>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="flex flex-col gap-[24px]">
              <div>
                <h1 className="text-[20px] font-semibold text-fg-default">團隊</h1>
                <p className="mt-[4px] text-[13px] text-fg-secondary">管理團隊成員和權限。</p>
              </div>
              <div className="flex h-[320px] flex-col items-center justify-center gap-[8px] rounded-[8px] border border-dashed border-border-strong px-[24px] text-center">
                <EmptyIllustration />
                <p className="mt-[16px] text-[14px] font-medium text-fg-secondary">團隊功能需登入系統後開放</p>
                <p className="text-[13px] text-fg-muted">多人協作與權限需要帳號系統（Supabase），將於登入功能上線後納入。</p>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="flex flex-col gap-[24px]">
              <div>
                <h1 className="text-[20px] font-semibold text-fg-default">整合</h1>
                <p className="mt-[4px] text-[13px] text-fg-secondary">連接第三方服務和工具。</p>
              </div>
              <div className="flex h-[320px] flex-col items-center justify-center gap-[8px] rounded-[8px] border border-dashed border-border-strong px-[24px] text-center">
                <EmptyIllustration />
                <p className="mt-[16px] text-[14px] font-medium text-fg-secondary">整合將於後續版本開放</p>
                <p className="text-[13px] text-fg-muted">第三方服務（Slack、GitHub 等）OAuth 串接尚未實作。</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// 個人資料：顯示名稱存 localStorage（email 無後端維持唯讀）
function ProfileForm() {
  const { displayName, save, isHydrated } = useProfile();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isHydrated) setName(displayName);
  }, [isHydrated, displayName]);

  const dirty = isHydrated && name.trim() !== displayName && name.trim().length > 0;

  const handleSave = () => {
    save(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="p-[20px] pb-[12px]">
        <CardTitle className="text-[16px]">公開資訊</CardTitle>
        <CardDescription className="text-[13px]">這將在你的 Agent 商店頁面上顯示。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-[16px] px-[20px] pb-[16px] pt-0">
        <div className="flex flex-col gap-[8px]">
          <label className="text-[13px] font-medium text-fg-default">顯示名稱</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className="max-w-[400px]"
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <label className="text-[13px] font-medium text-fg-default">電子郵件地址</label>
          <Input defaultValue="developer@example.com" type="email" disabled className="max-w-[400px] bg-bg-muted" />
          <p className="text-[12px] text-fg-muted flex items-center gap-[4px]">
            <AlertCircle className="h-[12px] w-[12px]" /> 電子郵件地址不支持直接修改，請聯繫支援。
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border-subtle px-[20px] py-[12px] flex items-center justify-end gap-[12px]">
        {saved && <span className="text-[13px] text-status-success">已儲存 ✓</span>}
        <Button onClick={handleSave} disabled={!dirty}>
          <Save className="mr-[8px] h-[14px] w-[14px]" />
          存好
        </Button>
      </CardFooter>
    </Card>
  );
}

// API 密鑰：本地產生/複製/刪除 demo key（非真實平台金鑰）
function ApiKeysPanel() {
  const { keys, create, remove, isHydrated } = useApiKeys();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (k: { id: string; key: string }) => {
    navigator.clipboard
      .writeText(k.key)
      .then(() => {
        setCopiedId(k.id);
        setTimeout(() => setCopiedId(null), 1500);
      })
      .catch(() => {});
  };

  if (!isHydrated) {
    return <div className="text-[13px] text-fg-muted">載入中…</div>;
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center justify-between gap-[12px]">
        <p className="text-[12px] text-fg-muted">
          本地保存的 demo key（非真實平台金鑰），用來示意管理流程。
        </p>
        <Button size="sm" onClick={() => create('')} disabled={keys.length >= MAX_API_KEYS}>
          <Plus className="mr-[8px] h-[14px] w-[14px]" /> 生成新 Key
        </Button>
      </div>

      {keys.length === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center rounded-[8px] border border-dashed border-border-strong text-center">
          <KeyIllustration />
          <p className="mt-[16px] text-[15px] font-medium text-fg-secondary">還沒有 API Key</p>
        </div>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {keys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between gap-[12px] rounded-[8px] border border-border-default bg-bg-subtle px-[16px] py-[12px]"
            >
              <div className="flex min-w-0 flex-col gap-[2px]">
                <span className="truncate text-[13px] font-medium text-fg-default">{k.name}</span>
                <span className="font-mono text-[12px] text-fg-muted">{maskApiKey(k.key)}</span>
              </div>
              <div className="flex shrink-0 items-center gap-[8px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-[28px] gap-[6px] px-[10px] text-[12px]"
                  onClick={() => copy(k)}
                >
                  {copiedId === k.id ? <Check className="h-[12px] w-[12px]" /> : <Copy className="h-[12px] w-[12px]" />}
                  {copiedId === k.id ? '已複製' : '複製'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-[28px] w-[28px] text-fg-muted hover:text-status-error"
                  onClick={() => remove(k.id)}
                  title="刪除此 Key"
                >
                  <Trash2 className="h-[14px] w-[14px]" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 模型管理中心：單一資料源，可增刪改 廠商/模型id/baseURL/金鑰/價格/啟用
function ModelRegistryPanel() {
  const { models, add, update, remove, reset, isHydrated } = useModelRegistry();

  if (!isHydrated) {
    return <div className="text-[13px] text-fg-muted">載入中…</div>;
  }

  const numOrUndef = (v: string): number | undefined =>
    v.trim() === "" ? undefined : Math.max(0, Number(v) || 0);

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center justify-between gap-[12px]">
        <p className="text-[12px] text-fg-muted">
          baseURL / 金鑰留空＝用伺服器預設（OpenRouter）；填了就真的路由到該端點。
        </p>
        <div className="flex items-center gap-[8px]">
          <Button variant="ghost" size="sm" onClick={reset} title="回復預設 6 個模型">
            <RotateCcw className="mr-[6px] h-[13px] w-[13px]" /> 回復預設
          </Button>
          <Button size="sm" onClick={() => add(newModelEntry())} disabled={models.length >= MAX_MODELS}>
            <Plus className="mr-[8px] h-[14px] w-[14px]" /> 新增模型
          </Button>
        </div>
      </div>

      {models.length === 0 ? (
        <div className="flex h-[160px] flex-col items-center justify-center gap-[12px] rounded-[8px] border border-dashed border-border-strong text-center">
          <p className="text-[14px] text-fg-secondary">還沒有任何模型</p>
          <Button size="sm" onClick={() => add(newModelEntry())}>新增第一個</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          {models.map((m) => (
            <ModelRow key={m.id} entry={m} onChange={(p) => update(m.id, p)} onDelete={() => remove(m.id)} numOrUndef={numOrUndef} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModelRow({
  entry,
  onChange,
  onDelete,
  numOrUndef,
}: {
  entry: ModelEntry;
  onChange: (patch: Partial<ModelEntry>) => void;
  onDelete: () => void;
  numOrUndef: (v: string) => number | undefined;
}) {
  const labelCls = "text-[12px] font-medium text-fg-secondary";
  const fieldCls = "h-[32px] text-[13px]";
  return (
    <div className={`rounded-[8px] border bg-bg-subtle p-[16px] ${entry.enabled ? "border-border-default" : "border-border-subtle opacity-60"}`}>
      <div className="mb-[12px] flex items-center justify-between gap-[12px]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] font-medium text-fg-default">{entry.displayName || "（未命名）"}</span>
          <span className="rounded-full bg-bg-elevated px-[8px] py-[1px] text-[11px] text-fg-muted">{entry.provider}</span>
        </div>
        <div className="flex items-center gap-[12px]">
          <label className="flex cursor-pointer items-center gap-[6px] text-[12px] text-fg-secondary">
            <input type="checkbox" checked={entry.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} className="h-[14px] w-[14px] accent-primary-default" />
            啟用
          </label>
          <Button variant="ghost" size="icon" className="h-[28px] w-[28px] text-fg-muted hover:text-status-error" onClick={onDelete} title="刪除">
            <Trash2 className="h-[14px] w-[14px]" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
        <div className="flex flex-col gap-[6px]">
          <label className={labelCls}>顯示名稱</label>
          <Input value={entry.displayName} onChange={(e) => onChange({ displayName: e.target.value })} className={fieldCls} placeholder="GPT-5.4 Mini" />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelCls}>廠商</label>
          <Input value={entry.provider} onChange={(e) => onChange({ provider: e.target.value })} className={fieldCls} placeholder="OpenAI" />
        </div>
        <div className="flex flex-col gap-[6px] sm:col-span-2">
          <label className={labelCls}>模型 ID（送給 gateway）</label>
          <Input value={entry.modelId} onChange={(e) => onChange({ modelId: e.target.value })} className={`${fieldCls} font-mono`} placeholder="openai/gpt-5.4-mini" />
        </div>
        <div className="flex flex-col gap-[6px] sm:col-span-2">
          <label className={labelCls}>baseURL（空＝伺服器預設）</label>
          <Input value={entry.baseURL} onChange={(e) => onChange({ baseURL: e.target.value })} className={`${fieldCls} font-mono`} placeholder="https://openrouter.ai/api/v1" />
        </div>
        <div className="flex flex-col gap-[6px] sm:col-span-2">
          <label className={labelCls}>API 金鑰（空＝伺服器預設）</label>
          <Input type="password" value={entry.apiKey} onChange={(e) => onChange({ apiKey: e.target.value })} className={`${fieldCls} font-mono`} placeholder="sk-..." autoComplete="off" />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelCls}>輸入價 $/1M（選填）</label>
          <Input type="number" min="0" step="0.01" value={entry.inputPricePer1M ?? ""} onChange={(e) => onChange({ inputPricePer1M: numOrUndef(e.target.value) })} className={fieldCls} placeholder="0.75" />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelCls}>輸出價 $/1M（選填）</label>
          <Input type="number" min="0" step="0.01" value={entry.outputPricePer1M ?? ""} onChange={(e) => onChange({ outputPricePer1M: numOrUndef(e.target.value) })} className={fieldCls} placeholder="4.5" />
        </div>
      </div>
    </div>
  );
}

function TokenEstimator() {
  const { enabledModels, isHydrated } = useModelRegistry();
  const priced = enabledModels.filter((m) => m.inputPricePer1M != null || m.outputPricePer1M != null);
  const [prompt, setPrompt] = useState('');
  const [entryId, setEntryId] = useState<string>('');

  // hydration 後預設選第一個有價格的模型
  useEffect(() => {
    if (isHydrated && !entryId && priced.length > 0) setEntryId(priced[0].id);
  }, [isHydrated, entryId, priced]);

  const selected = priced.find((m) => m.id === entryId) ?? priced[0];

  const { inputTokens, outputTokens, costUSD, level } = useMemo(() => {
    const inTok = estimateTokens(prompt);
    const outTok = inTok; // 簡化：輸出約等於輸入
    const inP = selected?.inputPricePer1M ?? 0;
    const outP = selected?.outputPricePer1M ?? 0;
    const cost = (inTok / 1_000_000) * inP + (outTok / 1_000_000) * outP;
    return { inputTokens: inTok, outputTokens: outTok, costUSD: cost, level: levelOf(cost) };
  }, [prompt, selected]);

  const levelStyles: Record<typeof level, { dot: string; text: string; bg: string; label: string }> = {
    green: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
      label: '安全區',
    },
    yellow: {
      dot: 'bg-amber-500',
      text: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
      label: '注意',
    },
    red: {
      dot: 'bg-rose-500',
      text: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-200',
      label: '偏貴',
    },
  };
  const s = levelStyles[level];

  return (
    <Card>
      <CardHeader className="p-[20px] pb-[12px]">
        <CardTitle className="text-[16px]">Token 預估器</CardTitle>
        <CardDescription className="text-[13px]">敲什麼算什麼——發送前先看到這次調用大概會花多少錢。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-[16px] px-[20px] pb-[16px] pt-0">
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="token-est-model" className="text-[13px] font-medium text-fg-default">選模型</label>
          <select
            id="token-est-model"
            value={selected?.id ?? ''}
            onChange={(e) => setEntryId(e.target.value)}
            disabled={priced.length === 0}
            className="max-w-[400px] h-[36px] rounded-[6px] border border-border-default bg-bg-default px-[10px] text-[13px] text-fg-default focus:outline-none focus:ring-2 focus:ring-primary-default/40 disabled:opacity-60"
          >
            {priced.length === 0 ? (
              <option value="">（無含價格的模型，請到上方模型管理填價格）</option>
            ) : (
              priced.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}（{m.provider} · 輸入 ${m.inputPricePer1M ?? 0}/M · 輸出 ${m.outputPricePer1M ?? 0}/M）
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex flex-col gap-[8px]">
          <label htmlFor="token-est-prompt" className="text-[13px] font-medium text-fg-default">Prompt</label>
          <Textarea
            id="token-est-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="把你準備發的 prompt 粘進來，即時看花多少..."
            className="min-h-[120px] text-[13px]"
          />
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-[12px] rounded-[8px] border px-[12px] py-[10px] ${s.bg}`}>
          <div className="flex items-center gap-[10px]">
            <span className={`inline-block h-[8px] w-[8px] rounded-full ${s.dot}`} aria-hidden />
            <span className={`text-[13px] font-medium ${s.text}`}>{s.label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-[16px] text-[13px] text-fg-secondary">
            <span>輸入 <span className="font-mono text-fg-default">{inputTokens}</span> tokens</span>
            <span>輸出約 <span className="font-mono text-fg-default">{outputTokens}</span> tokens</span>
            <span>本次约 <span className={`font-mono font-semibold ${s.text}`}>{formatUSD(costUSD)}</span></span>
          </div>
        </div>

        <p className="text-[12px] text-fg-muted">
          粗估（按 4 字符/token），誤差 ±30%，用於事前預警；計費以 provider 返回為準。
        </p>
      </CardContent>
    </Card>
  );
}