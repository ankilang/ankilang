import { LANGUAGES } from '../../constants/languages'

interface LanguageSelectProps {
  value: string
  onChange: (value: string) => void
  id?: string
  label?: string
  placeholder?: string
  className?: string
}

export default function LanguageSelect({
  value,
  onChange,
  id,
  label,
  placeholder = "Sélectionner une langue",
  className = ""
}: LanguageSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
