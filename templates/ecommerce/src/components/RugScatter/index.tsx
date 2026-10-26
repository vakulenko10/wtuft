const rugs = [
  { className: 'rug-a', src: '/rugs/botanical.webp' },
  { className: 'rug-b', src: '/rugs/arch.webp' },
  { className: 'rug-c', src: '/rugs/wave.webp' },
  { className: 'rug-d', src: '/rugs/straw-hat.webp' },
  { className: 'rug-e', src: '/rugs/botanical.webp' },
  { className: 'rug-f', src: '/rugs/wave.webp' },
  { className: 'rug-g', src: '/rugs/arch.webp' },
  { className: 'rug-h', src: '/rugs/straw-hat.webp' },
]

export function RugScatter() {
  return (
    <div aria-hidden="true" className="rug-scatter">
      {rugs.map((rug) => (
        <img key={rug.className} alt="" className={rug.className} src={rug.src} />
      ))}
    </div>
  )
}
