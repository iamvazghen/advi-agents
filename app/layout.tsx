import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { AgentProvider } from "@/lib/context/agent";
import { SettingsProvider } from "@/lib/context/settings";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chat App",
  description: "A modern chat application built with Next.js and Convex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
      <ThemeProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            suppressHydrationWarning
            className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased bg-background text-foreground`}
          >
            <AgentProvider>
              <SettingsProvider>
                {children}
                <Toaster />
              </SettingsProvider>
            </AgentProvider>
            </body>
          </html>
        </ThemeProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}