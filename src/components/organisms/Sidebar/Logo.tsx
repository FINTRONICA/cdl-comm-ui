import React from 'react'
import Image from 'next/image'
import { getPublicAssetPath } from '@/utils/basePath'

const Logo: React.FC = () => {
  return (
    <div className="flex items-center w-full mt-2 mb-2">
      <Image
        src={getPublicAssetPath('/Logo.png')}
        alt="Escrow Central Logo"
        width={100}
        height={40}
        className="object-contain"
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
    </div>
  )
}

export default Logo
