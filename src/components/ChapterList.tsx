"use client";

import Link from "next/link";
import { useState } from "react";

export default function ChapterList({
  slug,
  totalChapters,
  firstChapterSlug,
  chapterLabel,
}: {
  slug: string;
  totalChapters: number;
  firstChapterSlug: string;
  chapterLabel: string;
}) {
  const PER_PAGE = 50;
  const label = chapterLabel || "mtl";
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(totalChapters / PER_PAGE);

  if (totalChapters === 0) return null;

  const start = totalChapters - page * PER_PAGE;
  const end = Math.max(1, start - PER_PAGE + 1);
  
  // Generate chapter numbers for current page (newest first)
  const chapters: { num: number; slug: string; title: string }[] = [];
  for (let i = start; i >= end; i--) {
    chapters.push({
      num: i,
      slug: `${slug}/${label.toLowerCase()}/chapter-${i}`,
      title: `Chapter ${i}`,
    });
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Daftar Chapter ({totalChapters})
      </h2>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-30 hover:border-indigo-300"
          >
            ← Sebelumnya
          </button>
          <span className="text-xs text-gray-400">
            {start} - {end} dari {totalChapters}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-30 hover:border-indigo-300"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {chapters.map((ch) => (
          <Link
            key={ch.num}
            href={`/novel/${ch.slug}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs text-gray-400 dark:text-gray-500 w-8 flex-shrink-0">
                {ch.num}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {ch.title}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                label.toLowerCase() === "htl"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
              }`}>
                {label}
              </span>
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
