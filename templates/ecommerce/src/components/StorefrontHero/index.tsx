import type { Product } from '@/payload-types'

import { Price } from '@/components/Price'
import { rugCutouts } from '@/components/rugCutouts'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

const featuredSlug = 'straw-hat-portrait'

const rugShadow = { filter: 'drop-shadow(0 28px 22px rgb(21 55 13 / 16%))' }

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
    <section aria-labelledby="storefront-hero-heading" className="text-[#15370D]">
      <div className="container grid items-end gap-8 py-10 md:py-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-8 lg:py-20">
        <div className="max-w-xl">
          <h1
            className="font-display text-[3.5rem] leading-[0.86] font-medium tracking-[-0.04em] text-[#15370D] md:text-7xl lg:text-[6.25rem]"
            id="storefront-hero-heading"
          >
            <span className="block">Hand-tufted</span>
            <span className="block">rugs</span>
          </h1>
          <p className="mt-6 max-w-[22rem] text-lg leading-relaxed font-normal text-[#15370D]">
            Wool and cotton, tufted in small runs.
          </p>
          <Link
            className="mt-8 inline-flex min-h-12 items-center text-lg font-medium text-[#15370D] underline decoration-[#15370D] decoration-2 underline-offset-8"
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
          <span className="mt-5 flex items-baseline justify-between gap-4">
            <span className="font-display text-2xl font-medium text-[#15370D]">{title}</span>
            {typeof price === 'number' ? (
              <Price amount={price} as="span" className="text-lg font-medium text-[#15370D]" />
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
