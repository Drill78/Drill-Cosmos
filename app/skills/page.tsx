// app/skills/page.tsx
import {
  loadSkills,
  getMasteredSkills,
  getLevelCounts,
} from "@/lib/skills";
import { SkillsNebula } from "./SkillsNebula";
import { SkillsThemedLayout } from "./SkillsThemedLayout";

export const revalidate = 60;

export default async function SkillsPage() {
  const allSkills = loadSkills();
  const masteredSkills = getMasteredSkills(allSkills);
  const levelCounts = getLevelCounts(allSkills);

  const totalMastered = masteredSkills.length;
  const target = 2000;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-emerald-100">
      {/* 底层：整页瀑布 / 宇宙背景 */}
      <SkillsNebula skills={masteredSkills} />

      {/* 前景：两块主题卡片（上：仪表盘，下：tabs+nebula） */}
      <main className="relative z-10 flex min-h-screen items-start justify-center">
        <SkillsThemedLayout
          allSkills={allSkills}
          total={totalMastered}
          target={target}
          levelCounts={levelCounts}
        />
      </main>
    </div>
  );
}
