// app/skills/SkillsNebula.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Skill } from "@/lib/skills";

interface SkillsNebulaProps {
  skills: Skill[];
}

// 背景里一共多少个卡片 slot
const SLOT_COUNT = 48;

// 每个 slot 换技能的间隔范围（毫秒）
const MIN_INTERVAL_MS = 12000; // 12 秒
const MAX_INTERVAL_MS = 30000; // 30 秒

// 淡入淡出时间
const FADE_DURATION_MS = 900;

function randomInterval() {
  return (
    MIN_INTERVAL_MS +
    Math.floor(Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS))
  );
}

// 每个 slot 的随机“竖直偏移 + 漂移参数”
interface SlotMeta {
  offsetY: number;       // 上下微偏移（%，正负）
  driftDuration: number; // slot 自己上下微漂移的周期（秒）
  driftDelay: number;    // 漂移动画起始相位（秒）
}

// 仅在客户端调用：从池子里随机选一批不重复技能
function getRandomDistinctSkills(pool: Skill[], count: number): (Skill | null)[] {
  if (!pool.length) return Array(count).fill(null);

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const result: (Skill | null)[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i] ?? null);
  }
  return result;
}

interface SlotProps {
  index: number;
  skill: Skill | null;
  meta: SlotMeta;
  onRequestNew: (slotIndex: number) => void;
}

// 单个卡片 slot：自己管理“淡入淡出节奏”，需要新技能时找父组件要
function SkillNebulaSlot({ index, skill, meta, onRequestNew }: SlotProps) {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let fadeId: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      const delay = randomInterval();
      timerId = setTimeout(() => {
        if (cancelled) return;

        // 先淡出
        setVisible(false);

        fadeId = setTimeout(() => {
          if (cancelled) return;

          // 向父组件请求一条新技能（保证不重复）
          onRequestNew(index);
          setVisible(true);

          // 下一轮
          schedule();
        }, FADE_DURATION_MS);
      }, delay);
    };

    schedule();

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      if (fadeId) clearTimeout(fadeId);
    };
  }, [index, onRequestNew]);

  if (!skill) {
    // SSR / 初次渲染时的占位卡片（高度固定，避免布局抖动）
    return (
      <div className="h-28 rounded-xl border border-slate-800/40 bg-slate-950/40" />
    );
  }

  const fadeClass = visible ? "opacity-100" : "opacity-0";

  return (
    // 外层 slot：固定高度 + 只做竖直方向的微偏移
    <div
      className="relative h-28"
      style={{
        transform: `translateY(${meta.offsetY}%)`,
      }}
    >
      {/* 内层卡片：铺满整个 slot，做淡入淡出 + 轻微上下漂移 */}
      <div
        className={`flex h-full w-full flex-col justify-between rounded-xl border border-emerald-500/20 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-100 shadow-[0_0_16px_rgba(16,185,129,0.25)] backdrop-blur-sm transition-opacity duration-700 slot-drift ${fadeClass}`}
        style={{
          animationDuration: `${meta.driftDuration}s`,
          animationDelay: `${meta.driftDelay}s`,
        }}
      >
        {/* 标题行 */}
        <div className="flex items-center justify-between gap-1">
          <span className="line-clamp-1 font-medium text-emerald-100">
            {skill.name}
          </span>
          <span className="rounded-full border border-emerald-500/30 px-1.5 py-[1px] text-[9px] font-mono uppercase tracking-[0.15em] text-emerald-200/80">
            {skill.category.split("&")[0].trim()}
          </span>
        </div>

        {/* 子类行：固定一行高度，防止高度抖动 */}
        <div className="mt-1 h-4 text-[10px] text-emerald-200/75">
          <span className="line-clamp-1">
            {skill.subCategory || "\u00A0"}
          </span>
        </div>

        {/* 底部熟练度 */}
        <p className="mt-1 text-[9px] text-slate-400">
          熟练度：
          <span className="text-emerald-200">{skill.level}</span>
        </p>
      </div>
    </div>
  );
}

export function SkillsNebula({ skills }: SkillsNebulaProps) {
  const pool = useMemo(() => skills ?? [], [skills]);

  // 初始：所有 slot 都是空，保证 SSR / 初次 render 完全确定
  const [slotSkills, setSlotSkills] = useState<(Skill | null)[]>(() =>
    Array(SLOT_COUNT).fill(null),
  );

  // 初始：所有 meta 是“中性值”，不带随机（SSR 也安全）
  const [slotMetas, setSlotMetas] = useState<SlotMeta[]>(() =>
    Array.from({ length: SLOT_COUNT }, () => ({
      offsetY: 0,
      driftDuration: 24,
      driftDelay: 0,
    })),
  );

  // ✅ 只在客户端挂载后随机：给 slot 分配不重复的技能
  useEffect(() => {
    if (!pool.length) return;
    setSlotSkills(getRandomDistinctSkills(pool, SLOT_COUNT));
  }, [pool]);

  // ✅ 只在客户端挂载后随机：为每个 slot 设置竖直偏移 + 漂移参数
  useEffect(() => {
    const metas: SlotMeta[] = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      metas.push({
        // 上下微偏移：-8% ~ +8%
        offsetY: (Math.random() - 0.5) * 16,
        // 漂移周期：16 ~ 32 秒
        driftDuration: 16 + Math.random() * 16,
        // 起始相位：0 ~ 16 秒
        driftDelay: Math.random() * 16,
      });
    }
    setSlotMetas(metas);
  }, [pool.length]);

  // 父组件负责：给某个 slot 分配新的、不与其他 slot 重复的技能
  const handleRequestNew = useCallback(
    (slotIndex: number) => {
      setSlotSkills((prev) => {
        if (!pool.length) return prev;

        const current = [...prev];
        const usedIds = new Set(
          current
            .map((s, i) => (i === slotIndex ? null : s)) // 当前格子可以换掉，所以不算
            .filter((s): s is Skill => !!s)
            .map((s) => s.id),
        );

        const candidates = pool.filter((s) => !usedIds.has(s.id));
        if (!candidates.length) {
          // 实在没有可用的，就不换
          return prev;
        }

        const idx = Math.floor(Math.random() * candidates.length);
        const nextSkill = candidates[idx];

        current[slotIndex] = nextSkill;
        return current;
      });
    },
    [pool],
  );

  if (!pool.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-25">
      {/* 背景扫描线 + 光晕 */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_bottom,rgba(148,163,184,0.4)_1px,transparent_1px)] [background-size:100%_3px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen [background-image:radial-gradient(circle_at_20%_100%,rgba(52,211,153,0.45),transparent_55%),radial-gradient(circle_at_80%_0,rgba(56,189,248,0.35),transparent_55%)]" />

      {/* 瀑布流网格：整体做一个从下往上的缓慢滚动动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="nebula-scroll pointer-events-none absolute -inset-y-[15%] -inset-x-[5%]">
          <div className="grid h-full w-full auto-rows-[7rem] grid-cols-3 gap-3 px-6 py-8 sm:grid-cols-4 lg:grid-cols-5">
            {slotSkills.map((skill, index) => (
              <SkillNebulaSlot
                key={index}
                index={index}
                skill={skill}
                meta={slotMetas[index] ?? slotMetas[0]}
                onRequestNew={handleRequestNew}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
