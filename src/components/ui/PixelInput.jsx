import "./ui.css";

function PixelInput({
  label,
  hint,
  id,
  value,
  onChange,
  placeholder,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="pixel-field">
      {label && (
        <label className="pixel-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className="pixel-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
      {hint && <p className="pixel-hint">{hint}</p>}
    </div>
  );
}

export default PixelInput;
