// app/skills/page.tsx
import {
  loadSkills,
  getMasteredSkills,
  getLevelCounts,
  SKILL_LEVEL_ORDER,
} from "@/lib/skills";
import { SkillsDashboard } from "./SkillsDashboard";
import { SkillsNebula } from "./SkillsNebula";

export const revalidate = 60;

export default async function SkillsPage() {
  const allSkills = loadSkills();
  const masteredSkills = getMasteredSkills(allSkills);
  const levelCounts = getLevelCounts(allSkills);

  const totalMastered = masteredSkills.length;
  const target = 2000;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-emerald-100">
      {/* 背景：技能瀑布墙（client 组件，自身内部处理随机） */}
      <SkillsNebula skills={masteredSkills} />

      {/* 前景：主内容区 */}
      <main className="relative z-10 flex min-h-screen items-start justify-center">
        <div className="mt-16 mb-16 w-full max-w-5xl px-4">
          <section className="rounded-3xl border border-emerald-500/40 bg-black/75 px-5 py-6 shadow-[0_0_45px_rgba(16,185,129,0.3)] backdrop-blur-xl">
            <SkillsDashboard
              total={totalMastered}
              target={target}
              levelCounts={levelCounts}
              levelOrder={SKILL_LEVEL_ORDER}
            />

            {/* 以后这里可以接完整技能树 / tabs 等 */}
            {/* <SkillsTree skills={allSkills} /> */}
          </section>
        </div>
      </main>
    </div>
  );
}
