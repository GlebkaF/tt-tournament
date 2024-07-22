import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/post/random-pairs-2024",
      },
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: "/standings/",
      },
      {
        userAgent: "*",
        disallow: "/matches/",
      },
      {
        userAgent: "*",
        disallow: "/players/",
      },
    ],
    sitemap: "https://ebtt.ru/sitemap.xml",
  };
}
