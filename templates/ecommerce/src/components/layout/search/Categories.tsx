import configPromise from '@payload-config'
import { getPayload } from 'payload'
import clsx from 'clsx'
import React, { Suspense } from 'react'

import { FilterList } from './filter'
import { CategoryItem } from './Categories.client'

async function CategoryList() {
  const payload = await getPayload({ config: configPromise })

  const [categories, products] = await Promise.all([
    payload.find({
      collection: 'categories',
      limit: 100,
      overrideAccess: true,
      sort: 'title',
    }),
    payload.find({
      collection: 'products',
      depth: 0,
      draft: false,
      limit: 200,
      overrideAccess: false,
      pagination: false,
      select: {
        categories: true,
      },
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
  ])

  const usedCategoryIDs = new Set<string>()

  for (const product of products.docs) {
    for (const category of product.categories || []) {
      if (typeof category === 'string') usedCategoryIDs.add(category)
      else if (category && typeof category === 'object' && category.id)
        usedCategoryIDs.add(category.id)
    }
  }

  const visibleCategories = categories.docs.filter((category) => usedCategoryIDs.has(category.id))

  if (!visibleCategories.length) return null

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-[#092328]">Category</h3>

      <ul>
        {visibleCategories.map((category) => {
          return (
            <li key={category.id}>
              <CategoryItem category={category} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded'
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300'
const items = 'bg-neutral-400 dark:bg-neutral-700'

export function Categories() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
        </div>
      }
    >
      <CategoryList />
    </Suspense>
  )
}
