import { forwardRef } from 'react'

interface SwitchProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  describedById?: string
  'aria-label'?: string
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ id, checked, onChange, disabled = false, describedById, 'aria-label': ariaLabel }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        onChange(!checked)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return
      
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        onChange(!checked)
      }
    }

    const handleKeyUp = (event: React.KeyboardEvent) => {
      if (disabled) return
      
      if (event.key === ' ') {
        event.preventDefault()
      }
    }

    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={describedById}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'cursor-pointer'
          }
          ${checked 
            ? 'bg-blue-600' 
            : 'bg-gray-200'
          }
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    )
  }
)

Switch.displayName = 'Switch'
