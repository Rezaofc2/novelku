import Link from "next/link";
import { scrapeChapter } from "@/lib/scraper";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; chapterSlug: string[] };
}) {
  const { slug, chapterSlug } = await Promise.resolve(params);
  const fullSlug = `${slug}/${chapterSlug.join("/")}`;

  let chapter: any = null;
  let error: string | null = null;

  try {
    chapter = await scrapeChapter(fullSlug);
  } catch (e: any) {
    error = e.message || "Gagal memuat chapter";
  }

  if (!chapter && !error) {
    return notFound();
  }

  // Extract chapter number for prev/next
  const chMatch = fullSlug.match(/chapter-(\d+)/i);
  const chNum = chMatch ? parseInt(chMatch[1], 10) : 0;
  const label = chapterSlug[0] || "mtl"; // htl or mtl

  const prevLink = chNum > 1 ? `/novel/${slug}/${label}/chapter-${chNum - 1}` : null;
  const nextLink = `/novel/${slug}/${label}/chapter-${chNum + 1}`; // always show next

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        <Link href="/" className="hover:text-indigo-600">Beranda</Link>
        {" / "}
        <Link href={`/novel/${slug}`} className="hover:text-indigo-600">
          {chapter?.novelTitle || slug.replace(/-/g, " ")}
        </Link>
      </nav>

      {/* Chapter title */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center">
        {chapter?.title || `Chapter ${chNum}`}
      </h1>
      {chapter?.label && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-4">
          {chapter.label.toUpperCase()} - Chapter {chNum}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        {prevLink ? (
          <Link
            href={prevLink}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition"
          >
            ← Prev
          </Link>
        ) : (
          <span className="px-4 py-2 text-sm text-gray-300 dark:text-gray-600">← Prev</span>
        )}

        <Link
          href={nextLink}
          className="px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition"
        >
          Next →
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {chapter?.content ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {chapter.content}
          </div>
        </div>
      ) : !error ? (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500">Memuat chapter...</p>
        </div>
      ) : null}

      {/* Bottom navigation */}
      <div className="flex items-center justify-between mt-6">
        {prevLink ? (
          <Link
            href={prevLink}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition"
          >
            ← Prev
          </Link>
        ) : (
          <span className="px-4 py-2 text-sm text-gray-300">← Prev</span>
        )}

        <Link
          href={nextLink}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          Next →
        </Link>
      </div>
    </div>
  );
}
