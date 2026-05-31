"use client";

import { useCallback, useEffect, useState } from "react";
import {
  API_KEYS_KEY,
  apiKeysSchema,
  DEFAULT_PROFILE,
  generateApiKey,
  MAX_API_KEYS,
  PROFILE_KEY,
  profileSchema,
  type ApiKey,
} from "@/lib/schemas/settings";

export function useProfile() {
  const [displayName, setDisplayName] = useState(DEFAULT_PROFILE.displayName);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = profileSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setDisplayName(parsed.data.displayName);
      }
    } catch {
      // 壞資料忽略
    }
    setIsHydrated(true);
  }, []);

  const save = useCallback((name: string) => {
    const next = name.slice(0, 60);
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify({ displayName: next }));
    } catch {
      // 配額爆掉等：仍更新 UI
    }
    setDisplayName(next);
  }, []);

  return { displayName, save, isHydrated };
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(API_KEYS_KEY);
      if (raw) {
        const parsed = apiKeysSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setKeys(parsed.data);
      }
    } catch {
      // 壞資料忽略
    }
    setIsHydrated(true);
  }, []);

  const persist = (next: ApiKey[]) => {
    try {
      window.localStorage.setItem(API_KEYS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const create = useCallback((name: string) => {
    setKeys((prev) => {
      if (prev.length >= MAX_API_KEYS) return prev;
      const next: ApiKey[] = [
        ...prev,
        {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `key-${Date.now()}`,
          name: (name.trim() || `API Key ${prev.length + 1}`).slice(0, 60),
          key: generateApiKey(),
          createdAt: new Date().toISOString(),
        },
      ];
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setKeys((prev) => {
      const next = prev.filter((k) => k.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { keys, create, remove, isHydrated };
}
