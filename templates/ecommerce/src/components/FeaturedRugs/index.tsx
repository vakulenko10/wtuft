import { ProductGridItem } from '@/components/ProductGridItem'
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
    limit: 4,
    overrideAccess: false,
    sort: 'title',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  if (!products.docs.length) return null

  return (
    <section className="pb-20 text-[#15370D]">
      <div className="container">
        <div className="mb-10 flex items-end justify-between gap-4 border-t border-[#728E6D] pt-8">
          <h2 className="font-display text-4xl leading-none font-medium md:text-5xl">
            The collection
          </h2>
          <Link
            className="inline-flex min-h-11 items-center text-base font-medium text-[#15370D] underline decoration-[#15370D] underline-offset-4"
            href="/shop"
          >
            Shop all
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.docs.map((product) => (
            <li key={product.id}>
              <ProductGridItem product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
