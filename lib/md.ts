// lib/md.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type ItemMeta = {
  slug: string;
  title: string;
  date?: string;
  summary?: string;
  tags?: string[];
};

export type ItemData = ItemMeta & {
  content: string;      // 原始 Markdown 文本（保留着备用）
  contentHtml: string;  // 转成 HTML 之后的正文
};

function getCollectionDir(collection: string) {
  return path.join(process.cwd(), "content", collection);
}

export function getSlugs(collection: string): string[] {
  const dir = getCollectionDir(collection);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir).filter((file) => file.endsWith(".md"));
}

export async function getItemBySlug(
  collection: string,
  slug: string
): Promise<ItemData> {
  const realSlug = slug.replace(/\.md$/, "");
  const dir = getCollectionDir(collection);
  const fullPath = path.join(dir, `${realSlug}.md`);

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // ✅ 用 remark 把 Markdown 转成 HTML
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  const meta: ItemMeta = {
    slug: realSlug,
    title: (data as any).title || realSlug,
    date: (data as any).date,
    summary: (data as any).summary,
    tags: (data as any).tags || [],
  };

  return {
    ...meta,
    content,     // 原文
    contentHtml, // 已经转成 HTML 的版本
  };
}

export async function getAllItems(
  collection: string
): Promise<ItemMeta[]> {
  const slugs = getSlugs(collection);

  const items = await Promise.all(
    slugs.map(async (slug) => {
      const { content, contentHtml, ...meta } = await getItemBySlug(
        collection,
        slug
      );
      return meta;
    })
  );

  return items.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date > b.date ? -1 : 1;
  });
}
