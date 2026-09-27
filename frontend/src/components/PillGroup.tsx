import './PillGroup.css'

type Option<T> = {
  value: T
  label: string
}

type Props<T> = {
  legend: string
  name: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

// Real radio inputs styled as pills: arrow keys, focus and screen readers work for free.
export function PillGroup<T extends string>({ legend, name, options, value, onChange }: Props<T>) {
  return (
    <fieldset className="pill-group">
      <legend className="pill-group__legend">{legend}</legend>
      <div className="pill-group__options">
        {options.map((option) => (
          <label key={option.value} className="pill">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
