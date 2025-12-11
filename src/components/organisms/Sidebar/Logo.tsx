import React from 'react'
import Image from 'next/image'

const Logo: React.FC = () => {
  return (
    <div className="flex items-center w-full mb-2 mt-2">
      <Image
        src="/Logo.png"
        alt="Escrow Central Logo"
        width={100}
        height={40}
        className="object-contain"
        priority
      />
    </div>
  )
}

export default Logo
