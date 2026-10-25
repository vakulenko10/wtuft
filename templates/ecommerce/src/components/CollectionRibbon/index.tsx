import type { Media } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { CollectionRibbonClient, type RibbonItem } from './Ribbon.client'

export async function CollectionRibbon() {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    depth: 1,
    draft: false,
    limit: 8,
    overrideAccess: false,
    sort: 'title',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const items: RibbonItem[] = products.docs.flatMap((product) => {
    const galleryImage = product.gallery?.[0]?.image
    const image = galleryImage && typeof galleryImage !== 'string' ? (galleryImage as Media) : null

    if (!product.slug || !product.title) return []

    return [
      {
        id: product.id,
        image,
        priceInUSD: product.priceInUSD,
        slug: product.slug,
        title: product.title,
      },
    ]
  })

  if (!items.length) return null

  return <CollectionRibbonClient products={items} />
}
