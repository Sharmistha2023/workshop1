import "./globals.css";

export const metadata = {
  title: "Top 3 Films Finder",
  description: "Find top 3 films of your favourite Bollywood actors",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
