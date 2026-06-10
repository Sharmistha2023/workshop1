import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Films Finder",
  description: "Discover the top 3 films of your favourite Bollywood actors — powered by AI",
  openGraph: {
    title: "Films Finder",
    description: "Discover the top 3 films of your favourite Bollywood actors — powered by AI",
    type: "website",
    siteName: "Films Finder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Films Finder",
    description: "Discover the top 3 films of your favourite Bollywood actors — powered by AI",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
