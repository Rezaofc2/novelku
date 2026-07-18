import Link from "next/link";
import Image from "next/image";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

const ALL_GENRES = ["Action","Adventure","Comedy","Cooking","Drama","Ecchi","Fantasy","Gender Bender","Harem","Historical","Horror","Isekai","Josei","Magic","Martial Arts","Mature","Mecha","Musik","Mystery","One shot","Psychological","Reverse Harem","Romance","School Life","Sci-fi","Seinen","Shoujo","Shoujo Ai","Shounen","Slice of Life","Smut","Sports","Supernatural","Tragedy","Virtual Reality","Wuxia","Xianxia","Xuanhuan","Yuri"];

const BASE = "https://meionovels.com";

function slugifyGenre(g: string) { return g.toLowerCase().replace(/ /g, "-"); }

async function fetchHtml(url: string) {
  const res = await fetch(url,{
    headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)",Accept:"text/html"},
    next:{revalidate:3600},
  });
  return res.ok ? res.text() : null;
}

function scrapeList(html: string): any[] {
  const $ = cheerio.load(html);
  const items: any[] = [];
  $(".page-item-detail, .manga, article, .row.c-tabs-item__content").each((_, el) => {
    const a = $(el).find("h3 a,.post-title a,h2 a").first();
    if (!a.length) return;
    const title = a.text().trim();
    const href = a.attr("href") || "";
    if (!href.includes("/novel/")) return;
    let slug = href.replace(BASE + "/novel/", "").replace(/\/$/, "");
    if (slug.includes("/") || !slug) return;
    const img = $(el).find(".tab-thumb img, img").first();
    const cover = img.attr("src") || img.attr("data-src") || "";
    const rating = $(el).find(".rating .score,.post-total-vote").text().trim() || "";
    items.push({ title, slug, cover, rating });
  });
  return items;
}

function extractTotalPages(html: string, fallback: number = 1): number {
  const $ = cheerio.load(html);
  let max = 1;
  const countEl = $("h1, .page-title, .archive-title").first().text();
  const countMatch = countEl.match(/(\d[\d,]*)\s*results?/);
  if (countMatch) {
    const total = parseInt(countMatch[1].replace(/,/g, ""), 10);
    max = Math.min(50, Math.ceil(total / 12));
  }
  $(".pagination a, .nav-links a").each((_, el) => {
    const t = $(el).text().trim();
    const n = parseInt(t, 10);
    if (!isNaN(n) && n > max && n <= 100) max = n;
  });
  return max;
}

export default async function NovelListPage(props: any) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams?.page || "1", 10) || 1;
  const genre = searchParams?.genre || "";
  const sort = searchParams?.sort || "";
  const search = searchParams?.s || "";

  // Only fetch if user explicitly filtered/searched/paginated
  const shouldFetch = !!genre || !!search || !!sort || page > 1;

  let novels: any[] = [];
  let totalPages = 1;
  let error: string | null = null;

  if (shouldFetch) {
    let url: string;
    if (search) {
      url = `${BASE}/?s=${encodeURIComponent(search)}&post_type=wp-manga`;
    } else if (genre || sort) {
      const qs = new URLSearchParams();
      if (genre) qs.set("genre", genre);
      if (sort) qs.set("m_orderby", sort === "latest" ? "latest" : "alphabet");
      url = `${BASE}/novel/page/${page}/?${qs.toString()}`;
    } else {
      url = `${BASE}/novel/page/${page}/`;
    }
    
    try {
      const html = await fetchHtml(url);
      if (!html) {
        error = "Gagal memuat data. Coba lagi nanti.";
      } else {
        novels = scrapeList(html);
        totalPages = extractTotalPages(html, page);
        if (novels.length === 0) {
          error = "Tidak ada novel ditemukan.";
        }
      }
    } catch (e: any) {
      error = e.message || "Gagal memuat data";
    }
  }

  function buildUrl(p: number) {
    const qs = new URLSearchParams();
    if (genre) qs.set("genre", genre);
    if (sort) qs.set("sort", sort);
    if (search) qs.set("s", search);
    if (p > 1) qs.set("page", String(p));
    const q = qs.toString();
    return `/novel${q ? "?" + q : ""}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      {/* Search */}
      <form className="mb-6 flex gap-2 max-w-lg" action="/novel" method="GET">
        <input name="s" defaultValue={search} placeholder="Cari novel..." className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">Cari</button>
        {search && <Link href="/novel" className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕ Reset</Link>}
      </form>

      {/* Genre Tags — always visible */}
      <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Filter Genre</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_GENRES.map(g => (
            <Link key={g} href={`/novel?genre=${slugifyGenre(g)}`} className={`px-2.5 py-1 text-[11px] font-medium border rounded-full transition ${
              genre === slugifyGenre(g) 
                ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-300"
            }`}>{g}</Link>
          ))}
        </div>
      </div>

      {/* Active filter */}
      {(genre || sort || search) && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400">Menampilkan:</span>
          {genre && <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full flex items-center gap-1">{genre} <Link href={buildUrl(1).replace(/&?genre=[^&]+/, "").replace("?&","?")} className="ml-1 hover:text-red-500">✕</Link></span>}
          {search && <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full flex items-center gap-1">"{search}" <Link href="/novel" className="ml-1 hover:text-red-500">✕</Link></span>}
        </div>
      )}

      {/* No query — just show genres, hint to search/filter */}
      {!shouldFetch && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Cari atau pilih genre di atas</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Gunakan fitur search atau filter genre untuk menemukan novel.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Novel cards */}
      {novels.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {novels.map(n => (
            <Link key={n.slug} href={`/novel/${n.slug}`} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                {n.cover ? <Image src={n.cover} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="20vw" unoptimized /> :
                <div className="absolute inset-0 flex items-center justify-center text-gray-400"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></div>}
                {n.rating && parseFloat(n.rating) > 0 && <div className="absolute top-1.5 left-1.5 bg-yellow-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">★ {n.rating}</div>}
              </div>
              <div className="p-2"><h3 className="font-semibold text-[11px] sm:text-xs text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-tight">{n.title}</h3></div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && <Link href={buildUrl(page - 1)} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 transition">← Sebelumnya</Link>}
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Hal {page} dari {totalPages}</span>
          {page < totalPages && <Link href={buildUrl(page + 1)} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 transition">Selanjutnya →</Link>}
        </div>
      )}
    </div>
  );
}
