import { config as loadEnv } from 'dotenv'
import path from 'node:path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')
const { seedRugs } = await import('./rugs')

const payload = await getPayload({ config })

try {
  await seedRugs({ payload })
} finally {
  await payload.destroy()
}
