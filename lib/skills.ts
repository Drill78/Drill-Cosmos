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
  /** 解析自「父技能」列，只保留名称部分（括号前） */
  parentName?: string;
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

/**
 * 从「父技能」那一列里把真实的父技能名称提取出来。
 * 例如：
 *   "做饭(https://xxxx)"      -> "做饭"
 *   "FPS 核心操作（https...）" -> "FPS 核心操作"
 *   "  "                      -> undefined
 */
function stripParentName(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  // 既处理西文括号 "()" 也处理中文括号 "（）"
  const idx1 = trimmed.indexOf("(");
  const idx2 = trimmed.indexOf("（");
  let cut = trimmed;

  const idx =
    idx1 >= 0 && idx2 >= 0
      ? Math.min(idx1, idx2)
      : idx1 >= 0
      ? idx1
      : idx2;

  if (idx >= 0) {
    cut = trimmed.slice(0, idx);
  }

  const result = cut.trim();
  return result || undefined;
}

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
  }) as Record<string, string | undefined>[];

  // 4. 构造 Skill[]
  const skills: Skill[] = records.reduce<Skill[]>((acc, row, index) => {
    const name = row["技能名称"]?.toString().trim();
    const category = row["大类"]?.toString().trim();

    // 没有名字或大类，就跳过这一行
    if (!name || !category) {
      return acc;
    }

    const level = (row["熟练度"]?.toString().trim() ||
      "正在学习") as SkillLevel;

    const subCategoryRaw = row["小类"]?.toString().trim();
    const acquiredAtRaw = row["掌握时间"]?.toString().trim();
    const summaryRaw = row["描述"]?.toString().trim();
    const detailRaw = row["详细内容"]?.toString().trim();

    // 尝试从几种可能的列名中找到「父技能」那一列
    const rawParent =
      row["父技能"] ??
      row["父技能名"] ??
      row["父技能名称"] ??
      "";

    const parentName =
      typeof rawParent === "string" && rawParent.trim()
        ? stripParentName(rawParent)
        : undefined;

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
    if (parentName) skill.parentName = parentName;

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
