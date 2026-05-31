import Link from "next/link";
import { BookOpen, Rocket, Store, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// [Phase-1] /docs 佔位頁——原本 header CTA 與 footer「文檔」連到此路由會 404。
// 先給一個與設計系統一致的骨架頁，避免死連結；正式文檔內容後續再補。
export default function Docs() {
  return (
    <div className="mx-auto flex w-full max-w-[800px] flex-col px-[24px] py-[48px]">
      <Badge variant="outline" className="mb-[16px] w-fit">文檔施工中</Badge>
      <h1 className="mb-[12px] flex items-center gap-[12px] text-[30px] font-bold text-fg-default">
        <BookOpen className="h-[28px] w-[28px] text-primary-default" />
        AgentHub 文檔
      </h1>
      <p className="mb-[32px] text-[16px] text-fg-secondary">
        完整文檔正在撰寫中。在此之前，你可以直接從以下入口開始使用平台。
      </p>

      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-3">
        <Link href="/gallery">
          <Card className="h-full transition-colors hover:border-primary-default/50">
            <CardHeader className="p-[16px]">
              <Store className="mb-[8px] h-[20px] w-[20px] text-primary-default" />
              <CardTitle className="text-[15px]">瀏覽商店</CardTitle>
              <CardDescription className="text-[13px]">探索並開啟 Agent Playground。</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/pipeline">
          <Card className="h-full transition-colors hover:border-primary-default/50">
            <CardHeader className="p-[16px]">
              <Rocket className="mb-[8px] h-[20px] w-[20px] text-primary-default" />
              <CardTitle className="text-[15px]">工作流編排</CardTitle>
              <CardDescription className="text-[13px]">用節點畫布串接你的 Agent 流程。</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/runs">
          <Card className="h-full transition-colors hover:border-primary-default/50">
            <CardHeader className="p-[16px]">
              <Activity className="mb-[8px] h-[20px] w-[20px] text-primary-default" />
              <CardTitle className="text-[15px]">執行記錄</CardTitle>
              <CardDescription className="text-[13px]">查看每次運行的 Trace 瀑布圖。</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card className="mt-[32px]">
        <CardContent className="flex flex-col items-start gap-[12px] p-[20px]">
          <h2 className="text-[16px] font-semibold text-fg-default">快速開始</h2>
          <p className="text-[14px] leading-relaxed text-fg-secondary">
            到 Agent 商店挑一個 Agent，開啟 Playground，輸入你的 prompt（cmd/ctrl + enter 送出），
            即可看到流式生成的結構化 UI 卡片。你也能在右上角切換模型。
          </p>
          <Button asChild>
            <Link href="/gallery">
              立即開始
              <ArrowRight className="ml-[8px] h-[16px] w-[16px]" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
