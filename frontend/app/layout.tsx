import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Top 1% Backend Developer Roadmap",
  description: "The 52-Week Career Accelerator for World-Class Backend Engineers.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-text-primary antialiased selection:bg-primary-muted selection:text-primary">
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
