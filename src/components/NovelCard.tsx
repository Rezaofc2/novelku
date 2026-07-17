import Link from "next/link";
import Image from "next/image";

export default function NovelCard({ novel }: { novel: any }) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 dark:border-gray-700">
      <Link href={`/novel/${novel.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
          {novel.cover ? (
            <Image src={novel.cover} alt={novel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 45vw, 200px" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 flex gap-1">
            {novel.rating && parseFloat(novel.rating) > 0 && (
              <span className="bg-yellow-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {novel.rating}
              </span>
            )}
            {novel.type && (
              <span className="bg-indigo-500/90 text-white text-[9px] font-medium px-1 py-0.5 rounded">
                {novel.type.replace("Web Novel","WN").replace("Light Novel","LN")}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="p-2">
        <Link href={`/novel/${novel.slug}`}>
          <h3 className="font-semibold text-[11px] sm:text-xs text-gray-900 dark:text-white line-clamp-2 hover:text-indigo-600 transition-colors mb-1 min-h-[2rem] leading-tight">
            {novel.title}
          </h3>
        </Link>
        {novel.latestChapters?.length > 0 && (
          <div className="space-y-0.5 border-t border-gray-100 dark:border-gray-700 pt-1.5">
            {novel.latestChapters.slice(0, 2).map((ch: any, i: number) => (
              <Link key={i} href={`/novel/${ch.slug}`} className="block text-[10px] text-gray-400 hover:text-indigo-500 truncate transition-colors">
                {ch.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
