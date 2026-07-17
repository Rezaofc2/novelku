import * as cheerio from "cheerio";

const BASE_URL = "https://meionovels.com";

export interface NovelCard {
  title: string;
  slug: string;
  cover: string;
  rating: string;
  latestChapters: { title: string; slug: string; label?: string }[];
  type?: string;
}

export interface NovelDetail {
  title: string;
  cover: string;
  rating: string;
  rank: string;
  alternative: string;
  author: string;
  genres: string[];
  type: string;
  tags: string[];
  status: string;
  chapters: { title: string; slug: string; label?: string; date?: string }[];
  summary: string;
  totalChapters: number;
  release: string;
}

export interface ChapterContent {
  title: string;
  novelTitle: string;
  content: string;
  prevSlug: string | null;
  nextSlug: string | null;
  label: string | null;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.text();
}

/** Strip genre count like "Action (822)" → "Action" */
function cleanGenre(text: string): string {
  return text.replace(/\s*\(\d+\)\s*$/, "").trim();
}

export async function scrapeHomeV2(): Promise<{ latest: NovelCard[]; popular: NovelCard[] }> {
  const html = await fetchPage(BASE_URL);
  const $ = cheerio.load(html);

  const latest: NovelCard[] = [];
  const popular: NovelCard[] = [];

  // Scrape latest from main page
  $(".page-item-detail, .manga, article, .bixbox .listupd .utao, .listupd article, .utao").each((_, el) => {
    const $el = $(el);
    const titleEl = $el.find("h3 a, .post-title a, h2 a, a[rel='bookmark']").first();
    if (!titleEl.length) return;

    const title = titleEl.text().trim();
    const href = titleEl.attr("href") || "";
    if (!href.includes("/novel/")) return;

    const slug = href.replace(BASE_URL, "").replace(/\/$/, "").replace(/^\/novel\//, "");
    if (!slug || slug.includes("/")) return;

    const cover =
      $el.find("img").first().attr("src") ||
      $el.find("img").first().attr("data-src") ||
      "";
    const rating = $el.find(".rating .score, .post-total-vote").text().trim() || "0";

    const latestChapters: { title: string; slug: string; label?: string }[] = [];
    $el.find(".chapter-item a, .list-chapter a, .chapters a").slice(0, 2).each((_, chEl) => {
      const $ch = $(chEl);
      const chTitle = $ch.text().trim();
      const chHref = $ch.attr("href") || "";
      const chSlug = chHref.replace(BASE_URL + "/novel/", "").replace(/\/$/, "");
      if (chTitle && chSlug) latestChapters.push({ title: chTitle, slug: chSlug });
    });

    if (title && slug && !latest.find((n) => n.slug === slug)) {
      latest.push({ title, slug, cover, rating, latestChapters });
    }
  });

  // Fallback to archive
  if (latest.length === 0) {
    const archive = await scrapeArchivePage(1);
    latest.push(...archive.novels.slice(0, 20));
  }

  // Popular from sidebar
  $(".serieslist ul li, .popular-item, .widget_archive li, .c-popular li, .list-popular li, .top-series li").each((_, el) => {
    const $el = $(el);
    const aEl = $el.find("a").first();
    const title = aEl.text().trim();
    const href = aEl.attr("href") || "";
    if (!href.includes("/novel/")) return;
    const slug = href.replace(BASE_URL, "").replace(/\/$/, "").replace(/^\/novel\//, "");
    if (slug && !slug.includes("/") && title && !popular.find((n) => n.slug === slug)) {
      const cover = $el.find("img").first().attr("src") || "";
      popular.push({ title, slug, cover, rating: "", latestChapters: [] });
    }
  });

  // Add latest chapters to popular items from page data
  $(".popular-item, .c-popular li, .list-popular li").each((_, el) => {
    const $el = $(el);
    const aEl = $el.find("a").first();
    const href = aEl.attr("href") || "";
    const slug = href.replace(BASE_URL, "").replace(/\/$/, "").replace(/^\/novel\//, "");
    const existing = popular.find((n) => n.slug === slug);
    if (existing) {
      $el.find(".chapter-item a, .list-chapter a").slice(0, 2).each((_, chEl) => {
        const $ch = $(chEl);
        const chTitle = $ch.text().trim();
        const chHref = $ch.attr("href") || "";
        const chSlug = chHref.replace(BASE_URL + "/novel/", "").replace(/\/$/, "");
        if (chTitle && chSlug && !existing.latestChapters.find((c) => c.slug === chSlug)) {
          existing.latestChapters.push({ title: chTitle, slug: chSlug });
        }
      });
    }
  });

  if (popular.length === 0) {
    popular.push(...latest.slice(0, 8));
  }

  return { latest, popular };
}

export async function scrapeNovelDetail(slug: string): Promise<NovelDetail | null> {
  const html = await fetchPage(`${BASE_URL}/novel/${slug}/`);
  const $ = cheerio.load(html);

  const title =
    $(".post-title h1, h1.entry-title, .entry-title").first().text().trim() ||
    $("h1").first().text().trim() ||
    slug;
  const cover =
    $(".summary_image img, .novel-cover img").first().attr("src") ||
    $(".summary_image img").first().attr("data-src") ||
    $(".wp-post-image").first().attr("src") ||
    "";

  // Summary
  const summary =
    $(".summary__content p, .description-summary p, .summary_content p, .entry-content p, .manga-excerpt p")
      .first()
      .text()
      .trim() ||
    $(".summary__content, .description-summary, .manga-excerpt")
      .first()
      .text()
      .trim();

  // Metadata from post-content items
  const meta: Record<string, string> = {};
  $(".post-content_item, .post-status, .manga-info-row").each((_, el) => {
    const $el = $(el);
    const label = $el
      .find(".summary-heading, .info-label, h5, b, strong")
      .first()
      .text()
      .replace(/:/g, "")
      .trim()
      .toLowerCase();
    const value =
      $el.find(".summary-content, .info-value").first().text().trim() ||
      $el
        .text()
        .replace(
          $el.find(".summary-heading, .info-label, h5, b, strong").first().text(),
          ""
        )
        .trim();
    if (label && value) meta[label] = value;
  });

  // Genre — clean count suffix, only from detail page not sidebar
  const genres: string[] = [];
  const genreParent = $(".summary-content .genres-content, .post-content_item .summary-content .genres-content, .genres-content").first();
  if (genreParent.length) {
    genreParent.find("a").each((_, el) => {
      const g = cleanGenre($(el).text().trim());
      if (g && g.length > 0 && !genres.includes(g)) genres.push(g);
    });
  } else {
    // Fallback: try finding genre links within manga detail area only
    $(".summary_content .genres-content a, .post-content .genres-content a, .entry-content .genres a").each((_, el) => {
      const g = cleanGenre($(el).text().trim());
      if (g && g.length > 0 && !genres.includes(g)) genres.push(g);
    });
  }
  // Filter out non-genre noise (HTL, Korea, 2024, etc)
  const validGenres = genres.filter(g =>
    !g.match(/^(HTL|MTL|Korea|Japan|China|Tamat|202\d|\d{4})$/i) &&
    g.length > 1 && g.length < 30
  );

  // Tags
  const tags: string[] = [];
  $(".tags-content a, .manga-tags a").each((_, el) => {
    tags.push($(el).text().trim());
  });

  // Chapters — CHAPTER LIST IS LOADED VIA AJAX, SO GENERATE FROM CHAPTER COUNT
  // meionovels uses format: {slug}/htl/chapter-{n}/ or {slug}/mtl/chapter-{n}/
  const chapters: { title: string; slug: string; label?: string; date?: string }[] = [];
  
  // First check for Read First link to determine label (HTL/MTL)
  const firstChHref = $("a[href*='/chapter-1/'], a[href*='/chapter-01/']").first().attr("href") || "";
  const labelFromLink = firstChHref.includes("htl") ? "HTL" : firstChHref.includes("mtl") ? "MTL" : "HTL";
  
  const totalCh = parseInt(meta["chapters"] || meta["total chapter"] || "0", 10) || 0;
  
  if (totalCh > 0) {
    for (let i = 1; i <= totalCh; i++) {
      const chNum = String(i);
      chapters.push({
        title: `Chapter ${chNum}`,
        slug: `${slug}/${labelFromLink.toLowerCase()}/chapter-${chNum}`,
        label: labelFromLink,
        date: undefined,
      });
    }
  }

  return {
    title,
    cover,
    rating: meta["rating"] || $(".post-total-rating .score, .rating .score").text().trim() || "-",
    rank: meta["rank"] || meta["peringkat"] || "-",
    alternative: meta["alternative"] || meta["judul alternatif"] || "",
    author: meta["author"] || meta["penulis"] || meta["author(s)"] || "-",
    genres: validGenres,
    type: meta["type"] || meta["tipe"] || "",
    tags,
    status: meta["status"] || "",
    chapters,
    summary,
    totalChapters: parseInt(meta["chapters"] || meta["total chapter"] || "0", 10) || chapters.length,
    release: meta["release"] || meta["rilis"] || "",
  };
}

export async function scrapeChapter(fullSlug: string): Promise<ChapterContent | null> {
  const html = await fetchPage(`${BASE_URL}/novel/${fullSlug}/`);
  const $ = cheerio.load(html);

  const title =
    $(".reading-content .chapter-title, h1, .entry-title").first().text().trim() || fullSlug;

  const novelTitle =
    $(".breadcrumb a:nth-child(3), .breadcrumb a:nth-child(2)").last().text().trim() ||
    $(".allc a").first().text().trim() ||
    "";

  const contentEl = $(".reading-content, .entry-content, .text-left, .chapter-content, .epcontent, .entry-content_wrap").first();
  contentEl.find("script, style, .ads, .ad, .chapter-nav, .nav, .pagination, .sharedaddy, .code-block, .advertisement").remove();

  // Get text preserving paragraphs
  let content = "";
  contentEl.find("p").each((_, p) => {
    const text = $(p).text().trim();
    if (text) content += text + "\n\n";
  });
  if (!content) {
    content = contentEl.text().trim();
  }

  // Navigation
  const prevEl = $(".nav-previous a, .prev a, .prev-link a:not(.disabled), .nav-links .prev a, a.prev_page").first();
  const nextEl = $(".nav-next a, .next a, .next-link a:not(.disabled), .nav-links .next a, a.next_page").first();

  const prevHref = prevEl.attr("href") || null;
  const nextHref = nextEl.attr("href") || null;

  const prevSlug = prevHref ? prevHref.replace(BASE_URL + "/novel/", "").replace(/\/$/, "") : null;
  const nextSlug = nextHref ? nextHref.replace(BASE_URL + "/novel/", "").replace(/\/$/, "") : null;

  const label = $(".chapter-type, .mtl-label, .htl-label").first().text().trim() || null;

  return { title, novelTitle, content, prevSlug, nextSlug, label };
}

export async function scrapeArchivePage(page: number): Promise<{
  novels: NovelCard[];
  totalPages: number;
  totalNovels: number;
}> {
  const html = await fetchPage(`${BASE_URL}/novel/page/${page}/`);
  const $ = cheerio.load(html);

  const novels: NovelCard[] = [];

  $(".page-item-detail, .manga, article").each((_, el) => {
    const $el = $(el);
    const titleEl = $el.find("h3 a, .post-title a, h2 a").first();
    const title = titleEl.text().trim();
    const href = titleEl.attr("href") || "";
    const slug = href.replace(BASE_URL + "/novel/", "").replace(/\/$/, "");
    const cover =
      $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src") || "";
    const rating = $el.find(".rating .score, .post-total-rating .score").text().trim() || "0";

    const latestChapters: { title: string; slug: string; label?: string }[] = [];
    $el.find(".chapter-item a, .list-chapter a").slice(0, 3).each((_, chEl) => {
      const $ch = $(chEl);
      const chTitle = $ch.text().trim();
      const chHref = $ch.attr("href") || "";
      const chSlug = chHref.replace(BASE_URL + "/novel/", "").replace(/\/$/, "");
      if (chTitle && chSlug) latestChapters.push({ title: chTitle, slug: chSlug });
    });

    const type = $el.find(".type-label, .manga-type").first().text().trim() || undefined;

    if (title && slug) novels.push({ title, slug, cover, rating, latestChapters, type });
  });

  const lastPageEl = $(".pagination .last, .pagination a:last-child, .nav-links a:last-child").first();
  const lastPageHref = lastPageEl.attr("href") || "";
  const totalPages = parseInt(lastPageHref.match(/page\/(\d+)/)?.[1] || "1", 10);

  const totalText = $(".filter-count, .manga-count, .total-count").text().trim();
  const totalNovels = parseInt(totalText.replace(/\D/g, "") || "0", 10);

  return { novels, totalPages, totalNovels };
}

export async function searchNovels(query: string): Promise<NovelCard[]> {
  const html = await fetchPage(
    `${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=wp-manga`
  );
  const $ = cheerio.load(html);

  const novels: NovelCard[] = [];

  $(".page-item-detail, .manga, article, .c-tabs-item__content .row").each((_, el) => {
    const $el = $(el);
    const titleEl = $el.find("h3 a, .post-title a, h2 a, a").first();
    const title = titleEl.text().trim();
    const href = titleEl.attr("href") || "";
    if (!href.includes("/novel/")) return;
    const slug = href.replace(BASE_URL + "/novel/", "").replace(/\/$/, "");
    const cover =
      $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src") || "";

    if (title && slug) novels.push({ title, slug, cover, rating: "", latestChapters: [] });
  });

  return novels;
}
