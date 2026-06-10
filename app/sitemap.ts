import { API_ROUTES, BASE_URL } from "@/routes/api_routes";
import { MetadataRoute } from "next";

async function fetchProductUrls() {
  const response = await fetch(
    `${BASE_URL}${API_ROUTES.GETALLBUSINESSPRODUCTS}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const json = await response.json();
  const products = json?.data || [];

  return products.map(
    (product: { productid: number; bid: number; itemtype: string }) => ({
      url:
        product.itemtype === "product"
          ? `https://tradizions.vercel.app/product-detail/${product.productid}?productid=${product.productid}&bid=${product.bid}`
          : `https://tradizions.vercel.app/gift-detail/${product.productid}?productid=${product.productid}&bid=${product.bid}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tradizions.vercel.app";

  const productUrls = await fetchProductUrls();

  const baseSitemapEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gifts`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/corporate-orders`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  return [...baseSitemapEntries, ...productUrls];
}
