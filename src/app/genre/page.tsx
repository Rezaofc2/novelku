'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ICONS: Record<string, string> = {
  Action: '⚔️', Adventure: '🗺️', Comedy: '😂', Cooking: '🍳', Drama: '🎭',
  Ecchi: '💋', Fantasy: '🧙', 'Gender Bender': '🔄', Harem: '💕', Historical: '🏰',
  Horror: '👻', Isekai: '🌌', Josei: '👩', Magic: '✨', 'Martial Arts': '🥋',
  Mature: '🔞', Mecha: '🤖', Musik: '🎵', Mystery: '🔍', 'One shot': '📸',
  Psychological: '🧠', 'Reverse Harem': '👑', Romance: '💝', 'School Life': '🏫',
  'Sci-fi': '🚀', Seinen: '👨', Shoujo: '👧', 'Shoujo Ai': '🌸', Shounen: '👦',
  'Slice of Life': '🍃', Smut: '🔥', Sports: '⚽', Supernatural: '🌙',
  Tragedy: '😢', 'Virtual Reality': '🎮', Wuxia: '🗡️', Xianxia: '⚡',
  Xuanhuan: '🐉', Yuri: '🌹',
};

export default function GenreListPage() {
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/novels/genres')
      .then(r => r.json())
      .then(setGenres)
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6">
      <Link href="/" className="text-xs text-gray-400 hover:text-indigo-600">← Beranda</Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-6">Genre Novel</h1>

      {genres.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {genres.map(g => (
          <Link
            key={g}
            href={`/novel/genre/${g.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-300 hover:shadow-sm transition group"
          >
            <span className="text-xl">{ICONS[g] || '📚'}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600">{g}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
