import React from 'react'

interface ActionButton {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: string
  iconAlt?: string
}

interface ActionButtonsProps {
  buttons?: ActionButton[]
  className?: string
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  buttons,
  className = '',
}) => {
  const getButtonClasses = (
    variant: string = 'secondary',
    disabled: boolean = false
  ) => {
    const baseClasses =
      'px-[10px] py-[6px] w-[80px] justify-center items-center text-sm font-sans font-medium leading-5 rounded-md transition-colors'

    if (disabled) {
      return `${baseClasses} text-[#99A1AF] bg-[#E5E7EB] cursor-not-allowed`
    }

    switch (variant) {
      case 'primary':
        return `${baseClasses} text-white bg-blue-600 hover:bg-blue-700`
      case 'danger':
        return `${baseClasses} text-gray-700 bg-white hover:bg-gray-50`
      case 'secondary':
      default:
        return `${baseClasses} text-gray-700 bg-white hover:bg-gray-50`
    }
  }

  const getIconClasses = (disabled: boolean = false) => {
    const baseClasses =
      'flex items-center justify-center p-[6px] bg-[#E5E7EB] rounded-full w-8 hover:bg-gray-100'
    return disabled
      ? `${baseClasses}  cursor-not-allowed`
      : baseClasses
  }

  // Safety check for buttons array
  if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
    return null
  }

  return (
    <div
      className={`flex justify-end items-center gap-2 py-[14px] px-4 ${className}`}
    >
      {buttons.map((button, index) => {
        if (button.icon) {
          return (
            <button
              key={index}
              onClick={button.onClick}
              disabled={button.disabled}
              className={getIconClasses(button.disabled)}
              title={button.label}
            >
              <img src={button.icon} alt={button.iconAlt || button.label} />
            </button>
          )
        }

        return (
          <button
            key={index}
            onClick={button.onClick}
            disabled={button.disabled}
            className={getButtonClasses(button.variant, button.disabled)}
          >
            {button.label}
          </button>
        )
      })}
    </div>
  )
}
