import { API_ROUTES, BASE_URL, IMAGE_URL } from "@/routes/api_routes";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const res = await fetch(BASE_URL + API_ROUTES.GIFT_DETAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        giftid: id,
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const gift = data?.data?.giftdetail;
      if (gift) {
        const imageUrl = gift.giftimage
          ? gift.giftimage.startsWith("http") ||
            gift.giftimage.startsWith("data:")
            ? gift.giftimage
            : `${IMAGE_URL}${gift.giftimage}`
          : "/placeholder.png";

        return {
          title: `${gift.giftname} | Tradizions`,
          description: `${gift.description}`,
          openGraph: {
            title: `${gift.giftname} | Tradizions`,
            description: `${gift.description}`,
            images: [
              {
                url: imageUrl,
                height: 600,
                width: 800,
                alt: gift.giftname,
              },
            ],
          },
          twitter: {
            card: "summary_large_image",
            title: `${gift.giftname} | Tradizions`,
            description: `${gift.description}`,
            images: [imageUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error("Error fetching gift metadata:", error);
  }
  return {
    title: "Gift Detail | Tradizions",
    description:
      "Discover the richness of ancient Indian millets, wholesome malts, premium dry fruits, and artisanal gift hampers. Rooted in tradition, crafted for wellness.",
  };
}

export default function GiftDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
