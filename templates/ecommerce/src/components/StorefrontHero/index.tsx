import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

const notes = [
  { label: 'Studio', value: 'Made to order' },
  { label: 'Runs', value: 'Small, one by one' },
  { label: 'Materials', value: 'Wool and cotton' },
]

export async function StorefrontHero() {
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

  const featured =
    products.docs.find((product) => product.slug === 'straw-hat-portrait') ?? products.docs[0]
  const galleryImage = featured?.gallery?.[0]?.image
  const media = galleryImage && typeof galleryImage !== 'string' ? galleryImage : null

  return (
    <section
      aria-labelledby="storefront-hero-heading"
      className="relative overflow-hidden bg-[#092328] text-[#f4f6f2]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 100% 0%, #12544F 0%, transparent 58%), radial-gradient(ellipse 50% 45% at 0% 100%, #2A835F 0%, transparent 52%)',
        }}
      />
      <div className="relative container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:py-28">
        <div>
          <p className="text-xs font-medium tracking-[0.32em] text-[#8BBB92] uppercase">
            Wtuft atelier
          </p>
          <h1
            className="mt-5 max-w-xl text-5xl leading-[1.08] font-medium tracking-tight text-[#f4f6f2] md:text-6xl lg:text-7xl"
            id="storefront-hero-heading"
          >
            Rugs with a quiet warmth
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#e5f0e6] md:text-lg">
            Hand-tufted in small runs, for rooms that want to feel settled. The pile is cut so the
            drawing stays clear from across the floor.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f4f6f2] px-7 text-sm font-medium text-[#092328] hover:bg-[#e5f0e6]"
              href="/shop"
            >
              Shop the collection
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8BBB92] px-7 text-sm font-medium text-[#f4f6f2] hover:bg-[#12544F]"
              href={featured ? `/products/${featured.slug}` : '/shop'}
            >
              {featured ? `View ${featured.title}` : 'View a piece'}
            </Link>
          </div>
          <dl className="mt-14 grid max-w-lg grid-cols-1 gap-6 border-t border-[#2A835F] pt-8 sm:grid-cols-3">
            {notes.map((note) => (
              <div key={note.label}>
                <dt className="text-xs tracking-[0.18em] text-[#8BBB92] uppercase">{note.label}</dt>
                <dd className="mt-2 text-sm leading-snug text-[#f4f6f2]">{note.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {featured && media ? (
          <FeaturedPiece media={media} slug={featured.slug} title={featured.title} />
        ) : null}
      </div>
    </section>
  )
}

function FeaturedPiece({ media, slug, title }: { media: MediaType; slug: string; title: string }) {
  return (
    <Link className="group mx-auto block w-full max-w-md" href={`/products/${slug}`}>
      <div className="rounded-[1.75rem] border border-[#8BBB92] bg-[#f7faf7] p-3 shadow-[0_28px_70px_rgb(9_35_40_/_45%)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-[#092328]">
          <Media
            className="relative h-full w-full"
            fill
            imgClassName="object-contain p-6 motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-105"
            priority
            resource={media}
            size="(min-width: 64rem) 28rem, 90vw"
          />
        </div>
      </div>
      <p className="mt-4 flex items-baseline justify-between gap-4 text-sm">
        <span className="text-[#f4f6f2]">{title}</span>
        <span className="text-[#8BBB92]">Featured piece</span>
      </p>
    </Link>
  )
}
