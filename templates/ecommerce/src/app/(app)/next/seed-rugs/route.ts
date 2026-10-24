import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

import { checkRole } from '@/access/utilities'
import { seedRugs } from '@/endpoints/seed/rugs'

export const maxDuration = 300

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || !checkRole(['admin'], user)) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    await seedRugs({ payload })

    return Response.json({ success: true })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Error seeding rugs' })
    return new Response('Error seeding rugs.', { status: 500 })
  }
}
