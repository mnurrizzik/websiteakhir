/**
 * useCategories — shared category state via localStorage + StorageEvent
 *
 * Kategori yang sudah ada di project diambil langsung dari project-store.
 * Kategori tambahan (belum ada project-nya) disimpan di localStorage
 * key "extra_categories" supaya bisa dibaca oleh semua komponen/tab.
 *
 * Usage:
 *   const { allCategories, addCategory, removeCategory } = useCategories(projects);
 */

import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/lib/project-store";

const LS_KEY = "extra_categories";

function readExtra(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeExtra(cats: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(cats));
  // Broadcast ke tab / komponen lain di halaman yang sama
  window.dispatchEvent(new StorageEvent("storage", { key: LS_KEY, newValue: JSON.stringify(cats) }));
}

export function useCategories(projects: Project[]) {
  const [extra, setExtra] = useState<string[]>(readExtra);

  // Sinkronisasi ketika localStorage berubah (tab lain atau dispatch manual)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        setExtra(readExtra());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Kategori yang sudah dipakai minimal 1 project
  const fromProjects = Array.from(
    new Set(projects.map((p) => p.category).filter(Boolean))
  );

  // Gabung: dari project + extra (yang belum ada project-nya)
  const allCategories = Array.from(new Set([...fromProjects, ...extra])).filter(Boolean);

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const current = readExtra();
    if (!current.includes(trimmed)) {
      const next = [...current, trimmed];
      writeExtra(next);
      setExtra(next);
    }
  }, []);

  const removeCategory = useCallback((name: string) => {
    const current = readExtra();
    const next = current.filter((c) => c !== name);
    writeExtra(next);
    setExtra(next);
  }, []);

  // Bersihkan extra yang sudah punya project (tidak perlu disimpan lagi)
  useEffect(() => {
    const current = readExtra();
    const stillNeeded = current.filter((c) => !fromProjects.includes(c));
    if (stillNeeded.length !== current.length) {
      writeExtra(stillNeeded);
      setExtra(stillNeeded);
    }
  }, [projects]); // eslint-disable-line react-hooks/exhaustive-deps

  return { allCategories, addCategory, removeCategory };
}