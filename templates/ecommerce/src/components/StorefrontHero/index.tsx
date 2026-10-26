import type { Product } from '@/payload-types'

import { Price } from '@/components/Price'
import { rugCutouts } from '@/components/rugCutouts'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

const featuredSlug = 'straw-hat-portrait'

const rugShadow = { filter: 'drop-shadow(0 28px 24px rgb(9 35 40 / 14%))' }

export async function StorefrontHero() {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    depth: 0,
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ _status: { equals: 'published' } }, { slug: { equals: featuredSlug } }],
    },
  })

  const featured = products.docs[0]
  const href = featured ? `/products/${featured.slug}` : '/shop'
  const title = featured?.title || 'Straw Hat Portrait'
  const price = priceFromProduct(featured)
  const cutout = rugCutouts[featuredSlug]

  return (
    <section aria-labelledby="storefront-hero-heading" className="bg-[#e5f0e6] text-[#092328]">
      <div className="container grid items-center gap-8 py-8 md:py-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-6 lg:py-14">
        <div className="max-w-xl">
          <h1
            className="max-w-[11ch] text-[3.25rem] leading-[0.9] font-medium tracking-[-0.045em] text-[#092328] md:text-7xl lg:text-[5.4rem]"
            id="storefront-hero-heading"
          >
            Hand-tufted rugs
          </h1>
          <p className="mt-5 max-w-[24rem] text-base leading-relaxed text-[#12544F] md:text-lg">
            Wool and cotton, tufted in small runs.
          </p>
          <Link
            className="mt-6 inline-flex min-h-12 items-center text-base text-[#092328] underline decoration-[#12544F] decoration-2 underline-offset-8 hover:decoration-[#092328]"
            href="/shop"
          >
            Shop the collection
          </Link>
        </div>
        <Link className="group block" href={href}>
          <img
            alt=""
            className="ms-auto h-auto w-full max-w-3xl motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:-translate-y-1"
            height={cutout.height}
            src={cutout.src}
            style={rugShadow}
            width={cutout.width}
          />
          <span className="mt-4 flex items-baseline justify-between gap-4">
            <span className="text-lg text-[#092328]">{title}</span>
            {typeof price === 'number' ? (
              <Price amount={price} as="span" className="text-base text-[#12544F]" />
            ) : null}
          </span>
        </Link>
      </div>
    </section>
  )
}

function priceFromProduct(product: Product | undefined): number | undefined {
  if (!product) return undefined

  if (typeof product.priceInUSD === 'number') return product.priceInUSD

  const variant = product.variants?.docs?.[0]

  if (variant && typeof variant === 'object' && typeof variant.priceInUSD === 'number') {
    return variant.priceInUSD
  }

  return undefined
}
