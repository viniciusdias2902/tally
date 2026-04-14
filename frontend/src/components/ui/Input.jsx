export default function Input({
  label,
  id,
  erro,
  className = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-lg border bg-input-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
          erro ? "border-danger" : "border-border"
        }`}
        {...props}
      />
      {erro && <p className="text-xs text-danger">{erro}</p>}
    </div>
  );
}
