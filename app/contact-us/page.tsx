import { Metadata } from "next";
import ContactUsPageClient from "./contactusClient";

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch",
  description: "Have questions about our traditional wellness products, orders, or corporate gifting? Contact the Tradizions team today for prompt assistance.",
  keywords: "contact tradizions, customer support, traditional products support, wellness products contact",
  openGraph: {
    title: "Contact Us",
    description: "Reach out to us for any queries about our natural and traditional wellness products.",
    url: "https://tradizions.vercel.app/contact-us",
    siteName: "Tradizions",
    type: "website",
  },
  alternates: {
    canonical: "https://tradizions.vercel.app/contact-us",
  },
};

export default function ContactUsPage() {
  return <ContactUsPageClient />;
}
