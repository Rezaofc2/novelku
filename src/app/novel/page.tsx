import Link from "next/link";
import Image from "next/image";
import { scrapeArchivePage } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const ALL_GENRES = [
  "Action","Adventure","Comedy","Cooking","Drama","Ecchi","Fantasy",
  "Gender Bender","Harem","Historical","Horror","Isekai","Josei","Magic",
  "Martial Arts","Mature","Mecha","Musik","Mystery","One shot","Psychological",
  "Reverse Harem","Romance","School Life","Sci-fi","Seinen","Shoujo",
  "Shoujo Ai","Shounen","Slice of Life","Smut","Sports","Supernatural",
  "Tragedy","Virtual Reality","Wuxia","Xianxia","Xuanhuan","Yuri",
];

async function scrapeGenrePage(genre: string, page: number) {
  const BASE_URL = "https://meionovels.com";
  const genreSlug = genre.toLowerCase().replace(/ /g, "-");
  const url = `${BASE_URL}/novel-genre/${genreSlug}/page/${page}/`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return { novels: [] as any[], totalPages: 1 };

  const html = await res.text();
  const $ = await loadCheerio(html);

  const novels: any[] = [];

  $(".page-item-detail, .manga, article, .novel-item").each((_: number, el: any) => {
    const $el = $(el);
    const titleEl = $el.find("h3 a, .post-title a, h2 a, .novel-title a").first();
    const title = titleEl.text().trim();
    const href = titleEl.attr("href") || "";
    if (!href.includes("/novel/")) return;
    const slug = href.replace("https://meionovels.com/novel/", "").replace(/\/$/, "");
    if (slug.includes("/") || !slug) return;
    const cover = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src") || "";
    const rating = $el.find(".rating .score, .post-total-vote").text().trim() || "0";

    const latestChapters: any[] = [];
    $el.find(".chapter-item a, .list-chapter a").slice(0, 3).each((_c: number, chEl: any) => {
      const $ch = $(chEl);
      const chTitle = $ch.text().trim();
      const chHref = $ch.attr("href") || "";
      const chSlug = chHref.replace("https://meionovels.com/novel/", "").replace(/\/$/, "");
      if (chTitle && chSlug) latestChapters.push({ title: chTitle, slug: chSlug });
    });

    if (title && slug) novels.push({ title, slug, cover, rating, latestChapters });
  });

  const lastPageHref = $(".pagination .last, .pagination a:last-child").first().attr("href") || "";
  const totalPages = parseInt(lastPageHref.match(/page\/(\d+)/)?.[1] || "1", 10);

  return { novels, totalPages };
}

async function loadCheerio(html: string) {
  const cheerio = await import("cheerio");
  return cheerio.load(html);
}

export default async function NovelListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const sort = params.sort || "latest";
  const genre = params.genre || "";

  let novels: any[] = [];
  let totalPages = 1;
  let error: string | null = null;

  try {
    if (genre) {
      const data = await scrapeGenrePage(genre, page);
      novels = data.novels;
      totalPages = data.totalPages || 1;
    } else if (search) {
      const BASE_URL = "https://meionovels.com";
      const url = `${BASE_URL}/?s=${encodeURIComponent(search)}&post_type=wp-manga`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const html = await res.text();
        const $ = await loadCheerio(html);
        $(".page-item-detail, .manga, article, .c-tabs-item__content .row").each((_: number, el: any) => {
          const $el = $(el);
          const titleEl = $el.find("h3 a, .post-title a, h2 a, a").first();
          const title = titleEl.text().trim();
          const href = titleEl.attr("href") || "";
          if (!href.includes("/novel/")) return;
          const slug = href.replace("https://meionovels.com/novel/", "").replace(/\/$/, "");
          if (slug.includes("/") || !slug) return;
          const cover = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src") || "";
          if (title && slug) novels.push({ title, slug, cover, rating: "", latestChapters: [] });
        });
        totalPages = 1;
      }
    } else {
      const data = await scrapeArchivePage(page);
      novels = data.novels;
      totalPages = data.totalPages || 93;
    }
  } catch (e: any) {
    error = e.message || "Gagal memuat data";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/novel" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Daftar Novel
        </Link>
        {genre && (
          <>
            <span>/</span>
            <span className="text-indigo-600 capitalize">{genre.replace(/-/g, " ")}</span>
          </>
        )}
        {search && (
          <>
            <span>/</span>
            <span className="text-indigo-600">Pencarian: &quot;{search}&quot;</span>
          </>
        )}
      </div>

      {/* Title + Search */}
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {genre
            ? `Genre: ${genre.replace(/-/g, " ")}`
            : search
              ? `Hasil Pencarian: "${search}"`
              : "Daftar Novel"}
        </h1>

        {/* Search bar */}
        <form action="/novel" method="GET" className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Cari novel..."
            className="flex-1 max-w-md px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Cari
          </button>
          {(search || genre) && (
            <Link href="/novel" className="px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 transition-colors text-gray-500">
              Reset
            </Link>
          )}
        </form>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["latest", "alphabet", "rating", "trending", "views"].map((s) => (
          <Link
            key={s}
            href={`/novel?sort=${s}${genre ? `&genre=${genre}` : ""}${search ? `&search=${search}` : ""}`}
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

      {/* Genre Quick Links */}
      {!genre && (
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wide">
            Filter Genre
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_GENRES.map((g) => (
              <Link
                key={g}
                href={`/novel?genre=${g.toLowerCase().replace(/ /g, "-")}`}
                className="px-2.5 py-1 text-[11px] font-medium bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all"
              >
                {g}
              </Link>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-6">
          ⚠️ Gagal memuat data dari sumber.
        </div>
      )}

      {novels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {novels.map((novel: any) => (
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
            {search || genre ? "Tidak ada novel ditemukan" : "Tidak ada novel tersedia"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link
              href={`/novel?page=${page - 1}&sort=${sort}${genre ? `&genre=${genre}` : ""}${search ? `&search=${search}` : ""}`}
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
              href={`/novel?page=${page + 1}&sort=${sort}${genre ? `&genre=${genre}` : ""}${search ? `&search=${search}` : ""}`}
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
