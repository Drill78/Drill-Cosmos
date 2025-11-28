// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/md";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 注意：这里要 await params，因为它是 Promise
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  let post;
  try {
    post = await getItemBySlug("blog", slug);
  } catch (e) {
    // 找不到对应的 md 文件之类的情况
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <article className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        {/* 标题区 */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          {post.date && (
            <time className="text-xs opacity-60">{post.date}</time>
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
        </header>

        {/* ✅ 用 HTML 渲染正文（会生成 <p>、<h2>、<img> 等标签） */}
        <section
          className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />


        {/* 底部返回 */}
        <footer className="mt-12 text-xs opacity-60">
          <a href="/blog" className="hover:underline">
            ← 回到杂谈列表
          </a>
        </footer>
      </article>
    </main>
  );
}
