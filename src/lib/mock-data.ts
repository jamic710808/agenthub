// [Prep-03] 修复 Hydration mismatch：确定化所有随机值
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
const rand = seededRandom(42);
const MOCK_NOW = 1713600000000;

export const AGENTS = Array.from({ length: 24 }).map((_, i) => ({
  id: `agent-${i + 1}`,
  name: [
    '代碼審查助手',
    '數據分析師',
    '會議紀要整理器',
    'SEO 優化專家',
    '社交媒體文案生成器',
    '產品經理模擬器',
    '架構圖生成器',
    '前端組件生成器',
  ][i % 8],
  description: [
    '自動審查你的 Pull Request，檢查代碼風格、潛在 bug 和效能問題。',
    '輸入 CSV 即可輸出完整的分析報告和視覺化圖表代碼。',
    '將會議錄音或文字轉錄自動總結為結構化的 Action Items。',
    '分析網頁內容並生成符合 SEO 最佳實踐的優化建議。',
    '根據產品描述生成適合小紅書、微博、推特的文案。',
    '模擬挑剔的產品經理，幫你在開發前找出需求漏洞。',
    '根據自然語言描述自動生成 Mermaid 架構圖代碼。',
    '輸入 UI 截圖或描述，生成 React + Tailwind 組件代碼。',
  ][i % 8],
  author: ['AI Lab', 'DevTools Inc.', 'NextGen Corp.', 'OpenSource Co.'][i % 4],
  category: ['開發工具', '生產力', '行銷', '設計'][i % 4],
  provider: ['OpenAI', 'Anthropic', 'Meta', 'Google'][i % 4],
  capabilities: ['代碼生成', '數據分析', '視覺分析', '文字總結'].slice(0, (i % 3) + 1),
  price: i % 3 === 0 ? '免費' : i % 5 === 0 ? '$5/月' : '按需付費',
  runs: Math.floor(rand() * 100000) + 1000,
  rating: (rand() * 1.5 + 3.5).toFixed(1),
}));

export const CATEGORIES = [
  '開發工具',
  '生產力',
  '行銷',
  '設計',
  '人力資源',
  '銷售',
  '客戶支援',
  '財務',
  '教育',
  '遊戲',
];

export const PROVIDERS = ['OpenAI', 'Anthropic', 'Meta', 'Google', 'Mistral'];

export const RUN_HISTORY = Array.from({ length: 15 }).map((_, i) => ({
  id: `run-00${i + 1}`,
  timestamp: new Date(MOCK_NOW - i * 3600000 * rand()).toISOString(),
  agent: AGENTS[i % 8].name,
  status: i % 10 === 0 ? 'error' : 'success',
  duration: (rand() * 5 + 0.5).toFixed(2) + 's',
  cost: '$' + (rand() * 0.05).toFixed(4),
  input: '幫我用 React 寫一個帶載入態的按鈕元件。',
  output: '好的，這是為你生成的 React 按鈕元件代碼...',
  trace: [
    { name: 'Input Parser', duration: '0.1s', type: 'tool' },
    { name: 'Retrieve Context', duration: '0.5s', type: 'retriever' },
    { name: 'LLM Generation', duration: '2.3s', type: 'llm' },
    { name: 'Output Formatter', duration: '0.1s', type: 'tool' },
  ],
}));
