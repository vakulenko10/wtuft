import type { Product } from '@/payload-types'

import { ProductGridItem } from '@/components/ProductGridItem'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'

type Props = {
  products: Partial<Product>[]
}

const groupName = 'featured-rugs'

export function FeaturedCarousel({ products }: Props) {
  return (
    <div className="featured-rugs relative mt-8">
      <style>{carouselCss({ count: products.length })}</style>
      {products.map((product, index) => (
        <input
          aria-label={`Show ${product.title}, ${index + 1} of ${products.length}`}
          className="sr-only"
          defaultChecked={index === 0}
          id={`${groupName}-${index}`}
          key={product.slug || product.id || index}
          name={groupName}
          type="radio"
        />
      ))}
      <div className="featured-rugs__controls mb-6 flex items-center justify-end gap-3">
        {products.map((product, index) => (
          <span
            className={`featured-rugs__count featured-rugs__count-${index} me-auto text-sm font-medium text-[#15370D]`}
            key={product.slug || index}
          >
            {index + 1} of {products.length}
          </span>
        ))}
        {products.map((product, index) =>
          index > 0 ? (
            <label
              className={`featured-rugs__button featured-rugs__prev featured-rugs__prev-${index} min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-[#15370D] text-[#FFF2B4]`}
              htmlFor={`${groupName}-${index - 1}`}
              key={`prev-${product.slug || index}`}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              <span className="sr-only">Previous featured rug</span>
            </label>
          ) : null,
        )}
        {products.map((product, index) =>
          index < products.length - 1 ? (
            <label
              className={`featured-rugs__button featured-rugs__next featured-rugs__next-${index} min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-[#15370D] text-[#FFF2B4]`}
              htmlFor={`${groupName}-${index + 1}`}
              key={`next-${product.slug || index}`}
            >
              <ArrowRight aria-hidden="true" className="size-4" />
              <span className="sr-only">Next featured rug</span>
            </label>
          ) : null,
        )}
      </div>
      <div className="featured-rugs__viewport overflow-hidden">
        <ul className="featured-rugs__track m-0 flex list-none p-0">
          {products.map((product, index) => (
            <li
              className="featured-rugs__slide w-[var(--featured-slide)] shrink-0 pe-6"
              key={product.id || product.slug || index}
            >
              <ProductGridItem product={product} />
            </li>
          ))}
        </ul>
      </div>
      <div className="featured-rugs__pager mt-4 flex flex-wrap gap-1">
        {products.map((product, index) => (
          <label
            className={`featured-rugs__choice featured-rugs__choice-${index} inline-flex min-h-11 cursor-pointer items-center px-3 text-sm font-medium text-[#15370D]`}
            htmlFor={`${groupName}-${index}`}
            key={product.slug || index}
          >
            {product.title}
          </label>
        ))}
      </div>
    </div>
  )
}

function carouselCss({ count }: { count: number }) {
  const rules = [
    `.featured-rugs__count,
.featured-rugs__button {
  display: none;
}
@media (prefers-reduced-motion: no-preference) {
  .featured-rugs__track {
    transition: transform 500ms ease;
  }
}`,
  ]

  for (let index = 0; index < count; index++) {
    const nth = index + 1

    rules.push(`
.featured-rugs > input:nth-of-type(${nth}):checked ~ .featured-rugs__viewport .featured-rugs__track {
  transform: translateX(calc(${index} * -1 * var(--featured-slide)));
}
.featured-rugs > input:nth-of-type(${nth}):checked ~ .featured-rugs__controls .featured-rugs__count-${index} {
  display: inline;
}
.featured-rugs > input:nth-of-type(${nth}):checked ~ .featured-rugs__controls .featured-rugs__prev-${index},
.featured-rugs > input:nth-of-type(${nth}):checked ~ .featured-rugs__controls .featured-rugs__next-${index} {
  display: inline-flex;
}
.featured-rugs > input:nth-of-type(${nth}):checked ~ .featured-rugs__pager .featured-rugs__choice-${index} {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.featured-rugs > input:nth-of-type(${nth}):focus-visible ~ .featured-rugs__pager .featured-rugs__choice-${index} {
  outline: 2px solid #15370d;
  outline-offset: 2px;
}
.featured-rugs > input:nth-of-type(${nth}):checked ~ .featured-rugs__viewport .featured-rugs__slide:nth-child(-n + ${index}) {
  visibility: hidden;
}
.featured-rugs > input:nth-of-type(${nth}):checked ~ .featured-rugs__viewport .featured-rugs__slide:nth-child(n + ${nth + 2}) {
  visibility: hidden;
}`)
  }

  return rules.join('\n')
}
