import type { Metadata } from "next";
import { META_THEME_COLORS, siteConfig } from "@/lib/config";
import { ActiveThemeProvider } from "@/components/active-theme";

import "@/styles/globals.css";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  description: siteConfig.description,
  keywords: ["Javascript", "HTML", "Aprende Javascript", "Aprende CSS", "Aprende Node.js"],
  authors: [
    {
      name: "Brad Moyetones",
      url: "https://www.instagram.com/its.bradn",
    },
  ],
  creator: "Brad Moyetones",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: process.env.NEXT_PUBLIC_APP_URL!,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/opengraph-image.png`],
    creator: "@BradMoyetones",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.jpg",
    apple: "/apple-touch-icon_parque.jpg",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
                if (localStorage.layout) {
                  document.documentElement.classList.add('layout-' + localStorage.layout)
                }

                const savedTheme = localStorage.getItem('activeTheme') || 'blue';
                document.documentElement.classList.add('theme-' + savedTheme);
                if (savedTheme.endsWith('-scaled')) {
                  document.documentElement.classList.add('theme-scaled');
                }
              } catch (_) {}
            `,
          }}
        />
        <meta name="theme-color" content={META_THEME_COLORS.light} />
      </head>
      <body
        className={cn(
          "text-foreground group/body overscroll-none antialiased theme-container",
          fontVariables
        )}
      >
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <ActiveThemeProvider>
              {children}
            </ActiveThemeProvider>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
