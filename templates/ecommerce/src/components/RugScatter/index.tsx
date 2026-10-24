const rugs = [
  { className: 'rug-a', src: '/rugs/straw-hat.webp' },
  { className: 'rug-b', src: '/rugs/botanical.jpg' },
  { className: 'rug-c', src: '/rugs/arch.jpg' },
  { className: 'rug-d', src: '/rugs/wave.jpg' },
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
