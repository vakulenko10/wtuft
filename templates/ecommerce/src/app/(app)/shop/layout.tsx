import { Categories } from '@/components/layout/search/Categories'
import { FilterList } from '@/components/layout/search/filter'
import { sorting } from '@/lib/constants'
import { Search } from '@/components/Search'
import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className="bg-[#e5f0e6] text-[#092328]">
        <div className="container flex flex-col gap-8 pt-8 pb-16">
          <Search />

          <div className="flex flex-col items-start gap-8 md:flex-row md:gap-10">
            <div className="flex w-full flex-none flex-col gap-6 md:w-56">
              <Categories />
              <FilterList list={sorting} title="Sort by" />
            </div>
            <div className="w-full min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
