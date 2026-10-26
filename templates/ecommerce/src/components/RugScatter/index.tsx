const rugs = [
  { className: 'rug-a', src: '/rugs/straw-hat.webp' },
  { className: 'rug-b', src: '/rugs/botanical.webp' },
  { className: 'rug-c', src: '/rugs/arch.webp' },
  { className: 'rug-d', src: '/rugs/wave.webp' },
]

export function RugScatter() {
  return (
    <div aria-hidden="true" className="rug-scatter">
      {rugs.map((rug) => (
        <img key={rug.src} alt="" className={rug.className} src={rug.src} />
      ))}
    </div>
  )
}
