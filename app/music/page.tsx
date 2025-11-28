// app/music/page.tsx
export default function MusicPage() {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-3xl px-4 space-y-4 text-center">
          <h1 className="text-3xl font-bold">音乐精选集 / Mix Tape</h1>
          <p className="text-sm opacity-80">
            这里会收集歌单、磁带 tracklist、一些关于听歌的碎片。
          </p>
        </div>
      </main>
    );
  }
  