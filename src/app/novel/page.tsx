'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

function NovelListInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initSearch = searchParams.get('s') || '';
  const initPage = parseInt(searchParams.get('page') || '1', 10) || 1;

  const [results, setResults] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initSearch);
  const [query, setQuery] = useState(initSearch);
  const [error, setError] = useState('');
  const [page, setPage] = useState(initPage);

  const doSearch = (q: string, p: number) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setQuery(q);
    setPage(p);
    const qs = new URLSearchParams({ s: q, page: String(p), limit: '12' });
    router.push(`/novel?${qs.toString()}`, { scroll: false });
    fetch(`/api/novels/search?${qs.toString()}`)
      .then(r => r.json())
      .then(data => {
        setResults(data.novels || []);
        setTotalPages(data.totalPages || 1);
        setSearched(true);
        setLoading(false);
      })
      .catch(() => { setError('Gagal memuat'); setLoading(false); });
  };

  // Auto-search if URL has query param
  if (initSearch && !searched) {
    setSearched(true);
    // Will trigger useEffect below
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const q = (form.elements.namedItem('s') as HTMLInputElement).value;
    doSearch(q, 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2 max-w-lg">
        <input
          name="s"
          defaultValue={query}
          placeholder="Cari novel..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">
          Cari
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

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

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map(n => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <button onClick={() => doSearch(query, page - 1)} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 transition">
              ← Sebelumnya
            </button>
          )}
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            Hal {page} dari {totalPages}
          </span>
          <button onClick={() => doSearch(query, page + 1)} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 transition">
            Selanjutnya →
          </button>
        </div>
      )}

      {/* No results / initial state */}
      {!loading && !searchParams.get('s') && results.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Cari novel favoritmu</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Ketik judul novel lalu tekan Cari.</p>
        </div>
      )}

      {/* Empty results after search */}
      {!loading && searchParams.get('s') && results.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500">Tidak ada novel ditemukan untuk "{searchParams.get('s')}".</p>
        </div>
      )}
    </div>
  );
}

export default function NovelListPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>}>
      <NovelListInner />
    </Suspense>
  );
}
