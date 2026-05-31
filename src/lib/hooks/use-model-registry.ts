"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_MODELS,
  MAX_MODELS,
  MODEL_REGISTRY_KEY,
  modelRegistrySchema,
  type ModelEntry,
} from "@/lib/schemas/model-registry";

export interface UseModelRegistryReturn {
  readonly models: readonly ModelEntry[];
  readonly enabledModels: readonly ModelEntry[];
  add: (entry: ModelEntry) => void;
  update: (id: string, patch: Partial<ModelEntry>) => void;
  remove: (id: string) => void;
  reset: () => void;
  readonly isHydrated: boolean;
}

export function useModelRegistry(): UseModelRegistryReturn {
  const [models, setModels] = useState<ModelEntry[]>(DEFAULT_MODELS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(MODEL_REGISTRY_KEY);
      if (raw) {
        const parsed = modelRegistrySchema.safeParse(JSON.parse(raw));
        if (parsed.success) setModels(parsed.data);
      }
      // 沒存過 → 維持 DEFAULT_MODELS 種子（不主動寫入，首次編輯才落地）
    } catch {
      // 壞資料忽略，留用種子
    }
    setIsHydrated(true);
  }, []);

  const persist = (next: ModelEntry[]) => {
    try {
      window.localStorage.setItem(MODEL_REGISTRY_KEY, JSON.stringify(next));
    } catch {
      // 配額爆掉等：仍更新 UI
    }
  };

  const add = useCallback((entry: ModelEntry) => {
    setModels((prev) => {
      if (prev.length >= MAX_MODELS) return prev;
      // 新模型放最上面：按鈕在頂部，清單可能很長，append 到底部會跑到螢幕外像沒反應
      const next = [entry, ...prev];
      persist(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<ModelEntry>) => {
    setModels((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...patch } : m));
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setModels((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    persist(DEFAULT_MODELS);
    setModels(DEFAULT_MODELS);
  }, []);

  const enabledModels = models.filter((m) => m.enabled && m.modelId.trim());

  return { models, enabledModels, add, update, remove, reset, isHydrated };
}
