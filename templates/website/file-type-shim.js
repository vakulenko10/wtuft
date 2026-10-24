import { readFile } from 'node:fs/promises'

/**
 * Webpack turns file-type's dynamic `import('node:fs/promises')` into an empty
 * context, so media routes 500. This covers the image types the site uploads.
 */
function detect(bytes) {
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { ext: 'png', mime: 'image/png' }
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' }
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { ext: 'gif', mime: 'image/gif' }
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ext: 'webp', mime: 'image/webp' }
  }
  if (bytes.length >= 5 && bytes[0] === 0x3c && bytes[1] === 0x73 && bytes[2] === 0x76 && bytes[3] === 0x67) {
    return { ext: 'svg', mime: 'image/svg+xml' }
  }

  return undefined
}

export async function fileTypeFromBuffer(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return detect(bytes)
}

export async function fileTypeFromFile(filePath) {
  const buffer = await readFile(filePath)
  return detect(buffer)
}
