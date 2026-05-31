"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Plus,
  Play,
  Save,
  Settings2,
  Box,
  Database,
  Code2,
  Link as LinkIcon,
  CircleDashed,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_PIPELINE,
  PIPELINE_KEY,
  pipelineSchema,
  type PipelineNodeData,
  type PipelineNodeKind,
} from "@/lib/schemas/pipeline";
import { useRunHistory } from "@/lib/hooks/use-run-history";
import { createRunRecord, type RunRecord } from "@/lib/schemas/run-record";
import { useModelRegistry } from "@/lib/hooks/use-model-registry";

type PipelineNodeType = Node<PipelineNodeData, "pipeline">;

// 節點種類 → /runs 瀑布圖的 trace step 型別
const TRACE_TYPE: Record<PipelineNodeKind, RunRecord["trace"][number]["type"]> = {
  trigger: "agent",
  retriever: "retrieval",
  llm: "llm",
  tool: "tool",
  output: "agent",
};

// 拓撲排序（Kahn）；有循環回傳 null
function topoOrder(
  nodeIds: string[],
  edges: { source: string; target: string }[],
): string[] | null {
  const indeg = new Map(nodeIds.map((id) => [id, 0]));
  const adj = new Map<string, string[]>(nodeIds.map((id) => [id, []]));
  for (const e of edges) {
    if (!indeg.has(e.source) || !indeg.has(e.target)) continue;
    adj.get(e.source)!.push(e.target);
    indeg.set(e.target, indeg.get(e.target)! + 1);
  }
  const queue = [...indeg.entries()].filter(([, d]) => d === 0).map(([id]) => id);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of adj.get(id)!) {
      indeg.set(next, indeg.get(next)! - 1);
      if (indeg.get(next) === 0) queue.push(next);
    }
  }
  return order.length === nodeIds.length ? order : null;
}

const NODE_ICON: Record<PipelineNodeKind, React.ComponentType<{ className?: string }>> = {
  trigger: LinkIcon,
  retriever: Database,
  llm: Box,
  tool: Code2,
  output: CircleDashed,
};

function iconWrapClass(kind: PipelineNodeKind): string {
  if (kind === "trigger") return "bg-primary-default/10 text-primary-default";
  if (kind === "llm") return "bg-status-warning/10 text-status-warning";
  return "bg-bg-elevated text-fg-secondary";
}

