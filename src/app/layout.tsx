import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ProofPass",
  description: "Verified talent passport rebuilt from the ProofPass v2 blueprint.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

