import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateGlobal =
  (slug: 'header' | 'footer'): GlobalAfterChangeHook =>
  ({ doc, req: { context, payload } }) => {
    if (!context.disableRevalidate) {
      payload.logger.info(`Revalidating ${slug} global`)
      revalidateTag(`global_${slug}`, 'max')
    }

    return doc
  }
