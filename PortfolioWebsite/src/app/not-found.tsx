import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-white">
      <div className="max-w-xl text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">404</p>
        <h1 className="mt-4 text-4xl font-semibold">页面不存在</h1>
        <p className="mt-4 text-white/70">该地址没有对应的公开内容，或内容已经移动。</p>
        <Link className="mt-8 inline-block underline underline-offset-4" href="/works">
          返回作品索引
        </Link>
      </div>
    </main>
  );
}