// 單一自訂節點，靠 data.nodeType 區分外觀；提供真實的左進/右出連接點
function PipelineNode({ data, selected }: NodeProps<PipelineNodeType>) {
  const Icon = NODE_ICON[data.nodeType];
  return (
    <div
      className={`w-[180px] rounded-[8px] border bg-bg-subtle p-[16px] shadow-sm transition-all ${
        selected
          ? "border-primary-default ring-2 ring-primary-default/20"
          : "border-border-default hover:border-primary-default/50"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-[10px] !w-[10px] !border-2 !border-border-strong !bg-bg-base" />
      <div className="mb-[12px] flex items-center justify-between">
        <div className={`flex h-[24px] w-[24px] items-center justify-center rounded-[8px] ${iconWrapClass(data.nodeType)}`}>
          <Icon className="h-[14px] w-[14px]" />
        </div>
        {data.status === "active" && (
          <span className="relative flex h-[8px] w-[8px] rounded-full bg-status-warning">
            <span className="absolute inset-0 animate-ping rounded-full bg-status-warning opacity-75" />
          </span>
        )}
        {data.status === "success" && <span className="h-[8px] w-[8px] rounded-full bg-status-success" />}
        {data.status === "error" && <span className="h-[8px] w-[8px] rounded-full bg-status-error" />}
      </div>
      <h3 className="text-[14px] font-medium text-fg-default">{data.label}</h3>
      <p className="mt-[4px] text-[12px] text-fg-muted">{data.nodeType}</p>
      <Handle type="source" position={Position.Right} className="!h-[10px] !w-[10px] !border-2 !border-border-strong !bg-bg-base" />
    </div>
  );
}

const nodeTypes = { pipeline: PipelineNode };

export default function Pipeline() {
  const [nodes, setNodes, onNodesChange] = useNodesState<PipelineNodeType>(
    DEFAULT_PIPELINE.nodes as PipelineNodeType[],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    DEFAULT_PIPELINE.edges as Edge[],
  );
  const [selectedId, setSelectedId] = useState<string | null>("node-3");
  const [dirty, setDirty] = useState(false);
  const [execInput, setExecInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [execResult, setExecResult] = useState<{ status: "success" | "error"; text: string } | null>(null);
  const savedOnceRef = useRef(false);
  const { addRun } = useRunHistory();
  const { enabledModels } = useModelRegistry();

  // 載入存檔（localStorage 有就覆蓋預設）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PIPELINE_KEY);
      if (raw) {
        const parsed = pipelineSchema.safeParse(JSON.parse(raw));
        if (parsed.success) {
          setNodes(parsed.data.nodes as PipelineNodeType[]);
          setEdges(parsed.data.edges as Edge[]);
        }
      }
    } catch {
      // 壞資料忽略，留用預設
    }
  }, [setNodes, setEdges]);

  // 只有真正改動（非 select / dimensions 量測）才標記未儲存
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      if (changes.some((c) => c.type !== "select" && c.type !== "dimensions")) {
        setDirty(true);
      }
    },
    [onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes);
      if (changes.some((c) => c.type !== "select")) setDirty(true);
    },
    [onEdgesChange],
  );

  const onConnect = useCallback(
    (c: Connection) => {
      setEdges((eds) => addEdge(c, eds));
      setDirty(true);
    },
    [setEdges],
  );

  const updateNodeData = useCallback(
    (id: string, patch: Partial<PipelineNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
      setDirty(true);
    },
    [setNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedId(null);
      setDirty(true);
    },
    [setNodes, setEdges],
  );

  const addNode = useCallback(() => {
    const id = `node-${Date.now()}`;
    const newNode: PipelineNodeType = {
      id,
      type: "pipeline",
      position: { x: 240 + Math.random() * 200, y: 200 + Math.random() * 140 },
      data: { label: "新節點", nodeType: "tool", status: "idle" },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedId(id);
    setDirty(true);
  }, [setNodes]);

  const save = useCallback(() => {
    try {
      localStorage.setItem(PIPELINE_KEY, JSON.stringify({ nodes, edges }));
      setDirty(false);
      savedOnceRef.current = true;
    } catch {
      // 配額爆掉等：維持 dirty
    }
  }, [nodes, edges]);

  const setNodeStatus = useCallback(
    (id: string, status: PipelineNodeData["status"]) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, status } } : n)),
      );
    },
    [setNodes],
  );

  // 客戶端編排：拓撲排序逐節點跑，資料以純文字沿 edges 流動，匯流時串接。
  // 只有 llm 節點真打後端（/api/pipeline/node）；其餘節點誠實透傳上游輸入。
  const runWorkflow = useCallback(async () => {
    if (isRunning) return;
    if (!execInput.trim()) {
      setExecResult({ status: "error", text: "請先在上方輸入工作流輸入再執行" });
      return;
    }

    const graphNodes = nodes;
    const graphEdges = edges;
    const order = topoOrder(graphNodes.map((n) => n.id), graphEdges);
    if (!order) {
      setExecResult({ status: "error", text: "工作流有循環（cycle），無法執行" });
      return;
    }

    const incoming = new Map<string, string[]>();
    for (const e of graphEdges) {
      if (!incoming.has(e.target)) incoming.set(e.target, []);
      incoming.get(e.target)!.push(e.source);
    }

    setIsRunning(true);
    setExecResult(null);
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: "idle" as const } })));

    const outputs = new Map<string, string>();
    const trace: RunRecord["trace"] = [];
    const startedAt = Date.now();
    let runStatus: "success" | "error" = "success";
    let primaryModel = "pipeline";

    for (const id of order) {
      const node = graphNodes.find((n) => n.id === id)!;
      const kind = node.data.nodeType;
      setNodeStatus(id, "active");

      const sources = incoming.get(id) ?? [];
      const inputText =
        sources.length === 0
          ? execInput.trim()
          : sources.map((s) => outputs.get(s) ?? "").filter(Boolean).join("\n\n");

      const nodeStart = Date.now();
      let outText = inputText;
      let stepStatus: "success" | "error" = "success";

      try {
        if (kind === "llm") {
          const entry =
            enabledModels.find((m) => m.id === node.data.modelEntryId) ?? enabledModels[0];
          const model = entry?.modelId || "openai/gpt-5.4-mini";
          if (primaryModel === "pipeline") primaryModel = model;
          const res = await fetch("/api/pipeline/node", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              baseURL: entry?.baseURL ?? "",
              apiKey: entry?.apiKey ?? "",
              promptTemplate: node.data.promptTemplate ?? "",
              input: inputText,
            }),
          });
          const json = (await res.json()) as { text?: string; error?: string };
          if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
          outText = json.text ?? "";
        }
        // 非 llm 節點：誠實透傳（outText 已等於 inputText）
      } catch (err) {
        stepStatus = "error";
        runStatus = "error";
        outText = err instanceof Error ? err.message : "節點執行失敗";
      }

      const nodeMs = Date.now() - nodeStart;
      outputs.set(id, outText);
      setNodeStatus(id, stepStatus);
      trace.push({
        name: `${kind}:${node.data.label}`,
        duration: (nodeMs / 1000).toFixed(2) + "s",
        type: TRACE_TYPE[kind],
      });

      if (stepStatus === "error") break;
    }

    // 最終輸出取 output 節點，沒有就取執行順序最後一個
    const outputNode = graphNodes.find((n) => n.data.nodeType === "output");
    const finalId = outputNode ? outputNode.id : order[order.length - 1];
    const finalText = outputs.get(finalId) || "(無輸出)";

    setExecResult({ status: runStatus, text: finalText });
    addRun(
      createRunRecord({
        agentId: "pipeline",
        agentName: "工作流編排",
        model: primaryModel,
        prompt: execInput.trim(),
        status: runStatus,
        durationMs: Date.now() - startedAt,
        output: finalText,
        trace,
      }),
    );
    setIsRunning(false);
  }, [isRunning, execInput, nodes, edges, setNodes, setNodeStatus, addRun, enabledModels]);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-bg-base">
      <header className="flex h-[48px] shrink-0 items-center justify-between border-b border-border-default bg-bg-subtle px-[20px]">
        <div className="flex items-center gap-[16px]">
          <h1 className="text-[16px] font-semibold text-fg-default">工作流編排</h1>
          <Badge variant={dirty ? "outline" : "secondary"} className="text-[12px]">
            {dirty ? "未儲存變更" : "已儲存"}
          </Badge>
        </div>
        <div className="flex items-center gap-[12px]">
          <Button variant="secondary" size="sm" onClick={addNode}>
            <Plus className="mr-[8px] h-[14px] w-[14px]" /> 添加節點
          </Button>
          <Button variant="outline" size="sm" onClick={save} disabled={!dirty}>
            <Save className="mr-[8px] h-[14px] w-[14px]" /> 儲存
          </Button>
          <div className="mx-[8px] h-[24px] w-px bg-border-strong" />
          <Input
            value={execInput}
            onChange={(e) => setExecInput(e.target.value)}
            placeholder="工作流輸入…"
            disabled={isRunning}
            className="h-[30px] w-[220px] text-[13px]"
          />
          <Button size="sm" onClick={runWorkflow} disabled={isRunning}>
            {isRunning ? (
              <Loader2 className="mr-[8px] h-[14px] w-[14px] animate-spin" />
            ) : (
              <Play className="mr-[8px] h-[14px] w-[14px]" fill="currentColor" />
            )}
            {isRunning ? "執行中…" : "執行"}
          </Button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <main className="relative h-full flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} />
            <Controls />
          </ReactFlow>

          {execResult && (
            <div className="absolute bottom-[16px] left-1/2 max-h-[40%] w-[min(720px,calc(100%-48px))] -translate-x-1/2 overflow-hidden rounded-[8px] border border-border-default bg-bg-elevated shadow-lg">
              <div className="flex items-center justify-between border-b border-border-subtle px-[16px] py-[10px]">
                <div className="flex items-center gap-[8px]">
                  <span
                    className={`h-[8px] w-[8px] rounded-full ${
                      execResult.status === "success" ? "bg-status-success" : "bg-status-error"
                    }`}
                  />
                  <span className="text-[13px] font-medium text-fg-default">
                    {execResult.status === "success" ? "執行完成" : "執行失敗"}
                  </span>
                  <span className="text-[12px] text-fg-muted">已記錄到運行記錄</span>
                </div>
                <button
                  onClick={() => setExecResult(null)}
                  className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg-default"
                  aria-label="關閉"
                >
                  <X className="h-[14px] w-[14px]" />
                </button>
              </div>
              <pre className="max-h-[240px] overflow-auto whitespace-pre-wrap p-[16px] text-[13px] leading-relaxed text-fg-default">
                {execResult.text}
              </pre>
            </div>
          )}
        </main>

        <aside className="flex w-[320px] shrink-0 flex-col border-l border-border-default bg-bg-subtle">
          <div className="flex h-[48px] items-center border-b border-border-default px-[16px]">
            <h2 className="flex items-center gap-[8px] text-[14px] font-semibold text-fg-default">
              <Settings2 className="h-[16px] w-[16px]" />
              節點屬性
            </h2>
          </div>

          {selectedNode ? (
            <div className="flex flex-1 flex-col gap-[24px] overflow-y-auto p-[20px]">
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] font-medium text-fg-secondary">節點名稱</label>
                <Input
                  value={selectedNode.data.label}
                  onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                  className="h-[32px] text-[13px]"
                />
              </div>

              {selectedNode.data.nodeType === "llm" && (
                <>
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[13px] font-medium text-fg-secondary">模型</label>
                    <select
                      value={selectedNode.data.modelEntryId ?? (enabledModels[0]?.id ?? "")}
                      onChange={(e) => updateNodeData(selectedNode.id, { modelEntryId: e.target.value })}
                      className="h-[32px] w-full rounded-[8px] border border-border-default bg-bg-base px-[12px] text-[13px] text-fg-default focus:outline-none focus:ring-1 focus:ring-primary-default"
                    >
                      {enabledModels.length === 0 ? (
                        <option value="">（無啟用模型，請到設定→模型）</option>
                      ) : (
                        enabledModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.displayName}（{m.provider}）
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[13px] font-medium text-fg-secondary">Prompt 模板</label>
                    <textarea
                      value={selectedNode.data.promptTemplate ?? ""}
                      onChange={(e) => updateNodeData(selectedNode.id, { promptTemplate: e.target.value })}
                      className="min-h-[160px] w-full rounded-[8px] border border-border-default bg-bg-base p-[12px] font-mono text-[13px] text-fg-default placeholder-fg-muted focus:border-primary-default focus:outline-none focus:ring-1 focus:ring-primary-default"
                    />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-medium text-fg-secondary">Temperature</label>
                      <span className="font-mono text-[12px] text-fg-muted">
                        {(selectedNode.data.temperature ?? 0.7).toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={selectedNode.data.temperature ?? 0.7}
                      onChange={(e) => updateNodeData(selectedNode.id, { temperature: Number(e.target.value) })}
                      className="w-full accent-primary-default"
                    />
                  </div>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => deleteNode(selectedNode.id)}
                className="mt-auto border-status-error/50 text-status-error hover:border-status-error hover:bg-status-error/10"
              >
                刪除此節點
              </Button>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-[20px] text-center">
              <p className="text-[13px] text-fg-secondary">點選畫布上的節點以編輯屬性</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
