'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const PER_PAGE = 12;

export default function NovelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/novels/detail?slug=${encodeURIComponent(slug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setNovel(data);
        else setError('Gagal memuat detail novel.');
        setLoading(false);
      })
      .catch(() => { setError('Gagal memuat data'); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-48 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">{error || 'Novel tidak ditemukan'}</p>
        <Link href="/" className="text-indigo-600 mt-4 inline-block">← Kembali</Link>
      </div>
    );
  }

  const totalChapters = novel.chapters || 0;
  const startCh = page * PER_PAGE + 1;
  const endCh = Math.min(totalChapters, startCh + PER_PAGE - 1);
  const totalPages = Math.ceil(totalChapters / PER_PAGE);

  // Build chapter URL without /mtl prefix, like animecat
  const chUrl = (num: number) => `/novel/${slug}/chapter-${num}`;
  const novelTitleFormatted = slug.replace(/-/g, ' ');

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        <Link href="/" className="hover:text-indigo-600">Beranda</Link>
        {' / '}
        <span className="text-gray-600 dark:text-gray-400">{novel.title || novelTitleFormatted}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="relative w-full sm:w-48 h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          {novel.cover ? (
            <Image src={novel.cover} alt={novel.title || ''} fill className="object-cover" unoptimized sizes="200px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{novel.title}</h1>
          {novel.rating && <p className="text-yellow-500 text-sm mb-2">★ {novel.rating}</p>}
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
            {novel.author && <p>Author: {novel.author}</p>}
            {novel.type && <p>Type: {novel.type}</p>}
            {novel.status && <p>Status: {novel.status}</p>}
            {novel.release && <p>Release: {novel.release}</p>}
            <p>Chapters: {totalChapters}</p>
          </div>
          {novel.alternative && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Alternative: {novel.alternative}</p>
          )}
          {novel.genres && novel.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {novel.genres.map((g: string) => (
                <Link key={g} href={`/novel/genre/${g.toLowerCase().replace(/\s+/g, '-')}`} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
                  {g}
                </Link>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            {totalChapters > 0 && (
              <>
                <Link href={chUrl(1)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700">Baca Pertama</Link>
                <Link href={chUrl(totalChapters)} className="px-3 py-1.5 border border-indigo-600 text-indigo-600 text-xs rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20">Baca Terbaru</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Synopsis */}
      {novel.synopsis && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sinopsis</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{novel.synopsis}</p>
        </div>
      )}

      {/* Chapter List — load 1 page at a time, no scroll optimization */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Daftar Chapter ({totalChapters})
        </h2>
        {totalChapters > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {Array.from({ length: endCh - startCh + 1 }, (_, i) => {
                const num = startCh + i;
                return (
                  <Link key={num} href={chUrl(num)} className="flex items-center justify-between py-2.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition group">
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600">
                      Chapter {num}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1.5">MTL</span>
                    </span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setPage(page - 1)} disabled={page === 0}
                  className="px-3 py-1.5 text-xs font-medium border rounded-lg disabled:opacity-30 border-gray-200 dark:border-gray-600 hover:border-indigo-300">
                  ← Sebelumnya
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {startCh} - {endCh} dari {totalChapters}
                </span>
                <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-xs font-medium border rounded-lg disabled:opacity-30 border-gray-200 dark:border-gray-600 hover:border-indigo-300">
                  Selanjutnya →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
