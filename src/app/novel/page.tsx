import Link from "next/link";
import Image from "next/image";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

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

  // Method 1: Try to extract from "822 results" heading and count items per page
  const countEl = $("h1, .page-title, .archive-title").first().text();
  const countMatch = countEl.match(/(\d[\d,]*)\s*results?/);
  if (countMatch) {
    const total = parseInt(countMatch[1].replace(/,/g, ""), 10);
    // meionovels shows ~12 items per page
    max = Math.ceil(total / 12);
  }

  // Method 2: .pagination .page-numbers
  if (max === 1) {
    $(".pagination .page-numbers, .nav-links .page-numbers").each((_, el) => {
      const n = parseInt($(el).text().trim(), 10);
      if (n > max) max = n;
    });
  }

  // Method 3: .posts-navigation a (genre pages)
  if (max === 1) {
    $(".posts-navigation a, .nav-previous a, .nav-next a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const m = href.match(/page\/(\d+)/);
      if (m) { const p = parseInt(m[1], 10); if (p > max) max = p; }
    });
  }

  // Method 4: .pagination .last
  if (max === 1) {
    const lastHref = $(".pagination .last, .pagination a:last-child").attr("href") || "";
    const m = lastHref.match(/page\/(\d+)/);
    if (m) max = parseInt(m[1], 10);
  }

  return max > 1 ? max : fallback;
}

export default async function NovelListPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; sort?: string; genre?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const sort = params.sort || "latest";
  const genre = params.genre || "";

  let novels: any[] = [];
  let totalPages = 1;

  try {
    if (search) {
      const html = await fetchHtml(page > 1 ? `${BASE}/page/${page}/?s=${encodeURIComponent(search)}&post_type=wp-manga` : `${BASE}/?s=${encodeURIComponent(search)}&post_type=wp-manga`);
      if (html) { novels = scrapeList(html); totalPages = extractTotalPages(html, 1); }
    } else if (genre) {
      const html = await fetchHtml(`${BASE}/novel-genre/${slugifyGenre(genre)}/page/${page}/`);
      if (html) { novels = scrapeList(html); totalPages = extractTotalPages(html, 1); }
    } else {
      const html = await fetchHtml(`${BASE}/novel/page/${page}/`);
      if (html) { novels = scrapeList(html); totalPages = extractTotalPages(html, 93); }
    }
  } catch {}

  const buildUrl = (p: number) => {
    const q = new URLSearchParams();
    if (p > 1) q.set("page",String(p));
    if (sort !== "latest") q.set("sort",sort);
    if (genre) q.set("genre",genre);
    if (search) q.set("search",search);
    return `/novel?${q}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Beranda</Link>
        <span>/</span>
        <Link href="/novel" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Daftar Novel</Link>
        {search && <><span>/</span><span className="text-gray-600 dark:text-gray-300">Pencarian: &quot;{search}&quot;</span></>}
        {genre && <><span>/</span><span className="text-indigo-600 dark:text-indigo-400 capitalize">{genre.replace(/-/g," ")}</span></>}
      </div>

      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {genre ? `Genre: ${genre.replace(/-/g," ")}` : search ? `Hasil Pencarian: "${search}"` : "Daftar Novel"}
      </h1>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2">
          <form action="/novel" method="GET" className="flex gap-2 flex-1 max-w-md">
            {genre && <input type="hidden" name="genre" value={genre}/>}
            <input type="text" name="search" defaultValue={search} placeholder="Cari novel..." className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
            <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">Cari</button>
          </form>
          {(search||genre)&&<Link href="/novel" className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-500 transition">Reset</Link>}
        </div>

        <div className="flex gap-2 flex-wrap">
          {["latest","alphabet","rating","trending","views"].map(s=>{
            const q=new URLSearchParams();q.set("sort",s);if(genre)q.set("genre",genre);if(search)q.set("search",search);
            return <Link key={s} href={`/novel?${q}`} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${sort===s?"bg-indigo-600 text-white":"bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500"}`}>{s==="latest"?"Terbaru":s==="alphabet"?"A-Z":s==="rating"?"Rating":s==="trending"?"Trending":"Views"}</Link>
          })}
        </div>
      </div>

      {!genre && <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Filter Genre</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_GENRES.map(g=><Link key={g} href={`/novel?genre=${slugifyGenre(g)}`} className="px-2.5 py-1 text-[11px] font-medium bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">{g}</Link>)}
        </div>
      </div>}

      {novels.length>0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {novels.map(n=><Link key={n.slug} href={`/novel/${n.slug}`} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
              {n.cover?<Image src={n.cover} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="20vw" unoptimized/>:<div className="absolute inset-0 flex items-center justify-center text-gray-400"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></div>}
              {n.rating&&parseFloat(n.rating)>0&&<div className="absolute top-1.5 left-1.5 bg-yellow-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">★ {n.rating}</div>}
            </div>
            <div className="p-2"><h3 className="font-semibold text-[11px] sm:text-xs text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-tight">{n.title}</h3></div>
          </Link>)}
        </div>
      ) : <div className="text-center py-16"><p className="text-gray-400 dark:text-gray-500">Tidak ada novel ditemukan.</p></div>}

      {totalPages>1&&<div className="flex items-center justify-center gap-2 mt-10">
        {page>1&&<Link href={buildUrl(page-1)} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 transition">← Sebelumnya</Link>}
        <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Hal {page} dari {totalPages}</span>
        {page<totalPages&&<Link href={buildUrl(page+1)} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 transition">Selanjutnya →</Link>}
      </div>}
    </div>
  );
}
