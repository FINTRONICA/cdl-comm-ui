import React from 'react'

const Logo: React.FC = () => {
  return (
    <div className="flex items-center w-full mb-2 mt-2">
      <img
        src="/Logo.png"
        alt="logo"
        width={100}
        height={40}
        className="object-contain"
      />
    </div>
  )
}

export default Logo
