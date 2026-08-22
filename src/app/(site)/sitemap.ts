import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://www.fdsa.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("news_posts")
    .select("slug, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

   const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/programs`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/programs/baccalaureate`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/programs/two-year-technical`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/programs/senior-high-school`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/facilities`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/news`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/help-centre`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const newsRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/news/${post.slug}`,
    lastModified: post.created_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...newsRoutes];
}