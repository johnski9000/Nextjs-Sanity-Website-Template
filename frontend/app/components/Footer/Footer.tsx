import Link from 'next/link'
import type {ReactNode} from 'react'

type SanityRef = {
  slug?: {current?: string} | string
}

type SanityLink = {
  linkType: 'href' | 'page' | 'post'
  href?: string
  page?: SanityRef
  post?: SanityRef
  openInNewTab?: boolean
}

type FooterLink = {
  label: string
  link: SanityLink
}

type FooterColumn = {
  title: string
  links: FooterLink[]
}

type SocialLink = {
  platform: string
  url: string
}

type LegalLink = {
  label: string
  link: SanityLink
}

type FooterData = {
  columns?: FooterColumn[]
  social?: SocialLink[]
  legal?: LegalLink[]
  copyright?: string
}

function getSlugValue(slug: any): string | undefined {
  if (!slug) return undefined
  if (typeof slug === 'string') return slug
  return slug.current
}

function resolveLink(link?: SanityLink): {
  href: string
  external: boolean
  target?: string
  rel?: string
} {
  if (!link) return {href: '#', external: false}

  const openInNewTab = Boolean(link.openInNewTab)

  if (link.linkType === 'href' && link.href) {
    return {
      href: link.href,
      external: true,
      target: openInNewTab ? '_blank' : undefined,
      rel: openInNewTab ? 'noopener noreferrer' : undefined,
    }
  }

  if (link.linkType === 'page' && link.page) {
    const slug = getSlugValue(link.page.slug)
    const href = slug === 'homepage' ? '/' : `/${slug ?? ''}`
    return {href, external: false}
  }

  if (link.linkType === 'post' && link.post) {
    const slug = getSlugValue(link.post.slug)
    return {href: `/posts/${slug ?? ''}`, external: false}
  }

  return {href: '#', external: false}
}

function SmartLink({
  link,
  className,
  children,
}: {
  link?: SanityLink
  className?: string
  children: ReactNode
}) {
  const {href, external, target, rel} = resolveLink(link)

  if (external) {
    return (
      <a href={href} className={className} target={target} rel={rel}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export default function Footer({footer}: {footer?: FooterData}) {
  const columns = footer?.columns ?? []
  const social = footer?.social ?? []
  const legal = footer?.legal ?? []
  const copyright =
    footer?.copyright || `© ${new Date().getFullYear()} JW Digital. All rights reserved.`

  return (
    <footer className="bg-gray-50 relative border-t border-gray-100">
      <div className="absolute inset-0 bg-[url(/images/tile-grid-black.png)] bg-size-[17px] opacity-10 bg-position-[0_1]" />
      <div className="container relative py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left: brand/summary */}
          <div className="lg:col-span-4">
            <h3 className="text-2xl font-mono tracking-tighter">JW Digital</h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-sm">
              Modern websites, web apps, and SEO-ready builds — powered by a reusable component
              system.
            </p>

            {social.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {social.map((s, i) => (
                  <a
                    key={`${s.platform}-${i}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono hover:underline"
                  >
                    {s.platform}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right: columns */}
          <div className="lg:col-span-8">
            {columns.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {columns.map((col, i) => (
                  <div key={`${col.title}-${i}`}>
                    <h4 className="text-sm font-semibold text-gray-900">{col.title}</h4>
                    <ul className="mt-4 space-y-2">
                      {(col.links ?? []).map((l, j) => (
                        <li key={`${l.label}-${j}`}>
                          <SmartLink
                            link={l.link}
                            className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition"
                          >
                            {l.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Add footer columns in <span className="font-mono">Settings → Footer</span>.
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-600">{copyright}</p>

          {legal.length > 0 ? (
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {legal.map((l, i) => (
                <SmartLink
                  key={`${l.label}-${i}`}
                  link={l.link}
                  className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
                >
                  {l.label}
                </SmartLink>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
