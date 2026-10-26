import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { LogoIcon } from '@/components/icons/logo'

const { COMPANY_NAME, SITE_NAME } = process.env

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()
  const menu = footer.navItems || []
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')
  const skeleton = 'w-full h-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700'

  const configuredName = COMPANY_NAME || SITE_NAME || ''
  const copyrightName =
    configuredName === 'Payload Inc.' || configuredName === 'Payload Commerce'
      ? 'Wtuft'
      : configuredName

  return (
    <footer className="relative z-10 bg-background text-sm text-foreground">
      <div className="container">
        <div className="flex w-full flex-col gap-6 border-t border-[#728E6D] py-12 text-base md:flex-row md:gap-12">
          <div>
            <Link className="flex items-center gap-3 text-[#15370D] md:pt-1" href="/">
              <LogoIcon className="w-8" />
              <span className="font-display text-2xl font-medium tracking-[-0.03em]">Wtuft</span>
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="flex h-[188px] w-[200px] flex-col gap-2">
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
              </div>
            }
          >
            <FooterMenu menu={menu} />
          </Suspense>
          <div className="md:ml-auto flex flex-col gap-4 items-end">
            <ThemeSelector />
          </div>
        </div>
      </div>
      <div className="border-t border-[#728E6D] py-6 text-sm font-medium">
        <div className="container mx-auto flex w-full flex-col items-center gap-1 md:flex-row md:gap-0">
          <p>
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''} All rights reserved.
          </p>
          <hr className="mx-4 hidden h-4 w-px border-l border-[#728E6D] md:inline-block" />
          <p>Hand-tufted rugs</p>
          <p className="md:ml-auto">Pieces made to order</p>
        </div>
      </div>
    </footer>
  )
}
