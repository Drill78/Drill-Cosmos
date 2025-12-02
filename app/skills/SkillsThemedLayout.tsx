// app/skills/SkillsThemedLayout.tsx
"use client";

import React, { useState } from "react";
import type { Skill, SkillLevel } from "@/lib/skills";
import { SkillsDashboard } from "./SkillsDashboard";
import { SkillsCategoryTabs } from "./SkillsCategoryTabs";
import type { SkillTheme } from "./LifeSkillsGraph";

interface SkillsThemedLayoutProps {
  allSkills: Skill[];
  total: number;
  target: number;
  levelCounts: Record<SkillLevel, number>;
}

// 在 client 这边自己维护一份顺序常量，避免从 lib/skills 引值
const SKILL_LEVEL_ORDER_CLIENT: SkillLevel[] = [
  "初窥门径",
  "轻车熟路",
  "略有小成",
  "炉火纯青",
  "登峰造极",
  "正在学习",
];

const CARD_ACCENTS: Record<
  SkillTheme,
  {
    cardBorder: string;
    cardGlow: string;
  }
> = {
  life: {
    cardBorder: "border-emerald-400/60",
    cardGlow: "shadow-[0_0_35px_rgba(16,185,129,0.5)]",
  },
  art: {
    cardBorder: "border-pink-400/60",
    cardGlow: "shadow-[0_0_35px_rgba(244,114,182,0.5)]",
  },
  mind: {
    cardBorder: "border-purple-400/60",
    cardGlow: "shadow-[0_0_35px_rgba(168,85,247,0.5)]",
  },
  tech: {
    cardBorder: "border-sky-400/60",
    cardGlow: "shadow-[0_0_35px_rgba(59,130,246,0.5)]",
  },
  adventure: {
    cardBorder: "border-amber-400/60",
    cardGlow: "shadow-[0_0_35px_rgba(234,179,8,0.5)]",
  },
  game: {
    cardBorder: "border-red-400/60",
    cardGlow: "shadow-[0_0_35px_rgba(248,113,113,0.5)]",
  },
  meta: {
    cardBorder: "border-slate-400/60",
    cardGlow: "shadow-[0_0_35px_rgba(148,163,184,0.5)]",
  },
};

export function SkillsThemedLayout({
  allSkills,
  total,
  target,
  levelCounts,
}: SkillsThemedLayoutProps) {
  const [activeTheme, setActiveTheme] = useState<SkillTheme>("life");
  const accent = CARD_ACCENTS[activeTheme];

  return (
    <div className="mt-16 mb-16 w-full max-w-5xl px-4 space-y-10">
      {/* 顶部仪表盘：只有一层边框，内背景完全透明 */}
      <section
        className={[
          "rounded-3xl border px-5 py-6 bg-transparent",
          accent.cardBorder,
          accent.cardGlow,
        ].join(" ")}
      >
        <SkillsDashboard
          total={total}
          target={target}
          levelCounts={levelCounts}
          levelOrder={SKILL_LEVEL_ORDER_CLIENT}
        />
      </section>

      {/* 下方：tab + nebula 共用同一个大边框，背景透明 */}
      <section
        className={[
          "rounded-3xl border px-4 py-4 bg-transparent",
          accent.cardBorder,
          accent.cardGlow,
        ].join(" ")}
      >
        <SkillsCategoryTabs
          allSkills={allSkills}
          activeTheme={activeTheme}
          onThemeChange={setActiveTheme}
        />
      </section>
    </div>
  );
}
