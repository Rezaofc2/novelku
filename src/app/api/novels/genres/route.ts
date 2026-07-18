import { NextResponse } from 'next/server';

const GENRES = [
  "Action", "Adventure", "Comedy", "Cooking", "Drama",
  "Ecchi", "Fantasy", "Gender Bender", "Harem", "Historical",
  "Horror", "Isekai", "Josei", "Magic", "Martial Arts",
  "Mature", "Mecha", "Musik", "Mystery", "One shot",
  "Psychological", "Reverse Harem", "Romance", "School Life",
  "Sci-fi", "Seinen", "Shoujo", "Shoujo Ai", "Shounen",
  "Slice of Life", "Smut", "Sports", "Supernatural",
  "Tragedy", "Virtual Reality", "Wuxia", "Xianxia",
  "Xuanhuan", "Yuri"
];

export async function GET() {
  return NextResponse.json(GENRES, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
