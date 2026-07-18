import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';

const BASE = 'https://meionovels.com';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  const chapter = req.nextUrl.searchParams.get('chapter') || '';

  if (!slug || !chapter) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const url = `${BASE}/novel/${slug}/${chapter}/`;
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

    const title = $('.text-center h1, h1, .chapter-title').first().text().trim() || `Chapter ${chapter.replace('chapter-', '')}`;
    
    // Get content from reading-content
    const contentEl = $('.reading-content, .text-left, .entry-content, .chapter-content').first();
    let content = '';
    
    contentEl.find('p').each((_, p) => {
      const text = $(p).text().trim();
      if (text) content += text + '\n\n';
    });

    // Fallback: any paragraph
    if (!content) {
      $('p').each((_, p) => {
        const text = $(p).text().trim();
        if (text.length > 20) content += text + '\n\n';
      });
    }

    return NextResponse.json(
      { title, content: content.trim() },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=7200',
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(null, { status: 500 });
  }
}
