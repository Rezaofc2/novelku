import Link from "next/link";
import { scrapeChapter } from "@/lib/scraper";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string[] }>;
}) {
  const { slug, chapterSlug } = await params;
  const fullSlug = `${slug}/${chapterSlug.join("/")}`;

  let chapter: any = null;
  let error: string | null = null;

  try {
    chapter = await scrapeChapter(fullSlug);
  } catch (e: any) {
    error = e.message || "Gagal memuat chapter";
  }

  if (!chapter && !error) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link
          href={`/novel/${slug}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {chapter?.novelTitle || slug}
        </Link>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300 truncate">{chapter?.title || chapterSlug}</span>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-6">
          ⚠️ Gagal memuat chapter. Silakan coba lagi.
        </div>
      )}

      {chapter ? (
        <>
          {/* Chapter Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {chapter.title}
            </h1>
            {chapter.novelTitle && (
              <Link
                href={`/novel/${slug}`}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {chapter.novelTitle}
              </Link>
            )}
            {chapter.label && (
              <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${
                chapter.label.toLowerCase() === "htl"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
              }`}>
                {chapter.label}
              </span>
            )}
          </div>

          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            {chapter.prevSlug ? (
              <Link
                href={`/novel/${chapter.prevSlug}`}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors text-gray-700 dark:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </Link>
            ) : (
              <div />
            )}
            <Link
              href={`/novel/${slug}`}
              className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Semua Chapter
            </Link>
            {chapter.nextSlug ? (
              <Link
                href={`/novel/${chapter.nextSlug}`}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors text-gray-700 dark:text-gray-300"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Chapter Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-6">
            <div className="chapter-content text-gray-700 dark:text-gray-300 leading-loose text-[15px] whitespace-pre-line">
              {chapter.content}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between">
            {chapter.prevSlug ? (
              <Link
                href={`/novel/${chapter.prevSlug}`}
                className="flex items-center gap-1 px-5 py-2.5 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors text-gray-700 dark:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Chapter Sebelumnya
              </Link>
            ) : (
              <div />
            )}
            {chapter.nextSlug ? (
              <Link
                href={`/novel/${chapter.nextSlug}`}
                className="flex items-center gap-1 px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Chapter Selanjutnya
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </>
      ) : !error ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400 dark:text-gray-500">Memuat chapter...</p>
        </div>
      ) : null}
    </div>
  );
}
