import { FeaturedCarousel } from '@/components/FeaturedRugs/Carousel'
import { featuredSlugs } from '@/components/rugSales'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

export async function FeaturedRugs() {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    depth: 1,
    draft: false,
    limit: 12,
    overrideAccess: false,
    where: {
      and: [{ _status: { equals: 'published' } }, { slug: { in: featuredSlugs } }],
    },
  })

  const featured = featuredSlugs
    .map((slug) => products.docs.find((product) => product.slug === slug))
    .filter((product) => product != null)

  if (!featured.length) return null

  return (
    <section aria-labelledby="featured-rugs-heading" className="pb-16 text-[#15370D]">
      <div className="container">
        <div className="flex items-end justify-between gap-4 border-t border-[#728E6D] pt-8">
          <div>
            <h2
              className="font-display text-4xl leading-none font-medium md:text-5xl"
              id="featured-rugs-heading"
            >
              Featured
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed">
              Three rugs on sale this month.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center text-base font-medium text-[#15370D] underline decoration-[#15370D] underline-offset-4"
            href="/shop"
          >
            Shop all
          </Link>
        </div>
        <FeaturedCarousel products={featured} />
      </div>
    </section>
  )
}
