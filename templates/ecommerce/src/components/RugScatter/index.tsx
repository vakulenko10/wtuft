type FlowingRug = {
  alignClass: string
  rotate: number
  src: string
  widthClass: string
}

type Props = {
  rugs: FlowingRug[]
}

const rugShadow = { filter: 'drop-shadow(0 18px 14px rgb(21 55 13 / 16%))' }

export function FlowingRugs({ rugs }: Props) {
  return (
    <div aria-hidden="true" className="container flex flex-col gap-6 py-6">
      {rugs.map((rug) => (
        <img
          alt=""
          className={`h-auto ${rug.widthClass} ${rug.alignClass}`}
          key={`${rug.src}-${rug.rotate}`}
          src={rug.src}
          style={{
            ...rugShadow,
            position: 'relative',
            transform: `rotate(${rug.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
