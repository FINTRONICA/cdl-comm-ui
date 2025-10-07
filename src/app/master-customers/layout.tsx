import React from 'react'

interface MasterCustomersLayoutProps {
  children: React.ReactNode
}

const MasterCustomersLayout: React.FC<MasterCustomersLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

export default MasterCustomersLayout
