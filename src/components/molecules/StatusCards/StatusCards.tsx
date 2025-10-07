import React from 'react'
import { StatusCard } from '../../atoms/StatusCard'

interface StatusCardData {
  label: string
  count: number
  color: string
  textColor: string
  dotColor: string
  borderColor?: string
  variant?: 'default' | 'compact'
}

interface StatusCardsProps {
  cards: StatusCardData[]
  className?: string
}

const StatusCardsComponent: React.FC<StatusCardsProps> = ({
  cards,
  className = '',
}) => {
  return (
    <div className={`flex flex-row gap-4 w-full ${className}`}>
      {cards.map((card, index) => (
        <StatusCard
          key={index}
          label={card.label}
          count={card.count}
          color={card.color}
          textColor={card.textColor}
          dotColor={card.dotColor}
          variant="compact"
        />
      ))}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const StatusCards = React.memo(StatusCardsComponent)
