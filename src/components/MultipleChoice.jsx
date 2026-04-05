export default function MultipleChoice({ options, selected, onChange, multi = true, color = '#6366f1' }) {
  function toggle(value) {
    if (multi) {
      if (selected.includes(value)) {
        onChange(selected.filter(v => v !== value))
      } else {
        onChange([...selected, value])
      }
    } else {
      onChange(selected.includes(value) ? [] : [value])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map(({ value, label }) => {
        const active = selected.includes(value)
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            style={active ? { backgroundColor: color, borderColor: color } : {}}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
              active ? 'text-white' : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
