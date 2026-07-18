import Link from "next/link";
import Image from "next/image";
import { scrapeHomeV2 } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

const ALL_GENRES = [
  "Action","Adventure","Comedy","Cooking","Drama","Ecchi","Fantasy",
  "Gender Bender","Harem","Historical","Horror","Isekai","Josei","Magic",
  "Martial Arts","Mature","Mecha","Musik","Mystery","One shot","Psychological",
  "Reverse Harem","Romance","School Life","Sci-fi","Seinen","Shoujo",
  "Shoujo Ai","Shounen","Slice of Life","Smut","Sports","Supernatural",
  "Tragedy","Virtual Reality","Wuxia","Xianxia","Xuanhuan","Yuri",
];

export default async function Home() {
  let latest: any[] = [];
  let popular: any[] = [];
  let error: string | null = null;

  try {
    const data = await scrapeHomeV2();
    latest = data.latest.slice(0, 24);
    popular = data.popular.slice(0, 10);
  } catch (e: any) {
    error = e.message || "Gagal memuat data";
  }

  return (
    <div>
      {/* Hero — compact */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                NovelKu
              </h1>
              <p className="text-sm sm:text-base text-indigo-100 mt-1 max-w-lg">
                Baca novel bahasa Indonesia gratis. Light Novel & Web Novel China, Korea, Jepang terlengkap.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link
                href="/novel"
                className="inline-flex items-center gap-1.5 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
              >
                Jelajahi Novel
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/novel?sort=latest"
                className="inline-flex items-center gap-1.5 bg-white/20 text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                Terbaru
              </Link>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-600 dark:text-red-400 text-xs">
            ⚠️ Gagal memuat data dari sumber. Menampilkan data cache jika tersedia.
          </div>
        </div>
      )}

      {/* Latest Novels */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Novel Terbaru
          </h2>
          <Link href="/novel?sort=latest" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            Lihat Semua →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {latest.length > 0 ? (
            latest.slice(0, 12).map((novel) => (
              <Link
                key={novel.slug}
                href={`/novel/${novel.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {novel.cover ? (
                    <Image
                      src={novel.cover}
                      alt={novel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 16vw"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  {novel.rating && parseFloat(novel.rating) > 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-yellow-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {novel.rating}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="font-semibold text-[11px] sm:text-xs text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                    {novel.title}
                  </h3>
                  {novel.latestChapters?.[0] && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {novel.latestChapters[0].title}
                    </p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700" />
                <div className="p-2 space-y-1.5">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

          </div>
  );
}
