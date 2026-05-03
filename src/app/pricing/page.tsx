import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Pricing() {
  return (
    <div className="flex flex-col bg-bg-base px-[24px] py-[48px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-[48px] text-center">
          <h1 className="mb-[12px] text-[30px] font-bold text-fg-default">透明、可預測的定價</h1>
          <p className="text-[16px] text-fg-secondary">從個人黑客到企業團隊，總有一款適合你。</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-[24px] md:grid-cols-3 lg:gap-[32px]">
          {/* Free */}
          <Card className="flex flex-col border-border-default hover:border-primary-default/50 transition-colors">
            <CardHeader className="gap-[12px]">
              <CardTitle className="text-[20px]">免費版</CardTitle>
              <CardDescription className="text-[14px]">適合個人開發者試用和驗證概念。</CardDescription>
              <div className="text-[30px] font-bold text-fg-default">
                $0<span className="text-[14px] font-normal text-fg-secondary"> / 每月</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-[16px]">
              <div className="flex items-center gap-[8px]">
                <Check className="h-[16px] w-[16px] text-status-success" />
                <span className="text-[14px] text-fg-secondary">每月 1000 次 API 呼叫</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Check className="h-[16px] w-[16px] text-status-success" />
                <span className="text-[14px] text-fg-secondary">基礎模型訪問 (GPT-3.5)</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Check className="h-[16px] w-[16px] text-status-success" />
                <span className="text-[14px] text-fg-secondary">社群支援</span>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-[24px]">
              <Button variant="outline" className="w-full">免費開始</Button>
            </CardFooter>
          </Card>

          {/* Pro */}
          <Card className="relative flex flex-col border-primary-default bg-bg-subtle shadow-lg">
            <div className="absolute -top-[12px] left-1/2 -translate-x-1/2">
              <Badge variant="default" className="px-[12px] py-[4px] text-[12px]">最受歡迎</Badge>
            </div>
            <CardHeader className="gap-[12px]">
              <CardTitle className="text-[20px]">專業版</CardTitle>
              <CardDescription className="text-[14px]">為獨立創作者和高級開發者打造。</CardDescription>
              <div className="text-[30px] font-bold text-fg-default">
                $20<span className="text-[14px] font-normal text-fg-secondary"> / 每月</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-[16px]">
              <div className="flex items-center gap-[8px]">
                <Check className="h-[16px] w-[16px] text-status-success" />
                <span className="text-[14px] text-fg-secondary">每月 50,000 次 API 呼叫</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Check className="h-[16px] w-[16px] text-status-success" />
                <span className="text-[14px] text-fg-secondary">所有高級模型 (GPT-5.4 / Claude 4.7 / Gemini 2.5)</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Check className="h-[16px] w-[16px] text-status-success" />
                <span className="text-[14px] text-fg-secondary">進階 Trace 可視化</span>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-[24px]">
              <Button className="w-full">升級到專業版</Button>
            </CardFooter>
          </Card>

          {/* Team */}
          <Card className="flex flex-col border-border-default hover:border-primary-default/50 transition-colors">
            <CardHeader className="gap-[12px]">
              <CardTitle className="text-[20px]">團隊版</CardTitle>
              <CardDescription className="text-[14px]">適用於需要協作和高可用性的團隊。</CardDescription>
              <div className="text-[30px] font-bold text-fg-default">
                $50<span className="text-[14px] font-normal text-fg-secondary"> / 每席 / 每月</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-[16px]">
              <div className="flex items-center gap-[8px]">
                <Check className="h-[16px] w-[16px] text-status-success" />
                <span className="text-[14px] text-fg-secondary">不限次數 API 呼叫 (合理使用)</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Check className="h-[16px] w-[16px] text-status-success" />
                <span className="text-[14px] text-fg-secondary">團隊編排協作與權限管理</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Check className="h-[16px] w-[16px] text-status-success" />
                <span className="text-[14px] text-fg-secondary">專屬客戶成功經理與 SLA 保障</span>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-[24px]">
              <Button variant="secondary" className="w-full">聯繫銷售</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Feature Comparison */}
        <div className="mt-[48px]">
          <h2 className="mb-[24px] text-center text-[20px] font-semibold text-fg-default">詳細功能對比</h2>
          <div className="overflow-hidden rounded-[8px] border border-border-default bg-bg-subtle">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-bg-elevated border-b border-border-default">
                <tr>
                  <th className="p-[16px] font-medium text-fg-secondary">核心特性</th>
                  <th className="p-[16px] font-medium text-fg-secondary">免費版</th>
                  <th className="p-[16px] font-medium text-fg-secondary">專業版</th>
                  <th className="p-[16px] font-medium text-fg-secondary">團隊版</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                <tr>
                  <td className="p-[16px] text-fg-default">大模型 API 訪問</td>
                  <td className="p-[16px] text-fg-secondary">僅基礎模型</td>
                  <td className="p-[16px] text-fg-secondary">所有可用模型</td>
                  <td className="p-[16px] text-fg-secondary">所有可用模型 + 专属定制</td>
                </tr>
                <tr>
                  <td className="p-[16px] text-fg-default">Trace 留存時間</td>
                  <td className="p-[16px] text-fg-secondary">7 天</td>
                  <td className="p-[16px] text-fg-secondary">30 天</td>
                  <td className="p-[16px] text-fg-secondary">無限期</td>
                </tr>
                <tr>
                  <td className="p-[16px] text-fg-default">流式生成 UI</td>
                  <td className="p-[16px] text-fg-secondary"><Check className="h-[16px] w-[16px] text-status-success" /></td>
                  <td className="p-[16px] text-fg-secondary"><Check className="h-[16px] w-[16px] text-status-success" /></td>
                  <td className="p-[16px] text-fg-secondary"><Check className="h-[16px] w-[16px] text-status-success" /></td>
                </tr>
                <tr>
                  <td className="p-[16px] text-fg-default">並發限制</td>
                  <td className="p-[16px] text-fg-secondary">5 QPS</td>
                  <td className="p-[16px] text-fg-secondary">50 QPS</td>
                  <td className="p-[16px] text-fg-secondary">1000+ QPS</td>
                </tr>
                <tr>
                  <td className="p-[16px] text-fg-default">私有化部署</td>
                  <td className="p-[16px] text-fg-secondary"><X className="h-[16px] w-[16px] text-fg-disabled" /></td>
                  <td className="p-[16px] text-fg-secondary"><X className="h-[16px] w-[16px] text-fg-disabled" /></td>
                  <td className="p-[16px] text-fg-secondary"><Check className="h-[16px] w-[16px] text-status-success" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-[48px] max-w-[800px]">
          <h2 className="mb-[24px] text-center text-[20px] font-semibold text-fg-default">常見問題</h2>
          <div className="flex flex-col gap-[24px]">
            <div className="border-b border-border-default pb-[24px]">
              <h3 className="mb-[8px] text-[16px] font-medium text-fg-default">我可以隨時取消訂閱嗎？</h3>
              <p className="text-[14px] text-fg-secondary">是的，你可以隨時在帳戶設定中取消訂閱。取消後，你的權益將保留至當前計費週期結束。</p>
            </div>
            <div className="border-b border-border-default pb-[24px]">
              <h3 className="mb-[8px] text-[16px] font-medium text-fg-default">免費版有什麼限制？</h3>
              <p className="text-[14px] text-fg-secondary">免費版僅限於非商業用途的試用，併發限制較嚴，且只能訪問基礎的 GPT-3.5 級別模型。</p>
            </div>
            <div className="border-b border-border-default pb-[24px]">
              <h3 className="mb-[8px] text-[16px] font-medium text-fg-default">團隊版包含多少個席位？</h3>
              <p className="text-[14px] text-fg-secondary">團隊版基礎價格包含 1 個席位，你可以按每席 $50/月的價格增加額外的開發者席位。</p>
            </div>
            <div className="border-b border-border-default pb-[24px]">
              <h3 className="mb-[8px] text-[16px] font-medium text-fg-default">你們如何處理我的資料隱私？</h3>
              <p className="text-[14px] text-fg-secondary">我們不會使用你的輸入資料來訓練基礎模型。企業版客戶還可以選擇資料不出境的私有化部署方案。</p>
            </div>
            <div>
              <h3 className="mb-[8px] text-[16px] font-medium text-fg-default">是否支援按量付費？</h3>
              <p className="text-[14px] text-fg-secondary">目前的套餐包含了固定的額度。對於超額部分，我們提供靈活的 Token 按量計費，具體可在控制台查看帳單明細。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}