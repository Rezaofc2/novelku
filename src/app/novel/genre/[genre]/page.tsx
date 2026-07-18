'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';

function GenrePageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const genre = (params.genre as string || '').replace(/-/g, ' ');
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;

  const [novels, setNovels] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ genre, page: String(page), limit: '12' });
    fetch(`/api/novels/search?${qs.toString()}`)
      .then(r => r.json())
      .then(data => {
        setNovels(data.novels || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [genre, page]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      {/* Genre title */}
      <div className="mb-6">
        <Link href="/" className="text-xs text-gray-400 hover:text-indigo-600">← Beranda</Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-1 capitalize">{genre}</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">Novel dengan genre {genre}</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

      {/* Novel grid */}
      {!loading && novels.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {novels.map(n => (
            <Link key={n.slug} href={`/novel/${n.slug}`} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                {n.cover ? (
                  <Image src={n.cover} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="20vw" unoptimized />
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
                <h3 className="font-semibold text-[11px] sm:text-xs text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 transition leading-tight">{n.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && novels.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500">Tidak ada novel ditemukan untuk genre {genre}.</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link href={`/novel/genre/${params.genre}?page=${page - 1}`} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 transition">
              ← Sebelumnya
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            Hal {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/novel/genre/${params.genre}?page=${page + 1}`} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 transition">
              Selanjutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function GenrePage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>}>
      <GenrePageInner />
    </Suspense>
  );
}
