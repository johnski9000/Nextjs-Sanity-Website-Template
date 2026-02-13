import Link from 'next/link'
import type {ReactNode} from 'react'

type SanityRef = {
  _type?: string
  slug?: {current?: string} | string
}

type SanityLink = {
  linkType: 'href' | 'page' | 'post'
  href?: string
  page?: SanityRef
  post?: SanityRef
  openInNewTab?: boolean
}

type NavChild = {
  label: string
  description?: string
  link: SanityLink
}

type NavItem = {
  label: string
  kind: 'link' | 'dropdown'
  link?: SanityLink
  children?: NavChild[]
}

type NavCta = {
  label: string
  link: SanityLink
  variant?: 'primary' | 'secondary'
}

type NavData = {
  items?: NavItem[]
  cta?: NavCta
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
    // homepage doc should map to root
    const href = slug === 'homepage' ? '/' : `/${slug ?? ''}`
    return {href, external: false}
  }

  if (link.linkType === 'post' && link.post) {
    const slug = getSlugValue(link.post.slug)
    return {href: `/posts/${slug ?? ''}`, external: false}
  }

  return {href: '#', external: false}
}

function NavLink({
  link,
  className,
  children,
}: {
  link?: SanityLink
  className?: string
  children: ReactNode
}) {
  const {href, external, target, rel} = resolveLink(link)

  // External
  if (external) {
    return (
      <a href={href} className={className} target={target} rel={rel}>
        {children}
      </a>
    )
  }

  // Internal
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

/**
 * Clean SSR header using settings.nav
 * Usage: <Header nav={settings?.nav} siteTitle={settings?.siteTitle} />
 */
export default function Header({
  nav,
  siteTitle = 'JW Digital',
}: {
  nav?: NavData
  siteTitle?: string
}) {
  const items = nav?.items ?? []
  const cta = nav?.cta

  return (
    <header className="fixed z-50 h-24 inset-x-0 top-0 bg-white/80 flex items-center backdrop-blur-lg border-b border-gray-100">
      <div className="container px-2 sm:px-6">
        <div className="flex items-center justify-between gap-5">
          <Link className="flex items-center gap-2" href="/">
            <span className="text-lg sm:text-2xl pl-2 font-semibold">{siteTitle}</span>
          </Link>

          <nav aria-label="Primary">
            <ul className="flex items-center gap-3 sm:gap-5 text-xs sm:text-base tracking-tight font-mono">
              {items.map((item, idx) => {
                if (item.kind === 'dropdown') {
                  const children = item.children ?? []
                  if (children.length === 0) return null

                  return (
                    <li key={`${item.label}-${idx}`} className="relative group">
                      <button
                        type="button"
                        className="hover:underline inline-flex items-center gap-2"
                        aria-haspopup="menu"
                      >
                        <span>{item.label}</span>
                        <svg
                          className="h-4 w-4 opacity-70 group-hover:opacity-100 transition"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Dropdown */}
                      <div className="absolute right-0 mt-3 w-[320px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                          <div className="p-2">
                            {children.map((child, cIdx) => (
                              <NavLink
                                key={`${child.label}-${cIdx}`}
                                link={child.link}
                                className="block rounded-xl p-3 hover:bg-gray-50 transition"
                              >
                                <div className="text-sm font-semibold text-gray-900">
                                  {child.label}
                                </div>
                                {child.description ? (
                                  <div className="mt-1 text-xs text-gray-600 leading-relaxed">
                                    {child.description}
                                  </div>
                                ) : null}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                }

                // Regular link
                return (
                  <li key={`${item.label}-${idx}`}>
                    <NavLink link={item.link} className="hover:underline">
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}

              {/* CTA */}
              {cta?.label ? (
                <li className="sm:before:w-[1px] sm:before:bg-gray-200 before:block flex sm:gap-4 md:gap-6">
                  <NavLink
                    link={cta.link}
                    className={[
                      'rounded-full inline-flex items-center justify-center transition-colors duration-200 px-4 py-2 sm:px-6 sm:py-3',
                      cta.variant === 'secondary'
                        ? 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                        : 'bg-black text-white hover:bg-gray-900',
                    ].join(' ')}
                  >
                    <span className="whitespace-nowrap">{cta.label}</span>
                  </NavLink>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
