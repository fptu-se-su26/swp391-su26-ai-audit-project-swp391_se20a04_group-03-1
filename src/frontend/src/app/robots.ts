import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://datnotes.click";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Chặn bot index toàn bộ khu vực quản trị & cổng đăng nhập nội bộ.
      disallow: [
        "/admin",
        "/admin/",
        "/client",
        "/client/",
        "/.next/",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
