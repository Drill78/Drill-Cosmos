// lib/skills.ts
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export type SkillLevel =
  | "初窥门径"
  | "轻车熟路"
  | "略有小成"
  | "炉火纯青"
  | "登峰造极"
  | "正在学习";

export interface Skill {
  id: string;
  name: string;
  category: string;      // 大类
  subCategory?: string;  // 小类
  level: SkillLevel;     // 熟练度
  acquiredAt?: string;   // 掌握时间
  summary?: string;      // 描述
  detail?: string;       // 详细内容
}

export const SKILL_LEVEL_ORDER: SkillLevel[] = [
  "初窥门径",
  "轻车熟路",
  "略有小成",
  "炉火纯青",
  "登峰造极",
  "正在学习",
];

const SKILL_CSV_PATH = path.join(
  process.cwd(),
  "content",
  "skills",
  "skills.csv",
);

// 读 CSV -> Skill[]
export function loadSkills(): Skill[] {
    // 1. 读原始 CSV 文本
    const raw = fs.readFileSync(SKILL_CSV_PATH, "utf8");
  
    // 2. 去掉 UTF-8 BOM（有的话）
    const csvText = raw.replace(/^\uFEFF/, "");
  
    // 3. 解析 CSV
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // 让 csv-parse 自己也检查一下 BOM
    }) as Record<string, string>[];
  
    // 4. 构造 Skill[]
    const skills: Skill[] = records.reduce<Skill[]>((acc, row, index) => {
      const name = row["技能名称"]?.trim();
      const category = row["大类"]?.trim();
  
      // 如果某一行缺名字或大类，就直接跳过
      if (!name || !category) {
        return acc;
      }
  
      const level = (row["熟练度"]?.trim() || "正在学习") as SkillLevel;
      const subCategoryRaw = row["小类"]?.trim();
      const acquiredAtRaw = row["掌握时间"]?.trim();
      const summaryRaw = row["描述"]?.trim();
      const detailRaw = row["详细内容"]?.trim();
  
      const skill: Skill = {
        id: `${index}-${name}`,
        name,
        category,
        level,
      };
  
      if (subCategoryRaw) skill.subCategory = subCategoryRaw;
      if (acquiredAtRaw) skill.acquiredAt = acquiredAtRaw;
      if (summaryRaw) skill.summary = summaryRaw;
      if (detailRaw) skill.detail = detailRaw;
  
      acc.push(skill);
      return acc;
    }, []);
  
    return skills;
  }
  
  

export function isLearning(skill: Skill): boolean {
  return skill.level === "正在学习";
}

export function isMastered(skill: Skill): boolean {
  return skill.level !== "正在学习";
}

export function getMasteredSkills(allSkills: Skill[]): Skill[] {
  return allSkills.filter(isMastered);
}

export function getLevelCounts(
  allSkills: Skill[],
): Record<SkillLevel, number> {
  const counts: Record<SkillLevel, number> = {
    初窥门径: 0,
    轻车熟路: 0,
    略有小成: 0,
    炉火纯青: 0,
    登峰造极: 0,
    正在学习: 0,
  };

  for (const s of allSkills) {
    counts[s.level] = (counts[s.level] ?? 0) + 1;
  }

  return counts;
}
