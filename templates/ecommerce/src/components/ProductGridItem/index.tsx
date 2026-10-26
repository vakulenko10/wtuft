import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { rugCutouts } from '@/components/rugCutouts'
import Link from 'next/link'
import React from 'react'

type Props = {
  product: Partial<Product>
}

const rugShadow = { filter: 'drop-shadow(0 18px 16px rgb(9 35 40 / 12%))' }

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

  return (
    <Link className="group flex h-full flex-col" href={`/products/${product.slug}`}>
      <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-[#f7faf7] px-4 py-6 motion-safe:transition-colors motion-safe:duration-300 group-hover:bg-[#f4f6f2]">
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
      </div>
      <span className="mt-4 flex items-baseline justify-between gap-3 text-[#092328]">
        <span className="text-base font-medium">{title}</span>
        {typeof price === 'number' ? (
          <Price amount={price} as="span" className="text-sm text-[#12544F]" />
        ) : null}
      </span>
    </Link>
  )
}
