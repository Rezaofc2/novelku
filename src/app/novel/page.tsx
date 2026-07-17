import Link from "next/link";
import Image from "next/image";
import { scrapeArchivePage } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function NovelListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const sort = params.sort || "latest";

  let novels: any[] = [];
  let totalPages = 1;
  let error: string | null = null;

  try {
    const data = await scrapeArchivePage(page);
    novels = data.novels;
    totalPages = data.totalPages || 93;
  } catch (e: any) {
    error = e.message || "Gagal memuat data";
  }

  // Filter by search locally
  let filtered = novels;
  if (search) {
    filtered = novels.filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300">Daftar Novel</span>
        {search && (
          <>
            <span>/</span>
            <span className="text-indigo-600">Pencarian: &quot;{search}&quot;</span>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {search ? `Hasil Pencarian: "${search}"` : "Daftar Novel"}
        </h1>
        <div className="flex gap-2 flex-wrap">
          {["latest", "alphabet", "rating", "trending", "views"].map((s) => (
            <Link
              key={s}
              href={`/novel?sort=${s}${search ? `&search=${search}` : ""}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                sort === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300"
              }`}
            >
              {s === "latest" ? "Terbaru" : s === "alphabet" ? "A-Z" : s === "rating" ? "Rating" : s === "trending" ? "Trending" : "Views"}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-6">
          ⚠️ Gagal memuat data dari sumber.
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((novel) => (
            <Link
              key={novel.slug}
              href={`/novel/${novel.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
                {novel.cover ? (
                  <Image
                    src={novel.cover}
                    alt={novel.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 20vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                {novel.rating && parseFloat(novel.rating) > 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    ★ {novel.rating}
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {novel.title}
                </h3>
                {novel.latestChapters?.[0] && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate">
                    {novel.latestChapters[0].title}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-400 dark:text-gray-500">
            {search ? "Tidak ada novel ditemukan" : "Tidak ada novel tersedia"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !search && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link
              href={`/novel?page=${page - 1}&sort=${sort}`}
              className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition-colors"
            >
              ← Sebelumnya
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/novel?page=${page + 1}&sort=${sort}`}
              className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition-colors"
            >
              Selanjutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
