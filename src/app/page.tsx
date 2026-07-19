'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [latestNovels, setLatestNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchNovels = () => {
    if (fetched) return;
    setLoading(true);
    fetch('/api/novels/latest?limit=12')
      .then(r => r.json())
      .then(data => {
        setLatestNovels(data || []);
        setFetched(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-indigo-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            NovelKu
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Baca novel bahasa Indonesia gratis. Light Novel & Web Novel China, Korea, Jepang terlengkap.
          </p>
          <Link
            href="/novel"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
          >
            Jelajahi Novel →
          </Link>
        </div>
      </section>

      {/* Novel Terbaru — only fetch when user interacts */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Novel Terbaru
          </h2>
          <button
            onClick={fetchNovels}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Tampilkan →
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700" />
                <div className="p-2 space-y-1.5">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-2 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!fetched && !loading && (
          <p className="text-center py-12 text-sm text-gray-400 dark:text-gray-500">
            Klik "Tampilkan →" untuk memuat novel terbaru.
          </p>
        )}

        {latestNovels.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latestNovels.map((n) => (
              <Link key={n.slug} href={`/novel/${n.slug}`} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                  {n.cover ? (
                    <Image src={n.cover} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="16vw" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                    </div>
                  )}
                  {n.rating && parseFloat(n.rating) > 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-yellow-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">★ {n.rating}</div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="font-semibold text-[11px] sm:text-xs text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 transition leading-tight">
                    {n.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
