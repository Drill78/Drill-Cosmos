// app/blog/page.tsx
import Link from "next/link";
import { getAllItems } from "@/lib/md";

export const revalidate = 60; // 可选：ISR，每 60 秒允许再生成一次

export default async function BlogPage() {
  const posts = await getAllItems("blog");

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {/* 标题区 */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">杂谈 / Essay Log</h1>
          <p className="text-sm opacity-80">
            这里是大钻宇宙里的长篇碎碎念：随笔、胡思乱想、研究日志、观后感……
          </p>
        </header>

        {/* 文章列表 */}
        <section className="space-y-6">
          {posts.length === 0 && (
            <p className="text-sm opacity-70">
              目前还没有文章。试着在 <code>content/blog</code> 里放几篇
              <code>.md</code> 吧。
            </p>
          )}

          {posts.map((post) => (
            <article
              key={post.slug}
              className="border-l border-white/15 pl-4 hover:border-white/40 transition-colors"
            >
              <div className="flex items-baseline gap-3">
                <time className="text-xs opacity-60">
                  {post.date || "No date"}
                </time>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {post.title}
                </Link>
              </div>
              {post.summary && (
                <p className="mt-1 text-sm opacity-80">{post.summary}</p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
