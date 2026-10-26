import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { homeStaticData } from '@/endpoints/seed/home-static'
import { FeaturedRugs } from '@/components/FeaturedRugs'
import { FlowingRugs } from '@/components/RugScatter'
import { StorefrontHero } from '@/components/StorefrontHero'
import Link from 'next/link'
import React from 'react'

import type { Page } from '@/payload-types'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params }: Args) {
  const { slug = 'home' } = await params
  const url = '/' + slug

  let page = await queryPageBySlug({
    slug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStaticData() as Page
  }

  if (!page) {
    return notFound()
  }

  const { hero, layout } = page

  if (slug === 'home') {
    return (
      <article>
        <StorefrontHero />
        <FlowingRugs
          rugs={[
            {
              alignClass: 'ms-[2%] md:ms-[6%]',
              rotate: -8,
              src: '/rugs/wave.webp',
              widthClass: 'w-52 md:w-80',
            },
            {
              alignClass: 'me-[4%] self-end md:me-[12%]',
              rotate: 7,
              src: '/rugs/straw-hat.webp',
              widthClass: 'w-48 md:w-72',
            },
          ]}
        />
        <FeaturedRugs />
        <FlowingRugs
          rugs={[
            {
              alignClass: 'ms-auto me-[8%] md:me-[16%]',
              rotate: -6,
              src: '/rugs/botanical.webp',
              widthClass: 'w-48 md:w-72',
            },
          ]}
        />
        <section aria-labelledby="collection-heading" className="pb-20 text-[#15370D]">
          <div className="container border-t border-[#728E6D] pt-10">
            <h2
              className="font-display text-4xl leading-none font-medium md:text-5xl"
              id="collection-heading"
            >
              The full collection
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed">
              Every rug is in the shop, including the three on sale.
            </p>
            <Link
              className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#15370D] px-6 text-base font-medium text-[#FFF2B4]"
              href="/shop"
            >
              Browse the shop
            </Link>
          </div>
        </section>
      </article>
    )
  }

  return (
    <article className="pt-16 pb-24">
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({
    slug,
  })

  const meta = await generateMeta({ doc: page })

  if (slug === 'home') {
    const description =
      'Hand-tufted rugs made in small runs. Wool and cotton pieces for rooms that want to feel settled.'

    return {
      ...meta,
      description,
      openGraph: {
        ...meta.openGraph,
        description,
        title: 'Wtuft — Hand-tufted rugs',
      },
      title: 'Wtuft — Hand-tufted rugs',
    }
  }

  return meta
}

const queryPageBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
