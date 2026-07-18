'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ChapterPage() {
  const params = useParams();
  const slug = params.slug as string;
  const chapterSlug = (params.chapterSlug as string[]) || [];
  
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chMatch = chapterSlug.join('/').match(/chapter-(\d+)/i);
  const chNum = chMatch ? parseInt(chMatch[1], 10) : 0;
  const label = chapterSlug[0] || 'mtl';

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/novels/chapter?slug=${encodeURIComponent(slug)}&chapter=chapter-${chNum}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content || '');
          setTitle(data.title || `Chapter ${chNum}`);
        } else {
          setError('Gagal memuat chapter.');
        }
      } catch (e: any) {
        setError(e.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [slug, chNum]);

  const prevLink = chNum > 1 ? `/novel/${slug}/${label}/chapter-${chNum - 1}` : null;
  const nextLink = `/novel/${slug}/${label}/chapter-${chNum + 1}`;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        <Link href="/" className="hover:text-indigo-600">Beranda</Link>
        {' / '}
        <Link href={`/novel/${slug}`} className="hover:text-indigo-600">{slug.replace(/-/g, ' ')}</Link>
      </nav>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center">
        {title || `Chapter ${chNum}`}
      </h1>
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-4">
        {label.toUpperCase()} - Chapter {chNum}
      </p>

      {/* Navigation Top */}
      <div className="flex items-center justify-between mb-6">
        {prevLink ? (
          <Link href={prevLink} className="px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition">
            ← Prev
          </Link>
        ) : (
          <span className="px-4 py-2 text-sm text-gray-300 dark:text-gray-600">← Prev</span>
        )}
        <Link href={nextLink} className="px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition">
          Next →
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
          <div className="space-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && content && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {content}
          </div>
        </div>
      )}

      {/* Navigation Bottom */}
      <div className="flex items-center justify-between mt-6">
        {prevLink ? (
          <Link href={prevLink} className="px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 transition">
            ← Prev
          </Link>
        ) : (
          <span className="px-4 py-2 text-sm text-gray-300">← Prev</span>
        )}
        <Link href={nextLink} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">
          Next →
        </Link>
      </div>
    </div>
  );
}
