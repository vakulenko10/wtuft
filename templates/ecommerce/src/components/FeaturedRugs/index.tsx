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
    <section className="bg-[#e5f0e6] pb-20 text-[#092328]">
      <div className="container">
        <div className="mb-10 flex items-end justify-between gap-4 border-t border-[#8BBB92] pt-8">
          <h2 className="text-3xl font-medium tracking-tight">The collection</h2>
          <Link
            className="inline-flex min-h-11 items-center text-sm underline decoration-[#8BBB92] underline-offset-4 hover:decoration-[#12544F]"
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
