import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { RichText } from '@/components/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      links?: Page['hero']['links']
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, links, richText }) => {
  return (
    <div className="container mt-4">
      <div className="max-w-3xl bg-background">
        {children || (richText && <RichText data={richText} enableGutter={false} />)}
        {Array.isArray(links) && links.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
