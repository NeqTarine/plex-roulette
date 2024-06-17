import { Poppins} from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: "800"
})

const poppins500 = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins500',
  weight: "500"
})


export const metadata = {
  title: "Plex roulette: Random Movies & TV Shows",
  description: "Let random selection pick your next movie, TV show, or anime. Explore a vast library and dive into new adventures with every play. Compatible with all Plex platforms, discovering new favorites has never been easier!",
  alternates: {
    canonical: 'https://plex-roulette.com',
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
      },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={` ${poppins.variable} ${poppins500.variable}  font-sans`} >
      <body>{children}</body>
    </html>
  );
}
