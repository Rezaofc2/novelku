import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';

const BASE = 'https://meionovels.com';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('s') || '';
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10) || 1;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '12', 10);

  if (!search) {
    return NextResponse.json({ novels: [], totalPages: 0 });
  }

  try {
    const url = `${BASE}/?s=${encodeURIComponent(search)}&post_type=wp-manga`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'text/html',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ novels: [], totalPages: 0 }, { status: 502 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Count results
    const countEl = $('h1, .page-title, .archive-title').first().text();
    const countMatch = countEl.match(/(\d[\d,]*)\s*results?/);
    let total = 0;
    if (countMatch) {
      total = parseInt(countMatch[1].replace(/,/g, ''), 10);
    }

    // Extract novels
    const novels: any[] = [];
    $('.page-item-detail, .manga, article, .row.c-tabs-item__content').each((_, el) => {
      const a = $(el).find('h3 a, .post-title a, h2 a').first();
      if (!a.length) return;
      const title = a.text().trim();
      const href = a.attr('href') || '';
      if (!href.includes('/novel/')) return;
      const slug = href.replace(BASE + '/novel/', '').replace(/\/$/, '');
      if (slug.includes('/') || !slug) return;
      const img = $(el).find('.tab-thumb img, img').first();
      const cover = img.attr('src') || img.attr('data-src') || '';
      const rating = $(el).find('.rating .score, .post-total-vote').text().trim() || '';
      if (novels.length < limit) {
        novels.push({ title, slug, cover, rating });
      }
    });

    const totalPages = Math.min(50, Math.ceil(total / limit));

    return NextResponse.json(
      { novels, totalPages },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=7200',
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ novels: [], totalPages: 0 }, { status: 500 });
  }
}
