import Link from "next/link";
import Image from "next/image";
import { scrapeNovelDetail } from "@/lib/scraper";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function NovelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let novel: any = null;
  let error: string | null = null;

  try {
    novel = await scrapeNovelDetail(slug);
  } catch (e: any) {
    error = e.message || "Gagal memuat data";
  }

  if (!novel && !error) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-8 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/novel" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Daftar Novel
        </Link>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300 truncate">{novel?.title || slug}</span>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-6">
          ⚠️ Gagal memuat data dari sumber.
        </div>
      )}

      {novel ? (
        <>
          {/* Novel Header */}
          <div className="flex flex-col sm:flex-row gap-6 mb-10">
            <div className="relative w-40 h-56 sm:w-48 sm:h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 shadow-lg">
              {novel.cover ? (
                <Image src={novel.cover} alt={novel.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {novel.title}
              </h1>
              
              {/* Rating & Rank */}
              <div className="flex items-center gap-4 mb-4">
                {novel.rating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{novel.rating}</span>
                  </div>
                )}
                {novel.rank && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    #{novel.rank}
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                {novel.author && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">Author:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{novel.author}</span>
                  </div>
                )}
                {novel.type && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">Type:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{novel.type}</span>
                  </div>
                )}
                {novel.status && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">Status:</span>
                    <span className={`font-medium ${
                      novel.status.toLowerCase().includes("completed") || novel.status.toLowerCase().includes("tamat")
                        ? "text-green-600 dark:text-green-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}>
                      {novel.status}
                    </span>
                  </div>
                )}
                {novel.release && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">Release:</span>
                    <span className="text-gray-700 dark:text-gray-300">{novel.release}</span>
                  </div>
                )}
                {novel.totalChapters > 0 && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">Chapters:</span>
                    <span className="text-gray-700 dark:text-gray-300">{novel.totalChapters}</span>
                  </div>
                )}
                {novel.alternative && (
                  <div className="flex gap-2 col-span-full">
                    <span className="text-gray-400 dark:text-gray-500">Alternative:</span>
                    <span className="text-gray-700 dark:text-gray-300">{novel.alternative}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {novel.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {novel.genres.map((g: string) => (
                    <Link
                      key={g}
                      href={`/novel?genre=${g.toLowerCase()}`}
                      className="px-2.5 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              )}

              {/* First/Last chapter buttons */}
              {novel.chapters?.length > 0 && (
                <div className="flex gap-2">
                  <Link
                    href={`/novel/${novel.chapters[0].slug}`}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Baca Pertama
                  </Link>
                  <Link
                    href={`/novel/${novel.chapters[novel.chapters.length - 1].slug}`}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-colors"
                  >
                    Baca Terbaru
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Synopsis */}
          {novel.summary && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sinopsis
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {novel.summary}
              </div>
            </div>
          )}

          {/* Chapter List */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Daftar Chapter ({novel.chapters?.length || 0})
            </h2>

            {novel.chapters?.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {novel.chapters.map((ch: any, idx: number) => (
                  <Link
                    key={ch.slug}
                    href={`/novel/${ch.slug}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-gray-400 dark:text-gray-500 w-8 flex-shrink-0">
                        {novel.chapters.length - idx}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {ch.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ch.label && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ch.label.toLowerCase() === "htl"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        }`}>
                          {ch.label}
                        </span>
                      )}
                      {ch.date && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">{ch.date}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Belum ada chapter tersedia.
              </p>
            )}
          </div>
        </>
      ) : !error ? (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500">Memuat...</p>
        </div>
      ) : null}
    </div>
  );
}
