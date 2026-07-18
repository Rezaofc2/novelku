import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';

const BASE = 'https://meionovels.com';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  if (!slug) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const url = `${BASE}/novel/${slug}/`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'text/html',
      },
    });

    if (!res.ok) {
      return NextResponse.json(null, { status: 502 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('.post-title h1, h1').first().text().trim();
    const author = $('.author-content a, .manga-info-row:contains("Author") a').first().text().trim();
    const rating = $('.post-total-vote span, .rating .score').first().text().trim();
    const status = $('.post-status .summary-content, .manga-info-row:contains("Status") .summary-content').first().text().trim();
    const type = $('.manga-info-row:contains("Type") .summary-content').first().text().trim();
    const alternative = $('.manga-info-row:contains("Alternative") .summary-content').first().text().trim();
    const release = $('.manga-info-row:contains("Release") .summary-content').first().text().trim();
    const synopsis = $('.summary__content p, .description-summary p').first().text().trim();
    
    // Cover
    const imgEl = $('.summary_image img, .manga-info-cover img').first();
    const cover = imgEl.attr('src') || imgEl.attr('data-src') || '';

    // Genres
    const genres: string[] = [];
    $('.genres-content a, .manga-info-row:contains("Genre") a').each((_, el) => {
      genres.push($(el).text().trim());
    });

    // Chapter count from chapter list
    let chapters = 0;
    $('.wp-manga-chapter a, .chapter-list li a').each((_, el) => {
      const text = $(el).text().trim();
      if (/chapter\s*[\d.]+/i.test(text)) chapters++;
    });

    // Fallback: count from chapter link text
    if (chapters === 0) {
      $('.main.version-chap a, .chapter-item a').each((_, el) => {
        const text = $(el).text().trim();
        if (/chapter/i.test(text)) chapters++;
      });
    }

    // Final fallback: look for total in text
    if (chapters === 0) {
      const bodyText = $('body').text();
      const match = bodyText.match(/(\d+)\s*chapters?/i);
      if (match) chapters = parseInt(match[1], 10);
    }

    const novel = {
      title,
      slug,
      author,
      rating,
      status,
      type,
      alternative,
      release,
      synopsis,
      cover,
      genres,
      chapters,
    };

    return NextResponse.json(novel, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=7200',
      },
    });
  } catch (e: any) {
    return NextResponse.json(null, { status: 500 });
  }
}
