export default function Select({ label, error, options, placeholder, className = '', id, ...props }) {
  const selectId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
        </label>
      )}
      <select id={selectId} className="field-input" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-warn">{error}</p>}
    </div>
  );
}
