import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteBrief AI — Project conversations into project memory",
  description:
    "SiteBrief AI turns fragmented architecture and construction project communication into structured, searchable, and traceable project memory.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
