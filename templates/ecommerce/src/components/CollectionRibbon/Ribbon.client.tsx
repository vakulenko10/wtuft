'use client'

import type { Media } from '@/payload-types'
import type { CarouselApi } from '@/components/ui/carousel'

import { Media as MediaView } from '@/components/Media'
import { Price } from '@/components/Price'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import AutoScroll from 'embla-carousel-auto-scroll'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

export type RibbonItem = {
  id: string
  image?: Media | null
  priceInUSD?: number | null
  slug: string
  title: string
}

const controlClassName =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-[#8BBB92] px-4 text-sm text-[#f4f6f2] hover:bg-[#092328] disabled:opacity-60'

export function CollectionRibbonClient({ products }: { products: RibbonItem[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [isPlaying, setIsPlaying] = useState(false)
  const autoScroll = useMemo(
    () =>
      AutoScroll({
        playOnInit: false,
        speed: 0.6,
        startDelay: 0,
        stopOnFocusIn: false,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      }),
    [],
  )
  const slides = products.length < 6 ? [...products, ...products, ...products] : products

  useEffect(() => {
    if (!api) return

    const onPlay = () => setIsPlaying(true)
    const onStop = () => setIsPlaying(false)

    api.on('autoScroll:play', onPlay)
    api.on('autoScroll:stop', onStop)

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const start = () => {
      const plugin = api.plugins()?.autoScroll
      if (!plugin || motion.matches) return
      if (!plugin.isPlaying()) plugin.play()
      setIsPlaying(plugin.isPlaying())
    }

    api.on('reInit', start)
    start()
    const frame = window.requestAnimationFrame(start)

    const onMotionChange = () => {
      const current = api.plugins()?.autoScroll
      if (!current) return
      if (motion.matches) current.stop()
      else current.play()
    }

    motion.addEventListener('change', onMotionChange)

    return () => {
      window.cancelAnimationFrame(frame)
      api.off('autoScroll:play', onPlay)
      api.off('autoScroll:stop', onStop)
      api.off('reInit', start)
      motion.removeEventListener('change', onMotionChange)
    }
  }, [api])

  const togglePlayback = () => {
    const plugin = api?.plugins()?.autoScroll
    if (!plugin) return

    if (plugin.isPlaying()) plugin.stop()
    else plugin.play()
  }

  return (
    <section
      aria-describedby="collection-ribbon-note"
      aria-labelledby="collection-ribbon-heading"
      className="bg-[#12544F] py-10 text-[#f4f6f2] md:py-14"
    >
      <p className="sr-only" id="collection-ribbon-note">
        This row moves on its own. Use Pause to stop it, or Previous and Next to move one rug at a
        time.
      </p>
      <div className="container mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.28em] text-[#8BBB92] uppercase">
            The collection
          </p>
          <h2 className="mt-2 text-2xl text-[#f4f6f2] md:text-3xl" id="collection-ribbon-heading">
            A slow look along the rugs
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#e5f0e6] md:text-base">
            Pieces from the current run, drifting past so you can pause on the one that fits the
            room.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            aria-controls="collection-ribbon"
            className={controlClassName}
            disabled={!api}
            onClick={() => api?.scrollPrev()}
            type="button"
          >
            Previous
          </button>
          <button
            aria-controls="collection-ribbon"
            className={controlClassName}
            disabled={!api}
            onClick={() => api?.scrollNext()}
            type="button"
          >
            Next
          </button>
          <button
            aria-controls="collection-ribbon"
            aria-pressed={isPlaying}
            className={controlClassName}
            disabled={!api}
            onClick={togglePlayback}
            type="button"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>
      <Carousel
        aria-label="Rugs in the collection"
        className="w-full"
        id="collection-ribbon"
        opts={{ align: 'start', loop: true }}
        plugins={[autoScroll]}
        setApi={setApi}
      >
        <CarouselContent className="ml-0 ps-4 md:ps-8">
          {slides.map((product, index) => (
            <CarouselItem
              className="basis-[82%] sm:basis-[46%] lg:basis-[32%]"
              key={`${product.id}-${index}`}
            >
              <Link
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#8BBB92] bg-[#f7faf7] text-[#092328]"
                href={`/products/${product.slug}`}
              >
                <div className="relative aspect-square bg-[#092328]">
                  {product.image ? (
                    <MediaView
                      className="relative h-full w-full"
                      fill
                      imgClassName="object-contain p-6"
                      resource={product.image}
                      size="(min-width: 64rem) 24rem, 80vw"
                    />
                  ) : null}
                </div>
                <span className="flex items-baseline justify-between gap-3 p-4 text-sm">
                  <span className="font-medium">{product.title}</span>
                  {typeof product.priceInUSD === 'number' ? (
                    <Price amount={product.priceInUSD} as="span" className="text-[#12544F]" />
                  ) : null}
                </span>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
