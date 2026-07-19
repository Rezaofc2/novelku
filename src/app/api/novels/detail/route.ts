import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';

const BASE = 'https://meionovels.com';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  if (!slug) return NextResponse.json(null, { status: 400 });

  try {
    const res = await fetch(`${BASE}/novel/${slug}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', Accept: 'text/html' },
    });
    if (!res.ok) return NextResponse.json(null, { status: 502 });

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('.post-title h1, h1').first().text().trim();
    const cover = $('.summary_image img, .manga-info-cover img').first().attr('src') || $('.summary_image img').first().attr('data-src') || '';

    // Rating
    const rating = $('.post-total-vote span, .rating .score').first().text().trim();

    // Metadata from post-content or sidebar
    let author = '', status = '', type = '', alternative = '', release = '', chapters = 0;
    const genres: string[] = [];

    $('.post-content_item, .post-content .summary-heading, .manga-info-row').each((_, row) => {
      const heading = $(row).find('.summary-heading h5, .summary-heading, h5').first().text().trim()
        || $(row).find('b, strong').first().text().trim();
      const value = $(row).find('.summary-content, .summary-content a').first().text().trim()
        || $(row).next().text().trim();

      if (heading.match(/author/i)) author = value || $(row).find('.summary-content').text().trim();
      if (heading.match(/status/i)) status = value || $(row).find('.summary-content').text().trim();
      if (heading.match(/\btype\b/i)) type = value || $(row).find('.summary-content').text().trim();
      if (heading.match(/alternative/i)) alternative = value || $(row).find('.summary-content').text().trim();
      if (heading.match(/release/i)) release = value || $(row).find('.summary-content').text().trim();
      if (heading.match(/chapters/i) || heading.match(/chapter/i)) {
        const chText = $(row).find('.summary-content').text().trim();
        const chMatch = chText.match(/(\d[\d,]*)/);
        if (chMatch) chapters = parseInt(chMatch[1].replace(/,/g, ''), 10);
      }
      if (heading.match(/genre/i)) {
        $(row).find('.summary-content a, a').each((_, a) => {
          const g = $(a).text().trim();
          if (g && !g.match(/chapter/i)) genres.push(g);
        });
      }
    });

    // Synops
    const synopsis = $('.summary__content p, .description-summary p').first().text().trim()
      || $('.post-content_item:contains("Summary") + .summary-content').text().trim()
      || $('.manga-excerpt').text().trim();

    // Fallback: find chapters count in page text
    if (chapters === 0) {
      const body = $('body').text();
      const m = body.match(/Chapters\s*(\d+)/i);
      if (m) chapters = parseInt(m[1], 10);
    }

    // Fix author
    if (!author) {
      const a = $('a[href*="/novel-author/"]').first().text().trim();
      if (a) author = a;
    }

    return NextResponse.json(
      { title, slug, author, rating, status, type, alternative, release, synopsis, cover, genres, chapters },
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=7200' } }
    );
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
