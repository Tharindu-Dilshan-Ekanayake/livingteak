type InputFieldProps = {
  label?: string
  name?: string
  type?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
}

export default function InputField({
  label = 'Contact',
  name = 'contact',
  type = 'text',
  placeholder = 'Enter value',
  value,
  defaultValue = '',
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={
          onChange
            ? (event) => {
                onChange(event.target.value)
              }
            : undefined
        }
      />
    </div>
  )
}
