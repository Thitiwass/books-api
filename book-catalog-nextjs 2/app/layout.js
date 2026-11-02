import "./globals.css";

export const metadata = {
  title: "Bookspace | Book Catalog",
  description: "Manage your book collection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
