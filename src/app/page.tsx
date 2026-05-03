import Link from 'next/link';
import { ArrowRight, Terminal, BarChart, Activity, Zap, Layers, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ParticleBackground } from '@/components/particle-background';
import { AGENTS } from '@/lib/mock-data';

export default function Landing() {
  return (
    <div className="flex flex-col">
      {/* [Prep-02] 修复 #1: Hero 区 py 压缩至 48/64，max-h-[60vh] */}
      <section className="relative flex max-h-[60vh] flex-col items-center justify-center overflow-hidden px-[24px] py-[48px] text-center md:py-[64px]">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col items-center">
          <Badge variant="outline" className="mb-[16px]">AgentHub 2.0 現已發布</Badge>
          {/* [Prep-02] 修复 #1: 标题 30/36px 符合规范 */}
          <h1 className="mb-[16px] max-w-[800px] text-[30px] font-bold leading-tight tracking-tight text-fg-default md:text-[36px]">
            下一代 <span className="text-primary-default">AI Agent</span><br />
            構建、編排與分發平台
          </h1>
          <p className="mb-[24px] max-w-[600px] text-[15px] text-fg-secondary md:text-[16px]">
            為專業開發者設計的高效能工具。從零開始構建你的 AI 業務邏輯，或直接探索並整合社區的精選 Agent。
          </p>
          <div className="flex flex-col items-center gap-[12px] sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/gallery">
                瀏覽 Agent 商店
                <ArrowRight className="ml-[8px] h-[16px] w-[16px]" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/docs">查看文檔</Link>
            </Button>
          </div>
          <p className="mt-[12px] text-[13px] text-fg-muted">
            線上展示，無需註冊
          </p>
        </div>
      </section>

      {/* [Prep-02] 修复 #1: section py 从 64 压缩，卡片间距缩小 */}
      <section className="border-t border-border-default bg-bg-subtle px-[24px] py-[48px]">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-[24px] flex items-end justify-between">
            <div>
              <h2 className="text-[24px] font-semibold text-fg-default">精選 Agent</h2>
              <p className="mt-[4px] text-[14px] text-fg-secondary">立即整合，加速你的 AI 應用開發。</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/gallery">查看全部 <ArrowRight className="ml-[4px] h-[16px] w-[16px]" /></Link>
            </Button>
          </div>
          {/* [Prep-02] 修复 #1: gap 从 24 缩至 16，md 2列 lg 3列 */}
          <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 lg:grid-cols-3">
            {AGENTS.slice(0, 6).map((agent) => (
              // [Prep-02] 修复 #2: Card hover 去掉 translate/shadow，已由 Card 组件统一处理
              <Card key={agent.id} className="flex flex-col">
                <CardHeader className="p-[16px] pb-[12px]">
                  <div className="flex items-start justify-between">
                    <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-bg-elevated">
                      <Terminal className="h-[18px] w-[18px] text-primary-default" />
                    </div>
                    <Badge variant="outline">{agent.category}</Badge>
                  </div>
                  <CardTitle className="mt-[12px] text-[15px]">{agent.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[36px] text-[13px]">{agent.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto px-[16px] pb-[12px] pt-0">
                  <div className="flex flex-wrap gap-[4px]">
                    {agent.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="px-[8px] py-0 text-[12px]">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t border-border-subtle px-[16px] py-[12px]">
                  <span className="text-[14px] font-medium text-fg-default">{agent.price}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/agent/${agent.id}`}>開啟 Playground</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* [Prep-02] 修复 #1: Value Props py 压缩 */}
      <section className="bg-bg-base px-[24px] py-[48px]">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 gap-[24px] md:grid-cols-3">
            <div className="flex flex-col gap-[12px]">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-primary-default/10 text-primary-default">
                <Zap className="h-[20px] w-[20px]" />
              </div>
              <h3 className="text-[18px] font-semibold text-fg-default">生成式 UI 流式渲染</h3>
              <p className="text-[14px] leading-relaxed text-fg-secondary">
                支援 React Server Components 和串流傳輸，在終端使用者看到第一個 Token 時即可渲染複雜的 UI 互動介面。
              </p>
            </div>
            <div className="flex flex-col gap-[12px]">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-status-warning/10 text-status-warning">
                <BarChart className="h-[20px] w-[20px]" />
              </div>
              <h3 className="text-[18px] font-semibold text-fg-default">Token 用量事前預估</h3>
              <p className="text-[14px] leading-relaxed text-fg-secondary">
                基於輸入 prompt 和工具鏈的靜態分析，在執行前給出精準的 Token 消耗和成本預估。
              </p>
            </div>
            <div className="flex flex-col gap-[12px]">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-status-success/10 text-status-success">
                <Activity className="h-[20px] w-[20px]" />
              </div>
              <h3 className="text-[18px] font-semibold text-fg-default">Trace 執行瀑布圖</h3>
              <p className="text-[14px] leading-relaxed text-fg-secondary">
                生產級可觀察性。每一條大模型呼叫、工具執行、檢索耗時都以毫秒級瀑布圖呈現。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* [Prep-02] 修复 #1: Stats py 从 48 缩至 32，数字从 36 缩至 30 */}
      <section className="border-y border-border-default bg-bg-elevated px-[24px] py-[32px]">
        <div className="mx-auto grid max-w-[1024px] grid-cols-2 gap-[24px] md:grid-cols-4">
          <div className="flex flex-col items-center gap-[4px] text-center">
            <span className="text-[30px] font-bold text-fg-default">500+</span>
            <span className="text-[13px] text-fg-secondary">個 Agent</span>
          </div>
          <div className="flex flex-col items-center gap-[4px] text-center">
            <span className="text-[30px] font-bold text-fg-default">1 萬+</span>
            <span className="text-[13px] text-fg-secondary">開發者</span>
          </div>
          <div className="flex flex-col items-center gap-[4px] text-center">
            <span className="text-[30px] font-bold text-fg-default">5000 萬+</span>
            <span className="text-[13px] text-fg-secondary">次運行</span>
          </div>
          <div className="flex flex-col items-center gap-[4px] text-center">
            <span className="text-[30px] font-bold text-fg-default">99.9%</span>
            <span className="text-[13px] text-fg-secondary">可用性</span>
          </div>
        </div>
      </section>
    </div>
  );
}