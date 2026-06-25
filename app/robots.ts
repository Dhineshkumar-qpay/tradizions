import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/my-account/",
        "/checkout/",
        "/cart/"
      ],
    },
    sitemap: "https://tradizions.vercel.app/sitemap.xml",
  };
}
