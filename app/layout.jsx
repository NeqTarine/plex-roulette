import { Inter } from "next/font/google";
import "./globals.css";
import Head from 'next/head';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Plex roulette: Random Movies & TV Shows",
  description: "Let random selection pick your next movie, TV show, or anime. Explore a vast library and dive into new adventures with every play. Compatible with all Plex platforms, discovering new favorites has never been easier!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <Head>
        <link
          rel="canonical"
          href="https://plex-roulette.com/"
          key="canonical"
        />
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
