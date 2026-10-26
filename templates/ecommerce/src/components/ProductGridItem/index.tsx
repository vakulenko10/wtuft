import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { rugCutouts } from '@/components/rugCutouts'
import { compareAtPriceInUSD } from '@/components/rugSales'
import Link from 'next/link'
import React from 'react'

type Props = {
  product: Partial<Product>
}

const rugShadow = { filter: 'drop-shadow(0 18px 14px rgb(21 55 13 / 16%))' }

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInUSD, slug, title } = product

  let price = priceInUSD

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInUSD &&
      typeof variant.priceInUSD === 'number'
    ) {
      price = variant.priceInUSD
    }
  }

  const galleryImage = gallery?.[0]?.image
  const image = galleryImage && typeof galleryImage !== 'string' ? galleryImage : undefined
  const cutout = slug ? rugCutouts[slug] : undefined
  const compareAt = slug ? compareAtPriceInUSD[slug] : undefined
  const isOnSale = typeof price === 'number' && typeof compareAt === 'number' && compareAt > price

  return (
    <Link className="group flex h-full flex-col" href={`/products/${product.slug}`}>
      <div className="flex aspect-[4/5] flex-col rounded-3xl bg-[#E5CD82] px-5 pt-5 pb-6">
        {isOnSale ? (
          <span className="inline-flex min-h-8 w-fit items-center rounded-full bg-[#15370D] px-3 text-sm font-medium text-[#FFF2B4]">
            Sale
          </span>
        ) : (
          <span aria-hidden="true" className="min-h-8" />
        )}
        <span className="flex min-h-0 flex-1 items-center justify-center">
          {cutout ? (
            <img
              alt=""
              className="h-auto max-h-full w-auto max-w-full object-contain motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:-translate-y-1.5"
              height={cutout.height}
              src={cutout.src}
              style={rugShadow}
              width={cutout.width}
            />
          ) : image ? (
            <Media
              className="relative h-full w-full"
              imgClassName="h-full w-full object-contain motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:-translate-y-1.5"
              resource={image}
            />
          ) : null}
        </span>
      </div>
      <span className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2 text-[#15370D]">
        <span className="font-display text-xl leading-tight font-medium">{title}</span>
        <span className="flex flex-wrap items-baseline gap-2">
          {isOnSale && typeof compareAt === 'number' ? (
            <s className="text-sm font-normal text-[#15370D]">
              <span className="sr-only">Was </span>
              <Price amount={compareAt} as="span" />
            </s>
          ) : null}
          {typeof price === 'number' ? (
            <>
              {isOnSale ? <span className="sr-only">Now </span> : null}
              <Price amount={price} as="span" className="text-sm font-medium text-[#15370D]" />
            </>
          ) : null}
        </span>
      </span>
    </Link>
  )
}
