import type { Metadata, Viewport } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "सामाजिक संरचना सर्वेक्षण | उत्तर प्रदेश",
  description: "बूथ स्तरीय सामाजिक संरचना सर्वेक्षण प्रपत्र",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hi" className={`${devanagari.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
