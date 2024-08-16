import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/post/random-pairs-2024",
          "/post/summer-finals-announcement-2024",
        ],
        disallow: [
          "/standings/",
          "/matches/",
          "/players/",
          "/test/",
          "/schedule/",
          "/tournament/",
        ],
      },
    ],
    sitemap: "https://ebtt.ru/sitemap.xml",
  };
}
