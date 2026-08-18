import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { lireReglages } from '@/lib/settings'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

/* viewport-fit=cover : les encoches d'iPhone n'avalent plus la barre d'achat. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  const reglages = await lireReglages()
  return {
    title: {
      default: `${reglages.SITE_NOM} — ${reglages.SITE_SLOGAN}`,
      template: `%s · ${reglages.SITE_NOM}`,
    },
    description: reglages.SITE_SLOGAN,
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  )
}
