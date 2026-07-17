import Link from "next/link";
import Image from "next/image";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const ALL_GENRES = [
  "Action","Adventure","Comedy","Cooking","Drama","Ecchi","Fantasy",
  "Gender Bender","Harem","Historical","Horror","Isekai","Josei","Magic",
  "Martial Arts","Mature","Mecha","Musik","Mystery","One shot","Psychological",
  "Reverse Harem","Romance","School Life","Sci-fi","Seinen","Shoujo",
  "Shoujo Ai","Shounen","Slice of Life","Smut","Sports","Supernatural",
  "Tragedy","Virtual Reality","Wuxia","Xianxia","Xuanhuan","Yuri",
];

const BASE = "https://meionovels.com";

function slugifyGenre(g: string) { return g.toLowerCase().replace(/ /g, "-"); }

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", Accept: "text/html" },
    next: { revalidate: 3600 },
  });
  return res.ok ? res.text() : null;
}
