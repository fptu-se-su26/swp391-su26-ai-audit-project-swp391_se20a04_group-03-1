import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://datnotes.click";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Chặn các bot index các trang nhạy cảm hoặc rác
      disallow: [
        "/admin/trash/*", 
        "/admin/*/trash",
        "/.next/", 
        "/api/"
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
