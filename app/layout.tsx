import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Browser Hero - Guitar Hero for the Web",
  description: "Play Guitar Hero style games with YouTube videos. Paste a YouTube URL and let the game generate notes automatically from the audio!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white font-mono">
        {children}
      </body>
    </html>
  );
}
