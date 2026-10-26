import type { Media, Product } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Gallery } from '@/components/product/Gallery'
import { ProductDescription } from '@/components/product/ProductDescription'
import { ProductGridItem } from '@/components/ProductGridItem'
import { rugCutouts } from '@/components/rugCutouts'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Metadata } from 'next'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({
        ...item,
        image: item.image as Media,
      })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
        if (typeof variant !== 'object') return false
        return variant.inventory && variant?.inventory > 0
      })
    : product.inventory! > 0

  let price = product.priceInUSD

  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (typeof variant === 'object' && variant?.priceInUSD && acc && variant?.priceInUSD > acc) {
        return variant.priceInUSD
      }
      return acc
    }, price)
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: price,
      priceCurrency: 'usd',
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []
  const cutout = rugCutouts[product.slug]

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="bg-[#e5f0e6] text-[#092328]">
        <div className="container pt-8 pb-16">
          <Link
            className="inline-flex min-h-11 items-center text-sm text-[#12544F] underline decoration-[#8BBB92] underline-offset-4 hover:decoration-[#12544F]"
            href="/shop"
          >
            All products
          </Link>
          <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
            <div className="w-full lg:w-[55%]">
              <Suspense fallback={<div className="relative aspect-square h-full w-full" />}>
                {Boolean(gallery?.length) && (
                  <Gallery
                    cutout={
                      cutout
                        ? {
                            alt: gallery[0]?.image.alt || product.title,
                            height: cutout.height,
                            src: cutout.src,
                            width: cutout.width,
                          }
                        : undefined
                    }
                    gallery={gallery}
                  />
                )}
              </Suspense>
            </div>

            <div className="w-full lg:w-[45%] lg:pt-8">
              <ProductDescription product={product} />
            </div>
          </div>

          {relatedProducts.length ? (
            <RelatedProducts products={relatedProducts as Product[]} />
          ) : null}
        </div>
      </div>

      {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : null}
    </React.Fragment>
  )
}

function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null

  return (
    <div className="mt-16 border-t border-[#8BBB92] pt-10">
      <h2 className="mb-8 text-2xl font-medium tracking-tight">More rugs</h2>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-3">
        {products.map((product) => (
          <li key={product.id}>
            <ProductGridItem product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
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
    populate: {
      variants: {
        title: true,
        priceInUSD: true,
        inventory: true,
        options: true,
      },
    },
  })

  return result.docs?.[0] || null
}
