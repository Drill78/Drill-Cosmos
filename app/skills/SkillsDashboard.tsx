// app/skills/SkillsDashboard.tsx
import type { SkillLevel } from "@/lib/skills";

interface SkillsDashboardProps {
  total: number;
  target: number;
  levelCounts: Record<SkillLevel, number>;
  levelOrder: SkillLevel[];
}

// 从低到高：绿 → 黄 → 蓝 → 红 → 紫
const LEVEL_LABEL_COLORS: Record<SkillLevel, string> = {
  初窥门径: "bg-emerald-900/55 border-emerald-400/80",
  轻车熟路: "bg-amber-900/55 border-amber-400/80",
  略有小成: "bg-sky-900/55 border-sky-400/80",
  炉火纯青: "bg-red-900/55 border-red-400/80",
  登峰造极: "bg-violet-900/60 border-violet-400/90",
  正在学习: "bg-slate-900/60 border-slate-600/80",
};

export function SkillsDashboard({
  total,
  target,
  levelCounts,
  levelOrder,
}: SkillsDashboardProps) {
  const progress = Math.min(total / target, 1);
  const masteredLevels = levelOrder.filter((lv) => lv !== "正在学习");

  return (
    <section className="space-y-4">
      {/* 标题 + 总计数 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300/80">
            DRILL-COSMOS SKILL CORE
          </h1>
          <p className="mt-1 text-2xl font-semibold text-emerald-100">
            已登记技能{" "}
            <span className="tabular-nums text-emerald-300">{total}</span>
            <span className="text-slate-400"> / {target}</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            「正在学习」不计入总数，只记录已点亮的技能节点。
          </p>
        </div>

        {/* 小型进度条 */}
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>进度</span>
            <span className="tabular-nums text-emerald-200">
              {(progress * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-800/80">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-300 shadow-[0_0_12px_rgba(45,212,191,0.7)] transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 各熟练度统计 */}
      <div className="grid gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        {masteredLevels.map((level) => {
          const count = levelCounts[level] ?? 0;
          const colorClass = LEVEL_LABEL_COLORS[level];

          return (
            <div
              key={level}
              className={`flex flex-col justify-between rounded-xl border px-3 py-2 text-xs ${colorClass}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-emerald-50">{level}</span>
                <span className="tabular-nums text-sm text-emerald-200">
                  {count}
                </span>
              </div>
              <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-black/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-300 to-cyan-300"
                  style={{
                    width: `${
                      Math.min(count / Math.max(total, 1), 1) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
