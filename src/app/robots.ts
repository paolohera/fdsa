import type { MetadataRoute } from "next";

const SITE_URL = "https://www.fdsa.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}