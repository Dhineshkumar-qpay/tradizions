import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "About Us - Tradizions",
  },
  description:
    "Learn about Tradizions, our heritage, our organic certifications, and our mission to deliver pure, traditional wellness products, millets, and gifts.",
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
