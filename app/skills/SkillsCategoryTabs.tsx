// app/skills/SkillsCategoryTabs.tsx
"use client";

import React, { useMemo } from "react";
import type { Skill } from "@/lib/skills";
import { LifeSkillsGraph, type SkillTheme } from "./LifeSkillsGraph";

interface SkillsCategoryTabsProps {
  allSkills: Skill[];
  activeTheme: SkillTheme;
  onThemeChange: (theme: SkillTheme) => void;
}

const TAB_DEFS: {
  id: SkillTheme;
  label: string;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "life",
    label: "LIFE",
    title: "LIFE & SKILLS",
    subtitle: "生活相关技能：做饭、整理、照顾身体、自我管理等等。",
  },
  {
    id: "art",
    label: "ART",
    title: "ART",
    subtitle: "绘画、设计、摄影、音乐、剪辑等艺术表达相关技能。",
  },
  {
    id: "mind",
    label: "MIND",
    title: "MIND",
    subtitle: "思维方式、学习方法、语言能力、心理建设等心智相关技能。",
  },
  {
    id: "tech",
    label: "TECH",
    title: "TECH",
    subtitle: "编程、电子、电路、系统搭建、工具配置等技术栈相关技能。",
  },
  {
    id: "adventure",
    label: "ADVENTURE",
    title: "ADVENTURE",
    subtitle: "运动、户外、旅行、生存技能，身体和世界的探索。",
  },
  {
    id: "game",
    label: "GAME",
    title: "GAME",
    subtitle: "对战、策略、解谜、构筑等游戏相关技能。",
  },
  {
    id: "meta",
    label: "META",
    title: "META",
    subtitle: "时间管理、项目管理、抽象思维等『元技能』。",
  },
];

// 这里控制“标题颜色 + tab 按钮风格”，和卡片外框的主题保持一致
const THEME_ACCENTS: Record<
  SkillTheme,
  {
    titleText: string;
    tabActive: string;
    tabInactive: string;
  }
> = {
  life: {
    titleText: "text-emerald-300/90",
    tabActive:
      "border-emerald-300 bg-emerald-900/80 text-emerald-50 shadow-[0_0_18px_rgba(16,185,129,0.6)]",
    tabInactive:
      "border-slate-600/60 bg-slate-950/40 text-slate-300 hover:border-emerald-400/70 hover:text-emerald-100",
  },
  art: {
    titleText: "text-pink-300/90",
    tabActive:
      "border-pink-300 bg-pink-900/80 text-pink-50 shadow-[0_0_18px_rgba(244,114,182,0.7)]",
    tabInactive:
      "border-slate-600/60 bg-slate-950/40 text-slate-300 hover:border-pink-400/70 hover:text-pink-100",
  },
  mind: {
    titleText: "text-purple-300/90",
    tabActive:
      "border-purple-300 bg-purple-900/80 text-purple-50 shadow-[0_0_18px_rgba(168,85,247,0.7)]",
    tabInactive:
      "border-slate-600/60 bg-slate-950/40 text-slate-300 hover:border-purple-400/70 hover:text-purple-100",
  },
  tech: {
    titleText: "text-sky-300/90",
    tabActive:
      "border-sky-300 bg-sky-900/80 text-sky-50 shadow-[0_0_18px_rgba(59,130,246,0.7)]",
    tabInactive:
      "border-slate-600/60 bg-slate-950/40 text-slate-300 hover:border-sky-400/70 hover:text-sky-100",
  },
  adventure: {
    titleText: "text-amber-300/90",
    tabActive:
      "border-amber-300 bg-amber-900/80 text-amber-50 shadow-[0_0_18px_rgba(234,179,8,0.7)]",
    tabInactive:
      "border-slate-600/60 bg-slate-950/40 text-slate-300 hover:border-amber-400/70 hover:text-amber-100",
  },
  game: {
    titleText: "text-red-300/90",
    tabActive:
      "border-red-300 bg-red-900/80 text-red-50 shadow-[0_0_18px_rgba(248,113,113,0.7)]",
    tabInactive:
      "border-slate-600/60 bg-slate-950/40 text-slate-300 hover:border-red-400/70 hover:text-red-100",
  },
  meta: {
    titleText: "text-slate-200/90",
    tabActive:
      "border-slate-300 bg-slate-900/80 text-slate-50 shadow-[0_0_18px_rgba(148,163,184,0.7)]",
    tabInactive:
      "border-slate-600/60 bg-slate-950/40 text-slate-300 hover:border-slate-300/70 hover:text-slate-100",
  },
};

export function SkillsCategoryTabs({
  allSkills,
  activeTheme,
  onThemeChange,
}: SkillsCategoryTabsProps) {
  const byCategory = useMemo(() => {
    const map: Record<SkillTheme, Skill[]> = {
      life: [],
      art: [],
      mind: [],
      tech: [],
      adventure: [],
      game: [],
      meta: [],
    };

    for (const s of allSkills) {
      const cat = (s.category ?? "").toLowerCase();

      if (cat.includes("life") || cat.includes("生活")) {
        map.life.push(s);
      } else if (cat.includes("art") || cat.includes("艺术")) {
        map.art.push(s);
      } else if (
        cat.includes("mind") ||
        cat.includes("心") ||
        cat.includes("思维")
      ) {
        map.mind.push(s);
      } else if (
        cat.includes("tech") ||
        cat.includes("技术") ||
        cat.includes("工程")
      ) {
        map.tech.push(s);
      } else if (
        cat.includes("adventure") ||
        cat.includes("冒险") ||
        cat.includes("运动")
      ) {
        map.adventure.push(s);
      } else if (cat.includes("game") || cat.includes("游戏")) {
        map.game.push(s);
      } else if (cat.includes("meta") || cat.includes("元")) {
        map.meta.push(s);
      }
    }

    return map;
  }, [allSkills]);

  const activeDef = TAB_DEFS.find((t) => t.id === activeTheme)!;
  const activeSkills = byCategory[activeTheme] ?? [];
  const accent = THEME_ACCENTS[activeTheme];

  return (
    <div className="space-y-3">
      {/* 顶部标题 + 标签按钮（边框由外层 card 提供） */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2
            className={`mb-1 text-xs font-mono uppercase tracking-[0.24em] ${accent.titleText}`}
          >
            Skills Nebula — {activeDef.label}
          </h2>
          <p className="text-[11px] text-slate-300/90">
            {activeDef.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TAB_DEFS.map((tab) => {
            const isActive = tab.id === activeTheme;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onThemeChange(tab.id)}
                className={[
                  "rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] transition",
                  "backdrop-blur-sm",
                  isActive ? accent.tabActive : accent.tabInactive,
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 下方：真正的星云图；这里不再套边框，背景透明 */}
      <div className="rounded-3xl bg-transparent px-1 py-1">
        <LifeSkillsGraph
          skills={activeSkills}
          theme={activeDef.id}
          title={activeDef.title}
        />
      </div>
    </div>
  );
}
