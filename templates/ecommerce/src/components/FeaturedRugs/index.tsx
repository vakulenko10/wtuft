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
    <section className="container bg-background pt-8 pb-4">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs tracking-[0.28em] text-primary uppercase">In the studio</p>
          <h2 className="text-2xl text-foreground">Rugs ready to ship</h2>
        </div>
        <Link className="text-sm text-primary underline-offset-4 hover:underline" href="/shop">
          View the collection
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.docs.map((product) => (
          <li key={product.id}>
            <ProductGridItem product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
