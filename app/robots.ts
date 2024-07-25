import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/post/random-pairs-2024"],
        disallow: ["/standings/", "/matches/", "/players/", "/test/"],
      },
    ],
    sitemap: "https://ebtt.ru/sitemap.xml",
  };
}
