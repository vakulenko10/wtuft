import clsx from 'clsx'
import React from 'react'

export function LogoIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={clsx('h-8 w-8 text-[#12544F]', props.className)}
    >
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 18c2.2-4 4-6 8-6s5.8 2 8 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M10 14.5c1.2 1.4 2.4 2 6 2s4.8-.6 6-2"
        fill="none"
        stroke="#2A835F"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}
