import { resolveSrv } from 'node:dns/promises'
import { createConnection } from 'node:net'

import type { DatabaseAdapterType } from '../../dbAdapters.js'

import { dbAdapters } from '../../dbAdapters.js'

type ProbeTarget = {
  host: string
  label?: string
  port: number
  profile?: string
  /** URL protocol, including the trailing colon (`mongodb:`, `mongodb+srv:`). */
  protocol?: string
}

/**
 * `mongodb://host1:27017,host2:27017/...` is not a valid WHATWG URL, so `new URL`
 * throws and the probe used to fall through to localhost. Pull the first host out
 * so replica-set strings are still probed.
 */
function parseConnectionUrl(envUrl: string): { host: string; port: string; protocol: string } | null {
  try {
    const parsed = new URL(envUrl)
    return {
      host: parsed.hostname,
      port: parsed.port,
      protocol: parsed.protocol,
    }
  } catch {
    const match = /^(mongodb(?:\+srv)?):\/\/(?:[^@/?#]+@)?([^/?#,]+)(?::(\d+))?/i.exec(envUrl)
    if (!match?.[2]) {
      return null
    }
    return {
      host: match[2],
      port: match[3] ?? '',
      protocol: match[1].toLowerCase() === 'mongodb+srv' ? 'mongodb+srv:' : 'mongodb:',
    }
  }
}

/**
 * Resolve the host:port to probe for an adapter, honoring the same URL env
 * vars the adapter would. Returns null for adapters that don't need a probe.
 */
function getTarget(adapter: DatabaseAdapterType): ProbeTarget | null {
  const entry = dbAdapters[adapter]
  // Adapters without `port` are file-based (sqlite, d1) or externally-managed
  // (supabase, vercel-postgres-read-replica, content-api) — skip the probe.
  if (!entry || !('port' in entry)) {
    return null
  }
  const envUrl = process.env[entry.envVar] || process.env.DATABASE_URL

  if (envUrl) {
    const parsed = parseConnectionUrl(envUrl)
    if (parsed?.host) {
      const isSrv = parsed.protocol === 'mongodb+srv:'
      return {
        host: parsed.host,
        // An `mongodb+srv` URL has no port; the SRV record does. Keep the docker
        // default only for standard URLs that omit a port (`mongodb://127.0.0.1/db`).
        port: parsed.port ? Number(parsed.port) : isSrv ? 0 : entry.port,
        protocol: parsed.protocol,
        profile: entry.profile,
        label: entry.label,
      }
    }
  }

  return {
    host: entry.host,
    port: entry.port,
    profile: entry.profile,
    label: entry.label,
  }
}

/**
 * `mongodb+srv` hostnames have no A/AAAA record. Resolve `_mongodb._tcp.<host>`
 * and probe a shard on the SRV port (27017 on Atlas) instead of the docker port.
 */
async function resolveProbeTarget(
  target: ProbeTarget,
): Promise<{ error?: string; target: ProbeTarget }> {
  if (target.protocol !== 'mongodb+srv:') {
    return { target }
  }

  const srvName = `_mongodb._tcp.${target.host}`
  try {
    const records = await resolveSrv(srvName)
    const record = [...records].sort((a, b) => a.priority - b.priority || b.weight - a.weight)[0]
    if (!record) {
      return { target, error: `no SRV records for ${srvName}` }
    }
    return {
      target: {
        ...target,
        host: record.name.replace(/\.$/, ''),
        port: record.port,
      },
    }
  } catch (err) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as NodeJS.ErrnoException).code)
        : String(err)
    return { target, error: `SRV lookup failed for ${srvName} (${code})` }
  }
}

function tcpPing(host: string, port: number, timeoutMs: number): Promise<string | true> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port })
    const done = (value: string | true) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(value)
    }
    const timer = setTimeout(() => done(`timed out after ${timeoutMs}ms`), timeoutMs)
    socket.once('connect', () => {
      clearTimeout(timer)
      done(true)
    })
    socket.once('error', (err: NodeJS.ErrnoException) => {
      clearTimeout(timer)
      done(err.code || err.message || String(err))
    })
  })
}

/**
 * Verify the docker-hosted service for the given adapter accepts TCP
 * connections. Prints a friendly error and exits non-zero when unreachable.
 * Does nothing for file-based adapters like sqlite.
 */
export async function assertDbReachable(adapter: DatabaseAdapterType): Promise<void> {
  const initialTarget = getTarget(adapter)
  if (!initialTarget) {
    return
  }

  const { error: resolveError, target } = await resolveProbeTarget(initialTarget)
  const isLocal =
    target.host === 'localhost' || target.host === '127.0.0.1' || target.host === '::1'
  const timeoutMs = process.env.CI === 'true' || !isLocal ? 10000 : 2000
  const result = resolveError ?? (await tcpPing(target.host, target.port, timeoutMs))
  if (result === true) {
    return
  }

  const lines = [
    '',
    '\x1b[31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m',
    `\x1b[31m✗ ${target.label} is not reachable at ${target.host}:${target.port || '(no port)'}\x1b[0m`,
    '',
    `  Adapter : \x1b[1m${adapter}\x1b[0m`,
    `  Reason  : ${result}`,
    '',
    ...(isLocal
      ? [
          `  \x1b[2mStart the service:\x1b[0m`,
          `    \x1b[36mpnpm docker:start ${target.profile}\x1b[0m`,
          '',
        ]
      : [
          `  \x1b[2mThis host is not the local Docker database.\x1b[0m`,
          `  \x1b[2mmongodb+srv names are resolved with a DNS SRV lookup, then probed on the shard port.\x1b[0m`,
          '',
        ]),
    `  \x1b[2mOr pick a different adapter (sqlite needs no docker):\x1b[0m`,
    `    \x1b[36mPAYLOAD_DATABASE=sqlite pnpm dev\x1b[0m`,
    '\x1b[31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m',
    '',
  ]
  process.stderr.write(lines.join('\n'))
  process.exit(1)
}
