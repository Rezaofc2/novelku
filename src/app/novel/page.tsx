"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";

export const dynamic = "force-dynamic";

const ALL_GENRES = [
  "Action","Adventure","Comedy","Cooking","Drama","Ecchi","Fantasy",
  "Gender Bender","Harem","Historical","Horror","Isekai","Josei","Magic",
  "Martial Arts","Mature","Mecha","Musik","Mystery","One shot","Psychological",
  "Reverse Harem","Romance","School Life","Sci-fi","Seinen","Shoujo",
  "Shoujo Ai","Shounen","Slice of Life","Smut","Sports","Supernatural",
  "Tragedy","Virtual Reality","Wuxia","Xianxia","Xuanhuan","Yuri",
];

const BASE = "https://meionovels.com";

function slugifyGenre(g: string) {
  return g.toLowerCase().replace(/ /g, "-");
}

export default function NovelListPage() {
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("latest");
  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Read query from URL on mount
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setPage(parseInt(sp.get("page") || "1", 10));
    setSort(sp.get("sort") || "latest");
    setGenre(sp.get("genre") || "");
    setSearch(sp.get("search") || "");
    setSearchInput(sp.get("search") || "");
  }, []);

  const fetchNovels = useCallback(async (p: number, g: string, s: string, kw: string) => {
    setLoading(true);
    setError(null);
    try {
      if (kw) {
        // Search via meionovels search page
        const url = `${BASE}/page/${p}/?s=${encodeURIComponent(kw)}&post_type=wp-manga`;
        const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error("Search failed");
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const items: any[] = [];
        doc.querySelectorAll(".page-item-detail, .manga, article").forEach((el) => {
          const a = el.querySelector("h3 a, .post-title a, h2 a") as HTMLAnchorElement;
          if (!a) return;
          const title = a.textContent?.trim() || "";
          const href = a.href || "";
          if (!href.includes("/novel/")) return;
          const slug = href.replace(BASE + "/novel/", "").replace(/\/$/, "");
          if (slug.includes("/") || !slug) return;
          const img = el.querySelector("img") as HTMLImageElement;
          const cover = img?.src || img?.dataset?.src || "";
          items.push({ title, slug, cover, rating: "", latestChapters: [] });
        });
        // Count total pages
        const pagLinks = doc.querySelectorAll(".pagination a.page-numbers, .nav-links a.page-numbers");
        let maxP = 1;
        pagLinks.forEach((pl) => {
          const t = pl.textContent?.trim() || "";
          const n = parseInt(t, 10);
          if (n > maxP) maxP = n;
        });
        setNovels(items);
        setTotalPages(maxP || 1);
      } else if (g) {
        // Genre — always proxy to avoid CORS
        const genreSlug = slugifyGenre(g);
        const url = `${BASE}/novel-genre/${genreSlug}/page/${p}/?m_orderby=${s === "latest" ? "latest" : s === "alphabet" ? "alphabet" : s === "rating" ? "rating" : s === "trending" ? "trending" : "views"}`;
        const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error("Genre load failed");
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const items: any[] = [];
        doc.querySelectorAll(".page-item-detail, .manga, article").forEach((el) => {
          const a = el.querySelector("h3 a, .post-title a, h2 a") as HTMLAnchorElement;
          if (!a) return;
          const title = a.textContent?.trim() || "";
          const href = a.href || "";
          if (!href.includes("/novel/")) return;
          const slug = href.replace(BASE + "/novel/", "").replace(/\/$/, "");
          if (slug.includes("/") || !slug) return;
          const img = el.querySelector("img") as HTMLImageElement;
          const cover = img?.src || img?.dataset?.src || "";
          const rating = el.querySelector(".rating .score, .post-total-vote")?.textContent?.trim() || "";
          items.push({ title, slug, cover, rating, latestChapters: [] });
        });
        const pagLinks = doc.querySelectorAll(".pagination a.page-numbers, .nav-links a.page-numbers, .posts-navigation a");
        let maxP = 1;
        pagLinks.forEach((pl) => {
          const t = pl.textContent?.trim() || "";
          const n = parseInt(t, 10);
          if (n > maxP) maxP = n;
        });
        setNovels(items);
        setTotalPages(maxP || 1);
      } else {
        // Normal archive page
        const url = `${BASE}/novel/page/${p}/`;
        const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error("Load failed");
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const items: any[] = [];
        doc.querySelectorAll(".page-item-detail, .manga, article").forEach((el) => {
          const a = el.querySelector("h3 a, .post-title a, h2 a") as HTMLAnchorElement;
          if (!a) return;
          const title = a.textContent?.trim() || "";
          const href = a.href || "";
          if (!href.includes("/novel/")) return;
          const slug = href.replace(BASE + "/novel/", "").replace(/\/$/, "");
          if (slug.includes("/") || !slug) return;
          const img = el.querySelector("img") as HTMLImageElement;
          const cover = img?.src || img?.dataset?.src || "";
          const rating = el.querySelector(".rating .score")?.textContent?.trim() || "";
          items.push({ title, slug, cover, rating, latestChapters: [] });
        });
        const last = doc.querySelector(".pagination .last, .pagination a:last-child") as HTMLAnchorElement;
        const lastHref = last?.href || "";
        const t = parseInt(lastHref.match(/page\/(\d+)/)?.[1] || "93", 10);
        setNovels(items);
        setTotalPages(t || 93);
      }
    } catch (e: any) {
      setError(e.message || "Gagal memuat");
      setNovels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNovels(page, genre, sort, search);
  }, [page, genre, sort, search, fetchNovels]);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (sort !== "latest") params.set("sort", sort);
    if (genre) params.set("genre", genre);
    if (search) params.set("search", search);
    const qs = params.toString();
    return `/novel${qs ? "?" + qs : ""}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    if (searchInput) params.set("search", searchInput);
    window.location.href = `/novel${params.toString() ? "?" + params.toString() : ""}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {genre ? `Genre: ${genre.replace(/-/g, " ")}` : search ? `Hasil Pencarian: "${search}"` : "Daftar Novel"}
      </h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari novel..."
          className="flex-1 max-w-md px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">Cari</button>
        {(search || genre) && (
          <Link href="/novel" className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:border-indigo-300 transition">Reset</Link>
        )}
      </form>

      {/* Sort tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["latest","alphabet","rating","trending","views"].map((s) => (
          <Link key={s} href={(() => {
            const p = new URLSearchParams();
            p.set("sort", s);
            if (genre) p.set("genre", genre);
            if (search) p.set("search", search);
            return `/novel?${p.toString()}`;
          })()} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
            sort === s ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300"
          }`}>
            {s === "latest" ? "Terbaru" : s === "alphabet" ? "A-Z" : s === "rating" ? "Rating" : s === "trending" ? "Trending" : "Views"}
          </Link>
        ))}
      </div>

      {/* Genre chips */}
      {!genre && (
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Filter Genre</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_GENRES.map((g) => (
              <Link key={g} href={`/novel?genre=${slugifyGenre(g)}`} className="px-2.5 py-1 text-[11px] font-medium bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition">
                {g}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-6">
          ⚠️ Gagal memuat data dari sumber.
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700" />
              <div className="p-2 space-y-1.5">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : novels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {novels.map((n) => (
            <Link key={n.slug} href={`/novel/${n.slug}`} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                {n.cover ? (
                  <Image src={n.cover} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="20vw" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                )}
                {n.rating && parseFloat(n.rating) > 0 && (
                  <div className="absolute top-1.5 left-1.5 bg-yellow-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    ★ {n.rating}
                  </div>
                )}
              </div>
              <div className="p-2">
                <h3 className="font-semibold text-[11px] sm:text-xs text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition leading-tight">{n.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500">Tidak ada novel ditemukan.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link href={buildUrl(page - 1)} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition">← Sebelumnya</Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Hal {page} dari {totalPages}</span>
          {page < totalPages && (
            <Link href={buildUrl(page + 1)} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition">Selanjutnya →</Link>
          )}
        </div>
      )}
    </div>
  );
}
