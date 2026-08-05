import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight Dynamics School of Aeronautics, Inc.",
  description: "Flight Dynamics School of Aeronautics, Inc. - Mactan-Cebu International Airport Area",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
