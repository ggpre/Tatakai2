import type { Metadata } from "next";
import "./globals.css";
import "../styles/tv.css";
import { ClientLayout } from "@/components/ClientLayout";
import TVLayout from "@/components/TVLayout";
import DeviceSelector from "@/components/DeviceSelector";

export const metadata: Metadata = {
  title: "Tatakai - Modern Anime Streaming",
  description: "Watch the latest anime episodes and discover new series with high-quality streaming. Your ultimate anime destination.",
  keywords: "anime, streaming, watch anime, latest episodes, anime series, manga",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans">
        <ClientLayout>
          <TVLayout>
            {children}
          </TVLayout>
          <DeviceSelector />
        </ClientLayout>
      </body>
    </html>
  );
}
