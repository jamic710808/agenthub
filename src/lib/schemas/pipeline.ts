// ============================================================
// 工作流編排持久化 Schema (Phase 3 · localStorage)
// ------------------------------------------------------------
// 存的是 React Flow 的 nodes/edges（JSON-serializable）。
// 用 passthrough 保留 React Flow 自帶的額外欄位，schema 只擋掉結構性壞資料。
// ============================================================

import { z } from "zod";

export const PIPELINE_KEY = "agenthub:pipeline" as const;

export const NODE_TYPES = [
  "trigger",
  "retriever",
  "llm",
  "tool",
  "output",
] as const;

export type PipelineNodeKind = (typeof NODE_TYPES)[number];

export interface PipelineNodeData {
  label: string;
  nodeType: PipelineNodeKind;
  status?: "idle" | "active" | "success" | "error";
  // 僅 llm 節點使用
  provider?: string;
  modelEntryId?: string; // 指向 settings 模型登錄表的 entry id
  promptTemplate?: string;
  temperature?: number;
  [key: string]: unknown;
}

const positionSchema = z.object({ x: z.number(), y: z.number() });

const nodeSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().optional(),
    position: positionSchema,
    data: z
      .object({
        label: z.string(),
        nodeType: z.enum(NODE_TYPES),
      })
      .passthrough(),
  })
  .passthrough();

const edgeSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
  })
  .passthrough();

export const pipelineSchema = z.object({
  nodes: z.array(nodeSchema).max(100),
  edges: z.array(edgeSchema).max(200),
});

export type PipelineSnapshot = z.infer<typeof pipelineSchema>;

// 首次進入（localStorage 空）時的預設工作流——沿用原靜態頁的 5 節點佈局
export const DEFAULT_PIPELINE: PipelineSnapshot = {
  nodes: [
    { id: "node-1", type: "pipeline", position: { x: 80, y: 160 }, data: { label: "HTTP 觸發器", nodeType: "trigger", status: "success" } },
    { id: "node-2", type: "pipeline", position: { x: 360, y: 40 }, data: { label: "知識庫檢索", nodeType: "retriever", status: "idle" } },
    { id: "node-3", type: "pipeline", position: { x: 360, y: 280 }, data: { label: "大模型生成", nodeType: "llm", status: "active", provider: "OpenAI", promptTemplate: "你是一位專業的程式碼審查助手。請審查以下程式碼：\n\n{{input_code}}", temperature: 0.7 } },
    { id: "node-4", type: "pipeline", position: { x: 640, y: 280 }, data: { label: "代碼解析器", nodeType: "tool", status: "idle" } },
    { id: "node-5", type: "pipeline", position: { x: 920, y: 160 }, data: { label: "最終輸出", nodeType: "output", status: "idle" } },
  ],
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2" },
    { id: "e1-3", source: "node-1", target: "node-3" },
    { id: "e3-4", source: "node-3", target: "node-4" },
    { id: "e2-5", source: "node-2", target: "node-5" },
    { id: "e4-5", source: "node-4", target: "node-5" },
  ],
};
