"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MAX_RUNS,
  RUN_HISTORY_KEY,
  runHistorySchema,
  type RunRecord,
} from "@/lib/schemas/run-record";

export interface UseRunHistoryReturn {
  readonly runs: readonly RunRecord[];
  addRun: (record: RunRecord) => void;
  clear: () => void;
  readonly isHydrated: boolean;
}

export function useRunHistory(): UseRunHistoryReturn {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(RUN_HISTORY_KEY);
      if (raw) {
        const parsed = runHistorySchema.safeParse(JSON.parse(raw));
        if (parsed.success) setRuns(parsed.data);
      }
    } catch {
      // 損毀/非 JSON 視為空，下一次成功寫入會覆蓋
    }
    setIsHydrated(true);
  }, []);

  const addRun = useCallback((record: RunRecord) => {
    setRuns((prev) => {
      // 最新的排前面，超過上限砍掉最舊的
      const next = [record, ...prev].slice(0, MAX_RUNS);
      try {
        window.localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(next));
        return next;
      } catch {
        // 配額爆掉/storage 被禁：靜默維持原狀
        return prev;
      }
    });
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(RUN_HISTORY_KEY);
    } catch {
      // ignore
    }
    setRuns([]);
  }, []);

  return { runs, addRun, clear, isHydrated };
}
