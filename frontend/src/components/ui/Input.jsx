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
        className={`rounded-xl border bg-input-bg px-3.5 py-2.5 text-sm text-text-primary shadow-sm placeholder:text-text-muted transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent ${
          erro ? "border-danger" : "border-border"
        }`}
        {...props}
      />
      {erro && <p className="text-xs text-danger">{erro}</p>}
    </div>
  );
}
