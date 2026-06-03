import { API_ROUTES, BASE_URL, IMAGE_URL } from "@/routes/api_routes";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const res = await fetch(BASE_URL + API_ROUTES.PRODUCT_DETAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productid: Number(id) }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const product = data?.data?.productdetail;

      if (product) {
        const imageUrl = product.productimage
          ? product.productimage.startsWith("http") ||
            product.productimage.startsWith("data:")
            ? product.productimage
            : `${IMAGE_URL}${product.productimage}`
          : "/placeholder.png";

        return {
          title: `${product.productname}`,
          description: product.description,
          openGraph: {
            title: `${product.productname}`,
            description: product.description,
            images: [
              {
                url: imageUrl,
                width: 800,
                height: 600,
                alt: product.productname,
              },
            ],
          },
          twitter: {
            card: "summary_large_image",
            title: `${product.productname}`,
            description: product.description,
            images: [imageUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error("Error fetching product metadata:", error);
  }

  return {
    title: "Product Detail | Tradizions",
    description: "Buy premium organic products from Tradizions.",
  };
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
