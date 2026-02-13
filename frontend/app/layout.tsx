import './globals.css'

import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata} from 'next'
import {Inter, IBM_Plex_Mono} from 'next/font/google'
import {draftMode} from 'next/headers'
import {VisualEditing} from 'next-sanity/visual-editing'
import {Toaster} from 'sonner'

import DraftModeToast from '@/app/components/DraftModeToast'
import Footer from '@/app/components/Footer/Footer'
import Header from '@/app/components/NavBar/Header'
import * as demo from '@/sanity/lib/demo'
import {sanityFetch, SanityLive} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {handleError} from '@/app/client-utils'

/**
 * Generate metadata for the site (global defaults).
 */
export async function generateMetadata(): Promise<Metadata> {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    stega: false,
  })

  // New settings shape
  const siteTitle = settings?.siteTitle || demo.title
  const defaultSeoTitle = settings?.defaultSeo?.title || siteTitle
  const defaultSeoDescription = settings?.defaultSeo?.description || ''

  const ogImage = resolveOpenGraphImage(settings?.ogImage)

  let metadataBase: URL | undefined
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined
  } catch {
    metadataBase = undefined
  }

  return {
    metadataBase,
    title: {
      template: `%s | ${siteTitle}`,
      default: defaultSeoTitle,
    },
    description: defaultSeoDescription,
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {isEnabled: isDraftMode} = await draftMode()

  // ✅ Fetch settings once server-side for nav/footer
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    // If you want nav/footer to reflect drafts while in draft mode:
    perspective: isDraftMode ? 'previewDrafts' : 'published',
    stega: false,
  })

  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable} bg-white text-black`}>
      <body>
        <section className="min-h-screen pt-24">
          <Toaster />

          {isDraftMode && (
            <>
              <DraftModeToast />
              <VisualEditing />
            </>
          )}

          <SanityLive onError={handleError} />

          {/* ✅ Pass nav/footer data down */}
          <Header nav={settings?.nav} siteTitle={settings?.siteTitle} />
          <main>{children}</main>
          <Footer footer={settings?.footer} />
        </section>
        <SpeedInsights />
      </body>
    </html>
  )
}
