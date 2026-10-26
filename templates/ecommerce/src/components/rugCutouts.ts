export type RugCutout = {
  height: number
  src: string
  width: number
}

export const rugCutouts: Record<string, RugCutout> = {
  archway: { height: 1024, src: '/rugs/arch.webp', width: 1024 },
  'botanical-oval': { height: 1024, src: '/rugs/botanical.webp', width: 1024 },
  'straw-hat-portrait': { height: 470, src: '/rugs/straw-hat.webp', width: 512 },
  'tide-line': { height: 1024, src: '/rugs/wave.webp', width: 1024 },
}
